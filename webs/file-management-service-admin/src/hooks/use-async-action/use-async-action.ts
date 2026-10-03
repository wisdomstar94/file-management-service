"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/providers/toast-provider";
import { readBffErrorMessage } from "@/utils/bff-fetch";

/**
 * 저장 · 삭제처럼 서버에 반영하는 동작을 실행한다. 성공하면 토스트를 띄우고 서버 컴포넌트를 다시 불러오며,
 * 실패하면 오류 메시지를 토스트로 띄우고 `undefined` 를 돌려준다.
 */
export function useAsyncAction() {
  const router = useRouter();
  const showToast = useToast();
  const [isPending, setIsPending] = useState(false);

  async function run<T>(action: () => Promise<T>, options: { successMessage?: string } = {}): Promise<T | undefined> {
    setIsPending(true);
    try {
      const result = await action();
      if (options.successMessage) {
        showToast(options.successMessage);
      }
      router.refresh();
      return result;
    } catch (error) {
      showToast(readBffErrorMessage(error), "error");
      return undefined;
    } finally {
      setIsPending(false);
    }
  }

  return { isPending, run };
}
