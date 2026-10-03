export const API_ERROR_CODE = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCESS_POLICY_DENIED: "ACCESS_POLICY_DENIED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];

export type ApiErrorBody = {
  code: ApiErrorCode;
  message: string;
  requestKey?: string;
  details?: unknown;
};

/** 접근 정책 차단 시 `details` 에 담기는 값. 차단 화면에 그대로 표시한다. */
export type AccessPolicyDeniedDetails = {
  accountLoginId?: string;
  accountNickname?: string;
  accessPolicyGroupName: string;
  failedReasons: string[];
  requestIp: string;
  requestedAt: string;
};
