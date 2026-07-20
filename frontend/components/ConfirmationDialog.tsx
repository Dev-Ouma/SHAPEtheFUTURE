"use client";

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check, Info } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Continue",
  cancelText = "Cancel",
  type = 'danger'
}) => {
  const themes = {
    danger: {
      icon: <AlertTriangle className="text-red-600" size={24} />,
      button: "bg-red-600 hover:bg-red-700",
      accent: "border-red-100",
      bg: "bg-red-50",
      text: "text-red-900"
    },
    warning: {
      icon: <AlertTriangle className="text-amber-600" size={24} />,
      button: "bg-amber-600 hover:bg-amber-700",
      accent: "border-amber-100",
      bg: "bg-amber-50",
      text: "text-amber-900"
    },
    info: {
      icon: <Info className="text-primary" size={24} />,
      button: "bg-primary-darker hover:bg-primary",
      accent: "border-primary/10",
      bg: "bg-primary/5",
      text: "text-primary-darker"
    }
  };

  const theme = themes[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-primary-darker/60 backdrop-blur-[2px]"
          />
          
          {/* Dialog Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white max-w-[440px] w-full relative z-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-none border border-slate-200"
          >
            {/* Design Accent Line */}
            <div className={`h-1.5 w-full ${theme.button}`} />
            
            <div className="p-8 md:p-10">
               {/* Close Icon */}
               <button 
                  onClick={onClose}
                  className="absolute top-8 right-8 text-slate-300 hover:text-primary-darker transition-colors"
                >
                  <X size={20} />
                </button>

              <div className="space-y-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className={`w-16 h-16 ${theme.bg} rounded-full flex items-center justify-center border ${theme.accent} shadow-inner`}>
                    {theme.icon}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight leading-none">
                      {title}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                      {message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-darker hover:bg-slate-50 transition-all"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`flex-1 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl ${theme.button} transition-all transform active:scale-[0.98]`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationDialog;
