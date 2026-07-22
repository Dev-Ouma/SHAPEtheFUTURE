"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ExternalLink, Mail, MapPin } from "lucide-react";
import ShapePageHero from "@/components/shape/ShapePageHero";
import type { ShapePartner } from "@/lib/shape-api";
import { resolveImageUrl } from "@/lib/api";

const ease = [0.22, 1, 0.36, 1] as const;

function normalize(p: ShapePartner & Record<string, any>) {
  return {
    ...p,
    website: p.website || p.website_url,
    contact_name: p.contact_name || p.contact_person,
    role: p.role || p.consortium_role || "Partner",
  };
}

export default function PartnerDetailClient({ partner }: { partner: ShapePartner }) {
  const p = normalize(partner as any);

  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow={p.role}
        title={p.name}
        subtitle={[p.city, p.country].filter(Boolean).join(" · ")}
      >
        {p.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(p.logo_url)}
            alt={`${p.name} logo`}
            className="mt-8 h-14 w-auto object-contain bg-white p-2"
          />
        ) : null}
      </ShapePageHero>

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
            {p.description ? (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease }}
              >
                <p className="shape-eyebrow mb-3">About the institution</p>
                <p className="text-slate-600 leading-relaxed text-lg normal-case tracking-normal">
                  {p.description}
                </p>
              </motion.div>
            ) : null}

            {p.responsibilities ? (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.08, ease }}
                className="border-l-2 border-primary pl-6"
              >
                <p className="shape-eyebrow mb-3">SHAPE responsibilities</p>
                <p className="text-slate-600 leading-relaxed normal-case tracking-normal">
                  {p.responsibilities}
                </p>
              </motion.div>
            ) : null}

            {p.deliverables ? (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.12, ease }}
                className="border-l-2 border-secondary pl-6"
              >
                <p className="shape-eyebrow mb-3 text-secondary">Key deliverables</p>
                <p className="text-slate-600 leading-relaxed normal-case tracking-normal">
                  {p.deliverables}
                </p>
              </motion.div>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1, ease }}
              className="bg-gradient-to-br from-slate-50 to-[#037b90]/[0.05] border border-slate-200 p-6 md:p-8 space-y-5 sticky top-28"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Institution
              </p>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin size={16} className="text-secondary mt-0.5 shrink-0" />
                <span className="normal-case tracking-normal">
                  {[p.city, p.country].filter(Boolean).join(", ")}
                </span>
              </div>
              {p.contact_name ? (
                <p className="font-semibold text-primary-darker normal-case tracking-normal">
                  {p.contact_name}
                </p>
              ) : null}
              {p.contact_email ? (
                <a
                  href={`mailto:${p.contact_email}`}
                  className="inline-flex items-center gap-2 text-primary text-sm font-semibold"
                >
                  <Mail size={14} /> {p.contact_email}
                </a>
              ) : null}
              {p.website ? (
                <a
                  href={p.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary"
                >
                  Institution website <ExternalLink size={14} />
                </a>
              ) : null}
              <Link
                href="/partners"
                className="inline-block pt-4 text-[11px] font-black uppercase tracking-widest text-primary hover:text-secondary"
              >
                ← All partners
              </Link>
            </motion.div>
          </aside>
        </div>
      </section>
    </div>
  );
}
