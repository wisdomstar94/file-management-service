"use client";

import type { ApiFailBody } from "@fms/common-utils/responses/api-response-body";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function SharePasswordForm(props: { token: string }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    const res = await fetch(`/s/${props.token}/unlock`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: new FormData(event.currentTarget).get("password") }),
    });
    setIsPending(false);
    if (res.ok) {
      router.refresh();
      return;
    }
    const body = (await res.json().catch(() => null)) as ApiFailBody | null;
    setErrorMessage(body?.error.message ?? "확인하지 못했습니다.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[420px] max-w-full flex-col gap-4 rounded-2xl border border-line bg-white px-8 py-9"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-[24px] text-primary">
        <i className="ti ti-lock" aria-hidden />
      </div>
      <div>
        <h1 className="m-0 text-[20px] font-bold">비밀번호가 필요합니다</h1>
        <p className="mt-1.5 mb-0 text-[13.5px] text-muted">공유받은 비밀번호를 입력하면 자료를 확인할 수 있습니다.</p>
      </div>
      <TextInput
        type="password"
        name="password"
        aria-label="비밀번호"
        placeholder="비밀번호"
        required
        autoFocus
        className="!h-11 !px-3.5"
      />
      {errorMessage && (
        <p role="alert" className="m-0 text-[13px] text-danger">
          {errorMessage}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={isPending} className="!h-11 !text-[14.5px]">
        확인
      </Button>
    </form>
  );
}
