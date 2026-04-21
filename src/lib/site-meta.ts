/** 共通メタデータ（layout・OG・将来の JSON-LD などで再利用） */
export const SITE_TITLE_DEFAULT = "NOOK — 部屋にこだわってみる";

export const SITE_DESCRIPTION =
  "一人暮らしの部屋のムードを眺めながら、家具・雑貨の商品ページまで辿れます。";

/** 運営者連絡先（任意）。未設定なら規約・プライバシーでは「掲載する場合」の文言のみ。 */
export const SITE_OPERATOR_CONTACT =
  process.env.NEXT_PUBLIC_OPERATOR_CONTACT?.trim() ?? "";
