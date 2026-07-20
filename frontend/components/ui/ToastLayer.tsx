"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { Toaster, Toast, resolveValue } from "react-hot-toast";

type ToastTone = "blank" | "custom" | "loading" | "success" | "error";

const toneStyles: Record<ToastTone, { icon: typeof Info; accent: string; iconWrap: string }> = {
  blank: {
    icon: Info,
    accent: "bg-primary",
    iconWrap: "bg-primary/10 text-primary",
  },
  custom: {
    icon: Info,
    accent: "bg-primary",
    iconWrap: "bg-primary/10 text-primary",
  },
  loading: {
    icon: Loader2,
    accent: "bg-primary",
    iconWrap: "bg-primary/10 text-primary",
  },
  success: {
    icon: CheckCircle2,
    accent: "bg-emerald-500",
    iconWrap: "bg-emerald-50 text-emerald-700",
  },
  error: {
    icon: XCircle,
    accent: "bg-red-600",
    iconWrap: "bg-red-50 text-red-700",
  },
};

function ToastCard({ toast }: { toast: Toast }) {
  const reduceMotion = useReducedMotion();
  const tone = toast.type === "success" || toast.type === "error" || toast.type === "loading" ? toast.type : "blank";
  const { icon: Icon, accent, iconWrap } = toneStyles[toast.type === "custom" ? "custom" : tone];
  const content = resolveValue(toast.message, toast);

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, x: 12, scale: 0.98 }}
      animate={toast.visible ? (reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0, scale: 1 }) : reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, x: 8, scale: 0.985 }}
      transition={{ duration: reduceMotion ? 0.08 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto relative isolate overflow-hidden rounded-[12px] bg-white shadow-[0_18px_36px_rgba(0,31,38,0.16)] ring-1 ring-primary/10"
      style={toast.style}
      {...toast.ariaProps}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} aria-hidden="true" />
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconWrap}`}>
          <Icon size={18} className={toast.type === "loading" ? "animate-spin" : undefined} />
        </span>
        <div className="min-w-0 flex-1 text-sm leading-6 text-primary-darker">
          {content}
        </div>
      </div>
    </motion.article>
  );
}

export default function ToastLayer() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      toastOptions={{
        duration: 4200,
        removeDelay: 240,
        style: {
          color: "#001f26",
          padding: 0,
          margin: 0,
          maxWidth: "min(92vw, 26rem)",
          animation: "none",
        },
        success: {
          iconTheme: {
            primary: "#0f6e7e",
            secondary: "#e6fafb",
          },
        },
        error: {
          iconTheme: {
            primary: "#b42318",
            secondary: "#fef3f2",
          },
        },
        loading: {
          iconTheme: {
            primary: "#0f6e7e",
            secondary: "#e6fafb",
          },
        },
      }}
      containerStyle={{
        top: 24,
        right: 24,
      }}
    >
      {(toast) => <ToastCard toast={toast} />}
    </Toaster>
  );
}
