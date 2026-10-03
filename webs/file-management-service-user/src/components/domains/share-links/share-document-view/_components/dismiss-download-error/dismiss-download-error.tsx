"use client";

import { useEffect } from "react";

/** 문구는 지금 화면에 남겨 두고, 새로고침하면 사라지도록 실패 사유 쿠키만 지운다. */
export function DismissDownloadError(props: { token: string }) {
  const { token } = props;

  useEffect(() => {
    fetch(`/s/${token}/download-error`, { method: "DELETE" });
  }, [token]);

  return null;
}
