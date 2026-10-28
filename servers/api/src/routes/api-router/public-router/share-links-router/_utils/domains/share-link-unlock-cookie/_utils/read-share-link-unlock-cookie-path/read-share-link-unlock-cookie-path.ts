// 쿠키 경로를 그 링크의 api 로 한정해 다른 링크에 섞이지 않게 한다.
export const readShareLinkUnlockCookiePath = (shareLinkKey: string) =>
  `/api/public/share-links/${encodeURIComponent(shareLinkKey)}`;
