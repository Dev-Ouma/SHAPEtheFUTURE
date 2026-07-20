import PublicShell from "@/components/PublicShell";
import { getApiCached, getMenus, getSettings } from "@/lib/api";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  const [headerMenus, topMenus, footerMenus, settings, backlinks, maintenance] =
    await Promise.all([
      getMenus("header", locale),
      getMenus("top_header", locale),
      getMenus("footer", locale),
      getSettings(locale),
      getApiCached("/partnerships/backlinks", { revalidate: 300 }).catch(
        () => [],
      ),
      getApiCached("/maintenance/status", { revalidate: 30 }).catch(() => null),
    ]);

  const asMenuList = (value: any) =>
    Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];

  return (
    <PublicShell
      headerMenus={asMenuList(headerMenus)}
      topMenus={asMenuList(topMenus)}
      footerMenus={asMenuList(footerMenus)}
      settings={settings && typeof settings === "object" ? settings : {}}
      backlinks={Array.isArray(backlinks) ? backlinks : []}
      maintenanceInitial={maintenance}
    >
      {children}
    </PublicShell>
  );
}
