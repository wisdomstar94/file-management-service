export type PermissionResponse = {
  id: string;
  category: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type PermissionListResponse = {
  items: PermissionResponse[];
  /** 코드에는 있으나 DB 에 권한이 없는 코드. 이 코드로 막힌 기능은 아무도 쓸 수 없다. */
  codeOnlyPermissionCodes: string[];
};
