import { z } from "zod";

export const adminLoginRequestSchema = z.object({
  loginId: z.string().trim().min(1, "아이디를 입력하세요."),
  password: z.string().min(1, "비밀번호를 입력하세요."),
});

export const adminRefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type AdminLoginRequest = z.infer<typeof adminLoginRequestSchema>;
export type AdminRefreshTokenRequest = z.infer<typeof adminRefreshTokenRequestSchema>;
