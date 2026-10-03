"use client";

import { Button } from "@fms/web-ui/components/button";
import { useRouter } from "next/navigation";

export function AccessDeniedActions() {
  const router = useRouter();

  async function logout() {
    await fetch("/bff/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="mt-1.5 flex gap-2">
      <Button onClick={logout} className="!h-10">
        로그아웃
      </Button>
      <Button variant="primary" className="!h-10" onClick={() => window.location.assign("/")}>
        다시 시도
      </Button>
    </div>
  );
}
