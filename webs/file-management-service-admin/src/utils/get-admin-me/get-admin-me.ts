import type { AdminMeResponse } from "@fms/api-schemas/responses/admin-auth-responses";
import { cache } from "react";
import { serverApiFetch } from "../server-api-fetch";

/** 한 요청 안에서 레이아웃 · 페이지가 함께 불러도 api 는 한 번만 호출한다. */
export const getAdminMe = cache(() => serverApiFetch<AdminMeResponse>("/api/admin/auth/me"));
