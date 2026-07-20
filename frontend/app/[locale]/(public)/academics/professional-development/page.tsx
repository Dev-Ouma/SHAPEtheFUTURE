import { redirect } from "@/i18n/routing";

// Redirect the old URL slug to the actual page
export default function ProfessionalDevelopmentRedirect({
  params,
}: {
  params: { locale: string };
}) {
  redirect({
    href: "/academics/professional-development-courses",
    locale: params.locale,
  });
}
