import { api } from "../api-client";

export async function loginAs(props: { loginId: string; password: string; ip?: string }) {
  const res = await api({ ip: props.ip }).post("/api/admin/auth/login").send(props);
  return res;
}

export async function loginAsInitialAdmin(): Promise<string> {
  const res = await loginAs({
    loginId: process.env.INITIAL_ADMIN_ID ?? "",
    password: process.env.INITIAL_ADMIN_PASSWORD ?? "",
  });
  if (res.status !== 200) {
    throw new Error(`최초 관리자 로그인 실패: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.accessToken;
}
