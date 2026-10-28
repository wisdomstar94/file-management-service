import type { RequestHeaders } from "../request-headers/index.js";

export type AccessPolicyRequest = { ip: string; headers: RequestHeaders };
