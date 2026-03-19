import NookImage from "@/components/nook-image";
import WishlistItemButton from "@/components/wishlist-item-button";
import { getProductUrlMeta } from "@/lib/product-url";

type Item = {
  id: string;
  name: string;
  productUrl: string;
  note: string | null;
  mediaIndex: number;
};

type Media = { id: string; path: string };

function clampIdx(idx: number, n: number) {
  if (n <= 0) return 0;
  return Math.min(Math.max(0, Math.floor(idx)), n - 1);
}

function PurchaseLink({ name, productUrl }: { name: string; productUrl: string }) {
  const meta = getProductUrlMeta(productUrl);
  if (!meta) {
    return (
      <p className="text-[11px] leading-snug" style={{ color: "var(--text-muted)" }}>
        商品ページのURLを認識できませんでした
      </p>
    );
  }
  return (
    <div className="flex min-w-0 flex-col items-stretch gap-1 sm:items-end">
      <a
        href={meta.href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary inline-flex min-h-9 justify-center gap-1 px-4 text-center text-xs font-semibold"
        aria-label={`${name} の商品ページ（${meta.displayHost}）を別のタブで開く`}
      >
        商品ページを開く
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="shrink-0" aria-hidden>
          <path
            d="M5 2h7v7M12 2L2 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      <span className="block max-w-[12rem] truncate text-center text-[10px] sm:text-right" style={{ color: "var(--text-faint)" }} title={meta.displayHost}>
        {meta.displayHost}
      </span>
      {meta.isSecure ? (
        <span className="sr-only">暗号化された接続（https）</span>
      ) : (
        <p className="max-w-[12rem] text-center text-[9px] leading-snug sm:text-right" style={{ color: "var(--text-faint)" }} role="note">
          http の接続です。入力はご注意ください。
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

  function renderItemRow(item: Item) {
    return (
      <li
        key={item.id}
        className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border px-3 py-3.5 sm:px-4"
        style={{ borderColor: "var(--hairline)", background: "var(--bg-raised)" }}
      >
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
            {item.name}
          </span>
          {item.note ? (
            <p className="mt-1 text-xs leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
              {item.note}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-start">
          <WishlistItemButton
            productUrl={item.productUrl}
            name={item.name}
            note={item.note ?? ""}
            postId={postId}
            initialSaved={wishlistedUrls.has(item.productUrl)}
          />
          <PurchaseLink name={item.name} productUrl={item.productUrl} />
        </div>
      </li>
    );
  }

  if (items.length === 0) return null;

  if (n <= 1) {
    return (
      <ul className="space-y-2" role="list">
        {items.map((item) => renderItemRow(item))}
      </ul>
    );
  }

  const byIdx = new Map<number, Item[]>();
  for (const item of items) {
    const idx = clampIdx(item.mediaIndex, n);
    if (!byIdx.has(idx)) byIdx.set(idx, []);
    byIdx.get(idx)!.push(item);
  }
  const ordered = [...byIdx.keys()].sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {ordered.map((idx) => {
        const group = byIdx.get(idx)!;
        const thumb = medias[idx]?.path;
        return (
          <div key={idx}>
            <h3 className="nook-overline nook-overline--sentence mb-2">写真 {idx + 1} に写っている家具・雑貨</h3>
            {thumb ? (
              <div
                className="relative mb-3 h-28 w-40 overflow-hidden rounded-[var(--radius-sm)] border shadow-[var(--home-tile-shadow)]"
                style={{ borderColor: "var(--hairline)", background: "var(--bg-sunken)" }}
              >
                <NookImage
                  src={thumb}
                  alt={`部屋の写真（${idx + 1}枚目）に写っている家具・雑貨の参考`}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
            ) : null}
            <ul className="space-y-2" role="list">
              {group.map((item) => renderItemRow(item))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
