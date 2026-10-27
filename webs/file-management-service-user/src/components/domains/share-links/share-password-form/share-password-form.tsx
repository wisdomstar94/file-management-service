"use client";

import { isCommonError } from "@fms/error-provider/errors/is-common-error";
import { Button } from "@fms/web-ui/components/button";
import { TextInput } from "@fms/web-ui/components/text-input";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { SHARE_LINK_UNLOCK_ROUTE } from "@/api-schemas/share-link-route-schemas";
import { readCommonErrorMessage } from "@/utils/read-common-error-message";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";

export function SharePasswordForm(props: { token: string }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const unlockApi = useCallApiWrapper(SHARE_LINK_UNLOCK_ROUTE, { via: "client", refreshOnSuccess: false });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    const result = await unlockApi.fetchApi({
      params: { token: props.token },
      body: { password: String(new FormData(event.currentTarget).get("password") ?? "") },
    });
    if (!isCommonError(result)) {
      router.refresh();
      return;
    }
    setErrorMessage(readCommonErrorMessage(result));
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
      <Button type="submit" variant="primary" disabled={unlockApi.isLoading} className="!h-11 !text-[14.5px]">
        확인
      </Button>
    </form>
  );
}
