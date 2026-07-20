"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield, Settings, Check } from "lucide-react";
import { useTranslations } from "next-intl";

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

const CookieConsent = () => {
  const t = useTranslations("CookieConsent");
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = getCookie("ouk_cookie_consent");
    if (!consent) {
      setTimeout(() => setShowBanner(true), 2000);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setPreferences(parsed);
      } catch (e) {
        setShowBanner(true);
      }
    }

    const handleOpenSettings = () => setShowSettings(true);
    window.addEventListener("open_cookie_settings", handleOpenSettings);
    return () => window.removeEventListener("open_cookie_settings", handleOpenSettings);
  }, []);

  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "; expires=" + date.toUTCString();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax" + secure;
  };

  const getCookie = (name: string) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const handleAcceptAll = () => {
    savePreferences({ essential: true, analytics: true, functional: true, marketing: true });
  };

  const handleRejectAll = () => {
    savePreferences({ essential: true, analytics: false, functional: false, marketing: false });
  };

  const savePreferences = (prefs: CookiePreferences) => {
    setCookie("ouk_cookie_consent", JSON.stringify(prefs), 365);
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookie_consent_updated"));
    }
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-[500] max-w-4xl mx-auto"
          >
            <div className="bg-primary-darker text-white p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-[#ff7f50] hover:text-white transition-all duration-700" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-start space-x-6">
                  <div className="bg-primary p-4 shrink-0">
                    <Cookie size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-widest font-serif mb-2">{t("title")}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
                      {t("body")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center space-x-2"
                  >
                    <Settings size={14} />
                    <span>{t("customize")}</span>
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="text-[10px] font-black uppercase tracking-widest px-6 py-3 border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    {t("essentialOnly")}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="text-[10px] font-black uppercase tracking-widest px-8 py-3 bg-primary text-white hover:bg-[#ff7f50] hover:text-white transition-all"
                  >
                    {t("acceptAll")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center bg-primary-darker/80 backdrop-blur-sm p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl shadow-3xl overflow-hidden"
            >
              <div className="p-8 bg-primary-darker text-white flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Shield size={24} className="text-primary" />
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest font-serif">{t("preferencesTitle")}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {t("preferencesSubtitle")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label={t("close")}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
                <CookieItem title={t("essential")} desc={t("essentialDesc")} checked={true} disabled={true} />
                <CookieItem
                  title={t("analytics")}
                  desc={t("analyticsDesc")}
                  checked={preferences.analytics}
                  onChange={(val) => setPreferences({ ...preferences, analytics: val })}
                />
                <CookieItem
                  title={t("functional")}
                  desc={t("functionalDesc")}
                  checked={preferences.functional}
                  onChange={(val) => setPreferences({ ...preferences, functional: val })}
                />
                <CookieItem
                  title={t("marketing")}
                  desc={t("marketingDesc")}
                  checked={preferences.marketing}
                  onChange={(val) => setPreferences({ ...preferences, marketing: val })}
                />
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button
                  onClick={handleRejectAll}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors underline underline-offset-4"
                >
                  {t("essentialOnly")}
                </button>
                <button
                  onClick={() => savePreferences(preferences)}
                  className="bg-primary text-white px-10 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-[#ff7f50] hover:text-white transition-all flex items-center space-x-2"
                >
                  <span>{t("save")}</span>
                  <Check size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const CookieItem = ({
  title,
  desc,
  checked,
  onChange,
  disabled = false,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange?: (val: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-start justify-between group">
    <div className="max-w-md">
      <h4 className="text-xs font-black uppercase tracking-widest text-primary-darker mb-2">{title}</h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{desc}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div
        className={`w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${disabled ? "opacity-50" : ""}`}
      ></div>
    </label>
  </div>
);

export default CookieConsent;
