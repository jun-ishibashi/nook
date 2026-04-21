import { SITE_OPERATOR_CONTACT } from "@/lib/site-meta";

/** リンクにできる場合のみ href を返す（それ以外はプレーンテキスト表示）。 */
function contactHref(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  if (/^mailto:/i.test(t)) return t;

  if (t.startsWith("/") && !t.startsWith("//")) return t;

  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      return u.href;
    } catch {
      return null;
    }
  }

  // 単体のメールアドレスのみ mailto にする（自由文を mailto にしない）
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return `mailto:${t}`;

  return null;
}

function isExternalHttpHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/** 個人運営向け。NEXT_PUBLIC_OPERATOR_CONTACT 未設定時は掲示待ちの文言のみ。 */
export function OperatorContact({ className }: { className?: string }) {
  if (!SITE_OPERATOR_CONTACT) {
    return (
      <p className={className ?? "mt-2 text-xs leading-relaxed nook-fg-muted"}>
        お問い合わせ・個人情報に関するご請求は、運営者が本サービス上に連絡先を掲示した場合に、その方法にてご連絡ください。掲示がない場合は、掲示後にご連絡いただくか、サービス内の案内に従ってください。
      </p>
    );
  }

  const label = SITE_OPERATOR_CONTACT.trim();
  const href = contactHref(SITE_OPERATOR_CONTACT);

  return (
    <p className={className ?? "mt-2 text-sm leading-relaxed nook-fg-secondary"}>
      <span className="nook-fg-muted">運営者連絡先: </span>
      {href ? (
        <a
          href={href}
          className="underline underline-offset-2 hover:opacity-90"
          rel={isExternalHttpHref(href) ? "noopener noreferrer" : undefined}
          target={isExternalHttpHref(href) ? "_blank" : undefined}
        >
          {label}
        </a>
      ) : (
        <span className="nook-fg-secondary">{label}</span>
      )}
    </p>
  );
}
