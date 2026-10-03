/** 다운로드 실패 사유를 한 번만 보여주기 위한 쿠키. 주소에 남기면 새로고침해도 문구가 유지되기 때문이다. */
export function readDownloadErrorCookieName(token: string): string {
  return `fms_share_download_error_${token}`;
}

export function readDownloadErrorCookiePath(token: string): string {
  return `/s/${token}`;
}
