import React from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";

/**
 * Student portal is English-only (same policy as admin).
 * Provide next-intl so shared widgets (e.g. Chatbot) do not crash outside [locale].
 */
export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
