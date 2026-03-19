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
  if (!meta) return null;

  return (
    <div className="mt-4 flex flex-col items-stretch gap-2 sm:mt-0 sm:items-end">
      <a
        href={meta.href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex min-h-[2.5rem] items-center justify-center gap-1.5 px-5 text-[11px] font-bold tracking-tight shadow-sm transition active:scale-[0.97]"
        aria-label={`${name} の商品ページ（${meta.displayHost}）を別のタブで開く`}
      >
        <span>ショップを見る</span>
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
        <span className="max-w-[10rem] truncate text-[10px] font-medium tracking-wide uppercase" style={{ color: "var(--text-faint)" }}>
          {meta.displayHost}
        </span>
        {meta.isSecure && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-faint)" }} aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </div>
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
        className="group relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-card)] border p-4 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between sm:p-5 hover:border-[var(--text-muted)] hover:shadow-lg"
        style={{ borderColor: "var(--hairline)", background: "var(--bg-raised)" }}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--text)" }}>
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
          {item.note ? (
            <p className="mt-1.5 text-[12px] leading-relaxed italic" style={{ color: "var(--text-secondary)" }}>
              {item.note}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0">
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
