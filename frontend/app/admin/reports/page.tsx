"use client";

import React, { useState, useEffect } from "react";
import { 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  Download, 
  Filter, 
  Calendar,
  School,
  Users,
  AlertCircle,
  Newspaper,
  BookOpen,
  Monitor,
  Activity,
  Bot,
  ThumbsUp,
  ThumbsDown,
  Inbox
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { toast } from "react-hot-toast";
import { getApi, API_URL } from "@/lib/api";
import PermissionGate from "@/components/admin/PermissionGate";

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsDashboard() {
  return (
    <PermissionGate permission="reports.view">
      <ReportsDashboardInner />
    </PermissionGate>
  );
}

function ReportsDashboardInner() {
  const [activeTab, setActiveTab] = useState("executive");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all-time");
  // Complaints & Feedback tab: which feedback_type slice of the unified ICT
  // ticket queue to show — this is what the VC/executive overview filters on.
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<"all" | "complaint" | "compliment">("all");
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  // Data states
  const [executiveData, setExecutiveData] = useState<any>(null);
  const [websiteData, setWebsiteData] = useState<any>(null);
  const [academicData, setAcademicData] = useState<any>(null);
  const [complaintsData, setComplaintsData] = useState<any>(null);
  const [researchData, setResearchData] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);

  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState("");

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  // Complaints & Compliments now live in the unified ICT ticket queue
  // (feedback_type on IctTicket) rather than the old standalone complaints
  // table, so this tab is fetched separately against /ict/admin/analytics/feedback.
  useEffect(() => {
    fetchFeedbackData();
  }, [dateRange, feedbackTypeFilter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [exec, web, acad, res, ai] = await Promise.all([
        getApi(`/reports/executive-summary?range=${dateRange}`),
        getApi(`/reports/website-analytics?range=${dateRange}`),
        getApi(`/reports/academic?range=${dateRange}`),
        getApi(`/reports/research-alumni?range=${dateRange}`),
        getApi(`/reports/ai-search?range=${dateRange}`)
      ]);
      setExecutiveData(exec);
      setWebsiteData(web);
      setAcademicData(acad);
      setResearchData(res);
      setAiData(ai);
    } catch (err) {
      toast.error("Failed to load intelligence data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackData = async () => {
    setComplaintsLoading(true);
    try {
      const params = new URLSearchParams({ range: dateRange });
      if (feedbackTypeFilter !== "all") params.set("feedback_type", feedbackTypeFilter);
      const data = await getApi(`/ict/admin/analytics/feedback?${params.toString()}`);
      setComplaintsData(data);
    } catch {
      toast.error("Failed to load complaints & feedback data.");
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    toast.success(`Exporting ${activeTab} report to ${format.toUpperCase()}...`);
    // Example: window.open(`${API_URL}/reports/export?domain=${activeTab}&format=${format}`);
  };

  const handleGenerateAiSummary = async () => {
    setAiSummaryLoading(true);
    const toastId = toast.loading("AI is analysing the report...");
    try {
      let dataToSummarize = executiveData;
      if (activeTab === 'website') dataToSummarize = websiteData;
      if (activeTab === 'academic') dataToSummarize = academicData;
      if (activeTab === 'research') dataToSummarize = researchData;
      if (activeTab === 'complaints') dataToSummarize = complaintsData;

      const res = await fetch(`${API_URL}/reports/ai-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataToSummarize, domain: activeTab })
      });
      const result = await res.json();
      setAiSummaryText(result.summary);
      toast.success("AI Analysis complete!", { id: toastId });
    } catch (e) {
      toast.error("Failed to generate AI summary", { id: toastId });
    } finally {
      setAiSummaryLoading(false);
    }
  };

  if (loading && !executiveData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Centre</h1>
          <p className="text-slate-500 mt-1">University Decision Support & Analytics Dashboard</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border-slate-200 rounded-lg text-sm bg-white"
          >
            <option value="today">Today</option>
            <option value="last-7">Last 7 Days</option>
            <option value="last-30">Last 30 Days</option>
            <option value="this-year">This Year</option>
            <option value="all-time">All Time</option>
          </select>
          <button 
            onClick={handleGenerateAiSummary} 
            disabled={aiSummaryLoading}
            className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            <Bot size={16} className="mr-2" /> 
            {aiSummaryLoading ? 'Analysing...' : 'AI Summary'}
          </button>
          <button onClick={() => handleExport('csv')} className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Download size={16} className="mr-2" /> Export
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto space-x-1 bg-white p-1 rounded-xl border border-slate-200">
        {[
          { id: 'executive', label: 'Executive', icon: Activity },
          { id: 'website', label: 'Website Analytics', icon: Monitor },
          { id: 'academic', label: 'Academic & Admissions', icon: School },
          { id: 'research', label: 'Research & Alumni', icon: BookOpen },
          { id: 'complaints', label: 'Complaints & Feedback', icon: AlertCircle },
          { id: 'ai', label: 'AI Advisor & Search', icon: Bot },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon size={16} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI SUMMARY BOX */}
      {aiSummaryText && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl relative">
          <button 
            onClick={() => setAiSummaryText("")} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
          <div className="flex items-center text-indigo-700 font-bold mb-4">
            <Bot size={20} className="mr-2" /> AI Executive Analysis
          </div>
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
            {aiSummaryText}
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === 'executive' && executiveData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard title="Total Visitors" value={executiveData.websiteVisitors?.toLocaleString() || "0"} trend="+12.5%" />
            <MetricCard title="Applications" value={executiveData.totalApplications?.toLocaleString() || "0"} trend="+5.2%" />
            <MetricCard title="Active Students" value={executiveData.totalStudents?.toLocaleString() || "0"} trend="+2.1%" />
            <MetricCard title="Programmes" value={executiveData.totalProgrammes?.toLocaleString() || "0"} />
            <MetricCard title="Alumni Network" value={executiveData.totalAlumni?.toLocaleString() || "0"} trend="+15.0%" />
            <MetricCard title="Open Complaints" value={executiveData.totalComplaints?.toLocaleString() || "0"} trend="-3.4%" isBadTrend />
            <MetricCard title="Publications" value={executiveData.totalPublications?.toLocaleString() || "0"} />
            <MetricCard title="File Downloads" value={executiveData.totalDownloads?.toLocaleString() || "0"} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Website Traffic Trends</div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={websiteData?.trafficTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="visitors" stroke="#3b82f6" fill="#eff6ff" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Admissions Funnel</div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={academicData?.admissionsFunnel || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'website' && websiteData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard title="Unique Visitors" value={websiteData.visitors.unique.toLocaleString()} />
            <MetricCard title="Returning Visitors" value={websiteData.visitors.returning.toLocaleString()} />
            <MetricCard title="Total Sessions" value={websiteData.visitors.sessions.toLocaleString()} />
            <MetricCard title="Avg Session" value={websiteData.visitors.avgSessionDuration} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Traffic Sources</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <RePieChart>
                    <Pie data={websiteData.trafficSources} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {websiteData.trafficSources.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <CustomLegend data={websiteData.trafficSources} />
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Device Usage</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={websiteData.devices}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Browsers</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <RePieChart>
                    <Pie data={websiteData.browsers} outerRadius={80} dataKey="value">
                      {websiteData.browsers.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <CustomLegend data={websiteData.browsers} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'academic' && academicData && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Programmes by Level</div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={academicData.programsByLevel}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Programmes by School</div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <RePieChart>
                    <Pie data={academicData.programsBySchool} innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value">
                      {academicData.programsBySchool.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <CustomLegend data={academicData.programsBySchool} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="space-y-6">
          {/* Type filter — the whole tab is scoped to this */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
            {[
              { id: 'all', label: 'All Feedback', icon: AlertCircle },
              { id: 'complaint', label: 'Complaints', icon: ThumbsDown },
              { id: 'compliment', label: 'Compliments', icon: ThumbsUp },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFeedbackTypeFilter(f.id as any)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  feedbackTypeFilter === f.id ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <f.icon size={15} className="mr-2" /> {f.label}
              </button>
            ))}
          </div>

          {complaintsLoading && !complaintsData ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : complaintsData && complaintsData.summary.total === 0 ? (
            <div className="py-24 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="p-6 bg-white w-fit mx-auto rounded-full shadow-sm mb-4">
                <Inbox size={32} className="text-slate-300" />
              </div>
              <h5 className="text-lg font-black text-slate-700 uppercase tracking-tight">
                No {feedbackTypeFilter === 'all' ? 'Feedback' : feedbackTypeFilter === 'complaint' ? 'Complaints' : 'Compliments'} Found
              </h5>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Nothing recorded for this date range. Try widening the range or switching the filter above.
              </p>
            </div>
          ) : complaintsData && (
            <>
              {/* KPI overview — the at-a-glance numbers for the VC/executive view */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <MetricCard title="Total Cases" value={complaintsData.summary.total.toLocaleString()} />
                <MetricCard title="Open" value={complaintsData.summary.open.toLocaleString()} />
                <MetricCard title="Resolved" value={complaintsData.summary.resolved.toLocaleString()} />
                <MetricCard title="Escalated" value={complaintsData.summary.escalated.toLocaleString()} />
                <MetricCard title="Overdue" value={complaintsData.summary.overdue.toLocaleString()} />
                <MetricCard title="Avg Resolution" value={complaintsData.summary.avgResolutionDays > 0 ? `${complaintsData.summary.avgResolutionDays}d` : `${complaintsData.summary.avgResolutionHours}h`} />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Status Distribution</div>
                  {complaintsData.byStatus.length > 0 ? (
                    <>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <RePieChart>
                            <Pie data={complaintsData.byStatus} outerRadius={120} dataKey="value">
                              {complaintsData.byStatus.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <CustomLegend data={complaintsData.byStatus} />
                    </>
                  ) : (
                    <EmptyChartState />
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Incoming Trend (Monthly)</div>
                  {complaintsData.trend.some((t: any) => t.count > 0) ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={complaintsData.trend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChartState message="Nothing in the last 6 months — older cases may still be counted above." />
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Top Categories</div>
                  {complaintsData.byCategory.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={complaintsData.byCategory} layout="vertical" margin={{ left: 24 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#0f172a" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChartState />
                  )}
                </div>

                {feedbackTypeFilter === 'all' ? (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Complaints vs Compliments vs Technical Requests</div>
                    {complaintsData.byFeedbackType.length > 0 ? (
                      <>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <RePieChart>
                              <Pie data={relabelFeedbackType(complaintsData.byFeedbackType)} innerRadius={60} outerRadius={120} paddingAngle={3} dataKey="value">
                                {complaintsData.byFeedbackType.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RePieChart>
                          </ResponsiveContainer>
                        </div>
                        <CustomLegend data={relabelFeedbackType(complaintsData.byFeedbackType)} />
                      </>
                    ) : (
                      <EmptyChartState />
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Sentiment</div>
                    {complaintsData.bySentiment.length > 0 ? (
                      <>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <RePieChart>
                              <Pie data={complaintsData.bySentiment} innerRadius={60} outerRadius={120} paddingAngle={3} dataKey="value">
                                {complaintsData.bySentiment.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RePieChart>
                          </ResponsiveContainer>
                        </div>
                        <CustomLegend data={complaintsData.bySentiment} />
                      </>
                    ) : (
                      <EmptyChartState />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'research' && researchData && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Alumni Registration Growth</div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={researchData.alumniGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#ddd6fe" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Publications by Year</div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={researchData.publicationsByYear}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && aiData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard title="AI Conversations" value={aiData.conversations.toLocaleString()} />
            <MetricCard title="Unique Users" value={aiData.uniqueUsers.toLocaleString()} />
            <MetricCard title="Human Escalations" value={aiData.humanEscalations.toLocaleString()} />
            <MetricCard title="Resolution Rate" value={aiData.resolutionRate} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-base font-bold text-slate-800 tracking-tight mb-6">Top Questions Asked</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Query / Intent</th>
                    <th className="px-6 py-4 rounded-tr-lg w-32 text-right">Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {aiData.topQuestions.map((q: any, i: number) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{q.query}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                          {q.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  service_request: "Technical Request",
  complaint: "Complaint",
  compliment: "Compliment",
};

function relabelFeedbackType(entries: { name: string; value: number }[]) {
  return entries.map((e) => ({ ...e, name: FEEDBACK_TYPE_LABELS[e.name] || e.name }));
}

function EmptyChartState({ message = "No data for this period." }: { message?: string }) {
  return (
    <div className="h-80 flex items-center justify-center text-center text-sm text-slate-400 px-6">
      {message}
    </div>
  );
}

function MetricCard({ title, value, trend, isBadTrend = false }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 transition-colors">
      <h3 className="text-sm font-medium text-slate-500 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-black text-slate-900">{value}</div>
        {trend && (
          <div className={`text-sm font-bold ${
            trend.startsWith('+') && !isBadTrend ? 'text-green-500' : 
            trend.startsWith('-') && isBadTrend ? 'text-green-500' : 'text-red-500'
          }`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomLegend({ data }: any) {
  return (
    <div className="flex flex-wrap gap-4 mt-4 justify-center">
      {data.map((entry: any, index: number) => (
        <div key={index} className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
          <span className="text-slate-600 truncate max-w-[120px]">{entry.name}</span>
          <span className="font-bold ml-1">({entry.value})</span>
        </div>
      ))}
    </div>
  );
}
