import { z } from "zod";

const loginIdSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_.-]{3,100}$/, "아이디는 영문 · 숫자 · `_` `.` `-` 3~100자입니다.");
const passwordSchema = z.string().min(8, "비밀번호는 8자 이상입니다.").max(200);

export const createAdminAccountRequestSchema = z.object({
  loginId: loginIdSchema,
  password: passwordSchema,
  nickname: z.string().trim().min(1, "닉네임을 입력하세요.").max(100),
  memo: z.string().max(2000).default(""),
  permissionGroupId: z.uuid(),
  accessPolicyGroupId: z.uuid(),
});

/** 비밀번호는 바꿀 때만 보낸다. */
export const updateAdminAccountRequestSchema = createAdminAccountRequestSchema
  .omit({ loginId: true, password: true })
  .partial()
  .extend({ password: passwordSchema.optional() });

export type CreateAdminAccountRequest = z.infer<typeof createAdminAccountRequestSchema>;
export type UpdateAdminAccountRequest = z.infer<typeof updateAdminAccountRequestSchema>;
