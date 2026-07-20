"use client";

import React, { useEffect, useState } from 'react';
import { Search, Calculator, ArrowRight, ChevronDown, ChevronUp, Download, FileText, Mail, HelpCircle } from 'lucide-react';
import { getApi } from '@/lib/api';
import { generateFeesPDF } from '@/lib/exportUtils';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function FeeStructuresDashboard() {
  const t = useTranslations('Admissions');
  const [fees, setFees] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [schools, setSchools] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  const [expandedFeeId, setExpandedFeeId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterLevel, filterSchool]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [feesData, scholarData, pmData, filtersData] = await Promise.all([
          getApi(`/fee-structures/programme-fees/list?page=${page}&limit=10&search=${encodeURIComponent(debouncedSearch)}&level=${encodeURIComponent(filterLevel)}&school=${encodeURIComponent(filterSchool)}`),
          getApi('/finance/scholarships'),
          getApi('/finance/payment-methods'),
          getApi('/fee-structures/programme-fees/filters')
        ]);

        const feesArray = feesData && feesData.data ? feesData.data : (Array.isArray(feesData) ? feesData : []);
        setFees(feesArray);
        setTotalPages(feesData?.totalPages || 1);
        setScholarships(scholarData || []);
        setPaymentMethods(pmData || []);

        if (filtersData) {
          setSchools(filtersData.schools || []);
          setLevels(filtersData.levels || []);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page, debouncedSearch, filterLevel, filterSchool]);

  const filteredFees = fees;

  const toggleExpand = (id: string) => {
    setExpandedFeeId(prev => (prev === id ? null : id));
  };

  const handleExport = async () => {
    const toastId = toast.loading(t('feesPreparingDownload'));
    try {
      const res = await getApi(`/fee-structures/programme-fees/list?page=1&limit=1000&search=${encodeURIComponent(debouncedSearch)}&level=${encodeURIComponent(filterLevel)}&school=${encodeURIComponent(filterSchool)}`);
      
      const dataToExport = res?.data || [];
      if (dataToExport.length === 0) {
        toast.error(t('feesNoDataExport'), { id: toastId });
        return;
      }

      await generateFeesPDF(dataToExport);
      toast.success(t('feesPdfSuccess'), { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error(t('feesPdfFail'), { id: toastId });
    }
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-3 space-y-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder={t('feesSearch')}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <select 
                className="w-full md:w-48 py-4 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-slate-600 appearance-none"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                aria-label={t('feesAllLevels')}
              >
                <option value="">{t('feesAllLevels')}</option>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select 
                className="w-full md:w-48 py-4 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-slate-600 appearance-none"
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                aria-label={t('feesAllSchools')}
              >
                <option value="">{t('feesAllSchools')}</option>
                {schools.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400 font-medium animate-pulse bg-white rounded-3xl border border-slate-100 shadow-sm">
              {t('feesLoading')}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFees.map(f => {
                let otherFeesTotal = 0;
                if (f.other_fees && Array.isArray(f.other_fees)) {
                  otherFeesTotal += f.other_fees.reduce((acc: number, cur: any) => acc + Number(cur.amount || 0), 0);
                }
                const legacyTotal = Number(f.registration_fee || 0) + Number(f.student_activity_fee || 0) + Number(f.examination_fee || 0) + Number(f.technology_fee || 0) + Number(f.library_fee || 0) + Number(f.practical_laboratory_fee || 0);
                const totalPerYear = Number(f.tuition_fee || 0) + otherFeesTotal + legacyTotal;
                const totalPerSem = totalPerYear / 2;
                
                const isExpanded = expandedFeeId === f.id;

                return (
                  <div key={f.id} className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden transition-all duration-300">
                    
                    <button 
                      onClick={() => toggleExpand(f.id)}
                      className={`w-full text-left p-6 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${isExpanded ? 'bg-primary/5 border-b border-primary/10' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex-1 pr-4">
                        <div className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{f.program?.level}</span>
                        </div>
                        <h3 className="text-xl font-black text-primary-darker uppercase tracking-tight line-clamp-1">{f.program?.title}</h3>
                        <p className="text-slate-500 font-medium text-sm mt-1 flex items-center gap-2">
                          <span className="truncate max-w-[200px] sm:max-w-xs">{f.program?.school?.name}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                          <span className="hidden sm:inline">{t('feesYearLabel', { year: f.academic_year?.year_range })}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-6 md:shrink-0 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-left md:text-right">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('feesTotalPerYear')}</div>
                          <div className="text-xl font-black text-secondary">
                            <span className="text-xs text-slate-400 font-bold mr-1">{f.currency}</span>
                            {totalPerYear.toLocaleString()}
                          </div>
                        </div>
                        <div className={`p-2 rounded-full border transition-all ${isExpanded ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50'}`}>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
                            <Calculator size={16} className="text-primary" />
                            {t('feesDetailedBreakdown')}
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FeeItem label={t('feesTuition')} amount={f.tuition_fee} currency={f.currency} />
                            
                            {f.other_fees && Array.isArray(f.other_fees) && f.other_fees.map((of: any, idx: number) => (
                              <FeeItem key={idx} label={of.name} amount={of.amount} currency={f.currency} />
                            ))}

                            {(!f.other_fees || f.other_fees.length === 0) && (
                              <>
                                {Number(f.registration_fee) > 0 && <FeeItem label={t('feesRegistration')} amount={f.registration_fee} currency={f.currency} />}
                                {Number(f.examination_fee) > 0 && <FeeItem label={t('feesExamination')} amount={f.examination_fee} currency={f.currency} />}
                                {Number(f.student_activity_fee) > 0 && <FeeItem label={t('feesStudentActivity')} amount={f.student_activity_fee} currency={f.currency} />}
                                {Number(f.technology_fee) > 0 && <FeeItem label={t('feesTechnology')} amount={f.technology_fee} currency={f.currency} />}
                                {Number(f.library_fee) > 0 && <FeeItem label={t('feesLibrary')} amount={f.library_fee} currency={f.currency} />}
                                {Number(f.practical_laboratory_fee) > 0 && <FeeItem label={t('feesPracticalLab')} amount={f.practical_laboratory_fee} currency={f.currency} />}
                              </>
                            )}
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-sm bg-slate-50 p-4 rounded-xl">
                            <span className="text-slate-600 font-bold uppercase tracking-widest text-xs">{t('feesCostPerSemester')}</span>
                            <span className="font-black text-lg text-primary-darker">{f.currency} {totalPerSem.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-6 md:pl-8 md:border-l border-slate-100">
                          <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 border-b pb-2">
                            {t('feesPaymentOptions')}
                          </h4>
                          <div className="space-y-4">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                              <div className="font-bold text-emerald-800 text-sm mb-1">{t('feesFlexiblePayments')}</div>
                              <p className="text-xs text-emerald-600/80 leading-relaxed font-medium">{t('feesFlexiblePaymentsBody')}</p>
                            </div>
                            
                            {scholarships.length > 0 && (
                              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <div className="font-bold text-primary-darker text-sm mb-1">{t('feesScholarships')}</div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium mb-3">{t('feesFundingEligible')}</p>
                                <a href="#scholarships" className="text-xs font-bold text-primary hover:text-secondary flex items-center gap-1 transition-colors">
                                  {t('feesViewFunding')} <ArrowRight size={12} />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredFees.length === 0 && (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-slate-300" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">{t('feesEmptyTitle')}</h3>
                  <p className="text-slate-500">{t('feesEmptyBody')}</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mt-6">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors disabled:opacity-30 flex items-center gap-2"
                  >
                    {t('feesPrev')}
                  </button>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {t('feesPageOf', { page, total: totalPages })}
                  </div>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors disabled:opacity-30 flex items-center gap-2"
                  >
                    {t('feesNext')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{t('feesAdvancedDownloads')}</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleExport}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 p-4 rounded-xl font-bold flex items-center justify-between transition-colors border border-rose-100"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={20} />
                    <span>{t('feesDownloadPdf')}</span>
                  </div>
                  <Download size={16} className="opacity-50" />
                </button>
                <a 
                  href={`mailto:?subject=${encodeURIComponent(t('feesHeroTitle') + ' | Open University of Kenya')}&body=${encodeURIComponent(t('feesHeroBody') + '\n\nhttps://ouk.ac.ke/admissions/fee-structure')}`}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 p-4 rounded-xl font-bold flex items-center justify-between transition-colors border border-slate-200 block"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={20} />
                    <span>{t('feesSendEmail')}</span>
                  </div>
                  <ArrowRight size={16} className="opacity-50" />
                </a>
              </div>
            </div>

            <div className="bg-primary-darker p-6 rounded-3xl shadow-lg relative overflow-hidden text-white">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full pointer-events-none" />
              <HelpCircle className="text-secondary mb-4" size={28} />
              <h3 className="font-black uppercase tracking-widest text-sm mb-2">{t('feesNeedHelp')}</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                {t('feesNeedHelpBody')}
              </p>
              <button className="w-full bg-white text-primary-darker hover:bg-slate-50 font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-colors">
                {t('feesContactFinance')}
              </button>
            </div>

          </div>
        </div>

      </div>

      {!loading && paymentMethods.length > 0 && (
        <div className="bg-white p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
          <h3 className="text-2xl font-black text-primary-darker uppercase tracking-tighter mb-8">{t('feesHowToPayTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map(pm => (
              <div key={pm.id} className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-primary/30 hover:bg-white transition-all shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary font-black mb-4 uppercase text-[10px] tracking-widest">
                  {pm.provider_name.substring(0, 3)}
                </div>
                <h4 className="font-bold text-slate-800 mb-1">{pm.provider_name}</h4>
                <div className="text-sm font-medium text-slate-500 mb-4">{pm.account_name}</div>
                
                <div className="bg-white py-3 px-4 rounded-lg border border-slate-200 mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('feesAccountPaybill')}</div>
                  <div className="font-mono font-bold text-slate-700">{pm.account_number}</div>
                </div>

                {pm.instructions && (
                  <p className="text-xs text-slate-500 leading-relaxed bg-primary/5 p-3 rounded-lg">{pm.instructions}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && scholarships.length > 0 && (
        <div id="scholarships" className="bg-primary-darker p-10 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 -mr-48 -mt-48 rounded-full pointer-events-none" />
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 relative z-10">{t('feesScholarshipsTitle')}</h3>
          <p className="text-slate-300 font-medium mb-12 max-w-2xl relative z-10 leading-relaxed">
            {t('feesScholarshipsBody')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {scholarships.map(s => (
              <div key={s.id} className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-white text-lg">{s.title}</h4>
                  <div className="bg-secondary text-primary-darker font-black text-sm px-3 py-1 rounded-full whitespace-nowrap">
                    KES {Number(s.amount).toLocaleString()}
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{s.description}</p>
                
                {s.eligibility_criteria && (
                  <div className="mb-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">{t('feesEligibility')}</div>
                    <p className="text-sm text-slate-200">{s.eligibility_criteria}</p>
                  </div>
                )}

                {s.application_deadline && (
                  <div className="text-xs font-medium text-emerald-400 bg-emerald-400/10 inline-block px-3 py-1.5 rounded-lg border border-emerald-400/20">
                    {t('feesDeadlinePrefix', { date: new Date(s.application_deadline).toLocaleDateString() })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function FeeItem({ label, amount, currency }: { label: string, amount: number, currency: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="font-bold text-slate-800">{currency} {Number(amount).toLocaleString()}</span>
    </div>
  );
}
