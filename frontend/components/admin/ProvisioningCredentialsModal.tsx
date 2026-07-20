"use client";

import React from "react";
import { toast } from "react-hot-toast";

export type ProvisioningDetails = {
  username: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  expiresAt: string;
  emailSent: boolean;
  deliveryNote: string;
  resetUrl?: string;
};

const IClose = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function ProvisioningCredentialsModal({
  provisioning,
  onClose,
}: {
  provisioning: ProvisioningDetails;
  onClose: () => void;
}) {
  const copyText = async (label: string, value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg border border-slate-200 shadow-2xl">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-sm uppercase tracking-widest text-slate-800">
              {provisioning.temporaryPassword ? "Login Credentials" : "Password Reset Link"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{provisioning.deliveryNote}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors">
            <IClose />
          </button>
        </div>
        <div className="p-8 space-y-4">
          {!provisioning.emailSent && (
            <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              Email could not be sent. Copy the details below and share them securely with the user.
            </div>
          )}
          {provisioning.resetUrl ? (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reset Link (1 hour)</p>
              <div className="flex gap-2">
                <input readOnly value={provisioning.resetUrl} className="flex-1 bg-slate-50 p-3 text-xs font-mono" />
                <button type="button" onClick={() => copyText("Reset link", provisioning.resetUrl!)} className="px-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest">Copy</button>
              </div>
            </div>
          ) : (
            <>
              {[
                { label: "Login Email", value: provisioning.email },
                { label: "Username", value: provisioning.username },
                { label: "Temporary Password", value: provisioning.temporaryPassword },
                { label: "Login URL", value: provisioning.loginUrl },
              ].map((row) => (
                <div key={row.label} className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{row.label}</p>
                  <div className="flex gap-2">
                    <input readOnly value={row.value} className="flex-1 bg-slate-50 p-3 text-sm font-medium" />
                    <button type="button" onClick={() => copyText(row.label, row.value)} className="px-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest">Copy</button>
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-slate-500">
                Expires: {new Date(provisioning.expiresAt).toLocaleString()}. User must change password on first login.
              </p>
            </>
          )}
          <button type="button" onClick={onClose} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-4 font-black text-[10px] uppercase tracking-widest transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
