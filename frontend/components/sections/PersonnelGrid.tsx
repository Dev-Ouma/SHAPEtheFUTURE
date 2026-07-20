"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { getStaffDirectory, resolveImageUrl } from "@/lib/api";
import { PROFILE_IMAGE_PLACEHOLDER_CSS } from "@/lib/profile-image-placeholder";
import { RefreshCw, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface PersonnelGridProps {
  executiveType: string;
  title: string;
  subtitle?: string;
  /** SSR/RSC seed — skips client refetch when non-empty */
  initialMembers?: any[];
}

const PersonnelGrid: React.FC<PersonnelGridProps> = ({
  executiveType,
  title,
  subtitle,
  initialMembers,
}) => {
  const t = useTranslations("PersonnelGrid");
  const seeded = Array.isArray(initialMembers) ? initialMembers : [];
  const [members, setMembers] = useState<any[]>(seeded);
  const [loading, setLoading] = useState(seeded.length === 0);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (seeded.length > 0) return;
    let cancelled = false;
    const fetchMembers = async () => {
      try {
        const data = await getStaffDirectory(executiveType);
        if (cancelled) return;
        setMembers(Array.isArray(data) ? data : []);
        setLoadFailed(false);
      } catch (err) {
        console.error(`Failed to fetch ${executiveType}`, err);
        if (!cancelled) {
          setMembers([]);
          setLoadFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMembers();
    return () => {
      cancelled = true;
    };
  }, [executiveType, seeded.length]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-6">
        <RefreshCw className="animate-spin text-primary" size={48} strokeWidth={1.5} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t("loadingDirectory")}</p>
      </div>
    );
  }

  const isCouncil = executiveType === "Governing Council";
  const accentColor = isCouncil ? "bg-primary" : "bg-secondary";
  const textColor = isCouncil ? "text-primary" : "text-secondary";

  const emptyMessage = loadFailed ? t("directoryUnavailable") : t("directoryEmpty");
  const emptyHint = loadFailed ? t("directoryUnavailableHint") : t("directoryEmptyHint");

  return (
    <section className="py-12">
      <div className="flex flex-col mb-16 gap-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-1 ${accentColor}`} />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-primary-darker font-serif">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {members.length === 0 ? (
        <div className="py-24 px-6 text-center border-2 border-dashed border-slate-100 bg-slate-50/50">
          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
            {emptyMessage}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium text-slate-500">
            {emptyHint}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {members.map((member, idx) => {
            const photoUrl = resolveImageUrl(member.profile_image_url);
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group"
              >
                <Link href={`/about/staff/${member.profile_slug}`} className="block relative h-full flex flex-col">
                  <div className={`absolute inset-0 ${accentColor} translate-x-2 translate-y-2 -z-10 transition-transform group-hover:translate-x-4 group-hover:translate-y-4`} />

                  <div
                    className="relative w-full pb-[125%] overflow-hidden border-2 border-slate-900 grayscale group-hover:grayscale-0 transition-all duration-700"
                    style={{
                      backgroundImage: photoUrl
                        ? `url(${photoUrl})`
                        : PROFILE_IMAGE_PLACEHOLDER_CSS,
                      backgroundSize: "cover",
                      backgroundPosition: "center top",
                    }}
                  >
                    <div className="absolute inset-0 bg-primary-darker/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <div className="bg-white text-primary-darker px-5 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] flex items-center space-x-2">
                        <span>{t("viewProfile")}</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex-grow bg-white p-6 border-x-2 border-b-2 border-slate-900 -mt-2 ml-2 flex flex-col justify-between min-h-[160px]">
                    <div className="space-y-1">
                      <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${textColor} block mb-2`}>
                        {member.honorific_title || t("boardMember")}
                      </span>
                      <h3 className="text-xl font-black text-primary-darker uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors min-h-[3rem] line-clamp-2">
                        {member.full_name}
                      </h3>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-auto">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">
                        {member.staff_type?.name || t("executiveLeadership")}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PersonnelGrid;
