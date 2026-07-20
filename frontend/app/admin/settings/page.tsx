"use client";

import React, { useState, useEffect } from "react";
import { getApi, postApi, getApiErrorMessage } from "@/lib/api";
import { Save, RefreshCw, AlertCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import PermissionGate from "@/components/admin/PermissionGate";
import { usePermissions } from "@/hooks/useAdminPermissions";

export default function SettingsPage() {
  return (
    <PermissionGate permission={["settings.view", "settings.manage"]}>
      <SettingsPageInner />
    </PermissionGate>
  );
}

function SettingsPageInner() {
  const { permissions } = usePermissions(["settings.manage"]);
  const canManage = !!permissions["settings.manage"];
  const [settings, setSettings] = useState<any>({
    contact_email: "",
    contact_phone: "",
    address: "",
    student_support_phone: "",
    student_support_email: "",
    student_support_office: "",
    alumni_support_email: "",
    alumni_support_office: "",
    alumni_mission: "The Open University of Kenya Alumni Association aims to foster a lifelong relationship between the university and its graduates, creating a global community of innovators who drive the digital transformation of Africa.",
    alumni_ambassadors_count: "12,000+",
    alumni_jobs_hero: "Access exclusive job boards, alumni referrals, and internship opportunities within our global network of institutional partners.",
    alumni_events_hero: "Join our global network of alumni at exclusive events, webinars, and reunions across the world.",
    twitter_url: "",
    facebook_url: "",
    linkedin_url: "",
    tiktok_url: "",
    facebook_page_id: "",
    facebook_access_token: "",
    twitter_username: "",
    twitter_bearer_token: "",
    instagram_account_id: "",
    instagram_access_token: "",
    site_logo: "",
    site_favicon: "",
    cta_apply_url: "",
    cta_portal_url: "",
    intro_title: "",
    intro_description: "",
    intro_video_url: "",
    intro_video_type: "upload",
    smtp_host: "smtp.gmail.com",
    smtp_port: "587",
    smtp_user: "",
    smtp_pass: "",
    smtp_from_email: "",
    smtp_from_name: "OUK ICT Support & Helpdesk",
    smtp_user_subscriptions: "",
    smtp_pass_subscriptions: "",
    smtp_from_name_subscriptions: "OUK Newsletter",
    smtp_from_email_subscriptions: "",
    timetable_gcal_class_duration_hours: "3",
    timetable_gcal_semester_start_date: "",
    timetable_gcal_semester_end_date: "",
    google_client_id: "",
    google_client_secret: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingMail, setTestingMail] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Admin settings must load the authenticated catalog (includes SMTP secrets).
    // Public /settings/public intentionally omits smtp_* and would leave blanks
    // that overwrite passwords on Save.
    const data = await getApi("/settings");
    if (data && typeof data === "object") {
      setSettings((prev: any) => ({ ...prev, ...data }));
    } else {
      toast.error("Could not load admin settings. Check your session.");
    }
    setLoading(false);
  };

  const handleUpdate = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    const loadingToast = toast.loading("Updating configurations...");

    try {
      // Omit blank secrets so we never wipe SMTP / API keys on save.
      const payload = { ...settings };
      [
        "smtp_pass",
        "smtp_pass_subscriptions",
        "smtp_pass_support",
        "smtp_pass_system",
        "smtp_pass_complaints",
        "openai_api_key",
        "google_client_secret",
        "facebook_access_token",
        "instagram_access_token",
        "twitter_bearer_token",
      ].forEach((key) => {
        if (!payload[key] || String(payload[key]).trim() === "") {
          delete payload[key];
        }
      });

      const result = await postApi("/settings/bulk", payload);
      if (result?.success === false) {
        toast.error(`Partial save: ${result.message}`, { id: loadingToast });
      } else {
        toast.success("Settings updated successfully", { id: loadingToast });
        await fetchData();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to update settings"), { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const testSmtp = async () => {
    setTestingMail(true);
    const toastId = toast.loading("Testing SMTP…");
    try {
      const to = settings.smtp_from_email || settings.smtp_user || settings.contact_email;
      const result = await postApi("/mail/test", { to });
      if (result?.ok) {
        toast.success(result.message || "SMTP OK", { id: toastId });
      } else {
        toast.error(result?.message || "SMTP test failed", { id: toastId });
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "SMTP test failed"), { id: toastId });
    } finally {
      setTestingMail(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="space-y-12 w-full">
      <div className="flex justify-between items-end border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-3xl font-black text-primary-darker mb-2">Global Configuration</h2>
          <p className="text-slate-500 font-medium text-sm">Manage university contact details, social media links, and global branding assets.</p>
        </div>
      </div>

      {/* Floating Action Bar — writes require settings.manage */}
      {canManage && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-6">
        <div className="bg-primary-darker text-white p-4 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md bg-opacity-90">
          <div className="flex items-center space-x-4 pl-4">
             <div className={`w-2 h-2 rounded-full ${saving ? 'bg-secondary animate-pulse' : 'bg-green-500'}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {saving ? "Orchestrating Changes..." : "System Ready for Update"}
             </span>
          </div>
          <button 
            onClick={saveSettings}
            disabled={saving}
            className="bg-primary hover:bg-secondary text-white py-4 px-12 flex items-center space-x-3 text-xs font-black uppercase tracking-widest transition-all disabled:bg-slate-700 disabled:cursor-not-allowed group"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
            <span>{saving ? "Processing..." : "Save All Configuration"}</span>
          </button>
        </div>
      </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <section className="space-y-8 bg-white p-10 border border-slate-200">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary border-b border-slate-100 pb-4">Contact Info</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Email</label>
              <input 
                type="email" 
                value={settings.contact_email || ""} 
                onChange={(e) => handleUpdate("contact_email", e.target.value)}
                className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Phone</label>
              <input 
                type="text" 
                value={settings.contact_phone || ""} 
                onChange={(e) => handleUpdate("contact_phone", e.target.value)}
                className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Physical Address</label>
              <textarea 
                value={settings.address || ""} 
                onChange={(e) => handleUpdate("address", e.target.value)}
                className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none h-32"
              />
            </div>
          </div>
        </section>

        {/* Departmental Contacts */}
        <section className="space-y-8 bg-white p-10 border border-slate-200 col-span-1 md:col-span-2">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 border-b border-slate-100 pb-4">Departmental Contacts</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Student Support</h4>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Phone</label>
                <input 
                  type="text" 
                  value={settings.student_support_phone || ""} 
                  onChange={(e) => handleUpdate("student_support_phone", e.target.value)}
                  placeholder="+254 700 000 000"
                  className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Email</label>
                <input 
                  type="email" 
                  value={settings.student_support_email || ""} 
                  onChange={(e) => handleUpdate("student_support_email", e.target.value)}
                  placeholder="students@ouk.ac.ke"
                  className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Physical Office</label>
                <input 
                  type="text" 
                  value={settings.student_support_office || ""} 
                  onChange={(e) => handleUpdate("student_support_office", e.target.value)}
                  placeholder="OUK Student Centre, 2nd Floor"
                  className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Alumni Office</h4>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alumni Email</label>
                <input 
                  type="email" 
                  value={settings.alumni_support_email || ""} 
                  onChange={(e) => handleUpdate("alumni_support_email", e.target.value)}
                  placeholder="alumni.office@ouk.ac.ke"
                  className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alumni Headquarters</label>
                <input 
                  type="text" 
                  value={settings.alumni_support_office || ""} 
                  onChange={(e) => handleUpdate("alumni_support_office", e.target.value)}
                  placeholder="Konza Technopolis, OUK Hub"
                  className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Social Meta */}
        <section className="space-y-8 bg-white p-10 border border-slate-200">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-secondary border-b border-slate-100 pb-4">Social Presence</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">X (Twitter) URL</label>
              <input 
                type="text" 
                value={settings.twitter_url || ""} 
                onChange={(e) => handleUpdate("twitter_url", e.target.value)}
                className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Facebook URL</label>
              <input 
                type="text" 
                value={settings.facebook_url || ""} 
                onChange={(e) => handleUpdate("facebook_url", e.target.value)}
                className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">LinkedIn URL</label>
              <input 
                type="text" 
                value={settings.linkedin_url || ""} 
                onChange={(e) => handleUpdate("linkedin_url", e.target.value)}
                className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">TikTok URL</label>
              <input 
                type="text" 
                value={settings.tiktok_url || ""} 
                onChange={(e) => handleUpdate("tiktok_url", e.target.value)}
                className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </section>

        {/* Social Media API Integrations */}
        <section className="space-y-8 bg-white p-10 border border-slate-200 col-span-1 md:col-span-2">
           <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">Social Media Live Feeds</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">API Configuration</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Facebook */}
              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                   Facebook Graph API
                 </h4>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Page ID</label>
                    <input 
                      type="text" 
                      value={settings.facebook_page_id || ""} 
                      onChange={(e) => handleUpdate("facebook_page_id", e.target.value)}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access Token</label>
                    <input 
                      type="password" 
                      value={settings.facebook_access_token || ""} 
                      onChange={(e) => handleUpdate("facebook_access_token", e.target.value)}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
              </div>

              {/* Instagram */}
              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                   Instagram Graph API
                 </h4>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Account ID</label>
                    <input 
                      type="text" 
                      value={settings.instagram_account_id || ""} 
                      onChange={(e) => handleUpdate("instagram_account_id", e.target.value)}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access Token</label>
                    <input 
                      type="password" 
                      value={settings.instagram_access_token || ""} 
                      onChange={(e) => handleUpdate("instagram_access_token", e.target.value)}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
              </div>

              {/* Twitter */}
              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                   X (Twitter) API V2
                 </h4>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username (without @)</label>
                    <input 
                      type="text" 
                      value={settings.twitter_username || ""} 
                      onChange={(e) => handleUpdate("twitter_username", e.target.value)}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bearer Token</label>
                    <input 
                      type="password" 
                      value={settings.twitter_bearer_token || ""} 
                      onChange={(e) => handleUpdate("twitter_bearer_token", e.target.value)}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* Site Branding */}
        <section className="space-y-8 bg-white p-10 border border-slate-200">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary border-b border-slate-100 pb-4">Branding</h3>
          
          <div className="space-y-8">
            <div>
              <ImageUploader 
                label="Site Logo"
                value={settings.site_logo || ""} 
                onChange={(val) => handleUpdate("site_logo", val)}
                placeholder="/hero-campus.png"
              />
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-2">Recommended: .png or .svg with transparent background</p>
            </div>
            <div>
              <ImageUploader 
                label="Favicon"
                value={settings.site_favicon || ""} 
                onChange={(val) => handleUpdate("site_favicon", val)}
                placeholder="/favicon.ico"
              />
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-2">Standard web icon (.ico or .png)</p>
            </div>
          </div>
        </section>

        {/* CTA Links */}
        <section className="space-y-8 bg-white p-10 border border-slate-200">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary border-b border-slate-100 pb-4">Call to Action Targets</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apply Now URL</label>
              <input 
                type="text" 
                value={settings.cta_apply_url || ""} 
                onChange={(e) => handleUpdate("cta_apply_url", e.target.value)}
                className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Used in Hero and Admissions sections</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Portal URL</label>
              <input 
                type="text" 
                value={settings.cta_portal_url || ""} 
                onChange={(e) => handleUpdate("cta_portal_url", e.target.value)}
                className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
              />
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Used in Navbar and Footer</p>
            </div>
          </div>
        </section>

        {/* Footer Configuration */}
        <section className="space-y-8 bg-white p-10 border border-slate-200 col-span-1 md:col-span-2">
           <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Footer Orchestration</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Global Discovery Grounding</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Mission / Tagline</label>
                    <textarea 
                      value={settings.footer_mission || ""} 
                      onChange={(e) => handleUpdate("footer_mission", e.target.value)}
                      placeholder="The innovative university for inclusive prosperity"
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none h-24"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Footer Description</label>
                    <textarea 
                      value={settings.footer_description || ""} 
                      onChange={(e) => handleUpdate("footer_description", e.target.value)}
                      placeholder="Advancing global discovery through high-fidelity digital learning..."
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none h-24"
                    />
                 </div>
              </div>

              <div className="space-y-8">
                 <div>
                    <ImageUploader 
                      label="Footer Background Image"
                      value={settings.footer_background_image || settings.footer_background || ""} 
                      onChange={(val) => handleUpdate("footer_background_image", val)}
                      placeholder="/hero-campus.png"
                    />
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-2 leading-relaxed">
                       High-resolution architectural or abstract background. <br />
                       System automatically applies immersive dark gradients.
                    </p>
                 </div>
              </div>
           </div>
        </section>
        
        {/* Virtual Tour Orchestration */}
        <section className="space-y-8 bg-white p-10 border border-slate-200 col-span-1 md:col-span-2">
           <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-secondary">Virtual Tour Orchestration</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Institutional Intro & Discovery</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intro Title</label>
                    <input 
                      type="text" 
                      value={settings.intro_title || ""} 
                      onChange={(e) => handleUpdate("intro_title", e.target.value)}
                      placeholder="Institutional Intro"
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intro Description</label>
                    <textarea 
                      value={settings.intro_description || ""} 
                      onChange={(e) => handleUpdate("intro_description", e.target.value)}
                      placeholder="Experience the Open University of Kenya..."
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none h-24"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Video Source Type</label>
                    <select 
                      value={settings.intro_video_type || "upload"} 
                      onChange={(e) => handleUpdate("intro_video_type", e.target.value)}
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    >
                       <option value="upload">Direct Upload / URL</option>
                       <option value="youtube">YouTube Link</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-8">
                 <div>
                    <ImageUploader 
                      label="Intro Video Asset"
                      value={settings.intro_video_url || ""} 
                      onChange={(val) => handleUpdate("intro_video_url", val)}
                      placeholder={settings.intro_video_type === 'youtube' ? 'https://youtube.com/watch?v=...' : '/videos/intro.mp4'}
                      accept={settings.intro_video_type === 'youtube' ? 'text' : 'video/*'}
                      type="video"
                    />
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-2 leading-relaxed">
                       {settings.intro_video_type === 'youtube' ? 'Paste the full YouTube URL.' : 'Upload a cinematic MP4 or WebM (max 15MB).'}
                    </p>
                 </div>
              </div>
           </div>
        </section>

         {/* Timetable & Academic Calendar */}
         <section className="space-y-8 bg-white p-10 border border-slate-200 col-span-1 md:col-span-2">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-teal-600">Timetable & Academic Calendar</h3>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Google Calendar Sync Configuration</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Class Duration (Hours)</label>
                     <input 
                       type="number" 
                       value={settings.timetable_gcal_class_duration_hours || "3"} 
                       onChange={(e) => handleUpdate("timetable_gcal_class_duration_hours", e.target.value)}
                       className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                       min="1"
                       max="12"
                     />
                     <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                       Number of hours a scheduled class runs for when exported to Google Calendar.
                     </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semester Start Date</label>
                     <input 
                       type="date" 
                       value={settings.timetable_gcal_semester_start_date || ""} 
                       onChange={(e) => handleUpdate("timetable_gcal_semester_start_date", e.target.value)}
                       className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                     />
                     <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                       The official start date. Synced calendars will backfill past classes to this date.
                     </p>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semester End Date</label>
                     <input 
                       type="date" 
                       value={settings.timetable_gcal_semester_end_date || ""} 
                       onChange={(e) => handleUpdate("timetable_gcal_semester_end_date", e.target.value)}
                       className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                     />
                     <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                       The official end date. Schedule recurrences will automatically stop on this date.
                     </p>
                  </div>
               </div>
            </div>
         </section>

         {/* Authentication & Security */}
         <section className="space-y-8 bg-white p-10 border border-slate-200">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 border-b border-slate-100 pb-4">Authentication & Security</h3>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google OAuth Client ID</label>
                  <input 
                    type="text" 
                    value={settings.google_client_id || ""} 
                    onChange={(e) => handleUpdate("google_client_id", e.target.value)}
                    placeholder="your-google-client-id-here.apps.googleusercontent.com"
                    className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                    Used for Staff/Student Google Authentication in the Grievance Portal.
                  </p>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google OAuth Client Secret (Optional)</label>
                  <input 
                    type="password" 
                    value={settings.google_client_secret || ""} 
                    onChange={(e) => handleUpdate("google_client_secret", e.target.value)}
                    placeholder="GOCSPX-..."
                    className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                    Only required if implementing backend server-side verification. The frontend popup flow only uses the Client ID.
                  </p>
               </div>
            </div>
         </section>

        {/* Intelligence & AI */}
        <section className="space-y-8 bg-white p-10 border border-slate-200">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-secondary border-b border-slate-100 pb-4">Intelligence & AI</h3>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">OpenAI API Key</label>
                 <input 
                   type="password" 
                   value={settings.openai_api_key || ""} 
                   onChange={(e) => handleUpdate("openai_api_key", e.target.value)}
                   placeholder="sk-..."
                   className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                 />
                 <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                   Enables the scholarly fall-back brain when local discovery thresholds are insufficient.
                 </p>
              </div>

              <div className="space-y-2 opacity-50 pointer-events-none">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hybrid Confidence Threshold</label>
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   defaultValue="70"
                   className="w-full"
                 />
                 <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    <span>Performance</span>
                    <span>Accuracy</span>
                 </div>
              </div>
           </div>
        </section>

        {/* SMTP & Email Orchestration */}
        <section className="space-y-8 bg-white p-10 border border-slate-200 col-span-1 md:col-span-2">
           <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">SMTP & Email Orchestration</h3>
              <div className="flex items-center gap-3">
                {canManage && (
                <button
                  type="button"
                  onClick={testSmtp}
                  disabled={testingMail}
                  className="inline-flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                >
                  <Mail size={12} />
                  {testingMail ? "Testing…" : "Send test email"}
                </button>
                )}
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Google App Email Configuration</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SMTP Host</label>
                    <input 
                      type="text" 
                      value={settings.smtp_host || ""} 
                      onChange={(e) => handleUpdate("smtp_host", e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SMTP Port</label>
                    <input 
                      type="text" 
                      value={settings.smtp_port || ""} 
                      onChange={(e) => handleUpdate("smtp_port", e.target.value)}
                      placeholder="587"
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sender Email Name</label>
                    <input 
                      type="text" 
                      value={settings.smtp_from_name || ""} 
                      onChange={(e) => handleUpdate("smtp_from_name", e.target.value)}
                      placeholder="OUK ICT Support & Helpdesk"
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SMTP User (Email Address)</label>
                    <input 
                      type="email" 
                      value={settings.smtp_user || ""} 
                      onChange={(e) => handleUpdate("smtp_user", e.target.value)}
                      placeholder="email@ouk.ac.ke"
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SMTP App Password</label>
                    <input 
                      type="password" 
                      value={settings.smtp_pass || ""} 
                      onChange={(e) => handleUpdate("smtp_pass", e.target.value)}
                      placeholder="Leave blank to keep current password"
                      autoComplete="new-password"
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                      For Google/Gmail, use a generated App Password. Leave blank when saving if you do not want to change it.
                    </p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reply-To / From Email Address</label>
                    <input 
                      type="email" 
                      value={settings.smtp_from_email || ""} 
                      onChange={(e) => handleUpdate("smtp_from_email", e.target.value)}
                      placeholder="noreply@ouk.ac.ke"
                      className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                    />
                 </div>
              </div>
           </div>

           {/* Subscriptions Credentials Sub-section */}
           <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Subscriptions & Newsletter Channel</h4>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-8">
                 (Optional) Use a separate Google App Password to keep newsletter emails separate from official grievances. If left blank, the system will securely fallback to the global credentials above.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sender Email Name</label>
                       <input 
                         type="text" 
                         value={settings.smtp_from_name_subscriptions || ""} 
                         onChange={(e) => handleUpdate("smtp_from_name_subscriptions", e.target.value)}
                         placeholder="OUK Newsletter"
                         className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reply-To / From Email Address</label>
                       <input 
                         type="email" 
                         value={settings.smtp_from_email_subscriptions || ""} 
                         onChange={(e) => handleUpdate("smtp_from_email_subscriptions", e.target.value)}
                         placeholder="newsletter@ouk.ac.ke"
                         className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SMTP User (Email Address)</label>
                       <input 
                         type="email" 
                         value={settings.smtp_user_subscriptions || ""} 
                         onChange={(e) => handleUpdate("smtp_user_subscriptions", e.target.value)}
                         placeholder="newsletter@ouk.ac.ke"
                         className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SMTP App Password</label>
                       <input 
                         type="password" 
                         value={settings.smtp_pass_subscriptions || ""} 
                         onChange={(e) => handleUpdate("smtp_pass_subscriptions", e.target.value)}
                         placeholder="••••••••••••••••"
                         className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Security & Data Retention */}
        <section className="space-y-8 bg-white p-10 border border-slate-200">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 border-b border-slate-100 pb-4">Security & Data Retention</h3>
           
           <div className="space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Log Retention (Days)</label>
                 <input 
                   type="number" 
                   value={settings.audit_log_retention_days || "60"} 
                   onChange={(e) => handleUpdate("audit_log_retention_days", e.target.value)}
                   className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                   min="1"
                   max="3650"
                 />
                 <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                   Governs the archival threshold for administrative audit trails and operational security logs.
                 </p>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analytics Retention (Days)</label>
                 <input 
                   type="number" 
                   value={settings.analytics_retention_days || "60"} 
                   onChange={(e) => handleUpdate("analytics_retention_days", e.target.value)}
                   className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                   min="1"
                   max="3650"
                 />
                 <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                   Defines the lifespan of student engagement telemetry, page visits, and site interaction metrics.
                 </p>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recycle Bin Retention (Days)</label>
                 <input 
                   type="number" 
                   value={settings.recycle_bin_retention_days || "60"} 
                   onChange={(e) => handleUpdate("recycle_bin_retention_days", e.target.value)}
                   className="w-full bg-slate-50 border-none p-4 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none"
                   min="1"
                   max="3650"
                 />
                 <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed mt-2">
                   The duration soft-deleted registry items (Programmes, Units, etc.) are held before permanent purging.
                 </p>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
