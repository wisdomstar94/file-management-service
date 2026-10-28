/** 브라우저가 api 를 직접 호출하는 업로드 · 다운로드에서 이 토큰으로 허용할 동작과 대상 */
export type AdminShortTimeTokenTarget =
  | { purpose: "UPLOAD_DOCUMENT" }
  | { purpose: "UPLOAD_DOCUMENT_VERSION"; documentId: string }
  | { purpose: "DOWNLOAD_DOCUMENT_VERSION"; documentId: string; versionId: string };
