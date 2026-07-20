"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  BookOpen, 
  User, 
  Bell, 
  LogOut,
  ChevronRight,
  RefreshCw,
  Library,
  GraduationCap
} from "lucide-react";
import { getOfficialPortalUrl, isPortalDemoEnabled } from "@/lib/portal";

/**
 * Internal logic for the Student Portal Layout.
 * Separated for cleaner integration with global overlays like Chatbots.
 */
const PortalLayoutInner = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const demoEnabled = isPortalDemoEnabled();
  const officialPortal = getOfficialPortalUrl();

  useEffect(() => {
    const userStr =
      localStorage.getItem("ouk_portal_user") ||
      localStorage.getItem("ouk_admin_user");

    if (!userStr) {
      if (!demoEnabled) {
        window.location.replace(officialPortal);
        return;
      }
      if (pathname !== "/portal/login") {
        router.push("/portal/login");
      }
      return;
    }

    try {
      setStudent(JSON.parse(userStr));
    } catch {
      setStudent(null);
    }
    setAuthorized(true);
  }, [pathname, router, demoEnabled, officialPortal]);

  const handleLogout = () => {
    localStorage.removeItem("ouk_portal_token");
    localStorage.removeItem("ouk_portal_user");
    if (!demoEnabled) {
      window.location.href = officialPortal;
      return;
    }
    router.push("/portal/login");
  };

  const menuLinks = [
    { name: "My Dashboard", href: "/portal", icon: LayoutDashboard },
    { name: "Finance & Fees", href: "/portal/finance", icon: CreditCard },
    { name: "Academic Records", href: "/portal/academics", icon: BookOpen },
    { name: "Research Portal", href: "/portal/research", icon: GraduationCap },
    { name: "E-Learning (Moodle)", href: "https://moodle.ouk.ac.ke", icon: Library, external: true },
    { name: "My Profile", href: "/portal/profile", icon: User },
  ];

  if (!authorized && pathname !== "/portal/login") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (pathname === "/portal/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white flex flex-col border-r-8 border-secondary shrink-0 h-screen sticky top-0">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
              <span className="text-white font-black text-xl">U</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl leading-none text-primary-darker tracking-tighter">OUK</span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-slate-400 mt-1">Student Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-1">
          {menuLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                target={link.external ? "_blank" : "_self"}
                className={`flex items-center justify-between p-4 font-black uppercase tracking-widest text-[10px] transition-all ${
                  isActive 
                    ? "bg-secondary text-white shadow-lg" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary-darker"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={isActive ? "text-white" : "text-primary"}>
                    {(link.icon as any) && <link.icon size={18} />}
                  </div>
                  <span>{link.name}</span>
                </div>
                {!link.external && isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-slate-100">
           <div className="bg-primary-darker p-6 mb-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-secondary rotate-45 -mr-4 -mt-4 transition-transform group-hover:scale-150" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Registration No.</p>
              <p className="font-bold text-xs uppercase tracking-widest">
                {student?.registration_no || "OUK/2024/0001"}
              </p>
           </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-30">
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-primary-darker border-l-4 border-secondary pl-4">
            {menuLinks.find(l => l.href === pathname)?.name || "Campus Dashboard"}
          </h1>
          <div className="flex items-center space-x-8">
            <button className="relative p-2 text-slate-400 hover:text-secondary transition-colors">
               <Bell size={20} />
               <span className="absolute top-0 right-0 w-2 h-2 bg-primary animate-ping" />
            </button>
            <div className="flex items-center space-x-6 pl-8 border-l border-slate-100">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Welcome,</p>
                <p className="text-sm font-bold text-primary-darker">{student?.full_name || "Enrolled Student"}</p>
              </div>
              <div className="w-10 h-10 bg-secondary text-white flex items-center justify-center font-black text-xs">
                 {student?.full_name?.substring(0,2).toUpperCase() || "ST"}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PortalLayoutInner;
