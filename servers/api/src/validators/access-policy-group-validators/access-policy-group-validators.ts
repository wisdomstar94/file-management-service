import type {
  CREATE_ACCESS_POLICY_GROUP_API,
  UPDATE_ACCESS_POLICY_GROUP_API,
} from "@fms/api-schemas/schemas/access-policy-group-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import type { AccessPolicyNode } from "@fms/common-utils/access-policies/access-policy-node";
import { ACCESS_POLICY_TREE_MAX_DEPTH } from "@fms/common-utils/access-policies/access-policy-node";
import { z } from "zod";
import { isCidrFormat } from "./_utils/is-cidr-format/index.js";
import { isRegexFormat } from "./_utils/is-regex-format/index.js";
import { readDepth } from "./_utils/read-depth/index.js";

const ipNodeSchema = z.object({
  type: z.literal("IP"),
  mode: z.enum(["ALLOW_ALL_EXCEPT", "DENY_ALL_EXCEPT"]),
  cidrs: z.array(z.string().trim().refine(isCidrFormat, "IP 또는 CIDR 형식이 아닙니다.")),
});

const headerNodeSchema = z
  .object({
    type: z.literal("HEADER"),
    name: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9-]+$/, "헤더명은 영문 · 숫자 · `-` 만 쓸 수 있습니다."),
    matchType: z.enum(["EQUALS", "CONTAINS", "REGEX", "EXISTS"]),
    value: z.string().optional(),
  })
  .refine((node) => node.matchType === "EXISTS" || (node.value ?? "") !== "", "값을 입력하세요.")
  .refine((node) => node.matchType !== "REGEX" || isRegexFormat(node.value ?? ""), "정규식 형식이 아닙니다.");

export const accessPolicyNodeSchema: z.ZodType<AccessPolicyNode> = z.lazy(() =>
  z.union([
    ipNodeSchema,
    headerNodeSchema,
    z.object({
      type: z.literal("GROUP"),
      operator: z.enum(["AND", "OR"]),
      children: z.array(accessPolicyNodeSchema).min(1, "그룹에는 조건이 1개 이상 있어야 합니다."),
    }),
  ]),
);

const ruleTreeSchema = accessPolicyNodeSchema
  .nullable()
  .refine(
    (node) => node === null || readDepth(node) <= ACCESS_POLICY_TREE_MAX_DEPTH,
    `조건은 최대 ${ACCESS_POLICY_TREE_MAX_DEPTH}단계까지 중첩할 수 있습니다.`,
  );

export const createAccessPolicyGroupRequestSchema = z.object({
  name: z.string().trim().min(1, "접근 정책 그룹명을 입력하세요.").max(100),
  ruleTree: ruleTreeSchema,
}) satisfies z.ZodType<ReqBody<typeof CREATE_ACCESS_POLICY_GROUP_API>>;

export const updateAccessPolicyGroupRequestSchema = createAccessPolicyGroupRequestSchema.partial() satisfies z.ZodType<
  ReqBody<typeof UPDATE_ACCESS_POLICY_GROUP_API>
>;
