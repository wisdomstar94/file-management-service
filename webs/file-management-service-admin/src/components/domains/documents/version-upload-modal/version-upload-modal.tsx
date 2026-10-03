"use client";

import type { DocumentDetailResponse, DocumentVersionResponse } from "@fms/api-schemas/responses/document-responses";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import { type FormEvent, useState } from "react";
import { FormField } from "@/components/commons/form-field";
import { Modal } from "@/components/commons/modal";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useToast } from "@/providers/toast-provider";
import { bffFetch } from "@/utils/bff-fetch";
import { FileDropZone } from "./_components/file-drop-zone";

export type VersionUploadMode =
  | { kind: "new-document" }
  | { kind: "new-version"; documentId: string }
  | { kind: "edit-version"; documentId: string; version: DocumentVersionResponse };

const TITLES = { "new-document": "새 자료 등록", "new-version": "새 버전 등록", "edit-version": "버전 수정" };

/** 새 자료 등록 · 새 버전 등록 · 버전명 수정을 같은 모달로 처리한다. 버전 수정은 파일을 바꾸지 않는다. */
export function VersionUploadModal(props: {
  mode: VersionUploadMode;
  onClose: () => void;
  onSaved?: (document: DocumentDetailResponse) => void;
}) {
  const { mode, onClose, onSaved } = props;
  const [file, setFile] = useState<File | null>(null);
  const showToast = useToast();
  const { isPending, run } = useAsyncAction();
  const isEdit = mode.kind === "edit-version";

  function submit(form: FormData) {
    const versionName = String(form.get("versionName") ?? "");
    if (mode.kind === "edit-version") {
      return bffFetch<DocumentDetailResponse>(`documents/${mode.documentId}/versions/${mode.version.id}`, {
        method: "PATCH",
        body: JSON.stringify({ versionName }),
      });
    }
    const body = new FormData();
    if (mode.kind === "new-document") {
      body.set("name", String(form.get("name") ?? ""));
    }
    body.set("versionName", versionName);
    body.set("file", file as File);
    const path = mode.kind === "new-document" ? "documents" : `documents/${mode.documentId}/versions`;
    return bffFetch<DocumentDetailResponse>(path, { method: "POST", body });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isEdit && !file) {
      showToast("파일을 선택하세요.", "error");
      return;
    }
    const form = new FormData(event.currentTarget);
    const saved = await run(() => submit(form), { successMessage: isEdit ? "저장했습니다" : "등록했습니다" });
    if (saved) {
      onSaved?.(saved);
      onClose();
    }
  }

  return (
    <Modal title={TITLES[mode.kind]} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 px-[22px] py-5">
          {mode.kind === "new-document" && (
            <FormField label="자료명">
              <TextInput name="name" required placeholder="예: 2026 하반기 브랜드 가이드라인" />
            </FormField>
          )}
          <FormField label="버전명">
            <TextInput
              name="versionName"
              required
              defaultValue={isEdit ? mode.version.versionName : ""}
              placeholder="예: v0.13"
              className="font-mono"
            />
          </FormField>
          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold">파일</span>
              <FileDropZone file={file} onChange={setFile} />
            </div>
          )}
          <div className="flex gap-2 rounded-lg bg-field p-3 text-[12.5px] leading-normal text-muted">
            <i className="ti ti-info-circle shrink-0 text-[16px] text-primary" aria-hidden />
            {isEdit
              ? "버전명만 바꿉니다. 파일을 바꾸려면 새 버전을 등록하세요."
              : "같은 주제의 파일인지는 시스템에서 확인하지 않습니다. 등록 전 내용을 확인해 주세요."}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line-soft px-[22px] py-3.5">
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isEdit ? "저장" : "등록"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
