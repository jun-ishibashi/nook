/**
 * API が返す `error` 文字列（クライアントにそのまま表示想定）。
 * §4 敬体短文・内部用語を避ける。
 */
export const apiUserMsg = {
  unauthorized: "ログインが必要です。",
  accountNotFound: "アカウントが見つかりません。もう一度ログインしてください。",
  invalidJson: "形式が正しくありません。もう一度お試しください。",
  titleRequired: "タイトルを入力してください。",
  photosRequired: "写真を1枚以上選んでください。",
  notFound: "見つかりませんでした。",
  forbidden: "この操作はできません。",
  noFieldsToUpdate: "更新する内容がありません。",
  furnitureShape: "家具・雑貨のデータ形式が正しくありません。",
  styleTagsShape: "スタイルのデータ形式が正しくありません。",
  profileNoFields: "更新する内容がありません。",
  invalidProfileLink: "リンクは https:// から正しいURLで入力してください。",
  idRequired: "IDが必要です。",
  postIdRequired: "部屋の指定が必要です。",
  userIdRequired: "ユーザーの指定が必要です。",
  invalidProductUrl: "商品ページのURLを確認してください。",
  buyRankInvalid: "順番の指定が正しくありません。",
  cannotFollowSelf: "自分自身はフォローできません。",
  userNotFound: "ユーザーが見つかりません。",
} as const;
