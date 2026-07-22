"use client";

import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/routing";
import { SHAPE_NAV_LINKS } from "@/lib/shape-api";
import EuFundingBadge from "@/components/shape/EuFundingBadge";

type Props = {
  contactEmail?: string;
  blurb?: string;
};

export default function ShapeFooter({
  contactEmail = "shape@ouk.ac.ke",
  blurb = "Strengthening Higher Education for Smart Cities — a three-year Erasmus+ partnership across East Africa and Europe.",
}: Props) {
  const year = new Date().getFullYear();
  const quick = SHAPE_NAV_LINKS.filter((l) =>
    ["/the-project", "/partners", "/work-packages", "/dashboard", "/documents", "/events", "/contact"].includes(
      l.href,
    ),
  );

  return (
    <footer className="bg-primary-darker text-white border-t border-white/5" id="main-footer">
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          <div className="space-y-5 lg:col-span-1">
            <div>
              <p className="font-serif text-3xl font-black tracking-tight">SHAPE</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mt-2">
                Erasmus+ · OUK
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{blurb}</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Co-funded by the European Union. Views and opinions expressed are those of the author(s)
              only and do not necessarily reflect those of the European Union or EACEA.
            </p>
            <EuFundingBadge variant="dark" className="bg-primary-darker/40 border-white/15" />
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 border-l-2 border-primary pl-3 mb-6">
              Quick links
            </h4>
            <ul className="space-y-3">
              {quick.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-semibold text-slate-300 hover:text-secondary transition-colors"
                  >
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 border-l-2 border-primary pl-3 mb-6">
              Coordinator
            </h4>
            <p className="text-sm font-bold text-white mb-4">Open University of Kenya</p>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Technopolis Development Authority, Kenya</span>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="text-primary shrink-0 mt-0.5" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white">
                  {contactEmail}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="text-primary shrink-0 mt-0.5" />
                <span>+254 20 2311438</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 border-l-2 border-primary pl-3 mb-6">
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { title: "Project Map", href: "/map" },
                { title: "Media", href: "/media" },
                { title: "Gallery", href: "/gallery" },
                { title: "SDLC", href: "/sdlc" },
                { title: "Monitoring", href: "/monitoring" },
                { title: "News", href: "/news" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-semibold text-slate-300 hover:text-secondary transition-colors"
                  >
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-slate-500">
          <p>© {year} Open University of Kenya | SHAPE Erasmus+. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 uppercase tracking-widest font-bold text-[10px]">
            <Link href="/accessibility" className="hover:text-secondary transition-colors">
              Accessibility
            </Link>
            <Link href="/privacy" className="hover:text-secondary transition-colors">
              Privacy
            </Link>
            <Link href="/privacy-center" className="hover:text-secondary transition-colors">
              Cookies
            </Link>
            <span>Co-funded by the European Union</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
