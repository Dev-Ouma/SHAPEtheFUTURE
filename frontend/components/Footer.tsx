"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { 
  Facebook, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight,
  Globe,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { getMenus, getSettings, resolveImageUrl, getApiCached, postApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import SafeImage from "@/components/ui/SafeImage";
import { LocalizedText, I18nProtect } from "@/components/LocalizedCms";
import { Link } from "@/i18n/routing";

// Custom X (formerly Twitter) Icon
const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 2.395H4.293L17.607 20.65z" />
  </svg>
);

// Custom TikTok Icon
const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.03 1.6 4.26 1.39 1.69 3.4 2.67 5.56 2.87v4.03c-1.89-.04-3.75-.63-5.32-1.71-.12 3.69-.1 7.37-.11 11.06-.05 3.32-2.31 6.36-5.51 7.23-3.64.91-7.64-1.2-8.68-4.78-1.26-3.83 1.25-8.23 5.25-9.13.91-.18 1.84-.2 2.76-.08.01 1.48.01 2.97.01 4.45-.63-.16-1.3-.17-1.92-.02-1.81.36-2.9 2.25-2.28 3.98.54 1.4 2.12 2.19 3.52 1.76 1.19-.3 1.95-1.4 1.95-2.62-.03-5.3-.01-10.61-.02-15.91-.03-.13-.05-.26-.07-.39z" />
  </svg>
);

type FooterProps = {
  initialMenus?: any[];
  initialSettings?: Record<string, any>;
  initialBacklinks?: any[];
};

