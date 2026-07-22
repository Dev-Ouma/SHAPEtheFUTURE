"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminUser } from "@/hooks/useAdminPermissions";
import {
  Menu as MenuIcon,
  RefreshCw,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { AlertProvider } from "@/context/AlertContext";

import Sidebar from "@/components/admin/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import AdminGlobalSearch from "@/components/admin/AdminGlobalSearch";
import { useAdminMenu } from "@/context/AdminMenuContext";
import { cn } from "@/lib/utils";
import { API_URL, clearAdminSession, getAdminAuthHeaders, getApi } from "@/lib/api";
import { SearchHighlightProvider } from "@/components/SearchHighlightProvider";
import { DEFAULT_RELATED_TERMS } from "@/lib/searchHighlight";

/**
 * AdminLayout provides a premium, flat UI wrapper for the OUK management console.
 * It includes client-side auth protection and a sidebar navigation system.
 */
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);
  const { menuSections, refreshMenu } = useAdminMenu();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);

  const { user: authUser, refresh: refreshAuthUser, clearLocalUser } = useAdminUser();
  const [relatedTermsJson, setRelatedTermsJson] = React.useState<string>(
    JSON.stringify(DEFAULT_RELATED_TERMS),
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getApi("/settings/public");
        if (!cancelled && data?.search_related_terms_json) {
          setRelatedTermsJson(String(data.search_related_terms_json));
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const userRole = React.useMemo(() => {
    if (!authUser) return "User";
    const slug = authUser.role?.name || authUser.role?.slug || authUser.role_legacy || "User";
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, " ");
  }, [authUser]);

  const userDisplayName = React.useMemo(() => {
    if (!authUser) return "Administrator";
    return authUser.full_name || authUser.email || "Administrator";
  }, [authUser]);

  const userInitials = React.useMemo(() => {
    if (!authUser) return "U";
    const name = authUser.full_name || authUser.email || "Unknown";
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }, [authUser]);

  React.useEffect(() => {
    if (!accountMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  React.useEffect(() => {
    setAccountMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      if (
        pathname === "/admin/login" ||
        pathname.startsWith("/admin/forgot-password") ||
        pathname.startsWith("/admin/reset-password")
      ) {
        setLoggingOut(false);
        setAuthorized(false);
        return;
      }

      // Soft gate from cached user (fast paint), then confirm via cookie.
      const userStr = localStorage.getItem("ouk_admin_user");
      let hadCookieSession = false;
      try {
        hadCookieSession = sessionStorage.getItem("ouk_admin_cookie_ok") === "1";
      } catch {
        /* ignore */
      }
      if (userStr) setAuthorized(true);

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
          headers: getAdminAuthHeaders(),
          cache: "no-store",
        });

        if (cancelled) return;

        if (res.ok) {
          const me = await res.json();
          localStorage.setItem("ouk_admin_user", JSON.stringify(me));
          setAuthorized(true);
          if (menuSections.length === 0) refreshMenu();
          await refreshAuthUser();
        } else if (res.status === 401) {
          // Clear HttpOnly cookie + local backup; avoid leaving a stale session cookie.
          clearAdminSession({ redirect: false });
          setAuthorized(false);
          // Only label it "expired" when the browser previously held a session.
          const loginPath =
            userStr || hadCookieSession
              ? "/admin/login?session=expired"
              : "/admin/login";
          router.push(loginPath);
        } else if (!userStr) {
          setAuthorized(false);
          router.push("/admin/login");
        }
      } catch {
        if (!cancelled && !userStr) {
          setAuthorized(false);
          router.push("/admin/login");
        }
      }
    };

    verifySession();
    setIsSidebarOpen(false);

    let idleTimer: NodeJS.Timeout;
    const IDLE_TIMEOUT = 60 * 60 * 1000;

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (localStorage.getItem("ouk_admin_user")) {
          handleLogout();
        }
      }, IDLE_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    if (typeof window !== "undefined" && localStorage.getItem("ouk_admin_user")) {
      events.forEach(event => document.addEventListener(event, resetTimer));
      resetTimer();
    }

    return () => {
      cancelled = true;
      if (idleTimer) clearTimeout(idleTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: getAdminAuthHeaders(),
      });
    } catch (e) {}
    localStorage.removeItem("ouk_admin_token");
    localStorage.removeItem("ouk_admin_user");
    try {
      sessionStorage.removeItem("ouk_admin_cookie_ok");
    } catch {
      /* ignore */
    }
    // Do not call refresh()/auth/me here — session is already cleared and a
    // probe would only produce a console 401 before we leave /admin.
    clearLocalUser();
    setAuthorized(false);
    setTimeout(() => {
      router.push("/admin/login");
    }, 450);
  };

  const flattenMenuItems = (items: any[] = []): any[] => {
    const out: any[] = [];
    for (const item of items) {
      if (Array.isArray(item?.children) && item.children.length) {
        out.push(...flattenMenuItems(item.children));
      } else if (item?.href) {
        out.push(item);
      }
    }
    return out;
  };

  const sidebarLinks = menuSections?.flatMap((s: any) => flattenMenuItems(s.items || [])) || [];

  const headerTitle =
    sidebarLinks.find((l: any) => l.href === pathname)?.label ||
    sidebarLinks.find((l: any) => l.href && pathname.startsWith(l.href + "/"))?.label ||
    "Management";

  const isAuthEntryPage =
    pathname === "/admin/login" ||
    pathname === "/admin/force-change-password" ||
    pathname.startsWith("/admin/forgot-password") ||
    pathname.startsWith("/admin/reset-password");

  if (!authorized && !isAuthEntryPage) {
    return (
      <div className="min-h-screen bg-primary-darker flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <RefreshCw className="animate-spin text-primary" size={48} />
          <p className="text-white text-[10px] uppercase font-black tracking-widest animate-pulse">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (isAuthEntryPage) {
    return <>{children}</>;
  }

  return (
    <SearchHighlightProvider relatedTermsJson={relatedTermsJson}>
    <div className="flex min-h-screen bg-slate-50 font-sans relative overflow-x-hidden">
      <AnimatePresence>
        {loggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]"
            aria-live="polite"
            aria-busy="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-lg shadow-slate-900/10"
            >
              <RefreshCw className="shrink-0 animate-spin text-primary" size={18} />
              <div>
                <p className="text-sm font-semibold text-slate-800">Signing out</p>
                <p className="text-xs text-slate-500">Ending your session securely</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-primary-darker/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onLogout={handleLogout} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 xl:px-12 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 md:gap-12 flex-1 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-primary-darker hover:bg-slate-50 transition-colors"
            >
              <MenuIcon size={24} />
            </button>
            <h1 className="text-sm md:text-base font-semibold tracking-tight text-primary-darker border-l-[3px] border-primary pl-3 md:pl-4 shrink-0 truncate max-w-[180px] md:max-w-none">
              {headerTitle}
            </h1>
            <div className="hidden md:block flex-1 max-w-xl">
              <AdminGlobalSearch />
            </div>
          </div>

          <div className="relative ml-4" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setAccountMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 transition-colors",
                "hover:border-slate-200 hover:bg-slate-50",
                accountMenuOpen && "border-slate-200 bg-slate-50"
              )}
            >
              <div className="text-right hidden sm:block min-w-0">
                <p
                  className="text-[11px] md:text-sm font-semibold text-primary-darker truncate max-w-[140px] md:max-w-[180px]"
                  title={userDisplayName}
                >
                  {userDisplayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[140px] md:max-w-[180px]" title={userRole}>
                  {userRole}
                </p>
              </div>
              <div className="w-8 h-8 md:w-9 md:h-9 bg-primary-darker text-white flex items-center justify-center font-semibold text-[10px] md:text-xs tracking-wide">
                {userInitials}
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "hidden sm:block text-slate-400 transition-transform",
                  accountMenuOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {accountMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-xs text-slate-500">{authUser?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <LogOut size={16} className="text-slate-400" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto">
            <AlertProvider>
              {children}
            </AlertProvider>
          </div>
        </div>
      </main>
    </div>
    </SearchHighlightProvider>
  );
};

export default AdminLayout;
