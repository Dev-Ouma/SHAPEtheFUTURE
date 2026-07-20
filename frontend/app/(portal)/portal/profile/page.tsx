"use client";

import React, { useEffect, useState } from "react";
import { Mail, Hash, UserRound, ShieldCheck } from "lucide-react";

type PortalUser = {
  full_name?: string;
  registration_no?: string;
  email?: string;
};

export default function PortalProfilePage() {
  const [student, setStudent] = useState<PortalUser | null>(null);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem("ouk_portal_user") ||
        localStorage.getItem("ouk_admin_user");
      if (raw) setStudent(JSON.parse(raw));
    } catch {
      setStudent(null);
    }
  }, []);

  const fields = [
    {
      label: "Full name",
      value: student?.full_name || "Enrolled Student",
      icon: UserRound,
    },
    {
      label: "Registration number",
      value: student?.registration_no || "OUK/2024/0001",
      icon: Hash,
    },
    {
      label: "Institutional email",
      value: student?.email || "student@student.ouk.ac.ke",
      icon: Mail,
    },
    {
      label: "Account status",
      value: "Active · Verified",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-10 max-w-3xl">
      <section className="bg-white border border-slate-200 p-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">
          My profile
        </p>
        <h2 className="text-3xl font-black font-serif text-primary-darker tracking-tight">
          {student?.full_name || "Enrolled Student"}
        </h2>
        <p className="mt-3 text-sm text-slate-500 max-w-xl leading-relaxed">
          Review the details tied to your campus portal session. Official identity
          updates are completed through Academic Registry / SOMAS.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {fields.map((field) => (
          <div
            key={field.label}
            className="bg-white border border-slate-200 p-6 flex items-start gap-5"
          >
            <div className="w-11 h-11 bg-primary/5 text-primary flex items-center justify-center shrink-0">
              <field.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {field.label}
              </p>
              <p className="text-sm font-bold text-primary-darker">{field.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
