/** 로그인하지 않아야만 들어갈 수 있는 경로 — `(guest-only)` 라우트 그룹 */
export const GUEST_ONLY_PATHS = ["/login"];

/** 로그인 여부와 관계없이 들어갈 수 있는 경로 — `(public)` 라우트 그룹 */
export const PUBLIC_PATHS = ["/access-denied", "/forbidden"];

export type RouteGroup = "guest-only" | "public" | "auth-required";

const isMatched = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

/** 위 두 목록에 없으면 `(auth-required)` 로 본다. 새 경로가 실수로 공개되지 않게 기본값을 로그인 필수로 둔다. */
export function readRouteGroup(pathname: string): RouteGroup {
  if (isMatched(pathname, GUEST_ONLY_PATHS)) {
    return "guest-only";
  }
  if (isMatched(pathname, PUBLIC_PATHS)) {
    return "public";
  }
  return "auth-required";
}
