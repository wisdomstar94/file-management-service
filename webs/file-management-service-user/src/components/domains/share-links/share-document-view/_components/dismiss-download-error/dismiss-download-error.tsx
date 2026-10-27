"use client";

import { useEffect } from "react";
import { SHARE_LINK_DOWNLOAD_ERROR_ROUTE } from "@/api-schemas/share-link-route-schemas";
import { useCallApiWrapper } from "@/wrappers/use-call-api-wrapper";

/** 문구는 지금 화면에 남겨 두고, 새로고침하면 사라지도록 실패 사유 쿠키만 지운다. */
export function DismissDownloadError(props: { token: string }) {
  const { token } = props;
  const { fetchApi } = useCallApiWrapper(SHARE_LINK_DOWNLOAD_ERROR_ROUTE, { via: "client", refreshOnSuccess: false });

  // biome-ignore lint/correctness/useExhaustiveDependencies: 링크마다 한 번만 지운다.
  useEffect(() => {
    fetchApi({ params: { token } });
  }, [token]);

  return null;
}
