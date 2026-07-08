// ============================================================
// SEED PART 2 — Match Results, Documents, Saved Patents, Audit Logs
// Deals/Messages/Royalties already inserted in Part 1
// ============================================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ADMIN_ID      = 'cmraomuy80008i1ykcrpwy9m4';
const INVENTOR_ID   = 'cmraomvae000ai1yk8wnduj69';
const UNIVERSITY_ID = 'cmraomvlx000ci1ykufeb5alg';
const STARTUP_ID    = 'cmraomvry000ei1yk2690uahm';
const ENTERPRISE_ID = 'cmraomvy5000gi1ykblxge3b2';
const BROKER_ID     = 'cmraomw3v000ii1ykpbc007xn';

const ORG_STARTUP = 'cmraomtwc0004i1ykryzv940d';
const ORG_SAMSUNG = 'cmraomu8d0005i1yk3726g1rz';
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

async function main() {
  console.log('🌱 Seeding remaining data...\n');

  // ── AI MATCH RESULTS ──────────────────────────────────────
  console.log('🤖 Seeding AI match results...');

  // Delete old failed match requests if any
  await prisma.matchResult.deleteMany({ where: { matchRequestId: { in: ['mr-samsung-battery','mr-tesla-solar','mr-bio-crispr','mr-samsung-quantum','mr-tesla-glucose','mr-bio-drone'] } } }).catch(() => {});
  await prisma.matchRequest.deleteMany({ where: { id: { in: ['mr-samsung-battery','mr-tesla-solar','mr-bio-crispr','mr-samsung-quantum','mr-tesla-glucose','mr-bio-drone'] } } }).catch(() => {});

  const mr1 = await prisma.matchRequest.create({ data: { id: 'mr-samsung-battery', organizationId: ORG_SAMSUNG, domains: ['ENERGY', 'SEMICONDUCTOR'], keywords: ['battery', 'solid-state', 'EV'], minTrl: 5, maxBudget: 15000000, notes: 'EV battery tech for automotive division' } });
  const mr2 = await prisma.matchRequest.create({ data: { id: 'mr-tesla-solar',     organizationId: ORG_TESLA,   domains: ['ENERGY', 'CLEAN_TECH'],   keywords: ['solar', 'perovskite', 'photovoltaic'], minTrl: 6, maxBudget: 10000000, notes: 'Solar cell tech for energy division' } });
  const mr3 = await prisma.matchRequest.create({ data: { id: 'mr-bio-crispr',      organizationId: ORG_STARTUP, domains: ['BIOTECH', 'AGRICULTURE'],  keywords: ['CRISPR', 'gene editing', 'drought'], minTrl: 4, maxBudget: 5000000,  notes: 'Agricultural biotech innovations' } });
  const mr4 = await prisma.matchRequest.create({ data: { id: 'mr-samsung-quantum', organizationId: ORG_SAMSUNG, domains: ['SEMICONDUCTOR', 'IT_SOFTWARE'], keywords: ['quantum', 'encryption', 'QKD'], minTrl: 5, maxBudget: 20000000, notes: '6G network security' } });
  const mr5 = await prisma.matchRequest.create({ data: { id: 'mr-tesla-glucose',   organizationId: ORG_TESLA,   domains: ['HEALTHCARE'],             keywords: ['glucose', 'wearable', 'non-invasive'], minTrl: 7, maxBudget: 12000000, notes: 'Health wearable sensors' } });
  const mr6 = await prisma.matchRequest.create({ data: { id: 'mr-bio-drone',       organizationId: ORG_STARTUP, domains: ['AI_ML', 'AGRICULTURE'],    keywords: ['drone', 'swarm', 'autonomous', 'farming'], minTrl: 4, maxBudget: 3000000, notes: 'AgriTech precision drones' } });

  await prisma.matchResult.createMany({
    data: [
      { matchRequestId: mr1.id, patentId: PATENT_BATTERY, matchScore: 96, dealProbability: 82, estimatedRevenue: 8500000, reasons: ['Direct EV battery domain fit', 'TRL 8 production ready', 'Exclusive EV rights available'], risks: ['China market exclusion needed', 'Existing EU licensee'], status: 'CONTACTED' },
      { matchRequestId: mr1.id, patentId: PATENT_SOLAR,   matchScore: 62, dealProbability: 30, estimatedRevenue: 1200000, reasons: ['Energy domain adjacency'], risks: ['Different technology focus'], status: 'NEW' },
      { matchRequestId: mr2.id, patentId: PATENT_SOLAR,   matchScore: 98, dealProbability: 88, estimatedRevenue: 12000000, reasons: ['World-leading 32.1% efficiency', '25-year stability proof', 'Stanford research prestige'], risks: ['Scale-up risk', 'Lead content regulations'], status: 'CONTACTED' },
      { matchRequestId: mr2.id, patentId: PATENT_CARBON,  matchScore: 65, dealProbability: 35, estimatedRevenue: 1500000,  reasons: ['Cleantech ESG alignment'], risks: ['Not primary product need'], status: 'NEW' },
      { matchRequestId: mr3.id, patentId: PATENT_CRISPR,  matchScore: 94, dealProbability: 78, estimatedRevenue: 3200000,  reasons: ['Exact agricultural biotech match', 'CRISPR expertise in-house', 'SE Asia market fit'], risks: ['Bio-safety compliance', 'Regulatory timelines'], status: 'CONTACTED' },
      { matchRequestId: mr3.id, patentId: PATENT_POLYMER, matchScore: 70, dealProbability: 45, estimatedRevenue: 900000,   reasons: ['Agri supply chain packaging fit'], risks: ['Not core technology need'], status: 'NEW' },
      { matchRequestId: mr4.id, patentId: PATENT_QUANTUM, matchScore: 93, dealProbability: 76, estimatedRevenue: 9800000,  reasons: ['Solves 100km QKD barrier', 'Applicable to 6G security infrastructure', 'World-class research team'], risks: ['Export control regulations', 'Long co-dev timeline'], status: 'CONTACTED' },
      { matchRequestId: mr4.id, patentId: PATENT_NEURO,   matchScore: 81, dealProbability: 62, estimatedRevenue: 4500000,  reasons: ['Neuromorphic chip enhances 6G edge AI'], risks: ['Different primary domain'], status: 'NEW' },
      { matchRequestId: mr5.id, patentId: PATENT_GLUCOSE, matchScore: 97, dealProbability: 91, estimatedRevenue: 11500000, reasons: ['FDA Breakthrough Device designation', 'Best-in-class ±5% accuracy', 'Ideal for Tesla Health wearable'], risks: ['FDA clearance timeline', 'Manufacturing complexity'], status: 'CONTACTED' },
      { matchRequestId: mr5.id, patentId: PATENT_HAPTIC,  matchScore: 72, dealProbability: 50, estimatedRevenue: 2000000,  reasons: ['Haptic UX adds value to health wearable'], risks: ['Secondary use case only'], status: 'NEW' },
      { matchRequestId: mr6.id, patentId: PATENT_DRONE,   matchScore: 89, dealProbability: 71, estimatedRevenue: 2800000,  reasons: ['Swarm AI for precision farming', 'Low power suits field conditions', 'Compatible with BioGenesis AI stack'], risks: ['Agricultural weather conditions', 'DGCA regulatory approval'], status: 'CONTACTED' },
      { matchRequestId: mr6.id, patentId: PATENT_BATTERY, matchScore: 68, dealProbability: 40, estimatedRevenue: 600000,   reasons: ['Battery endurance for drone missions'], risks: ['Not core IP need'], status: 'NEW' },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ Match results done');

  // ── PATENT DOCUMENTS ──────────────────────────────────────
  console.log('📄 Seeding patent documents...');
  await prisma.patentDocument.createMany({
    data: [
      { patentId: PATENT_BATTERY, name: 'Full Patent Specification',       type: 'pdf', url: '/docs/battery-spec.pdf',       size: 3450000, isPublic: true },
      { patentId: PATENT_BATTERY, name: 'Claims Document',                  type: 'pdf', url: '/docs/battery-claims.pdf',     size: 890000,  isPublic: true },
      { patentId: PATENT_BATTERY, name: 'Technology Overview Brochure',    type: 'pdf', url: '/docs/battery-brochure.pdf',   size: 2100000, isPublic: true },
      { patentId: PATENT_GLUCOSE, name: 'Clinical Study Data (3 Studies)', type: 'pdf', url: '/docs/glucose-clinical.pdf',   size: 5800000, isPublic: false },
      { patentId: PATENT_GLUCOSE, name: 'FDA Breakthrough Device Letter',  type: 'pdf', url: '/docs/fda-letter.pdf',         size: 450000,  isPublic: false },
      { patentId: PATENT_SOLAR,   name: 'Efficiency Test Report',          type: 'pdf', url: '/docs/solar-test.pdf',         size: 2900000, isPublic: true },
      { patentId: PATENT_QUANTUM, name: 'Technical Whitepaper',            type: 'pdf', url: '/docs/quantum-whitepaper.pdf', size: 1750000, isPublic: true },
      { patentId: PATENT_CRISPR,  name: 'Nature Publication Reprint',      type: 'pdf', url: '/docs/crispr-nature.pdf',      size: 980000,  isPublic: true },
      { patentId: PATENT_NEURO,   name: 'Chip Architecture Specification', type: 'pdf', url: '/docs/neuro-spec.pdf',         size: 2200000, isPublic: true },
      { patentId: PATENT_DRONE,   name: 'Swarm Algorithm Technical Paper', type: 'pdf', url: '/docs/drone-algo.pdf',         size: 1400000, isPublic: true },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ Documents done');

  // ── SAVED PATENTS ─────────────────────────────────────────
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

  // ── AUDIT LOGS ────────────────────────────────────────────
  console.log('📋 Seeding audit logs...');
  await prisma.auditLog.createMany({
    data: [
      { userId: INVENTOR_ID,   action: 'CREATE_PATENT',   entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: ADMIN_ID,      action: 'APPROVE_LISTING', entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: ENTERPRISE_ID, action: 'VIEW_PATENT',     entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: ENTERPRISE_ID, action: 'CREATE_DEAL',     entity: 'Deal',   entityId: 'DEAL_BATTERY' },
      { userId: INVENTOR_ID,   action: 'CREATE_PATENT',   entity: 'Patent', entityId: PATENT_SOLAR },
      { userId: ADMIN_ID,      action: 'APPROVE_LISTING', entity: 'Patent', entityId: PATENT_SOLAR },
      { userId: UNIVERSITY_ID, action: 'UPDATE_PATENT',   entity: 'Patent', entityId: PATENT_NEURO },
      { userId: STARTUP_ID,    action: 'VIEW_PATENT',     entity: 'Patent', entityId: PATENT_CRISPR },
      { userId: STARTUP_ID,    action: 'SAVE_PATENT',     entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: ENTERPRISE_ID, action: 'SAVE_PATENT',     entity: 'Patent', entityId: PATENT_GLUCOSE },
      { userId: ADMIN_ID,      action: 'VIEW_USER',       entity: 'User',   entityId: STARTUP_ID },
      { userId: ADMIN_ID,      action: 'APPROVE_USER',    entity: 'User',   entityId: ENTERPRISE_ID },
      { userId: INVENTOR_ID,   action: 'UPDATE_PATENT',   entity: 'Patent', entityId: PATENT_BATTERY },
      { userId: BROKER_ID,     action: 'VIEW_PATENT',     entity: 'Patent', entityId: PATENT_GLUCOSE },
      { userId: STARTUP_ID,    action: 'CREATE_DEAL',     entity: 'Deal',   entityId: 'DEAL_CRISPR' },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ Audit logs done');

  // ── FINAL COUNTS ──────────────────────────────────────────
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

  console.log('\n🎉 ALL DONE! Final counts:');
  console.log(`  📁 Deals:          ${counts[0]}`);
  console.log(`  💬 Messages:       ${counts[1]}`);
  console.log(`  💰 Royalties:      ${counts[2]}`);
  console.log(`  🤖 Match Results:  ${counts[3]}`);
  console.log(`  🏁 Milestones:     ${counts[4]}`);
  console.log(`  📄 Documents:      ${counts[5]}`);
  console.log(`  ⭐ Saved Patents:  ${counts[6]}`);
  console.log(`  📋 Audit Logs:     ${counts[7]}`);
}

main().catch(e => { console.error('❌ Failed:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
