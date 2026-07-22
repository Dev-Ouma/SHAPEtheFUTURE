#!/usr/bin/env node
/**
 * Upserts rich work-package CMS content into Postgres.
 * Run: node scripts/enrich-work-packages.js
 */
const { Client } = require("pg");

const WPS = [
  {
    code: "WP1",
    title: "Project Management",
    description:
      "WP1 is the governance backbone of SHAPE. It coordinates the nine-partner consortium, financial reporting to EACEA, risk management, and decision-making across East Africa and Europe.\n\nThe work package maintains the project handbook, steers consortium meetings, and ensures every workstream stays aligned with Erasmus+ CBHE requirements and partner institutional calendars.",
    objectives:
      "Establish transparent consortium governance and reporting routines\nCoordinate financial management, procurement, and partner reimbursements\nMaintain risk, quality, and communications oversight with WP leads\nDeliver timely interim and final reports to the European Education and Culture Executive Agency",
    milestones: JSON.stringify([
      { title: "Consortium kick-off & WP alignment", due: "2026-06", status: "completed" },
      { title: "Project handbook v1 published", due: "2026-08", status: "completed" },
      { title: "Year-1 interim report submitted", due: "2027-01", status: "planned" },
      { title: "Mid-term review with EACEA", due: "2027-07", status: "planned" },
      { title: "Final consortium report", due: "2028-12", status: "planned" },
    ]),
    deliverables:
      "Project handbook | completed\nConsortium meeting minutes | in_progress\nInterim technical & financial reports | planned\nRisk & quality register | in_progress\nFinal project report | planned",
    progress_percent: 60,
    status: "in_progress",
  },
  {
    code: "WP2",
    title: "Needs Assessment",
    description:
      "WP2 maps digital and smart-city education needs across partner universities and municipal stakeholders in Kenya, Uganda, and Somalia — with comparative insight from European partners.\n\nFindings guide curriculum priorities (WP3), platform features (WP4), and pilot targeting (WP5), so SHAPE investments respond to real labour-market and institutional gaps.",
    objectives:
      "Conduct baseline surveys of staff, students, and city stakeholders\nProduce country briefs on smart-city skills and digital pedagogy gaps\nPrioritise curriculum and platform interventions with partner leads\nPublish an open needs assessment report for the consortium and public",
    milestones: JSON.stringify([
      { title: "Survey instruments validated", due: "2026-03", status: "completed" },
      { title: "Field data collection complete", due: "2026-06", status: "completed" },
      { title: "Country briefs drafted", due: "2026-08", status: "in_progress" },
      { title: "Needs assessment report published", due: "2026-09", status: "planned" },
    ]),
    deliverables:
      "Needs assessment report | in_progress\nCountry briefs (KE, UG, SO) | in_progress\nStakeholder map | completed\nPriority intervention matrix | planned",
    progress_percent: 40,
    status: "in_progress",
  },
  {
    code: "WP3",
    title: "Curriculum Development",
    description:
      "WP3 co-designs modular smart-city curricula and micro-credentials that partner universities can accredit and deliver. Content blends digital public services, urban data, climate resilience, and inclusive mobility.\n\nEuropean partners contribute pedagogical models; East African partners ground modules in local city challenges and degree structures.",
    objectives:
      "Co-create modular programme frameworks aligned to national HE standards\nDefine learning outcomes, assessment schemes, and credit pathways\nProduce open educational resources ready for the digital platform\nSupport institutional approval processes at partner universities",
    milestones: JSON.stringify([
      { title: "Curriculum design workshops", due: "2026-05", status: "completed" },
      { title: "Module outlines approved by WP leads", due: "2026-10", status: "in_progress" },
      { title: "OER packages released to platform", due: "2027-03", status: "planned" },
      { title: "Accreditation dossiers submitted", due: "2027-06", status: "planned" },
    ]),
    deliverables:
      "Curriculum frameworks | in_progress\nModule outlines & learning outcomes | in_progress\nOpen educational resources | planned\nAccreditation support packs | planned",
    progress_percent: 25,
    status: "in_progress",
  },
  {
    code: "WP4",
    title: "Digital Learning Platform",
    description:
      "WP4 builds the shared digital learning environment that hosts SHAPE courses, resources, and collaboration spaces. The platform prioritises accessibility, multilingual support, and low-bandwidth resilience for East African learners.\n\nIt integrates content from WP3, supports pilot cohorts in WP5, and becomes a lasting institutional asset beyond the grant.",
    objectives:
      "Deploy a shared LMS / content repository for the consortium\nEnsure accessibility, mobile use, and multilingual pathways\nTrain partner IT and teaching staff as platform champions\nPublish user guides and technical documentation",
    milestones: JSON.stringify([
      { title: "Platform architecture agreed", due: "2026-04", status: "completed" },
      { title: "MVP environment live", due: "2026-09", status: "in_progress" },
      { title: "Content repository populated", due: "2027-03", status: "planned" },
      { title: "Full platform release for pilots", due: "2027-06", status: "planned" },
    ]),
    deliverables:
      "Platform MVP | in_progress\nContent repository | planned\nStaff training packs | planned\nUser & admin guides | planned",
    progress_percent: 20,
    status: "in_progress",
  },
  {
    code: "WP5",
    title: "Pilot Training",
    description:
      "WP5 runs live pilot cohorts across East African partner institutions to validate curriculum (WP3) and the digital platform (WP4). Pilots engage academic staff, postgraduate learners, and city practitioners.\n\nEvaluation evidence feeds quality assurance (WP6) and informs scale-up and sustainability (WP8).",
    objectives:
      "Recruit and onboard pilot cohorts in partner institutions\nDeliver blended training using SHAPE modules and platform\nCollect learner feedback and performance evidence\nRecommend refinements before wider roll-out",
    milestones: JSON.stringify([
      { title: "Pilot protocol & selection criteria", due: "2026-12", status: "planned" },
      { title: "First cohort launch", due: "2027-03", status: "planned" },
      { title: "Mid-pilot evaluation", due: "2027-08", status: "planned" },
      { title: "Pilot completion report", due: "2027-12", status: "planned" },
    ]),
    deliverables:
      "Pilot cohort plans | planned\nTraining delivery logs | planned\nEvaluation reports | planned\nRefinement recommendations | planned",
    progress_percent: 10,
    status: "not_started",
  },
  {
    code: "WP6",
    title: "Quality Assurance",
    description:
      "WP6 embeds cross-partner quality standards into curriculum design, platform delivery, and pilot training. Peer review, continuous improvement cycles, and shared QA tools keep SHAPE outputs academically rigorous and transferable.\n\nEuropean QA experience is adapted to East African institutional contexts without lowering ambition.",
    objectives:
      "Publish a consortium QA handbook and review templates\nRun peer reviews on modules, platform UX, and pilot delivery\nTrack improvement actions with WP leads\nAlign QA evidence with Erasmus+ monitoring expectations",
    milestones: JSON.stringify([
      { title: "QA framework draft", due: "2026-05", status: "completed" },
      { title: "QA handbook v1", due: "2026-09", status: "in_progress" },
      { title: "First peer-review cycle", due: "2027-02", status: "planned" },
      { title: "Continuous improvement report", due: "2028-06", status: "planned" },
    ]),
    deliverables:
      "QA handbook | in_progress\nPeer review reports | planned\nImprovement action plans | planned\nQA evidence pack for EACEA | planned",
    progress_percent: 15,
    status: "in_progress",
  },
  {
    code: "WP7",
    title: "Dissemination",
    description:
      "WP7 makes SHAPE visible and useful beyond the consortium — through the public portal, events, policy briefs, academic outputs, and partner communications.\n\nLed with OUK as coordination hub, dissemination ensures ministries, cities, and other universities can adopt SHAPE approaches.",
    objectives:
      "Operate the public SHAPE portal and news hub\nProduce policy briefs and conference contributions\nSupport partner-level communication campaigns\nDocument impact stories for Erasmus+ visibility",
    milestones: JSON.stringify([
      { title: "Public portal launch", due: "2026-07", status: "completed" },
      { title: "Dissemination plan approved", due: "2026-08", status: "completed" },
      { title: "First policy brief series", due: "2027-03", status: "planned" },
      { title: "Final dissemination conference", due: "2028-10", status: "planned" },
    ]),
    deliverables:
      "Public website & news hub | completed\nPolicy briefs | planned\nConference presentations | in_progress\nImpact story pack | planned",
    progress_percent: 30,
    status: "in_progress",
  },
  {
    code: "WP8",
    title: "Sustainability",
    description:
      "WP8 ensures SHAPE results outlive the three-year grant: institutional adoption of curricula, continued platform hosting, alumni and trainer networks, and follow-on funding pathways.\n\nMoUs, business models, and partnership agreements lock in capacity built across WP1–WP7.",
    objectives:
      "Design institutional sustainability plans with each partner\nSecure MoUs for continued curriculum and platform use\nMap continuation funding and alumni networks\nHand over assets with clear ownership and maintenance roles",
    milestones: JSON.stringify([
      { title: "Sustainability framework workshop", due: "2027-06", status: "planned" },
      { title: "Partner MoU drafts", due: "2027-12", status: "planned" },
      { title: "Continuation funding proposals", due: "2028-06", status: "planned" },
      { title: "Final sustainability dossier", due: "2028-11", status: "planned" },
    ]),
    deliverables:
      "Sustainability plan | planned\nInstitutional MoUs | planned\nContinuation funding proposals | planned\nAlumni & trainer network model | planned",
    progress_percent: 5,
    status: "not_started",
  },
];

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5433),
    user: process.env.DB_USER || "shape_user",
    password: process.env.DB_PASSWORD || "shape_dev_password",
    database: process.env.DB_NAME || "shape_db",
  });
  await client.connect();

  for (const wp of WPS) {
    const res = await client.query(
      `UPDATE shape_work_packages
       SET title = $2,
           description = $3,
           objectives = $4,
           milestones = $5,
           deliverables = $6,
           progress_percent = $7,
           status = $8,
           is_published = true,
           updated_at = NOW()
       WHERE code = $1
       RETURNING code, left(description, 40) AS preview, progress_percent`,
      [
        wp.code,
        wp.title,
        wp.description,
        wp.objectives,
        wp.milestones,
        wp.deliverables,
        wp.progress_percent,
        wp.status,
      ],
    );
    console.log(res.rows[0] || { code: wp.code, error: "not found" });
  }

  // Page CMS settings
  const settings = [
    ["work_packages_eyebrow", "Delivery architecture"],
    ["work_packages_title", "Work packages"],
    [
      "work_packages_subtitle",
      "Eight coordinated workstreams spanning management, curriculum, platforms, training, quality, dissemination, and sustainability — each led by a consortium partner with clear milestones and deliverables.",
    ],
  ];
  for (const [key, value] of settings) {
    await client.query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, value],
    );
  }
  console.log("Settings upserted");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
