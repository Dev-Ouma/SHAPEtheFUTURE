"use client";

import React, { useEffect, useState, useRef } from "react";
import { notFound } from "next/navigation";
import { getStaffProfile, resolveImageUrl } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import { PROFILE_IMAGE_PLACEHOLDER_DATA_URI } from "@/lib/profile-image-placeholder";
import { 
  ArrowLeft, Mail, Phone, Globe, Linkedin, FileText, 
  BookOpen, GraduationCap, Award, Briefcase, Download, Loader2
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

export default function CVGeneratorPage({ params }: { params: { slug: string } }) {
  const t = useTranslations("Staff");
  const locale = useLocale();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStaffProfile(params.slug);
        if (!data || !data.is_public) {
          notFound();
        } else {
          setProfile(data);
        }
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [params.slug]);

  const handleDownload = async () => {
    if (!cvRef.current || !profile) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;

      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: cvRef.current.scrollWidth,
        height: cvRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // Only add extra pages if there is truly more content (> 2mm threshold avoids blank tail pages)
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      let heightLeft = imgHeight - pageHeight;
      while (heightLeft > 2) {
        const position = -(imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `OUK_CV_${profile.full_name.replace(/\s+/g, "_")}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("generatingCv")}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const displayImage =
    resolveImageUrl(profile.profile_image_url) || PROFILE_IMAGE_PLACEHOLDER_DATA_URI;
  const primaryColor = "#006b6b";
  const darkColor = "#001f26";

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }} className="min-h-screen bg-slate-100">

      {/* ── Floating Action Bar ─────────────────────────── */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-full px-6 py-3 flex items-center space-x-6 z-50 border border-slate-200 print:hidden">
        <Link href={`/about/staff/${profile.profile_slug}`} className="flex items-center space-x-2 text-slate-500 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest" style={{ fontFamily: "sans-serif" }}>
          <ArrowLeft size={16} />
          <span>{t("backToProfile")}</span>
        </Link>
        <div className="w-[1px] h-4 bg-slate-200" />
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center space-x-2 text-white bg-primary px-5 py-2 rounded-full hover:bg-primary-darker transition-colors text-xs font-black uppercase tracking-widest disabled:opacity-60"
          style={{ fontFamily: "sans-serif" }}
        >
          {downloading
            ? <><Loader2 size={16} className="animate-spin" /><span>{t("generating")}</span></>
            : <><Download size={16} /><span>{t("downloadPdf")}</span></>}
        </button>
      </div>

      {/* ── CV Document ─────────────────────────────────── */}
      <div className="pt-24 pb-16 px-4">
        <div
          ref={cvRef}
          style={{
            width: "794px",          // ≈ A4 at 96dpi
            minHeight: "1123px",
            background: "#ffffff",
            margin: "0 auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
        >
          {/* ── Sidebar + Main two-column layout ── */}
          <div style={{ display: "flex", minHeight: "1123px" }}>

            {/* LEFT SIDEBAR */}
            <div style={{ width: "240px", background: darkColor, color: "#fff", padding: "40px 24px", flexShrink: 0, display: "flex", flexDirection: "column" }}>

              {/* Logo / Branding */}
              <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                {/* OUK Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
                  <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src="/icon.png" alt="OUK Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} crossOrigin="anonymous" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "10px", fontWeight: 900, color: "#fff", letterSpacing: "0.1em", margin: 0, textTransform: "uppercase" }}>Open University</h3>
                    <p style={{ fontSize: "10px", color: "#ccc", margin: 0 }}>of Kenya</p>
                  </div>
                </div>
                <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.3)", fontFamily: "sans-serif", letterSpacing: "0.08em" }}>{t("academicStaffProfile")}</p>
              </div>

              {/* Photo */}
              {/* Photo — using background-image so html2canvas renders it correctly */}
              <div style={{
                width: "160px",
                height: "160px",
                marginBottom: "24px",
                border: "3px solid rgba(255,255,255,0.15)",
                flexShrink: 0,
                backgroundImage: `url(${displayImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
              }} />

              {/* Contact */}
              <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ fontSize: "8px", fontWeight: 700, color: primaryColor, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "12px" }}>{t("contact")}</p>
                {profile.email && (
                  <div style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>{t("email")}</p>
                    <p style={{ fontSize: "9px", color: "#fff", fontFamily: "sans-serif", wordBreak: "break-all" }}>{profile.email}</p>
                  </div>
                )}
                {profile.phone_number && (
                  <div style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>{t("phone")}</p>
                    <p style={{ fontSize: "9px", color: "#fff", fontFamily: "sans-serif" }}>{profile.phone_number}</p>
                  </div>
                )}
                {profile.linkedin_url && (
                  <div style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>LinkedIn</p>
                    <p style={{ fontSize: "8px", color: primaryColor, fontFamily: "sans-serif", wordBreak: "break-all" }}>{profile.linkedin_url.replace("https://", "")}</p>
                  </div>
                )}
                {profile.website_url && (
                  <div>
                    <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>{t("website")}</p>
                    <p style={{ fontSize: "8px", color: primaryColor, fontFamily: "sans-serif", wordBreak: "break-all" }}>{profile.website_url.replace("https://", "")}</p>
                  </div>
                )}
              </div>

              {/* Specializations */}
              {profile.specializations && (
                <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ fontSize: "8px", fontWeight: 700, color: primaryColor, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "12px" }}>{t("specializations")}</p>
                  {profile.specializations.split(",").map((s: string, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "6px" }}>
                      <div style={{ width: "4px", height: "4px", background: primaryColor, borderRadius: "50%", marginTop: "5px", flexShrink: 0 }} />
                      <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.75)", fontFamily: "sans-serif", lineHeight: "1.4" }}>{s.trim()}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Research IDs */}
              {(profile.google_scholar_url || profile.researchgate_url) && (
                <div>
                  <p style={{ fontSize: "8px", fontWeight: 700, color: primaryColor, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "12px" }}>{t("researchSection")}</p>
                  {profile.google_scholar_url && (
                    <div style={{ marginBottom: "8px" }}>
                      <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>Google Scholar</p>
                      <p style={{ fontSize: "8px", color: primaryColor, fontFamily: "sans-serif", wordBreak: "break-all" }}>{profile.google_scholar_url.replace("https://", "")}</p>
                    </div>
                  )}
                  {profile.researchgate_url && (
                    <div>
                      <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2px" }}>ResearchGate</p>
                      <p style={{ fontSize: "8px", color: primaryColor, fontFamily: "sans-serif", wordBreak: "break-all" }}>{profile.researchgate_url.replace("https://", "")}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Spacer then footer */}
              <div style={{ flex: 1 }} />
              <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.25)", fontFamily: "sans-serif", letterSpacing: "0.1em" }}>ouk.ac.ke</p>
                <p style={{ fontSize: "7px", color: "rgba(255,255,255,0.2)", fontFamily: "sans-serif", marginTop: "2px" }}>© {new Date().getFullYear()} OUK</p>
              </div>
            </div>

            {/* RIGHT MAIN CONTENT */}
            <div style={{ flex: 1, padding: "40px 36px", background: "#fff", display: "flex", flexDirection: "column" }}>

              {/* Name + Title Block */}
              <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: `3px solid ${darkColor}` }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: primaryColor, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "6px" }}>
                  {profile.executive_types?.map((e: any) => e.name).join(" · ") || profile.staff_type?.name || t("academicStaff")}
                </p>
                <h1 style={{ fontSize: "32px", fontWeight: 900, color: darkColor, lineHeight: 1.1, letterSpacing: "-1px", margin: "0 0 6px 0" }}>
                  <span style={{ fontSize: "16px", fontWeight: 400, color: "#666", display: "block", letterSpacing: "0.05em" }}>{profile.honorific_title}</span>
                  {profile.full_name}
                </h1>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#666", fontFamily: "sans-serif", margin: 0 }}>
                  {profile.job_title || profile.designation}
                  {profile.department && <span style={{ color: "#aaa" }}> · {profile.department.name}</span>}
                  {profile.school && <span style={{ color: "#aaa" }}> · {profile.school.name}</span>}
                </p>
              </div>

              {/* Professional Biography */}
              {profile.bio && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ width: "3px", height: "16px", background: primaryColor }} />
                    <p style={{ fontSize: "9px", fontWeight: 700, color: darkColor, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "sans-serif", margin: 0 }}>{t("professionalBio")}</p>
                  </div>
                  <div
                    style={{ fontSize: "10.5px", color: "#444", lineHeight: "1.75", fontFamily: "Georgia, serif" }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.bio) }}
                  />
                </div>
              )}

              {/* Academic Qualifications */}
              {profile.academic_qualifications && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ width: "3px", height: "16px", background: primaryColor }} />
                    <p style={{ fontSize: "9px", fontWeight: 700, color: darkColor, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "sans-serif", margin: 0 }}>{t("academicQualifications")}</p>
                  </div>
                  <div
                    style={{ fontSize: "10.5px", color: "#444", lineHeight: "1.75", fontFamily: "Georgia, serif" }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.academic_qualifications) }}
                  />
                </div>
              )}

              {/* Publications */}
              {profile.publications && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ width: "3px", height: "16px", background: primaryColor }} />
                    <p style={{ fontSize: "9px", fontWeight: 700, color: darkColor, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "sans-serif", margin: 0 }}>{t("selectedPubsResearch")}</p>
                  </div>
                  <div
                    style={{ fontSize: "10.5px", color: "#444", lineHeight: "1.75", fontFamily: "Georgia, serif" }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.publications) }}
                  />
                </div>
              )}

              {/* Official Statement */}
              {profile.message && (
                <div style={{ background: "#f8f9fb", borderLeft: `4px solid ${primaryColor}`, padding: "16px 20px", marginBottom: "28px" }}>
                  <p style={{ fontSize: "9px", fontWeight: 700, color: primaryColor, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: "8px" }}>{t("officialStatement")}</p>
                  <div
                    style={{ fontSize: "10.5px", color: "#555", lineHeight: "1.7", fontStyle: "italic", fontFamily: "Georgia, serif" }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.message) }}
                  />
                </div>
              )}

              {/* Footer — pinned to bottom via flex column + marginTop auto */}
              <div style={{ marginTop: "auto" }}>
                <div style={{ height: "3px", background: `linear-gradient(to right, ${primaryColor}, ${darkColor})`, marginBottom: "12px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src="/icon.png" alt="OUK Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} crossOrigin="anonymous" />
                    </div>
                    <p style={{ fontSize: "8px", color: "#999", fontFamily: "sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>{t("officialFacultyProfile")}</p>
                  </div>
                  <p style={{ fontSize: "8px", color: "#bbb", fontFamily: "sans-serif", margin: 0 }}>{t("generatedOn", { date: new Date().toLocaleDateString(locale === "sw" ? "sw-KE" : "en-GB", { day: "numeric", month: "long", year: "numeric" }) })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