const Footer = ({
  initialMenus,
  initialSettings,
  initialBacklinks,
}: FooterProps = {}) => {
  const t = useTranslations("Footer");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const hasServerMenus =
    Array.isArray(initialMenus) && initialMenus.length > 0;
  const [footerMenus, setFooterMenus] = useState<any[]>(
    Array.isArray(initialMenus) ? initialMenus : [],
  );
  const [backlinks, setBacklinks] = useState<any[]>(
    Array.isArray(initialBacklinks) ? initialBacklinks : [],
  );
  const [settings, setSettings] = useState<any>({
    ...(initialSettings || {}),
  });

  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!subscribeEmail) return;
    setIsSubscribing(true);
    try {
      await postApi('/subscriptions/subscribe', { email: subscribeEmail });
      toast.success(t("subscribeSuccess"));
      setSubscribeEmail("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("subscribeFail"));
    } finally {
      setIsSubscribing(false);
    }
  };

  useEffect(() => {
    if (hasServerMenus) return;
    const fetchData = async () => {
      const [menus, siteSettings, linksData] = await Promise.all([
        getMenus("footer", locale),
        getSettings(locale),
        getApiCached("/partnerships/backlinks", { revalidate: 300 }),
      ]);
      if (menus && menus.length > 0) setFooterMenus(menus);
      if (siteSettings && Object.keys(siteSettings).length > 0) {
        setSettings((prev: any) => ({ ...prev, ...siteSettings }));
      }
      if (Array.isArray(linksData)) setBacklinks(linksData);
    };
    fetchData();
  }, [locale, hasServerMenus]);

  useEffect(() => {
    if (!hasServerMenus) return;
    setFooterMenus(Array.isArray(initialMenus) ? initialMenus : []);
    setBacklinks(Array.isArray(initialBacklinks) ? initialBacklinks : []);
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSettings((prev: any) => ({ ...prev, ...initialSettings }));
    }
  }, [initialMenus, initialSettings, initialBacklinks, hasServerMenus]);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative bg-primary-darker text-white overflow-hidden border-t border-white/5"
      id="main-footer"
    >
      {/* Background Image with Heavy Gradient Overlay - Optimized visibility */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-soft-light"
          style={(() => { const url = resolveImageUrl(settings.footer_background_image || settings.footer_background); return url ? { backgroundImage: `url('${url}')` } : {}; })()}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-darker/80 via-primary-darker/90 to-primary-darker" />
      </div>

      <div className="container mx-auto px-6 relative z-10 py-16 md:py-24">
        {/* Top Section: Branding & Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 md:gap-16 mb-16 md:mb-24 pb-16 md:pb-20 border-b border-white/5">
          <div className="max-w-xl space-y-6 text-center lg:text-left w-full lg:w-auto">
            <Link href="/" className="inline-block group mx-auto lg:mx-0 mb-4">
              {settings.site_logo ? (
                <SafeImage
                  src={resolveImageUrl(settings.site_logo)}
                  alt={tCommon("logoAltShort")}
                  width={200}
                  height={64}
                  className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105 mx-auto lg:mx-0"
                />
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary flex items-center justify-center shadow-2xl mx-auto lg:mx-0">
                   <span className="text-white font-black text-xl md:text-2xl uppercase">U</span>
                </div>
              )}
            </Link>
            {settings.footer_mission ? (
              <LocalizedText
                locale={locale}
                swSource={settings.footer_mission_sw}
                as="h2"
                className="text-white font-black text-xl lg:text-2xl leading-tight uppercase tracking-widest"
              >
                {settings.footer_mission}
              </LocalizedText>
            ) : (
              <I18nProtect locale={locale} as="h2" className="text-white font-black text-xl lg:text-2xl leading-tight uppercase tracking-widest">
                {t("missionFallback")}
              </I18nProtect>
            )}
            {settings.footer_description ? (
              <LocalizedText
                locale={locale}
                swSource={settings.footer_description_sw}
                as="p"
                className="text-slate-400 text-sm font-medium leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                {settings.footer_description}
              </LocalizedText>
            ) : (
              <I18nProtect locale={locale} as="p" className="text-slate-400 text-sm font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                {t("descriptionFallback")}
              </I18nProtect>
            )}
          </div>
          <div className="w-full lg:w-[400px]">
             <div className="bg-white/5 p-10 border border-white/5 backdrop-blur-3xl transition-all hover:bg-white/[0.08]">
                <I18nProtect locale={locale} as="h4" className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">{t("newsletterTitle")}</I18nProtect>
                <I18nProtect locale={locale} as="p" className="text-sm font-medium text-slate-400 mb-8">{t("newsletterBody")}</I18nProtect>
                <div className="flex relative group">
                   <input 
                      type="email" 
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                      placeholder={t("newsletterPlaceholder")} 
                      className="w-full bg-transparent border-b border-white/20 py-4 px-0 text-sm font-bold tracking-widest uppercase outline-none focus:border-primary transition-all pr-12 disabled:opacity-50"
                      disabled={isSubscribing}
                      aria-label={t("newsletterSubscribe")}
                   />
                   <button 
                     onClick={handleSubscribe}
                     disabled={isSubscribing}
                     aria-label={t("newsletterSubscribe")}
                     className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-all transform group-focus-within:translate-x-1 disabled:opacity-50"
                   >
                      {isSubscribing ? <span className="animate-pulse">...</span> : <ArrowRight size={20} />}
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Middle Section: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* Contact Details */}
          <div className="space-y-10">
            <I18nProtect locale={locale} as="h4" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 border-l-2 border-primary pl-4">{t("contact")}</I18nProtect>
            <div className="space-y-8">
               <div className="flex items-start space-x-4 group">
                  <MapPin size={18} className="text-primary shrink-0 mt-1" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400 leading-relaxed group-hover:text-white transition-colors">
                      {settings.address}
                    </p>
                  </div>
               </div>
               {settings.contact_email ? (
               <div className="flex items-center space-x-4 group">
                  <Mail size={18} className="text-primary shrink-0" />
                  <a href={`mailto:${settings.contact_email}`} className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">
                    {settings.contact_email}
                  </a>
               </div>
               ) : null}
               <div className="flex items-start space-x-4 group">
                  <Phone size={18} className="text-primary shrink-0 mt-1" />
                  <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">
                    {settings.contact_phone}
                  </p>
               </div>
            </div>
          </div>

          {/* Dynamic Footer Menus from CMS */}
          {footerMenus.length > 0 ? (
            footerMenus
              .filter((menu: any) => !menu.parentId) // only top-level groups
              .map((group: any) => (
                <div key={group.id} className="space-y-10">
                  <LocalizedText
                    locale={locale}
                    swSource={group.title_sw}
                    as="h4"
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 border-l-2 border-primary pl-4"
                  >
                    {group.title}
                  </LocalizedText>
                  <ul className="grid grid-cols-1 gap-4">
                    {(group.children || []).map((item: any) => (
                      <li key={item.id}>
                        <Link
                          href={item.link || "#"}
                          target={item.target || "_self"}
                          className="text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center space-x-2 group"
                        >
                          <ChevronRight size={10} className="text-slate-800 group-hover:text-primary transition-colors" />
                          <LocalizedText locale={locale} swSource={item.title_sw}>{item.title}</LocalizedText>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
          ) : (
            <>
              {/* Fallback: Static Services Column */}
              <div className="space-y-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 border-l-2 border-primary pl-4">{t("services")}</h4>
                <ul className="grid grid-cols-1 gap-4">
                  {[
                    { label: "myOUK", href: "#" },
                    { label: "SOMAS", href: "#" },
                    { label: t("fallbackAdmissions"), href: "/admissions" },
                    { label: t("fallbackLibrary"), href: "/library" },
                    { label: t("fallbackERepository"), href: "#" },
                    { label: t("fallbackSupport"), href: "/support" },
                  ].map(item => (
                    <li key={item.label}>
                      <Link href={item.href} className="text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center space-x-2 group">
                        <ChevronRight size={10} className="text-slate-800 group-hover:text-primary transition-colors" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Fallback: Static Quick Links Column */}
              <div className="space-y-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 border-l-2 border-primary pl-4">{t("quickLinks")}</h4>
                <ul className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'KUCCPS', href: '#' },
                    { label: 'HELB', href: '#' },
                    { label: t("universitiesFund"), href: '#' },
                    { label: 'CUE', href: '#' },
                    { label: 'COL', href: '#' },
                    { label: t("serviceCharter"), href: '/service-charter' },
                  ].map(item => (
                    <li key={item.label}>
                      <Link href={item.href} className="text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center space-x-2 group">
                        <ChevronRight size={10} className="text-slate-800 group-hover:text-primary transition-colors" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Digital Community */}
          <div className="space-y-10">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 border-l-2 border-primary pl-4">{t("digitalCommunity")}</h4>
             <div className="flex flex-wrap gap-4">
                {[
                  { icon: Facebook, url: settings.facebook_url, label: "Facebook" },
                  { icon: XIcon, url: settings.twitter_url, label: "X" },
                  { icon: Linkedin, url: settings.linkedin_url, label: "LinkedIn" },
                  { icon: TikTokIcon, url: settings.tiktok_url, label: "TikTok" }
                ].map((social, i) => (
                  social.url ? (
                  <a 
                    key={i}
                    href={social.url}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300"
                  >
                    <social.icon size={18} />
                  </a>
                  ) : null
                ))}
             </div>
             <Link href="/social" className="pt-4 flex items-center space-x-2 group/social inline-block">
                <Globe size={14} className="text-primary/60 group-hover/social:text-primary transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover/social:text-white transition-colors">{t("digitalSocialLink")}</span>
             </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em]" suppressHydrationWarning>
            © {currentYear} <span className="text-white">{t("rights")}</span>
          </p>
          <div className="flex items-center space-x-8 text-[11px] font-black uppercase tracking-widest text-slate-700">
             <Link href="/privacy" className="hover:text-white transition-colors">{t("privacy")}</Link>
             <Link href="/terms" className="hover:text-white transition-colors">{t("terms")}</Link>
             <button
               type="button"
               onClick={() => window.dispatchEvent(new Event("open_cookie_settings"))}
               className="hover:text-white transition-colors uppercase"
             >
               {t("cookies")}
             </button>
             <Link href="/sitemap" className="hover:text-white transition-colors uppercase">{t("sitemap")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
