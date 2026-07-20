"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getSettings } from "@/lib/api";

type AdmissionsCTAProps = { initialSettings?: Record<string, any> };

const AdmissionsCTA = ({ initialSettings }: AdmissionsCTAProps = {}) => {
  const t = useTranslations("Admissions");
  const locale = useLocale();
  const hasServerData =
    !!initialSettings && Object.keys(initialSettings).length > 0;
  const [settings, setSettings] = useState<any>({
    cta_apply_url: "/admissions",
    cta_apply_label: "",
    address: "Nairobi, Kenya",
    contact_phone: "+254 700 000 000",
    contact_email: "info@ouk.ac.ke",
    ...(initialSettings || {}),
  });

  useEffect(() => {
    if (hasServerData) {
      setSettings((prev: any) => ({ ...prev, ...initialSettings }));
      return;
    }
    const fetchSettings = async () => {
      const data = await getSettings(locale);
      if (data) setSettings((prev: any) => ({ ...prev, ...data }));
    };
    fetchSettings();
  }, [locale, hasServerData, initialSettings]);

  return (
    <section className="py-24 px-6 relative overflow-hidden" id="admissions-cta">
      <div className="container mx-auto">
        <div className="bg-primary-darker text-white flex flex-col lg:flex-row items-center relative overflow-hidden">
          <div className="p-12 lg:p-24 lg:w-2/3 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-secondary font-black uppercase tracking-[0.3em] text-[10px] mb-8 block"
            >
              {t("ctaEyebrow")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-6xl font-black mb-8 leading-tight font-serif"
            >
              {t("ctaTitle")}
            </motion.h2>
            <p className="text-base md:text-xl text-white/50 mb-12 max-w-xl leading-relaxed font-medium">
              {t("ctaBody")}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-6 justify-center lg:justify-start w-full">
              <Link href={settings.cta_apply_url || "/admissions"} id="cta-apply-now-btn" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ x: 5 }}
                  className="w-full sm:w-auto bg-primary-darker !text-white border border-white/10 px-10 py-5 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 shadow-2xl hover:bg-primary-dark transition-all"
                >
                  <span>{settings.cta_apply_label || t("ctaApply")}</span>
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
              <Link href="/contact" id="cta-contact-btn" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border-2 border-white/30 !text-white px-10 py-5 font-black uppercase tracking-widest text-sm hover:bg-white hover:text-primary-darker transition-all">
                  {t("ctaContact")}
                </button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block lg:w-1/3 bg-primary-darker border-l border-white/5 p-24 h-full min-h-[500px] relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 -mr-16 -mt-16 rotate-45" />
            <div className="space-y-12">
              <div>
                <h4 className="text-secondary font-black uppercase tracking-widest text-xs mb-4">{t("ctaLocation")}</h4>
                <div className="flex items-start space-x-4">
                  <MapPin className="text-secondary mt-1" />
                  <p className="font-bold text-lg">{settings.address}</p>
                </div>
              </div>
              <div>
                <h4 className="text-secondary font-black uppercase tracking-widest text-xs mb-4">{t("ctaContactLabel")}</h4>
                <p className="font-bold text-2xl mb-2">{settings.contact_phone || "+254 700 000 000"}</p>
                <p className="text-primary-foreground/60">{settings.contact_email || "info@ouk.ac.ke"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionsCTA;
