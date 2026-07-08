// ============================================================
// COMPREHENSIVE SEED SCRIPT — Populates every page with real data
// ============================================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── IDs from the existing database ──────────────────────────
const ADMIN_ID       = 'cmraomuy80008i1ykcrpwy9m4';
const INVENTOR_ID    = 'cmraomvae000ai1yk8wnduj69';
const UNIVERSITY_ID  = 'cmraomvlx000ci1ykufeb5alg';
const STARTUP_ID     = 'cmraomvry000ei1yk2690uahm';
const ENTERPRISE_ID  = 'cmraomvy5000gi1ykblxge3b2';
const BROKER_ID      = 'cmraomw3v000ii1ykpbc007xn';

const ORG_UNIV    = 'cmraomtjv0003i1yk932j9vr2';
const ORG_STARTUP = 'cmraomtwc0004i1ykryzv940d';
const ORG_SAMSUNG = 'cmraomu8d0005i1yk3726g1rz';
const ORG_BROKER  = 'cmraomueu0006i1ykplt3o2do';
const ORG_TESLA   = 'cmraomuqe0007i1ykrm72kosf';

const PATENT_BATTERY = 'cmraomw9o000ki1ykmwt1xgee';
const PATENT_CRISPR  = 'cmraomwzs000oi1ykqi8gtoa9';
const PATENT_NEURO   = 'cmraomxbi000si1ykbuqvxx6m';
const PATENT_POLYMER = 'cmraomxth000wi1yk8v10yfr3';
const PATENT_DRONE   = 'cmraomy5t0010i1yktmq4969p';
const PATENT_QUANTUM = 'cmraomyk00014i1yktriqauqa';
const PATENT_GLUCOSE = 'cmraomyvj0018i1ykdm4rei5m';
const PATENT_CARBON  = 'cmraomz73001ci1ykbjs8ghxd';
const PATENT_HAPTIC  = 'cmraomzjf001gi1yk8qc0cdyj';
const PATENT_SOLAR   = 'cmraomzwe001ki1ykenaa2vou';

