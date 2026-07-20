"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface CustomConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function CustomConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  variant = "danger"
}: CustomConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: "bg-red-50",
      icon: "text-red-500",
      button: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
      border: "border-red-100"
    },
    warning: {
      bg: "bg-amber-50",
      icon: "text-amber-500",
      button: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
      border: "border-amber-100"
    },
    info: {
      bg: "bg-blue-50",
      icon: "text-blue-500",
      button: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
      border: "border-blue-100"
    }
  };

  const style = colors[variant];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-primary-darker/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className={`p-10 ${style.bg} flex flex-col items-center text-center space-y-6`}>
             <div className={`p-5 bg-white rounded-full shadow-sm ${style.icon}`}>
                <AlertTriangle size={32} />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-primary-darker italic">{title}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-[280px]">
                   {message}
                </p>
             </div>
          </div>

          <div className="p-8 bg-white flex flex-col space-y-3">
             <button 
               onClick={onConfirm}
               className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl active:scale-95 ${style.button}`}
             >
                {confirmText}
             </button>
             <button 
               onClick={onCancel}
               className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
             >
                {cancelText}
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
