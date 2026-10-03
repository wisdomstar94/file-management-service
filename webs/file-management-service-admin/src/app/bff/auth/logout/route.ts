import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAdminTokenCookies, REFRESH_TOKEN_COOKIE } from "@/utils/admin-auth-cookies";
import { webEnv } from "@/utils/web-env";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    await fetch(`${webEnv.apiInternalUrl}/api/admin/auth/logout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }
  const response = new NextResponse(null, { status: 204 });
  clearAdminTokenCookies(response.cookies);
  return response;
}
