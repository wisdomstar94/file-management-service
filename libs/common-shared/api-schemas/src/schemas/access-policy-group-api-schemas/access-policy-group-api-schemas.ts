import type { AccessPolicyNode } from "@fms/common-utils/access-policies/access-policy-node";
import type { ApiSuccessBody } from "@fms/common-utils/responses/api-response-body";
import { type ApiSchema, typeOf } from "../../types/api-schema/index.js";

type AccessPolicyGroupSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type AccessPolicyGroupDetail = AccessPolicyGroupSummary & {
  ruleTree: AccessPolicyNode | null;
  usedAccountCount: number;
  usedShareLinkCount: number;
};

type CreateAccessPolicyGroupBody = {
  name: string;
  ruleTree: AccessPolicyNode | null;
};

export const ACCESS_POLICY_GROUP_LIST_API = {
  url: "/api/admin/access-policy-groups",
  method: "GET",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AccessPolicyGroupSummary[]>>(),
  tags: ["access-policy-groups"],
} as const satisfies ApiSchema;

export const ACCESS_POLICY_GROUP_DETAIL_API = {
  url: "/api/admin/access-policy-groups/:id",
  method: "GET",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AccessPolicyGroupDetail>>(),
  tags: ["access-policy-groups"],
} as const satisfies ApiSchema;

export const CREATE_ACCESS_POLICY_GROUP_API = {
  url: "/api/admin/access-policy-groups",
  method: "POST",
  request: {
    params: typeOf<undefined>(),
    headers: typeOf<undefined>(),
    body: typeOf<CreateAccessPolicyGroupBody>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AccessPolicyGroupDetail>>(),
  tags: ["access-policy-groups"],
} as const satisfies ApiSchema;

export const UPDATE_ACCESS_POLICY_GROUP_API = {
  url: "/api/admin/access-policy-groups/:id",
  method: "PATCH",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<Partial<CreateAccessPolicyGroupBody>>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<ApiSuccessBody<AccessPolicyGroupDetail>>(),
  tags: ["access-policy-groups"],
} as const satisfies ApiSchema;

export const DELETE_ACCESS_POLICY_GROUP_API = {
  url: "/api/admin/access-policy-groups/:id",
  method: "DELETE",
  request: {
    params: typeOf<{ id: string }>(),
    headers: typeOf<undefined>(),
    body: typeOf<undefined>(),
    query: typeOf<undefined>(),
  },
  response: typeOf<null>(),
  tags: ["access-policy-groups"],
} as const satisfies ApiSchema;
