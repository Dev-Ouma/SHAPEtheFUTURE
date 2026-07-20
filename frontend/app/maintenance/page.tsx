"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wrench, Clock, ArrowRight, Mail, Phone, Home } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const moduleName = searchParams.get('module');
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    // Optionally fetch the actual maintenance status from backend to show estimated end time
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/maintenance/status`)
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(() => {});
  }, []);

  const formattedModule = moduleName ? moduleName.charAt(0).toUpperCase() + moduleName.slice(1) : '';

  return (
    <div className="min-h-screen bg-primary-darker flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -ml-64 -mb-64" />

      <div className="relative z-10 max-w-2xl w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 border border-primary/30 relative">
            <Wrench className="text-primary w-10 h-10" />
            <span className="absolute -top-2 -right-2 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary"></span>
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
            {moduleName ? 'Section Unavailable' : 'System Maintenance'}
          </h1>
          
          <p className="text-lg text-slate-300 max-w-xl mx-auto">
            {moduleName 
              ? `The ${formattedModule} section is currently undergoing scheduled improvements to better serve you.`
              : status?.message || "We're currently performing operational maintenance to improve your experience. Our systems will be back online shortly."}
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 mb-12 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-4">
              <div className="bg-slate-800 p-3 rounded-xl">
                <Clock className="text-slate-400 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <p className="text-white font-medium">Work in Progress</p>
                </div>
              </div>
            </div>

            {status?.ends_at && (
              <div className="text-center md:text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Estimated Completion</p>
                <p className="text-white font-medium">
                  {new Date(status.ends_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {moduleName && (
            <Link href="/" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center space-x-2 group">
              <Home size={18} />
              <span>Return Homepage</span>
            </Link>
          )}
          
          <a href="mailto:support@ouk.ac.ke" className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 text-white border border-slate-700 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
            <Mail size={18} />
            <span>Contact Support</span>
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-8 text-center w-full">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Open University of Kenya © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary-darker flex items-center justify-center text-white font-black">LOADING...</div>}>
      <MaintenanceContent />
    </Suspense>
  );
}
