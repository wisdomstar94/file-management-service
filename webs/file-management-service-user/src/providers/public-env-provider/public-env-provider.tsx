"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { PublicEnv } from "./_types/public-env";

const PublicEnvContext = createContext<PublicEnv>({ apiPublicUrl: "" });

export function PublicEnvProvider(props: { env: PublicEnv; children: ReactNode }) {
  return <PublicEnvContext value={props.env}>{props.children}</PublicEnvContext>;
}

export function usePublicEnv() {
  return useContext(PublicEnvContext);
}
