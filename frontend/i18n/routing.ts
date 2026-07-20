import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Site locales: `en` = British English (en-GB copy & formatting),
 * `sw` = Kiswahili (sw-KE). Keep routing codes as en/sw for URLs.
 */
export const routing = defineRouting({
  locales: ["en", "sw"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
