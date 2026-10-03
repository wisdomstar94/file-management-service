import argon2 from "argon2";

/** 해시 형식이 잘못된 경우에도 예외 대신 `false` 를 반환한다. */
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}
