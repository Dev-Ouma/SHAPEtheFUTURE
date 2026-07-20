"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function ManageCookiesButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("open_cookie_settings"));
      }}
      className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-darker flex items-center gap-2"
    >
      {label} <ArrowRight size={14} />
    </button>
  );
}
