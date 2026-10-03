/** 선택지(드롭다운)용 이름 목록 */
export type NamedOption = { id: string; name: string };

export type AssignableAccountGroupsResponse = {
  permissionGroups: NamedOption[];
  accessPolicyGroups: NamedOption[];
};
