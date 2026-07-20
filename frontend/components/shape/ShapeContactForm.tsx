"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { postShapeContact } from "@/lib/shape-api";

export default function ShapeContactForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    organisation: "",
    subject: "",
    message: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in name, email, and message.");
      return;
    }
    setLoading(true);
    try {
      await postShapeContact(form);
      toast.success("Message sent. Thank you.");
      setForm({ name: "", email: "", organisation: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message || "Could not send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-primary bg-white";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <input className={field} name="name" placeholder="Full name *" value={form.name} onChange={onChange} />
        <input
          className={field}
          name="email"
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={onChange}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          className={field}
          name="organisation"
          placeholder="Organisation"
          value={form.organisation}
          onChange={onChange}
        />
        <input className={field} name="subject" placeholder="Subject" value={form.subject} onChange={onChange} />
      </div>
      <textarea
        className={`${field} min-h-[140px]`}
        name="message"
        placeholder="Message *"
        value={form.message}
        onChange={onChange}
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary text-[11px] font-black uppercase tracking-widest disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