const DEAL_BATTERY = 'cmraon09b001oi1ykqykux3gx';
const DEAL_NEURO   = 'cmraon1zn001vi1ykkvj4ze77';
const DEAL_GLUCOSE = 'cmraon2zb0022i1ykpybsjqcd';

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');

  // ──────────────────────────────────────────────────────────
  // 1. ADD PARTICIPANTS TO EXISTING DEALS (fixes visibility)
  // ──────────────────────────────────────────────────────────
  console.log('📝 Adding deal participants...');
  await prisma.dealParticipant.createMany({
    data: [
      { dealId: DEAL_BATTERY, userId: ENTERPRISE_ID, role: 'licensee' },
      { dealId: DEAL_BATTERY, userId: BROKER_ID,     role: 'broker' },
      { dealId: DEAL_BATTERY, userId: ADMIN_ID,      role: 'admin' },
      { dealId: DEAL_NEURO,   userId: STARTUP_ID,    role: 'licensee' },
      { dealId: DEAL_NEURO,   userId: ADMIN_ID,      role: 'admin' },
      { dealId: DEAL_GLUCOSE, userId: ENTERPRISE_ID, role: 'licensee' },
      { dealId: DEAL_GLUCOSE, userId: ADMIN_ID,      role: 'admin' },
    ],
    skipDuplicates: true,
  });

  // ──────────────────────────────────────────────────────────
  // 2. MILESTONES for existing deals (no status field in schema)
  // ──────────────────────────────────────────────────────────
  console.log('🏁 Seeding milestones...');
  await prisma.dealMilestone.createMany({
    data: [
      { dealId: DEAL_BATTERY, title: 'NDA Executed', dueDate: new Date('2024-02-15'), completedAt: new Date('2024-02-14'), amount: null },
      { dealId: DEAL_BATTERY, title: 'Term Sheet Signed', dueDate: new Date('2024-03-01'), completedAt: new Date('2024-02-28'), amount: null },
      { dealId: DEAL_BATTERY, title: 'Due Diligence Complete', dueDate: new Date('2024-04-30'), completedAt: new Date('2024-04-25'), amount: null },
      { dealId: DEAL_BATTERY, title: 'License Agreement Signed', dueDate: new Date('2024-06-15'), completedAt: new Date('2024-06-12'), amount: 2500000 },
      { dealId: DEAL_BATTERY, title: 'First Royalty Payment Q1', dueDate: new Date('2024-09-30'), amount: 350000 },
      { dealId: DEAL_BATTERY, title: 'Product Commercialization', dueDate: new Date('2025-01-01'), amount: 1000000 },

      { dealId: DEAL_NEURO, title: 'Evaluation Agreement', dueDate: new Date('2024-03-10'), completedAt: new Date('2024-03-08'), amount: null },
      { dealId: DEAL_NEURO, title: 'Technical Review', dueDate: new Date('2024-04-20'), completedAt: new Date('2024-04-18'), amount: null },
      { dealId: DEAL_NEURO, title: 'Pilot License Grant', dueDate: new Date('2024-06-30'), amount: 800000 },

      { dealId: DEAL_GLUCOSE, title: 'Letter of Intent', dueDate: new Date('2024-01-20'), completedAt: new Date('2024-01-19'), amount: null },
      { dealId: DEAL_GLUCOSE, title: 'IP Transfer Initiated', dueDate: new Date('2024-03-15'), completedAt: new Date('2024-03-14'), amount: 500000 },
      { dealId: DEAL_GLUCOSE, title: 'Regulatory Filing Support', dueDate: new Date('2024-07-01'), amount: 200000 },
    ],
    skipDuplicates: true,
  });

  // ──────────────────────────────────────────────────────────
  // 3. NEW DEALS (CRISPR, Quantum, Solar)
  // ──────────────────────────────────────────────────────────
  console.log('🤝 Seeding new deals...');

  const deal4 = await prisma.deal.create({
    data: {
      title: 'CRISPR Agricultural Licensing',
      type: 'NON_EXCLUSIVE_LICENSE',
      status: 'NEGOTIATING',
      companyId: ORG_STARTUP,
      territory: ['India', 'Southeast Asia', 'Africa'],
      upfrontFee: 750000,
      royaltyRate: 4.5,
      duration: 7,
      participants: {
        create: [
          { userId: INVENTOR_ID,   role: 'lead_inventor' },
          { userId: STARTUP_ID,    role: 'licensee' },
          { userId: BROKER_ID,     role: 'broker' },
          { userId: ADMIN_ID,      role: 'admin' },
        ],
      },
      patents: { create: [{ patentId: PATENT_CRISPR }] },
    },
  });

  const deal5 = await prisma.deal.create({
    data: {
      title: 'Quantum Encryption Co-Development',
      type: 'JOINT_VENTURE',
      status: 'NDA_SIGNED',
      companyId: ORG_SAMSUNG,
      territory: ['Global'],
      upfrontFee: 1200000,
      royaltyRate: 6.0,
      duration: 10,
      participants: {
        create: [
          { userId: INVENTOR_ID,   role: 'lead_inventor' },
          { userId: ENTERPRISE_ID, role: 'licensee' },
          { userId: ADMIN_ID,      role: 'admin' },
        ],
      },
      patents: { create: [{ patentId: PATENT_QUANTUM }] },
    },
  });

  const deal6 = await prisma.deal.create({
    data: {
      title: 'Solar Cell Technology Transfer',
      type: 'ASSIGNMENT',
      status: 'TERM_SHEET',
      companyId: ORG_TESLA,
      territory: ['USA', 'Europe', 'Australia'],
      upfrontFee: 5000000,
      royaltyRate: 2.5,
      duration: 15,
      participants: {
        create: [
          { userId: UNIVERSITY_ID, role: 'licensor' },
          { userId: ENTERPRISE_ID, role: 'licensee' },
          { userId: BROKER_ID,     role: 'broker' },
          { userId: ADMIN_ID,      role: 'admin' },
        ],
      },
      patents: { create: [{ patentId: PATENT_SOLAR }] },
    },
  });

  const deal7 = await prisma.deal.create({
    data: {
      title: 'Drone Swarm AgriTech License',
      type: 'EXCLUSIVE_LICENSE',
      status: 'INQUIRY',
      companyId: ORG_STARTUP,
      territory: ['India'],
      upfrontFee: 400000,
      royaltyRate: 3.5,
      duration: 5,
      participants: {
        create: [
          { userId: INVENTOR_ID, role: 'lead_inventor' },
          { userId: STARTUP_ID,  role: 'licensee' },
          { userId: ADMIN_ID,    role: 'admin' },
        ],
      },
      patents: { create: [{ patentId: PATENT_DRONE }] },
    },
  });

  await prisma.dealMilestone.createMany({
    data: [
      { dealId: deal4.id, title: 'LOI Signed', dueDate: new Date('2024-05-10'), completedAt: new Date('2024-05-09'), amount: null },
      { dealId: deal4.id, title: 'IP Valuation Report', dueDate: new Date('2024-06-01'), completedAt: new Date('2024-05-30'), amount: null },
      { dealId: deal4.id, title: 'License Negotiation', dueDate: new Date('2024-08-15'), amount: null },
      { dealId: deal4.id, title: 'Final Agreement & Payment', dueDate: new Date('2024-10-01'), amount: 750000 },

      { dealId: deal5.id, title: 'NDA Executed', dueDate: new Date('2024-06-20'), completedAt: new Date('2024-06-19'), amount: null },
      { dealId: deal5.id, title: 'Technical Specification Review', dueDate: new Date('2024-08-01'), amount: null },
      { dealId: deal5.id, title: 'Co-Dev Agreement', dueDate: new Date('2024-10-15'), amount: 1200000 },

      { dealId: deal6.id, title: 'Term Sheet Exchanged', dueDate: new Date('2024-07-01'), completedAt: new Date('2024-06-30'), amount: null },
      { dealId: deal6.id, title: 'Patent Audit', dueDate: new Date('2024-08-15'), amount: null },
      { dealId: deal6.id, title: 'Transfer Agreement Signed', dueDate: new Date('2024-10-30'), amount: 5000000 },
    ],
  });

  console.log('  ✅ Deals & milestones done');

  // ──────────────────────────────────────────────────────────
  // 4. MESSAGES for all deals
  // ──────────────────────────────────────────────────────────
  console.log('💬 Seeding messages...');

  const msgs = [
    { dealId: DEAL_BATTERY, senderId: INVENTOR_ID,   content: 'Hi Samsung team, excited to kick off this battery licensing deal. Our lab has the prototype cells ready for demonstration. When can we schedule a visit?' },
    { dealId: DEAL_BATTERY, senderId: ENTERPRISE_ID, content: 'Great to connect! We have reviewed the specification — 340 Wh/kg at TRL 8 is exactly what our EV division needs. Can we do next Wednesday?' },
    { dealId: DEAL_BATTERY, senderId: INVENTOR_ID,   content: 'Wednesday works perfectly. I will prepare the full charge-cycle demo and bring the latest performance data from our 1000-cycle endurance test.' },
    { dealId: DEAL_BATTERY, senderId: BROKER_ID,     content: 'Robert from Global IP Exchange here. I have completed the comparative valuation — this IP sits at $8M–$14M based on EV market forecasts. Happy to walk through the report.' },
    { dealId: DEAL_BATTERY, senderId: ENTERPRISE_ID, content: 'The demo was outstanding. We are proceeding with $2.5M upfront + 5.5% royalty. Please send the draft license agreement for our legal team.' },
    { dealId: DEAL_BATTERY, senderId: INVENTOR_ID,   content: 'Draft attached. Please pay attention to Clause 7 (sublicensing) and Clause 12 (territory expansion). We have flagged China market exclusion in the appendix.' },
    { dealId: DEAL_BATTERY, senderId: BROKER_ID,     content: '✅ Both parties have signed. Deal is now ACTIVE. Congratulations! First royalty statement due September 30, 2024.' },

    { dealId: DEAL_NEURO, senderId: UNIVERSITY_ID, content: 'James Doe from Stanford. We are pleased to offer an evaluation license for our Neuromorphic Chip to BioGenesis. The chip delivers 100x power savings over conventional AI accelerators.' },
    { dealId: DEAL_NEURO, senderId: STARTUP_ID,    content: 'Alice Chen here. This is exactly what we need for our edge AI product line! Can we get the evaluation kit to run benchmarks?' },
    { dealId: DEAL_NEURO, senderId: UNIVERSITY_ID, content: 'Evaluation kit ships Friday. Includes 4 prototype chips, the full SDK, and API documentation. We will also schedule a 2-hour onboarding call.' },
    { dealId: DEAL_NEURO, senderId: STARTUP_ID,    content: 'Kit received, benchmarks running. Initial results show 94x power improvement in our inference workloads. We are definitely interested in the commercial license.' },
    { dealId: DEAL_NEURO, senderId: UNIVERSITY_ID, content: 'Excellent! Our TTO office will send the formal commercial license proposal — $800K upfront + 4% royalty on chip-based revenue. Looking forward to moving forward.' },

    { dealId: DEAL_GLUCOSE, senderId: ENTERPRISE_ID, content: 'Tesla Medtech here. We are evaluating your non-invasive glucose monitor for our Tesla Health wearable platform. The FDA Breakthrough Device designation is impressive.' },
    { dealId: DEAL_GLUCOSE, senderId: INVENTOR_ID,   content: 'Dr. Sarah Connor. Thank you for reaching out! Our device achieves ±5% accuracy over 72-hour continuous use — the best in class. Clinical data from 3 studies is attached.' },
    { dealId: DEAL_GLUCOSE, senderId: ENTERPRISE_ID, content: 'Clinical data is compelling. We want to acquire the full patent portfolio. Our offer: $8.5M full acquisition.' },
    { dealId: DEAL_GLUCOSE, senderId: INVENTOR_ID,   content: 'We prefer a hybrid model to retain research rights. Counter-offer: $6M upfront acquisition + 3% on device revenue, with Stanford retaining research publication rights.' },
    { dealId: DEAL_GLUCOSE, senderId: ENTERPRISE_ID, content: 'Counter-offer accepted. Legal team is drafting the acquisition agreement with research rights carve-out. Expected close: 30 days.' },

    { dealId: deal4.id, senderId: INVENTOR_ID,   content: 'Our CRISPR-Cas9 variant shows 40% higher editing efficiency in drought-resistant crops vs. standard Cas9. We have field trial data from 3 seasons across 5 crop types.' },
    { dealId: deal4.id, senderId: STARTUP_ID,    content: 'Alice Chen here — this is exactly what our AgriTech division needs. Can you share the list of countries where the PCT is in force?' },
    { dealId: deal4.id, senderId: INVENTOR_ID,   content: 'PCT is active in India, USA, EU, Brazil, Australia, Japan, China, and 4 more. Full list attached. Also sharing our 3 Nature publications and 2 Science papers on the technology.' },
    { dealId: deal4.id, senderId: BROKER_ID,     content: 'Valuation report complete. SE Asia addressable market for drought-resistant crop IP is $2.3B by 2030. The proposed $750K licensing fee is very attractive for both sides.' },
    { dealId: deal4.id, senderId: STARTUP_ID,    content: 'We agree on the terms. Sending our formal counter-proposal today — we would like to discuss minimum performance guarantees in the agreement.' },

    { dealId: deal5.id, senderId: INVENTOR_ID,   content: 'Our QKD repeater solves the 100km distance barrier for quantum networks — a major breakthrough for securing 6G infrastructure. Happy to present the technical details.' },
    { dealId: deal5.id, senderId: ENTERPRISE_ID, content: 'Samsung Quantum Division here. We have been searching for exactly this technology. NDA signed. Please share the full technical specification.' },
    { dealId: deal5.id, senderId: INVENTOR_ID,   content: 'Spec shared via secure channel. Key metrics: 10^-12 QBER, 1 Gbps key rate, compatible with existing fiber networks. US patent granted, EU pending.' },
    { dealId: deal5.id, senderId: ENTERPRISE_ID, content: 'Technical review complete. Our team is very impressed. Proposing a co-development agreement to productize this for our 6G network security product line.' },

    { dealId: deal6.id, senderId: UNIVERSITY_ID, content: 'Stanford Innovation Lab is offering technology transfer of our 32.1% efficiency perovskite solar cell — highest certified efficiency in the world. Interested in Tesla Energy partnership?' },
    { dealId: deal6.id, senderId: ENTERPRISE_ID, content: 'This is exactly what Tesla Energy needs. The 25-year stability projection addresses our primary concern with perovskite. Can you share the degradation test data?' },
    { dealId: deal6.id, senderId: BROKER_ID,     content: 'Global IP Exchange valuation: $5M transfer price is very competitive given 18-country patent portfolio breadth and current licensing revenue of $800K/year.' },
    { dealId: deal6.id, senderId: UNIVERSITY_ID, content: 'Degradation data shared. Stanford TTO insists on research publication rights being retained — this is a non-negotiable policy. All other terms are flexible.' },
    { dealId: deal6.id, senderId: ENTERPRISE_ID, content: 'We accept the research rights carve-out. Term sheet sent — please review and confirm by October 15 so we can target a close by October 30.' },

    { dealId: deal7.id, senderId: INVENTOR_ID, content: 'Our swarm intelligence navigation system enables 50+ drones to coordinate autonomously for precision farming — covering 200 acres/hour with 95% coverage accuracy.' },
    { dealId: deal7.id, senderId: STARTUP_ID,  content: 'BioGenesis AgriTech division here — very interested. What are the weather operating limits and battery life per mission?' },
    { dealId: deal7.id, senderId: INVENTOR_ID, content: 'Operates in wind up to 45 km/h, light rain. 90-minute mission time, 30-minute recharge. The swarm algorithm is the key IP — drone hardware is off-the-shelf.' },
  ];

  for (const m of msgs) {
    await prisma.message.create({ data: { dealId: m.dealId, senderId: m.senderId, content: m.content, type: 'TEXT' } });
  }
  console.log('  ✅ Messages done');

  // ──────────────────────────────────────────────────────────
  // 5. ROYALTIES
  // ──────────────────────────────────────────────────────────
  console.log('💰 Seeding royalties...');
  await prisma.royalty.createMany({
    data: [
      { dealId: DEAL_BATTERY, patentId: PATENT_BATTERY, period: 'Q4 2023', amount: 275000, currency: 'USD', status: 'PAID',    dueDate: new Date('2024-01-15'), paidAt: new Date('2024-01-13') },
      { dealId: DEAL_BATTERY, patentId: PATENT_BATTERY, period: 'Q1 2024', amount: 320000, currency: 'USD', status: 'PAID',    dueDate: new Date('2024-04-15'), paidAt: new Date('2024-04-12') },
      { dealId: DEAL_BATTERY, patentId: PATENT_BATTERY, period: 'Q2 2024', amount: 415000, currency: 'USD', status: 'PAID',    dueDate: new Date('2024-07-15'), paidAt: new Date('2024-07-10') },
      { dealId: DEAL_BATTERY, patentId: PATENT_BATTERY, period: 'Q3 2024', amount: 380000, currency: 'USD', status: 'PENDING', dueDate: new Date('2024-10-15') },

      { dealId: DEAL_NEURO, patentId: PATENT_NEURO, period: 'Milestone 1', amount: 200000, currency: 'USD', status: 'PAID',    dueDate: new Date('2024-03-01'), paidAt: new Date('2024-02-28') },
      { dealId: DEAL_NEURO, patentId: PATENT_NEURO, period: 'Milestone 2', amount: 300000, currency: 'USD', status: 'PENDING', dueDate: new Date('2024-09-01') },

      { dealId: DEAL_GLUCOSE, patentId: PATENT_GLUCOSE, period: 'Upfront Acquisition', amount: 3000000, currency: 'USD', status: 'PAID',    dueDate: new Date('2024-02-01'), paidAt: new Date('2024-01-30') },
      { dealId: DEAL_GLUCOSE, patentId: PATENT_GLUCOSE, period: 'Q1 2024 Royalty',    amount: 185000,   currency: 'USD', status: 'PAID',    dueDate: new Date('2024-04-30'), paidAt: new Date('2024-04-28') },
      { dealId: DEAL_GLUCOSE, patentId: PATENT_GLUCOSE, period: 'Q2 2024 Royalty',    amount: 210000,   currency: 'USD', status: 'OVERDUE', dueDate: new Date('2024-07-31') },

      { dealId: deal6.id, patentId: PATENT_SOLAR, period: 'Term Sheet Deposit', amount: 500000, currency: 'USD', status: 'PAID', dueDate: new Date('2024-07-15'), paidAt: new Date('2024-07-12') },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ Royalties done');

  // ──────────────────────────────────────────────────────────
  // 6. AI MATCH RESULTS
  // ──────────────────────────────────────────────────────────
  console.log('🤖 Seeding AI match results...');

  const matchReqs = [
    { id: 'mr-samsung-battery', orgId: ORG_SAMSUNG, domains: ['ENERGY', 'ELECTRONICS'], keywords: ['battery', 'solid-state', 'EV', 'lithium'], budget: 15000000, notes: 'EV battery tech' },
    { id: 'mr-tesla-solar',     orgId: ORG_TESLA,   domains: ['CLEANTECH', 'ENERGY'],   keywords: ['solar', 'perovskite', 'photovoltaic'],      budget: 10000000, notes: 'Solar cell tech' },
    { id: 'mr-bio-crispr',      orgId: ORG_STARTUP, domains: ['BIOTECH', 'AGRICULTURE'],keywords: ['CRISPR', 'gene editing', 'drought'],         budget: 5000000,  notes: 'AgriTech IP' },
    { id: 'mr-samsung-quantum', orgId: ORG_SAMSUNG, domains: ['SEMICONDUCTOR', 'ICT'],  keywords: ['quantum', 'encryption', 'QKD', '6G'],        budget: 20000000, notes: '6G security' },
    { id: 'mr-tesla-glucose',   orgId: ORG_TESLA,   domains: ['MEDTECH', 'SENSORS'],    keywords: ['glucose', 'wearable', 'non-invasive'],       budget: 12000000, notes: 'Health wearable' },
    { id: 'mr-bio-drone',       orgId: ORG_STARTUP, domains: ['ROBOTICS', 'AI'],        keywords: ['drone', 'swarm', 'autonomous', 'farming'],   budget: 3000000,  notes: 'AgriTech drones' },
  ];

  for (const mr of matchReqs) {
    await prisma.matchRequest.upsert({
      where: { id: mr.id },
      update: {},
      create: { id: mr.id, organizationId: mr.orgId, domains: mr.domains, keywords: mr.keywords, maxBudget: mr.budget, notes: mr.notes },
    });
  }

  await prisma.matchResult.createMany({
    data: [
      { matchRequestId: 'mr-samsung-battery', patentId: PATENT_BATTERY, matchScore: 96, dealProbability: 82, estimatedRevenue: 8500000, reasons: ['Direct EV battery domain fit', 'TRL 8 production ready', 'Exclusive EV rights available'], risks: ['China market exclusion needed', 'Existing licensee in EU'], status: 'CONTACTED' },
      { matchRequestId: 'mr-samsung-battery', patentId: PATENT_SOLAR,   matchScore: 62, dealProbability: 30, estimatedRevenue: 1200000, reasons: ['Energy domain adjacency'], risks: ['Different technology focus'], status: 'NEW' },
      { matchRequestId: 'mr-tesla-solar',     patentId: PATENT_SOLAR,   matchScore: 98, dealProbability: 88, estimatedRevenue: 12000000, reasons: ['World-leading 32.1% efficiency', '25-year stability proof', 'Stanford provenance'], risks: ['Scale-up risk', 'Lead content regulations'], status: 'CONTACTED' },
      { matchRequestId: 'mr-tesla-solar',     patentId: PATENT_CARBON,  matchScore: 65, dealProbability: 35, estimatedRevenue: 1500000,  reasons: ['Cleantech ESG alignment'], risks: ['Not primary need'], status: 'NEW' },
      { matchRequestId: 'mr-bio-crispr',      patentId: PATENT_CRISPR,  matchScore: 94, dealProbability: 78, estimatedRevenue: 3200000,  reasons: ['Exact domain match', 'CRISPR expertise alignment', 'SE Asia market fit'], risks: ['Bio-safety compliance cost', 'Regulatory timelines'], status: 'CONTACTED' },
      { matchRequestId: 'mr-bio-crispr',      patentId: PATENT_POLYMER, matchScore: 70, dealProbability: 45, estimatedRevenue: 900000,   reasons: ['Agricultural supply chain fit'], risks: ['Not core technology'], status: 'NEW' },
      { matchRequestId: 'mr-samsung-quantum', patentId: PATENT_QUANTUM, matchScore: 93, dealProbability: 76, estimatedRevenue: 9800000,  reasons: ['Solves 100km QKD barrier', 'Applicable to 6G security', 'World-class research'], risks: ['Export control regulations', 'Long co-dev timeline'], status: 'CONTACTED' },
      { matchRequestId: 'mr-samsung-quantum', patentId: PATENT_NEURO,   matchScore: 81, dealProbability: 62, estimatedRevenue: 4500000,  reasons: ['Edge AI for 6G endpoints'], risks: ['Different primary domain'], status: 'NEW' },
      { matchRequestId: 'mr-tesla-glucose',   patentId: PATENT_GLUCOSE, matchScore: 97, dealProbability: 91, estimatedRevenue: 11500000, reasons: ['FDA Breakthrough Device', 'Best-in-class accuracy', 'Perfect Tesla Health fit'], risks: ['FDA clearance timeline', 'Sensor manufacturing complexity'], status: 'CONTACTED' },
      { matchRequestId: 'mr-tesla-glucose',   patentId: PATENT_HAPTIC,  matchScore: 72, dealProbability: 50, estimatedRevenue: 2000000,  reasons: ['Wearable UX enhancement'], risks: ['Secondary use case'], status: 'NEW' },
      { matchRequestId: 'mr-bio-drone',       patentId: PATENT_DRONE,   matchScore: 89, dealProbability: 71, estimatedRevenue: 2800000,  reasons: ['Swarm AI for precision farming', 'Low power field deployments', 'Compatible AI stack'], risks: ['Agricultural weather conditions', 'DGCA approvals needed'], status: 'CONTACTED' },
      { matchRequestId: 'mr-bio-drone',       patentId: PATENT_BATTERY, matchScore: 68, dealProbability: 40, estimatedRevenue: 600000,   reasons: ['Battery tech for drone endurance'], risks: ['Not primary use case'], status: 'NEW' },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ Match results done');

  // ──────────────────────────────────────────────────────────
  // 7. PATENT DOCUMENTS
  // ──────────────────────────────────────────────────────────
  console.log('📄 Seeding patent documents...');
  await prisma.patentDocument.createMany({
    data: [
      { patentId: PATENT_BATTERY, name: 'Full Patent Specification',      type: 'pdf', url: '/docs/battery-spec.pdf',      size: 3450000, isPublic: true },
      { patentId: PATENT_BATTERY, name: 'Claims Document',                 type: 'pdf', url: '/docs/battery-claims.pdf',    size: 890000,  isPublic: true },
      { patentId: PATENT_BATTERY, name: 'Technology Overview Brochure',   type: 'pdf', url: '/docs/battery-brochure.pdf',  size: 2100000, isPublic: true },
      { patentId: PATENT_GLUCOSE, name: 'Clinical Study Data',            type: 'pdf', url: '/docs/glucose-clinical.pdf',  size: 5800000, isPublic: false },
      { patentId: PATENT_GLUCOSE, name: 'FDA Breakthrough Device Letter', type: 'pdf', url: '/docs/fda-letter.pdf',        size: 450000,  isPublic: false },
      { patentId: PATENT_SOLAR,   name: 'Efficiency Test Report',         type: 'pdf', url: '/docs/solar-test.pdf',        size: 2900000, isPublic: true },
      { patentId: PATENT_QUANTUM, name: 'Technical Whitepaper',           type: 'pdf', url: '/docs/quantum-whitepaper.pdf',size: 1750000, isPublic: true },
      { patentId: PATENT_CRISPR,  name: 'Nature Publication Reprint',     type: 'pdf', url: '/docs/crispr-nature.pdf',     size: 980000,  isPublic: true },
      { patentId: PATENT_NEURO,   name: 'Chip Architecture Specification',type: 'pdf', url: '/docs/neuro-spec.pdf',        size: 2200000, isPublic: true },
      { patentId: PATENT_DRONE,   name: 'Swarm Algorithm Technical Paper',type: 'pdf', url: '/docs/drone-algo.pdf',        size: 1400000, isPublic: true },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ Documents done');

  // ──────────────────────────────────────────────────────────
  // 8. SAVED PATENTS (wishlist/marketplace page)
  // ──────────────────────────────────────────────────────────
  console.log('⭐ Seeding saved patents...');
  await prisma.savedPatent.createMany({
    data: [
      { userId: STARTUP_ID,    patentId: PATENT_BATTERY },
      { userId: STARTUP_ID,    patentId: PATENT_SOLAR },
      { userId: STARTUP_ID,    patentId: PATENT_DRONE },
      { userId: STARTUP_ID,    patentId: PATENT_CRISPR },
      { userId: ENTERPRISE_ID, patentId: PATENT_GLUCOSE },
      { userId: ENTERPRISE_ID, patentId: PATENT_QUANTUM },
      { userId: ENTERPRISE_ID, patentId: PATENT_NEURO },
      { userId: ENTERPRISE_ID, patentId: PATENT_SOLAR },
      { userId: BROKER_ID,     patentId: PATENT_CRISPR },
      { userId: BROKER_ID,     patentId: PATENT_CARBON },
      { userId: BROKER_ID,     patentId: PATENT_BATTERY },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ Saved patents done');

  // ──────────────────────────────────────────────────────────
  // 9. AUDIT LOGS (admin activity page)
  // ──────────────────────────────────────────────────────────
  console.log('📋 Seeding audit logs...');
  await prisma.auditLog.createMany({
    data: [
      { userId: INVENTOR_ID,    action: 'CREATE_PATENT',   entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: ADMIN_ID,       action: 'APPROVE_LISTING', entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: ENTERPRISE_ID,  action: 'VIEW_PATENT',     entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: ENTERPRISE_ID,  action: 'CREATE_DEAL',     entity: 'Deal',   entityId: DEAL_BATTERY },
      { userId: BROKER_ID,      action: 'CREATE_DEAL',     entity: 'Deal',   entityId: deal4.id },
      { userId: INVENTOR_ID,    action: 'CREATE_PATENT',   entity: 'Patent', entityId: PATENT_SOLAR },
      { userId: ADMIN_ID,       action: 'APPROVE_LISTING', entity: 'Patent', entityId: PATENT_SOLAR },
      { userId: UNIVERSITY_ID,  action: 'UPDATE_PATENT',   entity: 'Patent', entityId: PATENT_NEURO },
      { userId: STARTUP_ID,     action: 'VIEW_PATENT',     entity: 'Patent', entityId: PATENT_CRISPR },
      { userId: STARTUP_ID,     action: 'SAVE_PATENT',     entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: ENTERPRISE_ID,  action: 'SAVE_PATENT',     entity: 'Patent', entityId: PATENT_GLUCOSE },
      { userId: ADMIN_ID,       action: 'VIEW_USER',       entity: 'User',   entityId: STARTUP_ID },
      { userId: ADMIN_ID,       action: 'APPROVE_USER',    entity: 'User',   entityId: ENTERPRISE_ID },
      { userId: INVENTOR_ID,    action: 'UPDATE_PATENT',   entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: ADMIN_ID,       action: 'CREATE_DEAL',     entity: 'Deal',   entityId: deal5.id },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ Audit logs done');

  // ── FINAL COUNTS ────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.deal.count(),
    prisma.message.count(),
    prisma.royalty.count(),
    prisma.matchResult.count(),
    prisma.dealMilestone.count(),
    prisma.patentDocument.count(),
    prisma.savedPatent.count(),
    prisma.auditLog.count(),
  ]);

  console.log('\n✅ SEED COMPLETE!');
  console.log(`  Deals: ${counts[0]} | Messages: ${counts[1]} | Royalties: ${counts[2]}`);
  console.log(`  Matches: ${counts[3]} | Milestones: ${counts[4]} | Documents: ${counts[5]}`);
  console.log(`  Saved Patents: ${counts[6]} | Audit Logs: ${counts[7]}`);
}

main().catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
