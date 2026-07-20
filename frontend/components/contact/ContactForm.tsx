"use client";

import React, { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { getApiErrorMessage, submitContactForm } from "@/lib/api";

const SUBJECT_KEYS = [
  "subjectGeneral",
  "subjectAdmissions",
  "subjectTechnical",
  "subjectFinancial",
  "subjectResearch",
] as const;

export default function ContactForm() {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subjectKey, setSubjectKey] = useState<(typeof SUBJECT_KEYS)[number]>("subjectGeneral");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        subject: t(subjectKey),
        message: message.trim(),
      });
      setFeedback({
        ok: true,
        text: res?.message || t("submitSuccess"),
      });
      setName("");
      setEmail("");
      setSubjectKey("subjectGeneral");
      setMessage("");
    } catch (err: unknown) {
      setFeedback({
        ok: false,
        text: getApiErrorMessage(err, t("submitFail")),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("fullName")}</label>
          <input
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("fullNamePlaceholder")}
            className="w-full bg-white border border-slate-200 px-6 py-5 text-sm font-bold outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("email")}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="w-full bg-white border border-slate-200 px-6 py-5 text-sm font-bold outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("subject")}</label>
        <select
          value={subjectKey}
          onChange={(e) => setSubjectKey(e.target.value as (typeof SUBJECT_KEYS)[number])}
          className="w-full bg-white border border-slate-200 px-6 py-5 text-sm font-bold outline-none focus:border-primary transition-all appearance-none"
        >
          {SUBJECT_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(key)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("message")}</label>
        <textarea
          rows={6}
          required
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="w-full bg-white border border-slate-200 px-6 py-5 text-sm font-bold outline-none focus:border-primary transition-all resize-none"
        />
      </div>

      {feedback && (
        <p className={`text-sm font-medium ${feedback.ok ? "text-emerald-600" : "text-red-600"}`}>
          {feedback.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-darker text-white py-6 px-12 text-sm font-black uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-4 shadow-xl disabled:opacity-60"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        <span>{t("submit")}</span>
      </button>
    </form>
  );
}
