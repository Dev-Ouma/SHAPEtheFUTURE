import { notFound } from "next/navigation";
import { redirect } from "@/i18n/routing";
import { getStaffProfile } from "@/lib/api";

export default async function LeadershipProfileRedirect({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  // Try to find the profile in the new system
  const profile = await getStaffProfile(params.slug);

  if (profile && profile.is_public) {
    // Preserve active locale (e.g. /sw/...) when moving to the canonical staff URL
    redirect({ href: `/about/staff/${params.slug}`, locale: params.locale });
  }

  // If not found in dynamic, check legacy mock data or return 404
  // For OUK, we want to transition everyone to the dynamic system.
  // If the admin hasn't added them yet, they might get a 404, which is correct as we move away from mocks.

  return notFound();
}
