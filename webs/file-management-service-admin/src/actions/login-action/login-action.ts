"use server";

import { ADMIN_LOGIN_API } from "@fms/api-schemas/schemas/admin-auth-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import { cookies } from "next/headers";
import { writeAdminTokenCookies } from "@/utils/admin-auth-cookies";
import { fetchServerWrapper } from "@/wrappers/fetch-server-wrapper";
import { serverActionWrapper } from "@/wrappers/server-action-wrapper";

/** 로그인 성공 시 토큰은 httpOnly 쿠키로만 저장하고 브라우저에는 돌려주지 않는다. */
export const loginAction = serverActionWrapper(async (body: ReqBody<typeof ADMIN_LOGIN_API>) => {
  const tokens = await fetchServerWrapper(
    ADMIN_LOGIN_API,
    { body },
    { accessToken: null, redirectOnAuthError: false, redirectOnPageError: false },
  );
  writeAdminTokenCookies(await cookies(), tokens.data);
  return { isLoggedIn: true as const };
});
