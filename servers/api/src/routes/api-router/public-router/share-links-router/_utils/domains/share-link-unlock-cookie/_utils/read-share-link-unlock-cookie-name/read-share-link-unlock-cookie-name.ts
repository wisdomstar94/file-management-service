// 링크마다 잠금 해제 토큰을 따로 둔다.
export const readShareLinkUnlockCookieName = (shareLinkKey: string) => `fms_share_unlock_${shareLinkKey}`;
