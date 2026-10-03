import { randomUUID } from "node:crypto";
import { expect, type Page } from "@playwright/test";

export const INITIAL_ADMIN = {
  loginId: process.env.INITIAL_ADMIN_ID ?? "admin",
  password: process.env.INITIAL_ADMIN_PASSWORD ?? "admin1234!",
};

export function uniqueName(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export async function loginThroughUi(page: Page, credentials: { loginId: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("아이디").fill(credentials.loginId);
  await page.getByLabel("비밀번호").fill(credentials.password);
  await page.getByRole("button", { name: "로그인" }).click();
}

export async function loginAsInitialAdmin(page: Page) {
  await loginThroughUi(page, INITIAL_ADMIN);
  await expect(page).toHaveURL(/\/documents/);
}

export async function expectToast(page: Page, message: string) {
  await expect(page.getByRole("status").filter({ hasText: message })).toBeVisible();
}
