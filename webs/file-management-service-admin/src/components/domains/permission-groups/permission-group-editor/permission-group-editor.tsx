"use client";

import type { PermissionGroupDetailResponse } from "@fms/api-schemas/responses/permission-group-responses";
import type { PermissionResponse } from "@fms/api-schemas/responses/permission-responses";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/commons/card";
import { FormField } from "@/components/commons/form-field";
import { PageHeading } from "@/components/commons/page-heading";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useAdminSession } from "@/providers/admin-session-provider";
import { bffFetch } from "@/utils/bff-fetch";
import { groupPermissionsByCategory } from "./_utils/group-permissions-by-category";

export function PermissionGroupEditor(props: {
  group: PermissionGroupDetailResponse | null;
  permissions: PermissionResponse[];
}) {
  const { group, permissions } = props;
  const router = useRouter();
  const canSave = useAdminSession().hasPermission(group ? "perm.group.update" : "perm.group.create");
  const [name, setName] = useState(group?.name ?? "");
  const [checkedIds, setCheckedIds] = useState(() => new Set(group?.permissions.map((p) => p.id) ?? []));
  const { isPending, run } = useAsyncAction();
  const sections = groupPermissionsByCategory(permissions);

  function toggle(ids: string[], isChecked: boolean) {
    setCheckedIds((previous) => {
      const next = new Set(previous);
      for (const id of ids) {
        if (isChecked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }

  async function save() {
    const body = JSON.stringify({ name, permissionIds: [...checkedIds] });
    const saved = await run(
      () =>
        group
          ? bffFetch(`permission-groups/${group.id}`, { method: "PATCH", body })
          : bffFetch("permission-groups", { method: "POST", body }),
      { successMessage: "권한 그룹을 저장했습니다" },
    );
    if (saved !== undefined) {
      router.push("/permissions/groups");
    }
  }

  return (
    <>
      <PageHeading
        title={group ? group.name : "새 권한 그룹"}
        back={{ href: "/permissions/groups", label: "권한 그룹 목록" }}
        actions={
          <>
            <Link
              href="/permissions/groups"
              className="inline-flex h-[38px] items-center rounded-lg border border-line-input bg-white px-3.5 text-[13.5px] font-medium text-ink-2"
            >
              취소
            </Link>
            <Button
              variant="primary"
              disabled={!canSave || isPending}
              title={canSave ? undefined : `권한 그룹 ${group ? "수정" : "생성"} 권한이 없습니다`}
              onClick={save}
            >
              저장
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 rounded-xl border border-line bg-white px-[22px] py-5">
        <FormField label="권한 그룹 식별키">
          <TextInput
            disabled
            value={group?.id ?? "저장 시 자동 생성"}
            className="!h-[38px] !border-line-table !bg-field font-mono !text-[13px] !text-muted"
          />
        </FormField>
        <FormField label="권한 그룹명">
          <TextInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 자료 운영자"
            disabled={!canSave}
            className="!h-[38px] !text-[13.5px]"
          />
        </FormField>
      </div>
      <Card>
        <div className="flex items-center border-b border-line-soft px-[22px] py-4">
          <div className="flex-1 text-[15px] font-bold">권한 선택</div>
          <span className="text-[13px] font-semibold text-primary">
            {checkedIds.size} / {permissions.length}개 선택됨
          </span>
        </div>
        {sections.map((section) => {
          const ids = section.items.map((item) => item.id);
          const isAllChecked = ids.every((id) => checkedIds.has(id));
          return (
            <div
              key={section.category}
              className="grid grid-cols-[220px_minmax(0,1fr)] gap-4 border-b border-line-row px-[22px] py-4"
            >
              <label className="flex cursor-pointer items-center gap-2.5 self-start text-[13.5px] font-semibold">
                <input
                  type="checkbox"
                  className="size-[15px] accent-primary"
                  checked={isAllChecked}
                  disabled={!canSave}
                  onChange={(event) => toggle(ids, event.target.checked)}
                />
                {section.category}
              </label>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2.5">
                {section.items.map((item) => (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border border-line-table px-3 py-2.5 ${checkedIds.has(item.id) ? "bg-primary-row" : "bg-white"}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-[15px] accent-primary"
                      checked={checkedIds.has(item.id)}
                      disabled={!canSave}
                      onChange={(event) => toggle([item.id], event.target.checked)}
                    />
                    <div>
                      <div className="text-[13.5px]">{item.name}</div>
                      <div className="mt-0.5 font-mono text-[11.5px] text-faint">{item.code}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
