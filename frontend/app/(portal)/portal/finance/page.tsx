"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Wallet, Receipt, AlertTriangle, CheckCircle2, QrCode, RefreshCw } from "lucide-react";
import { getSettings } from "@/lib/api";

export default function StudentFinancePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState<any>(null);

  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.amount_total - inv.amount_paid), 0);

  useEffect(() => {
    // Mock data for Phase 2 initialization
    const mockInvoices = [
      { id: "1", description: "Tuition Fees - Semester 1, 2024", amount_total: 45000, amount_paid: 20000, status: "partial", due_date: "2024-05-15" },
      { id: "2", description: "Examination Fees", amount_total: 5000, amount_paid: 0, status: "unpaid", due_date: "2024-06-20" },
      { id: "3", description: "Library Registration", amount_total: 1500, amount_paid: 1500, status: "paid", due_date: "2024-03-01" },
    ];
    setInvoices(mockInvoices);
    setLoading(false);
  }, []);

  const [paying, setPaying] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+254 700 000 000");

  const initiateMpesaPayment = async () => {
    if (!activeInvoice) return;
    setPaying(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/finance/initiate-payment`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          invoiceId: activeInvoice.id,
          amount: activeInvoice.amount_total - activeInvoice.amount_paid,
          phoneNumber: phoneNumber
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("STK Push Sent! Check your phone.");
      } else {
        alert(data.message || "Payment initiation failed");
      }
    } catch (error) {
      alert("Error connecting to payment service");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-primary-darker mb-2 font-serif ">Fee Statement</h2>
          <p className="text-slate-500 font-medium">Manage your educational financial obligations and payment history.</p>
        </div>
        <div className="bg-primary-darker p-6 border-l-8 border-primary text-white text-right">
           <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Total Outstanding Balance</p>
           <p className="text-3xl font-black uppercase tracking-tight text-secondary">
             KES {totalOutstanding.toLocaleString()}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Invoice List */}
        <div className="lg:col-span-2 space-y-8">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-darker border-b border-slate-100 pb-4">Invoices & Charges</h3>
           <div className="space-y-4">
              {invoices.map((inv) => (
                <div key={inv.id} className={`bg-white border p-8 flex items-center justify-between transition-all ${activeInvoice?.id === inv.id ? 'border-primary shadow-xl scale-[1.02]' : 'border-slate-200'}`}>
                   <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 flex items-center justify-center ${inv.status === 'paid' ? 'bg-green-50 text-green-600' : inv.status === 'partial' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                         <Receipt size={24} />
                      </div>
                      <div>
                         <h4 className="font-black text-primary-darker uppercase tracking-widest text-sm mb-1">{inv.description}</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                            <span className="mr-3">Due: {inv.due_date}</span>
                            <span className={`px-2 py-0.5 ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : inv.status === 'partial' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                               {inv.status}
                            </span>
                         </p>
                      </div>
                   </div>
                   <div className="text-right flex items-center space-x-8">
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-400">Amount</p>
                         <p className="font-black text-primary-darker">KES {inv.amount_total.toLocaleString()}</p>
                      </div>
                      {inv.status !== 'paid' && (
                        <button 
                           onClick={() => setActiveInvoice(inv)}
                           className="bg-primary text-white p-4 font-black uppercase tracking-widest text-[10px] hover:bg-[#ff7f50] hover:text-white transition-colors"
                        >
                           Pay Now
                        </button>
                      )}
                      {inv.status === 'paid' && <CheckCircle2 className="text-green-500" />}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Payment Panel */}
        <div className="space-y-8">
           <div className="bg-white border border-slate-200 p-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-8 border-b border-slate-50 pb-4">Make a Payment</h3>
              
              {activeInvoice ? (
                <div className="space-y-8">
                   <div className="p-6 bg-slate-50 border-l-4 border-secondary space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paying for</p>
                      <p className="font-bold text-sm text-primary-darker uppercase">{activeInvoice.description}</p>
                   </div>
                   
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Method</p>
                      <button className="w-full flex items-center justify-between p-5 bg-white border-2 border-primary text-primary-darker">
                         <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-black text-sm">M</div>
                            <span className="font-black uppercase tracking-widest text-xs">M-Pesa STK Push</span>
                         </div>
                         <div className="w-4 h-4 rounded-full border-4 border-primary" />
                      </button>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">M-Pesa Number</label>
                      <input 
                        type="text" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-slate-50 border-none p-5 font-black text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                      />
                   </div>

                   <button 
                    onClick={initiateMpesaPayment}
                    disabled={paying}
                    className="w-full bg-primary-darker text-white p-6 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 shadow-2xl hover:bg-secondary transition-all disabled:bg-slate-300"
                   >
                      {paying ? <RefreshCw className="animate-spin" /> : <Wallet size={20} />}
                      <span>{paying ? "Processing..." : "Initiate Transfer"}</span>
                   </button>
                </div>
              ) : (
                <div className="py-24 text-center space-y-6">
                   <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mx-auto">
                      <QrCode size={32} className="text-slate-200" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Select an invoice to start the payment process</p>
                </div>
              )}
           </div>

           <div className="bg-primary-darker p-10 text-white">
              <div className="flex items-center space-x-4 mb-6">
                 <AlertTriangle className="text-secondary" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest">Financial Support</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                 Having trouble with your fees? Contact the bursar's office or apply for the university's flexible payment plan.
              </p>
              <button className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white transition-colors underline">
                 Apply for Payment Plan
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
