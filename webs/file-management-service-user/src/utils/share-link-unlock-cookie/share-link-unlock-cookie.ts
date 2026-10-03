/** 링크마다 잠금 해제 토큰을 따로 둔다. 쿠키 경로를 그 링크로 한정해 다른 링크에 섞이지 않게 한다. */
export function readUnlockCookieName(token: string): string {
  return `fms_share_unlock_${token}`;
}

export function readUnlockCookiePath(token: string): string {
  return `/s/${token}`;
}
