import React from "react";
import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import ShapePageHero from "@/components/shape/ShapePageHero";
import ShapeContactForm from "@/components/shape/ShapeContactForm";
import { withLocaleSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return withLocaleSeo("/contact", params.locale, {
    title: "Contact",
    description: "Contact the SHAPE Erasmus+ project coordinator at Open University of Kenya.",
  });
}

export default function ContactPage() {
  return (
    <div className="bg-white">
      <ShapePageHero
        eyebrow="Get in touch"
        title="Contact"
        subtitle="Reach the SHAPE project office at the Open University of Kenya."
      />

      <section className="shape-section">
        <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            <div>
              <p className="shape-eyebrow mb-3">Coordinator</p>
              <h2 className="font-serif text-2xl font-black text-primary-darker uppercase tracking-tight mb-2">
                Open University of Kenya
              </h2>
              <p className="text-slate-500 text-sm">SHAPE Project Office</p>
            </div>
            <ul className="space-y-5 text-slate-600">
              <li className="flex gap-3">
                <MapPin className="text-primary shrink-0" size={18} />
                <span>Technopolis Development Authority, Kenya</span>
              </li>
              <li className="flex gap-3">
                <Mail className="text-primary shrink-0" size={18} />
                <a href="mailto:shape@ouk.ac.ke" className="hover:text-primary">
                  shape@ouk.ac.ke
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="text-primary shrink-0" size={18} />
                <span>+254 20 2311438</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-8">
            <p className="shape-eyebrow mb-4">Enquiry form</p>
            <ShapeContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
