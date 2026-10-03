import { type JWTPayload, SignJWT } from "jose";

/** HS256 으로 서명한 JWT 를 만듭니다. `audience` 로 토큰 용도를 구분해 다른 용도의 토큰을 재사용하지 못하게 합니다. */
export function signJwt(props: {
  payload: JWTPayload;
  subject: string;
  audience: string;
  secret: string;
  expiresInSeconds: number;
}): Promise<string> {
  const { payload, subject, audience, secret, expiresInSeconds } = props;
  const nowSeconds = Math.floor(Date.now() / 1000);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setAudience(audience)
    .setIssuedAt(nowSeconds)
    .setExpirationTime(nowSeconds + expiresInSeconds)
    .sign(new TextEncoder().encode(secret));
}
