import { normalizeBrandForDb } from "./brand-master";
import { getProductUrlHost } from "./product-url";
import {
  normalizeFurnitureLinkRelation,
  parseLinkVerifiedDate,
} from "./furniture-link-meta";
import { parsePinCoordPair } from "./furniture-pin-coords";

export type ParsedFurnitureForDb = {
  brand: string;
  brandSlug: string;
  name: string;
  productUrl: string;
  note: string;
  price: number | null;
  mediaIndex: number;
  pinX: number | null;
  pinY: number | null;
  linkRelation: string;
  linkVerifiedAt: Date | null;
};

type RawFurniture = {
  brand?: unknown;
  brandSlug?: unknown;
  name?: unknown;
  productUrl?: unknown;
  note?: unknown;
  price?: unknown;
  mediaIndex?: unknown;
  pinX?: unknown;
  pinY?: unknown;
  linkRelation?: unknown;
  linkVerifiedDate?: unknown;
};

function isHttpProductUrl(raw: unknown): raw is string {
  return typeof raw === "string" && raw.trim().startsWith("http");
}

export function normalizeFurnitureInputs(parsed: unknown): ParsedFurnitureForDb[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is RawFurniture => item !== null && typeof item === "object")
    .filter((f) => typeof f.name === "string" && isHttpProductUrl(f.productUrl))
    .map((f) => {
      const productUrl = (f.productUrl as string).trim();
      const brandRaw = typeof f.brand === "string" ? f.brand.trim().slice(0, 80) : "";
      const { brand, brandSlug } = normalizeBrandForDb(brandRaw, f.brandSlug);
      const pins = parsePinCoordPair(f.pinX, f.pinY);
      return {
        brand,
        brandSlug,
        name: f.name as string,
        productUrl,
        note: typeof f.note === "string" ? f.note.trim().slice(0, 500) : "",
        price:
          typeof f.price === "number" && Number.isFinite(f.price)
            ? Math.max(0, Math.floor(f.price))
            : null,
        mediaIndex:
          typeof f.mediaIndex === "number" && Number.isFinite(f.mediaIndex)
            ? Math.max(0, Math.floor(f.mediaIndex))
            : 0,
        pinX: pins.pinX,
        pinY: pins.pinY,
        linkRelation: normalizeFurnitureLinkRelation(f.linkRelation),
        linkVerifiedAt: parseLinkVerifiedDate(f.linkVerifiedDate),
      };
    });
}

export function parseFurnitureJson(json: string | null): ParsedFurnitureForDb[] {
  if (!json) return [];
  try {
    return normalizeFurnitureInputs(JSON.parse(json) as unknown);
  } catch {
    return [];
  }
}

export function clampMediaIndexToCount(raw: number, mediaCount: number): number {
  if (mediaCount <= 0) return 0;
  return Math.min(Math.max(0, raw), mediaCount - 1);
}

function furnitureWriteBase(
  f: ParsedFurnitureForDb,
  sortOrder: number,
  mediaCount: number,
) {
  const url = f.productUrl.trim().slice(0, 2000);
  return {
    brand: f.brand.trim().slice(0, 80),
    brandSlug: f.brandSlug.trim().slice(0, 64),
    name: f.name.trim().slice(0, 200),
    productUrl: url,
    productHost: getProductUrlHost(url),
    note: f.note.slice(0, 500),
    sortOrder,
    mediaIndex: clampMediaIndexToCount(f.mediaIndex, mediaCount),
    pinX: f.pinX,
    pinY: f.pinY,
    price: f.price,
    linkRelation: f.linkRelation,
    linkVerifiedAt: f.linkVerifiedAt,
  };
}

/** 投稿のネスト create（postId は親が付与） */
export function toFurnitureNestedCreate(
  f: ParsedFurnitureForDb,
  sortOrder: number,
  mediaCount: number,
) {
  return furnitureWriteBase(f, sortOrder, mediaCount);
}

/** createMany 用 */
export function toFurnitureCreateManyRow(
  f: ParsedFurnitureForDb,
  sortOrder: number,
  mediaCount: number,
  postId: string,
) {
  return { ...furnitureWriteBase(f, sortOrder, mediaCount), postId };
}
