/** NextAuth の `error` クエリ用（§4 敬体短文） */
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "ログインの準備に失敗しました。もう一度お試しください。",
  OAuthCallback: "認証でエラーが発生しました。もう一度お試しください。",
  OAuthCreateAccount: "アカウントを作成できませんでした。もう一度お試しください。",
  EmailCreateAccount: "アカウントを作成できませんでした。もう一度お試しください。",
  Callback: "認証でエラーが発生しました。もう一度お試しください。",
  OAuthAccountNotLinked: "このメールは、ほかのログイン方法で登録済みです。",
  EmailSignin: "メールを送信できませんでした。もう一度お試しください。",
  CredentialsSignin: "ログインできませんでした。もう一度お試しください。",
  SessionRequired: "ログインが必要です。",
  Default: "ログインできませんでした。もう一度お試しください。",
};

export function loginErrorMessage(code: string): string {
  return LOGIN_ERROR_MESSAGES[code] ?? LOGIN_ERROR_MESSAGES.Default;
}
