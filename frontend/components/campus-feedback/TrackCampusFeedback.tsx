"use client";

import React, { useState } from "react";
import { Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getApiErrorMessage, postApi } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function TrackCampusFeedback() {
  const t = useTranslations("Helpdesk");
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await postApi("/api/campus-feedback/track", {
        reference_number: reference.trim(),
        email: email.trim(),
      });
      if (!response) {
        setError(t("trackNotFound"));
        return;
      }
      setResult(response);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t("trackNotFound")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleTrack} className="space-y-4">
        <input
          placeholder={t("trackRefPlaceholder")}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
        />
        <input
          type="email"
          placeholder={t("trackEmailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
          {t("trackSubmission")}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-500 text-sm flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="text-emerald-500" size={18} />
            <span className="font-bold text-sm">{result.reference_number}</span>
          </div>
          <p className="text-sm">
            <strong>{t("status")}:</strong> {result.status}
          </p>
          <p className="text-sm mt-1">
            <strong>{t("subject")}:</strong> {result.subject || result.title}
          </p>
          {result.responses?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t("responses")}</p>
              {result.responses.map((r: any) => (
                <p key={r.id} className="text-sm text-slate-600 mb-2">
                  {r.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
