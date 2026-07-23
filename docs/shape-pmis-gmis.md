# SHAPE PMIS / GMIS Capability Model

Reference architecture for a **Grant / Project Management Information System** supporting Erasmus+, World Bank, USAID, UN, AU, or government-funded projects. Applied here to the live **SHAPE** Erasmus+ portal at [shape.ouk.ac.ke](https://shape.ouk.ac.ke).

Modern grant platforms typically cover the full lifecycle—proposal through closure—plus monitoring, finance, documents, dashboards, and dissemination ([AIMS feature overview](https://www.grantmanagementsoftware.com/aims-grant-management-software/full-features/), [Grants Online](https://www.grantsmis.com/)).

**SHAPE today** is a production **public PMIS + dissemination hub** with a secure CMS: partners, work packages, workplan, events, dashboard, documents, news, SDLC, monitoring, map, media, and contact. It is **not yet** a full finance/disbursement/procurement GMIS. The platform remains extensible so OUK can reuse it for future Erasmus+, research, and donor-funded projects.

---

## Status legend

| Tag | Meaning |
|-----|---------|
| **Done** | Live in SHAPE public site and/or CMS |
| **Partial** | Core present; GMIS depth still missing |
| **Planned** | Not built for SHAPE (roadmap) |

---

## Public navigation (complete)

Primary nav is **full and locked** — do not add or remove items without an explicit product decision.

| Label | Route |
|-------|--------|
| Home | `/` |
| The Project | `/the-project` |
| Partners | `/partners` |
| Outputs | `/work-packages` (workplan `#workplan`) |
| Events | `/events` |
| Dashboard | `/dashboard` |
| Documents | `/documents` |
| News | `/news` |
| SDLC | `/sdlc` |
| Monitoring | `/monitoring` |
| Map | `/map` |
| Media | `/media` |
| Contact | `/contact` |

Also available (not primary nav chrome): `/gallery`, `/accessibility`, `/search`, locale `en` / `sw`.

CMS (`/admin`): shape-home, partners, work-packages, events, documents, press, KPIs, activities, risks, SDLC, contact inbox, plus news & hero slides.

Source of truth: `frontend/lib/shape-api.ts` → `SHAPE_NAV_LINKS`.

---

## Core modules (1–30)

### 1. Project & Grant Portfolio Management — **Partial**

*Ideal:* portfolio dashboard, programme/project registry, profiles, lifecycle tracking, multi-project analytics.

*SHAPE:* Single-grant SHAPE profile (`/the-project`, `/admin/shape-home`), public dashboard (`/dashboard`). No multi-grant portfolio or programme registry yet.

---

### 2. User & Role Management — **Partial**

*Ideal:* Super Admin, Coordinator, PI, Finance, WP Lead, Partner, Researcher, M&E, Funder, Auditor, Public Visitor, granular RBAC.

*SHAPE:* Super Admin / Admin / Content Manager; **Partner Institution** (scoped); **Grant Funder** (read). Partner scoping via `PartnerScopeGuard`. Coordinator-style powers = unscoped `shape.manage`. Dedicated Finance / WP Lead / M&E / Auditor roles not yet modelled.

---

### 3. Partner Institution Management — **Done**

*Ideal:* profiles, country, contacts, departments, teams, responsibilities, MoUs, performance.

*SHAPE:* Nine consortium partners — profiles, country/city, contacts, responsibilities/deliverables, map coords, en/sw (`/partners`, `/admin/shape-partners`). Gaps: MoUs entity, departments/teams, performance scoring.

---

### 4. Grant Lifecycle Management — **Planned**

Calls, concept notes, proposals, internal review, awards, agreements, amendments, extensions, closure — **not started** for SHAPE.

---

### 5. Work Package (WP) Management — **Partial**

*Ideal:* objectives, lead, team, deliverables, milestones, budget, timeline, progress, risks, dependencies, KPIs.

*SHAPE:* WP1–WP8 with objectives, description, lead/partners, timeline, progress, milestone/deliverable text, status (`/work-packages`, `/admin/shape-work-packages`). Gaps: budget lines, team roster, first-class WP↔risk/KPI links, dependencies.

---

### 6. Project Planning — **Partial**

*Ideal:* WBS, Gantt, milestones, activities, dependencies, resources, critical path, baselines.

*SHAPE:* Activity workplan table on the same screen as work packages (`/work-packages#workplan`, `/admin/shape-activities`). No interactive Gantt, WBS, or critical path.

---

### 7. Deliverables Management — **Partial**

*Ideal:* registry, due dates, responsible institution, versions, approvals, quality review, publication status.

*SHAPE:* Deliverables as WP text + document category `deliverables`. No dedicated registry, versions, or approval workflow.

---

### 8. Milestone Tracking — **Partial**

*Ideal:* planned vs actual, approvals, evidence, notifications, variance.

*SHAPE:* Milestone text on WPs; activity dates/status. No formal milestone entity or variance alerts.

---

### 9. Budget & Financial Management — **Planned**

*SHAPE:* KPI/dashboard “budget utilization” signals and document category `financial` only — **no** budget lines, WP budgets, revisions, or forecasting.

---

### 10. Grant Disbursement Management — **Planned**

Tranches, payment requests, schedules, balances — **not started**.

---

### 11. Procurement Management — **Planned** (SHAPE)

SHAPE grant procurement — **not started**. (Repo may contain institutional OUK tender CMS; that is out of SHAPE GMIS scope.)

---

### 12. Contract & Agreement Management — **Planned**

Agreements, MoUs, NDAs, e-sign, amendments — **not started** (PDFs can be stored as documents only).

---

### 13. Monitoring & Evaluation (M&E) — **Partial**

*Ideal:* logframe, results framework, KPIs, baselines, outcomes, beneficiaries, lessons learned, risks ([Grants Online](https://www.grantsmis.com/)).

*SHAPE:* KPIs + targets, risk register, SDLC process view (`/monitoring`, `/dashboard`, `/sdlc`). Gaps: logframe, beneficiary tracking, issues/lessons modules.

---

### 14. Risk Management — **Partial**

*SHAPE:* Risk register with likelihood/impact/status/mitigation/owner (`/monitoring`, `/admin/shape-risks`). Gaps: escalation workflows, heat-map analytics.

---

### 15. Issues Management — **Planned**

Issue log, corrective actions, RCA — **not started** (risks only).

---

### 16. Quality Assurance — **Planned**

QA plans, checklists, audits, metrics — **not started** as a module (WP6 content can be CMS text).

---

### 17. Event & Meeting Management — **Done**

*SHAPE:* Events with venue, host, agenda, minutes/presentations URLs, attendance notes, outcomes, gallery (`/events`, `/admin/shape-events`). Gaps: structured attendance roster, action-item tracker.

---

### 18. Calendar & Scheduling — **Partial**

Event/activity dates and workplan. No unified project calendar or reminder engine.

---

### 19. Document Management System (DMS) — **Partial**

*SHAPE:* Categorised repository (reports, minutes, deliverables, financial, presentations, policy, publications, templates), WP/partner links, public/private, a11y captions/transcripts (`/documents`, `/admin/shape-documents`), search. Gaps: folders, version control, approval workflow, OCR, formal ACL beyond public + partner scope.

---

### 20. News & Dissemination — **Done**

News hub + press coverage (`/news`, `/media`, `/admin/news`, `/admin/shape-press`). Gaps: newsletter campaigns, social scheduling.

---

### 21. Publications Repository — **Partial**

Document category `publications` + news. No DOI-centric scholarly registry for SHAPE outputs.

---

### 22. Media Gallery — **Done**

Event galleries + `/gallery` / Media page. Gaps: dedicated album CMS, hosted video beyond URLs.

---

### 23. Dashboard & Analytics — **Partial**

*SHAPE:* Overall completion signals, WP progress, partners/countries, meetings/events, docs/activities, KPIs, open risks, SDLC (`/dashboard`). Gaps: real budget engine, partner performance analytics, risk heat maps, timeline variance, financial summaries ([Grants Online](https://www.grantsmis.com/)).

---

### 24. Reporting Engine — **Planned**

Donor / Erasmus+ / narrative / financial / custom exports (PDF, Excel, CSV, Word) — **not started** for SHAPE.

---

### 25. Notifications & Communication — **Partial**

Contact form + CMS inbox; mail infrastructure. Gaps: deadline alerts, in-app notification centre, SMS, discussion threads.

---

### 26. Workflow Automation — **Planned**

Configurable multi-level approvals, task assignment, escalations, e-sign, workflow designer — **not started** ([AIMS](https://www.grantmanagementsoftware.com/aims-grant-management-software/full-features/)).

---

### 27. Audit & Compliance — **Partial**

Platform audit logs (`/admin/logs`), accessibility/privacy surfaces, edge hardening docs. Gaps: SHAPE-specific compliance packs, artifact version history, donor checklists.

---

### 28. Interactive GIS Map — **Done** (partners)

OSM partner map (`/map`). Gaps: activity/event/beneficiary layers.

---

### 29. Public Website CMS — **Done**

Dynamic SHAPE site + CMS; en/sw; search; SEO; WCAG 2.2 AA orientation (`/accessibility`, accessibility tools, media captions/transcripts). Legacy OUK academic routes are fenced → `/the-project`.

---

### 30. System Administration — **Done**

Users/roles, settings, maintenance mode, deploy hygiene, backups guidance, REST API, security/edge docs (`DEPLOYMENT.md`, `docs/edge-hardening.md`, `docs/deploy-hygiene.md`).

---

## Advanced features

| Feature | Status |
|---------|--------|
| REST API (`/shape/*`) | **Done** |
| Mobile-responsive UI | **Done** |
| Multilingual (en / sw) | **Done** |
| Accessibility tools + WCAG orientation | **Done** |
| Full audit logging (platform) | **Partial** |
| 2FA | **Partial** (user field; not full product surface) |
| Data import/export | **Partial** (seed scripts; no general Excel I/O) |
| Scheduled backups / DR | **Partial** (ops docs) |
| Dark/light / a11y themes | **Partial** (accessibility panel) |
| Interactive Gantt / Kanban | **Planned** |
| Budget forecasting | **Planned** |
| AI report drafting / summarization / KPI insights | **Planned** |
| OCR | **Planned** |
| Electronic signatures | **Planned** |
| M365 / SharePoint / OneDrive | **Planned** |
| Moodle LMS | **Planned** |
| Teams / Zoom | **Planned** |
| Offline collection / PWA | **Planned** |
| SSO | **Planned** |

---

## SHAPE maturity summary

| Strength (live) | Largest GMIS gaps |
|-----------------|-------------------|
| Partners, events, news/press, media/gallery | Grant lifecycle (calls → award → closure) |
| Public CMS + en/sw + a11y | Budget, disbursement, procurement, contracts |
| WPs, workplan, documents, map | Issues / QA modules |
| KPIs, risks, SDLC, dashboard | Donor reporting engine & workflow automation |
| **Full primary navigation** | Multi-grant portfolio |

**Positioning:** SHAPE operates as a complete **Project Management Information System (PMIS)** for governance visibility and Erasmus+ dissemination, with a secure CMS and partner-scoped collaboration. Extending toward a full **GMIS** means adding lifecycle, finance, contracts, workflows, and reporting on the same stack.

---

## Related docs

- [README.md](../README.md) — local setup & routes  
- [DEPLOYMENT.md](../DEPLOYMENT.md) — production cutover  
- [edge-hardening.md](./edge-hardening.md) — TLS / Nginx  
- [deploy-hygiene.md](./deploy-hygiene.md) — pre-flight checks  

## References

1. [Grant Management System Features (AIMS)](https://www.grantmanagementsoftware.com/aims-grant-management-software/full-features/)  
2. [Grants Online — Grant Management & M&E](https://www.grantsmis.com/)
