/** 「写真を載せる」モーダル: label の checkbox と Radix Dialog の open を同期するためのイベント */

export const NOOK_POST_MODAL_CLOSE_EVENT = "nook:post-modal-programmatic-close";

/** checkbox.checked = false だけでは change が飛ばない環境があるため、Dialog の open も閉じる */
export function notifyPostModalProgrammaticClose() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(NOOK_POST_MODAL_CLOSE_EVENT));
}
