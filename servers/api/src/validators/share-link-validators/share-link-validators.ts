import type { PUBLIC_SHARE_LINK_UNLOCK_API } from "@fms/api-schemas/schemas/public-share-link-api-schemas";
import type { CREATE_SHARE_LINK_API, UPDATE_SHARE_LINK_API } from "@fms/api-schemas/schemas/share-link-api-schemas";
import type { ReqBody } from "@fms/api-schemas/types/api-schema-utils";
import { z } from "zod";
import { isValidFixedVersion } from "./_utils/is-valid-fixed-version/index.js";
import { isValidPeriod } from "./_utils/is-valid-period/index.js";

const shareLinkFieldsSchema = z.object({
  accessPolicyGroupId: z.uuid().nullable(),
  /** 문자열이면 그 비밀번호로 설정, `null` 이면 비밀번호 해제. 수정 시 생략하면 기존 값 유지 */
  password: z.string().min(4, "비밀번호는 4자 이상입니다.").max(200).nullable(),
  maxDownloadCount: z.number().int().min(1, "1 이상이어야 합니다.").nullable(),
  availableFrom: z.iso.datetime({ offset: true }).nullable(),
  availableUntil: z.iso.datetime({ offset: true }).nullable(),
  defaultVersionMode: z.enum(["FOLLOW_DOCUMENT", "FIXED"]),
  fixedVersionId: z.uuid().nullable(),
  isShowOtherVersions: z.boolean(),
  isAllowOtherVersionDownload: z.boolean(),
  isShowDownloadStatus: z.boolean(),
});

export const createShareLinkRequestSchema = shareLinkFieldsSchema
  .refine(isValidPeriod, { message: "종료일은 시작일보다 빠를 수 없습니다.", path: ["availableUntil"] })
  .refine(isValidFixedVersion, {
    message: "별도 지정할 버전을 선택하세요.",
    path: ["fixedVersionId"],
  }) satisfies z.ZodType<ReqBody<typeof CREATE_SHARE_LINK_API>>;

export const updateShareLinkRequestSchema = shareLinkFieldsSchema
  .partial()
  .refine(isValidPeriod, { message: "종료일은 시작일보다 빠를 수 없습니다.", path: ["availableUntil"] })
  .refine(isValidFixedVersion, {
    message: "별도 지정할 버전을 선택하세요.",
    path: ["fixedVersionId"],
  }) satisfies z.ZodType<ReqBody<typeof UPDATE_SHARE_LINK_API>>;

export const unlockShareLinkRequestSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력하세요."),
}) satisfies z.ZodType<ReqBody<typeof PUBLIC_SHARE_LINK_UNLOCK_API>>;
