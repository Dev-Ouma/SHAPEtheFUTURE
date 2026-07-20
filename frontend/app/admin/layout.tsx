import { NextIntlClientProvider } from "next-intl";
import AdminLayout from "@/components/AdminLayout";
import { AdminMenuProvider } from "@/context/AdminMenuContext";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";
import enMessages from "@/messages/en.json";

/** Admin is client-auth gated; never statically cache this segment. */
export const dynamic = "force-dynamic";

/**
 * Admin is English-only and lives outside [locale].
 * Provide next-intl so shared public clients (e.g. programme preview,
 * pagination helpers that still touch i18n) do not crash with
 * "No intl context found".
 */
export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <AdminAuthProvider>
        <AdminMenuProvider>
          <AdminLayout>{children}</AdminLayout>
        </AdminMenuProvider>
      </AdminAuthProvider>
    </NextIntlClientProvider>
  );
}
