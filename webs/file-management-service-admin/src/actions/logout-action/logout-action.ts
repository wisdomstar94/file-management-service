"use server";

import { ADMIN_LOGOUT_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import { cookies } from "next/headers";
import { clearAdminTokenCookies, REFRESH_TOKEN_COOKIE } from "@/utils/admin-auth-cookies";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";
import { serverActionWrapper } from "@/wrappers/server-action-wrapper";

/** api 의 refresh token 을 폐기하고 토큰 쿠키를 지운다. api 호출이 실패해도 쿠키는 지운다. */
export const logoutAction = serverActionWrapper(async () => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    await fetchServerWrapper(
      ADMIN_LOGOUT_API,
      { body: { refreshToken } },
      { accessToken: null, redirectOnAuthError: false, redirectOnPageError: false },
    ).catch(() => undefined);
  }
  clearAdminTokenCookies(cookieStore);
  return { isLoggedOut: true as const };
});
