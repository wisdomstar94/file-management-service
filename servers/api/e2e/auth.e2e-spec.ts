import { api } from "./_utils/api-client";
import { loginAs } from "./_utils/login-as";

const credentials = { loginId: process.env.INITIAL_ADMIN_ID ?? "", password: process.env.INITIAL_ADMIN_PASSWORD ?? "" };

describe("관리자 인증", () => {
  test("올바른 아이디 · 비밀번호면 토큰을 발급하고 /me 로 권한 코드를 돌려준다", async () => {
    const login = await loginAs(credentials);
    expect(login.status).toBe(200);
    expect(login.body.data).toEqual(
      expect.objectContaining({ accessToken: expect.any(String), refreshToken: expect.any(String) }),
    );

    const me = await api({ token: login.body.data.accessToken }).get("/api/admin/auth/me").expect(200);
    expect(me.body.data.loginId).toBe(credentials.loginId);
    expect(me.body.data.permissionCodes).toEqual(expect.arrayContaining(["account.access", "perm.update"]));
  });

  test("비밀번호가 틀리면 401 INVALID_CREDENTIALS", async () => {
    const res = await loginAs({ ...credentials, password: "wrong-password" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  test("토큰 없이 관리 API 를 호출하면 401", async () => {
    const res = await api().get("/api/admin/accounts");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  test("refresh 는 새 토큰을 발급하고, 이미 쓴 refresh token 은 다시 쓸 수 없다", async () => {
    const login = await loginAs(credentials);
    const refreshed = await api().post("/api/admin/auth/refresh").send({ refreshToken: login.body.data.refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.refreshToken).not.toBe(login.body.data.refreshToken);

    const reused = await api().post("/api/admin/auth/refresh").send({ refreshToken: login.body.data.refreshToken });
    expect(reused.status).toBe(401);
  });

  test("logout 한 refresh token 은 더 이상 쓸 수 없다", async () => {
    const login = await loginAs(credentials);
    await api().post("/api/admin/auth/logout").send({ refreshToken: login.body.data.refreshToken }).expect(204);

    const res = await api().post("/api/admin/auth/refresh").send({ refreshToken: login.body.data.refreshToken });
    expect(res.status).toBe(401);
  });
});
