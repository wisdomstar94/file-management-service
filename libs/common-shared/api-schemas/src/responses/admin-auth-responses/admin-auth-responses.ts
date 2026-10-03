export type AdminTokenResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export type AdminMeResponse = {
  id: string;
  loginId: string;
  nickname: string;
  permissionGroupName: string;
  accessPolicyGroupName: string;
  permissionCodes: string[];
};
