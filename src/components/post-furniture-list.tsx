import WishlistItemButton from "@/components/wishlist-item-button";
import { getProductUrlMeta } from "@/lib/product-url";
import {
  COPY_FURNITURE_VERIFIED_AT_PREFIX,
  formatLinkVerifiedAtJa,
  getFurnitureLinkRelationHint,
  getFurnitureLinkRelationLabel,
} from "@/lib/furniture-link-meta";

type Item = {
  id: string;
  brand: string;
  name: string;
  productUrl: string;
  note: string | null;
  price: number | null;
  currency: string;
  mediaIndex: number;
  sortOrder: number;
  linkRelation: string;
  linkVerifiedAt: Date | null;
};

type Media = { id: string; path: string };

function clampIdx(idx: number, n: number) {
  if (n <= 0) return 0;
  return Math.min(Math.max(0, Math.floor(idx)), n - 1);
}

function PurchaseLink({
  name,
  productUrl,
  linkRelation,
  linkVerifiedAt,
}: {
  name: string;
  productUrl: string;
  linkRelation: string;
  linkVerifiedAt: Date | null;
}) {
  const meta = getProductUrlMeta(productUrl);
  if (!meta) return null;

  const relationLabel =
    linkRelation && linkRelation.trim() ? getFurnitureLinkRelationLabel(linkRelation) : "";
  const relationHint = linkRelation?.trim() ? getFurnitureLinkRelationHint(linkRelation) : "";
  const verifiedLabel = formatLinkVerifiedAtJa(linkVerifiedAt);
  const trustTitle = [
    relationHint,
    verifiedLabel ? `${COPY_FURNITURE_VERIFIED_AT_PREFIX} ${verifiedLabel}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mt-4 flex flex-col items-stretch gap-2 sm:mt-0 sm:items-end">
      <a
        href={meta.href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex min-h-[var(--touch)] items-center justify-center gap-1.5 px-5 text-sm font-bold tracking-tight transition active:scale-[0.97] sm:min-h-[2.5rem] sm:text-[11px]"
        aria-label={`${name} の商品ページ（${meta.displayHost}）を別のタブで開く`}
      >
        <span>商品ページを開く</span>
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden>
          <path
            d="M5 2h7v7M12 2L2 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </a>
      <div className="flex items-center justify-center gap-1.5 sm:justify-end">
        <span className="nook-fg-faint max-w-[10rem] truncate text-[10px] font-medium tracking-wide uppercase">
          {meta.displayHost}
        </span>
        {meta.isSecure && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="nook-fg-faint" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </div>
      {(relationLabel || verifiedLabel) && (
        <p
          title={trustTitle || undefined}
          className="nook-fg-faint max-w-[14rem] text-right text-[9px] font-medium leading-snug sm:ml-auto"
        >
          {relationLabel ? <span>{relationLabel}</span> : null}
          {relationLabel && verifiedLabel ? (
            <span className="mx-1 opacity-50" aria-hidden>
              ・
            </span>
          ) : null}
          {verifiedLabel ? (
            <span>
              {COPY_FURNITURE_VERIFIED_AT_PREFIX} {verifiedLabel}
            </span>
          ) : null}
        </p>
      )}
    </div>
  );
}

export default function PostFurnitureList({
  postId,
  medias,
  items,
  wishlistedUrls,
}: {
  postId: string;
  medias: Media[];
  items: Item[];
  wishlistedUrls: Set<string>;
}) {
  const n = medias.length;

  function renderItemRow(item: Item, staggerClass = "") {
    return (
      <li
        key={item.id}
        id={`post-furniture-item-${item.id}`}
        className={["nook-furniture-row group relative flex flex-col gap-4 overflow-hidden scroll-mt-[calc(var(--nav-height)+0.75rem)] rounded-[var(--radius-card)] border p-4 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between sm:p-5 hover:border-[var(--text-muted)]", staggerClass].filter(Boolean).join(" ")}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="nook-fg text-[15px] font-bold tracking-tight">
              {item.name}
            </span>
            <WishlistItemButton
              productUrl={item.productUrl}
              name={item.name}
              note={item.note ?? ""}
              postId={postId}
              initialSaved={wishlistedUrls.has(item.productUrl)}
            />
          </div>
          {item.brand?.trim() ? (
            <p className="nook-fg-muted mt-0.5 text-[11px] font-medium">{item.brand.trim()}</p>
          ) : null}
          {item.note ? (
            <p className="nook-fg-secondary mt-1.5 text-[12px] leading-relaxed italic">
              {item.note}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 text-right">
          {item.price !== null && (
            <div className="flex flex-col items-end">
              <span className="nook-section-label !mb-0 text-[10px]">参考価格</span>
              <span className="nook-fg text-[17px] font-bold tracking-tight">
                ¥{item.price.toLocaleString()}
              </span>
            </div>
          )}
          <PurchaseLink
            name={item.name}
            productUrl={item.productUrl}
            linkRelation={item.linkRelation}
            linkVerifiedAt={item.linkVerifiedAt}
          />
        </div>
      </li>
    );
  }

  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => {
    const ai = clampIdx(a.mediaIndex, n);
    const bi = clampIdx(b.mediaIndex, n);
    if (ai !== bi) return ai - bi;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <ul className="space-y-2" role="list">
      {sorted.map((item) => renderItemRow(item, "stagger-item"))}
    </ul>
  );
}
