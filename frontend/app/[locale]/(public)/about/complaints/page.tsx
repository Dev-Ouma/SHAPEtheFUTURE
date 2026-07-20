import { redirect } from "@/i18n/routing";

export default function ComplaintsRedirectPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect({ href: "/about/campus-feedback", locale: params.locale });
}
