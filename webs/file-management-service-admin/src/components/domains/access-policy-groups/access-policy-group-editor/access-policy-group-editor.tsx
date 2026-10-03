"use client";

import { ACCESS_POLICY_TREE_MAX_DEPTH } from "@fms/api-schemas/requests/access-policy-group-request-schemas";
import type { AccessPolicyGroupDetailResponse } from "@fms/api-schemas/responses/access-policy-group-responses";
import { describeAccessPolicyNode } from "@fms/common-utils/access-policies/describe-access-policy-node";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField } from "@/components/commons/form-field";
import { PageHeading } from "@/components/commons/page-heading";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useAdminSession } from "@/providers/admin-session-provider";
import { bffFetch } from "@/utils/bff-fetch";
import { PolicyGroupBlock } from "./_components/policy-group-block";
import { fromPolicyTree, toPolicyTree } from "./_utils/convert-policy-tree";

export function AccessPolicyGroupEditor(props: { group: AccessPolicyGroupDetailResponse | null }) {
  const { group } = props;
  const router = useRouter();
  const canSave = useAdminSession().hasPermission(group ? "policy.update" : "policy.create");
  const [name, setName] = useState(group?.name ?? "");
  const [root, setRoot] = useState(() => fromPolicyTree(group?.ruleTree ?? null));
  const { isPending, run } = useAsyncAction();
  const tree = toPolicyTree(root);

  async function save() {
    const body = JSON.stringify({ name, ruleTree: tree });
    const saved = await run(
      () =>
        group
          ? bffFetch(`access-policy-groups/${group.id}`, { method: "PATCH", body })
          : bffFetch("access-policy-groups", { method: "POST", body }),
      { successMessage: "접근 정책 그룹을 저장했습니다" },
    );
    if (saved !== undefined) {
      router.push("/access-policy-groups");
    }
  }

  return (
    <>
      <PageHeading
        title={group ? group.name : "새 접근 정책 그룹"}
        back={{ href: "/access-policy-groups", label: "접근 정책 그룹 목록" }}
        actions={
          <>
            <Link
              href="/access-policy-groups"
              className="inline-flex h-[38px] items-center rounded-lg border border-line-input bg-white px-3.5 text-[13.5px] font-medium text-ink-2"
            >
              취소
            </Link>
            <Button
              variant="primary"
              disabled={!canSave || isPending}
              title={canSave ? undefined : `접근 정책 그룹 ${group ? "수정" : "생성"} 권한이 없습니다`}
              onClick={save}
            >
              저장
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 rounded-xl border border-line bg-white px-[22px] py-5">
            <FormField label="접근 정책 그룹 식별키">
              <TextInput
                disabled
                value={group?.id ?? "저장 시 자동 생성"}
                className="!h-[38px] !border-line-table !bg-field font-mono !text-[13px] !text-muted"
              />
            </FormField>
            <FormField label="접근 정책 그룹명">
              <TextInput
                value={name}
                disabled={!canSave}
                onChange={(event) => setName(event.target.value)}
                placeholder="예: 사내망 전용"
                className="!h-[38px] !text-[13.5px]"
              />
            </FormField>
          </div>
          <PolicyGroupBlock
            group={root}
            depth={1}
            maxDepth={ACCESS_POLICY_TREE_MAX_DEPTH}
            isDisabled={!canSave}
            onChange={setRoot}
          />
        </div>
        <aside className="flex max-w-full flex-[1_1_280px] flex-col gap-3.5 rounded-xl border border-line bg-white p-5">
          <div className="text-[14px] font-bold">적용 규칙 미리보기</div>
          <div className="rounded-lg bg-code-bg p-3.5 font-mono text-[13px] leading-relaxed text-code-fg">
            {describeAccessPolicyNode(tree)}
          </div>
          <div className="text-[13px] leading-relaxed text-sub">
            {tree === null ? "제한이 없어 모든 접근을 허용합니다." : "위 조건식을 통과한 요청만 허용합니다."}
          </div>
          {group && (
            <>
              <div className="h-px bg-line-soft" />
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">사용 중인 관리자 계정</span>
                <span className="font-semibold">{group.usedAccountCount}개</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">사용 중인 공개 링크</span>
                <span className="font-semibold">{group.usedShareLinkCount}개</span>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
