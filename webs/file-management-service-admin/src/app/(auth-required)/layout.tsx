import type { ReactNode } from "react";
import { AdminShell } from "@/components/layouts/admin-shell";
import { AdminSessionProvider } from "@/providers/admin-session-provider";
import { PublicEnvProvider } from "@/providers/public-env-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { getAdminMe } from "@/utils/get-admin-me";
import { webEnv } from "@/utils/web-env";

export default async function AuthRequiredLayout(props: { children: ReactNode }) {
  const me = await getAdminMe();
  return (
    <PublicEnvProvider env={{ apiPublicUrl: webEnv.apiPublicUrl }}>
      <AdminSessionProvider me={me}>
        <ToastProvider>
          <AdminShell>{props.children}</AdminShell>
        </ToastProvider>
      </AdminSessionProvider>
    </PublicEnvProvider>
  );
}
