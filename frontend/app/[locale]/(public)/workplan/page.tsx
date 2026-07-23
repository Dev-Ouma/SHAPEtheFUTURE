import { redirect } from "@/i18n/routing";

/** Workplan lives on the Work Packages screen (`#workplan`). */
export default function WorkplanRedirectPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect({ href: "/work-packages#workplan", locale: params.locale });
}
