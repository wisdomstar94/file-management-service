import { GUEST_ONLY_PATHS, PUBLIC_PATHS } from "./_consts/route-group-paths";
import { isMatched } from "./_utils/is-matched";

export type RouteGroup = "guest-only" | "public" | "auth-required";

/** `GUEST_ONLY_PATHS` · `PUBLIC_PATHS` 에 없으면 `(auth-required)` 로 본다. 새 경로가 실수로 공개되지 않게 기본값을 로그인 필수로 둔다. */
export function readRouteGroup(pathname: string): RouteGroup {
  if (isMatched(pathname, GUEST_ONLY_PATHS)) {
    return "guest-only";
  }
  if (isMatched(pathname, PUBLIC_PATHS)) {
    return "public";
  }
  return "auth-required";
}
