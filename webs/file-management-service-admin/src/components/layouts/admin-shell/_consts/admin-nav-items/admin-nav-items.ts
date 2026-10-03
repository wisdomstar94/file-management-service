import type { PermissionCode } from "@fms/common-utils/permissions/permission-code-registry";

export type AdminNavItem = {
  label: string;
  icon: string;
  href: string;
  permission: PermissionCode;
  children?: AdminNavItem[];
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "자료 관리", icon: "ti-folders", href: "/documents", permission: "file.list.access" },
  { label: "관리자 계정 관리", icon: "ti-user-shield", href: "/accounts", permission: "account.access" },
  { label: "접근 정책 그룹 관리", icon: "ti-shield-lock", href: "/access-policy-groups", permission: "policy.access" },
  {
    label: "권한 관리",
    icon: "ti-key",
    href: "/permissions",
    permission: "perm.group.access",
    children: [
      { label: "권한 그룹 관리", icon: "ti-users-group", href: "/permissions/groups", permission: "perm.group.access" },
      { label: "권한 관리", icon: "ti-list-check", href: "/permissions/items", permission: "perm.access" },
    ],
  },
];
