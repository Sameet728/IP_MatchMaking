const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Pre-defined UUIDs to maintain consistency with existing configurations
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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = {
  query: (text, params) => pool.query(text, params),
};

const PASSWORD_HASH = bcrypt.hashSync('password123', 10);

async function runInBatches(queries, batchSize = 50) {
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    await Promise.all(batch.map(q => db.query(q.text, q.values)));
  }
}

async function main() {
  console.log('🌱 Starting database seeding (Targeting 1000+ records per main table)...');

  // 1. Truncate all tables
  console.log('🧹 Truncating tables...');
  await db.query(`
    TRUNCATE TABLE 
      "AuditLog", "SavedPatent", "Notification", "Report", "Royalty", 
      "Message", "DealMilestone", "DealPatent", "DealParticipant", "Deal", 
      "MatchResult", "MatchRequest", "AIAnalysisJob", "AIReport", 
      "PatentDocument", "PatentFamily", "Patent", "User", "Organization",
      "Subscription", "SubscriptionPlan"
    CASCADE;
  `);

  // 2. Insert Core Organizations
  console.log('🏢 Seeding organizations...');
  const orgs = [
    [ORG_UNIV, 'Stanford University', 'UNIVERSITY', 'tto@stanford.edu', 'Education'],
    [ORG_STARTUP, 'NexaGen AI', 'STARTUP', 'contact@nexagen.ai', 'Artificial Intelligence'],
    [ORG_SAMSUNG, 'Samsung Electronics', 'ENTERPRISE', 'ip@samsung.com', 'Consumer Electronics'],
    [ORG_BROKER, 'Global IP Exchange', 'BROKER', 'info@globalipexchange.com', 'IP Brokerage'],
    [ORG_TESLA, 'Tesla Motors', 'ENTERPRISE', 'patents@tesla.com', 'Automotive & Energy']
  ];

  for (const org of orgs) {
    await db.query(`
      INSERT INTO "Organization" (id, name, type, email, industry, country, "updatedAt")
      VALUES ($1, $2, $3, $4, $5, 'USA', NOW())
    `, org);
  }

  // 3. Insert Core Users
  console.log('👤 Seeding user logins...');
  const users = [
    [ADMIN_ID, 'admin@ipcos.in', PASSWORD_HASH, 'System Admin', 'ADMIN', 'ACTIVE', ORG_BROKER],
    [INVENTOR_ID, 'inventor@demo.com', PASSWORD_HASH, 'Dr. Ramesh Sharma', 'INVENTOR', 'ACTIVE', ORG_UNIV],
    [UNIVERSITY_ID, 'university@demo.com', PASSWORD_HASH, 'Stanford TTO Officer', 'UNIVERSITY', 'ACTIVE', ORG_UNIV],
    [STARTUP_ID, 'startup@demo.com', PASSWORD_HASH, 'Priya Mehta (NexaGen CTO)', 'STARTUP', 'ACTIVE', ORG_STARTUP],
    [ENTERPRISE_ID, 'enterprise@demo.com', PASSWORD_HASH, 'Vikram Nair (Samsung VP)', 'ENTERPRISE', 'ACTIVE', ORG_SAMSUNG],
    [BROKER_ID, 'broker@demo.com', PASSWORD_HASH, 'Rahul Kapoor (Broker)', 'BROKER', 'ACTIVE', ORG_BROKER]
  ];

  for (const u of users) {
    await db.query(`
      INSERT INTO "User" (id, email, "passwordHash", name, role, status, "organizationId", "emailVerified", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
    `, u);
  }

  // 4. Generate 1,020 Patents and matching AIReports
  console.log('📦 Generating 1,020 patents & AI reports batches...');

  const domains = ['AI_ML', 'BIOTECH', 'CLEAN_TECH', 'SEMICONDUCTOR', 'HEALTHCARE', 'ENERGY', 'AGRICULTURE', 'MANUFACTURING', 'MATERIALS', 'DEFENSE', 'IT_SOFTWARE', 'AUTOMOTIVE', 'PHARMA', 'NANOTECHNOLOGY', 'OTHER'];
  const statuses = ['FILED', 'GRANTED', 'PUBLISHED', 'LICENSED', 'EXPIRED'];
  const types = ['UTILITY', 'DESIGN', 'PCT', 'CONTINUATION'];

  const titles = [
    ['AI-Powered', 'Predictive Maintenance', 'for Industrial Equipment'],
    ['Next-Generation', 'Antimicrobial Packaging', 'using Nanotechnology'],
    ['Solid-State', 'Lithium-Sulfur Battery', 'with High Energy Density'],
    ['Quantum-Resistant', 'Cryptographic Protocol', 'for IoT Networks'],
    ['Sorption-Based', 'Water Harvesting', 'in Arid Regions'],
    ['Low-Power', 'Gesture Recognition', 'for Medical Devices'],
    ['Federated Learning', 'Healthcare Data Collaboration', 'in Smart Cities'],
    ['Graphene-Enhanced', 'Cement Composite', 'for Infrastructure'],
    ['Autonomous Drone', 'Swarm Coordination', 'for Precision Farming'],
    ['Perovskite Solar', 'Cell Stack', 'with 25-Year Stability']
  ];

  const patentQueries = [];
  const aiReportQueries = [];

  for (let i = 1; i <= 1020; i++) {
    const id = `p-uid-${i}`;
    const base = titles[i % titles.length];
    const title = `${base[0]} ${base[1]} ${base[2]} (v${Math.ceil(i/10)})`;
    const patentNumber = `IN2026${String(100000 + i)}`;
    const applicationNumber = `TEMP/2026/${String(500000 + i)}`;
    const status = statuses[i % statuses.length];
    const type = types[i % types.length];
    const domain = domains[i % domains.length];
    const trl = (i % 7) + 3; // TRL 3 to 9
    const isListed = i % 3 !== 0; // 66% listed
    const price = isListed ? (1000000 + (i * 25000) % 20000000) : null;
    const royaltyRate = isListed ? (2.0 + (i * 0.1) % 6.0) : null;
    const views = 50 + (i * 13) % 2500;
    const inquiries = Math.floor(views * 0.01);
    const saves = Math.floor(views * 0.05);

    // alternate assignees/inventors
    const inventorId = i % 2 === 0 ? INVENTOR_ID : UNIVERSITY_ID;
    const orgId = i % 3 === 0 ? ORG_UNIV : (i % 3 === 1 ? ORG_STARTUP : ORG_SAMSUNG);

    const abstract = `A novel system and method for realizing ${title.toLowerCase()}. By implementing advanced sensor feedback loops and multi-layer processing architectures, this invention improves efficiency by ${(20 + i % 30)}% while cutting deployment costs.`;

    patentQueries.push({
      text: `
        INSERT INTO "Patent" (
          id, title, "patentNumber", "applicationNumber", status, type,
          abstract, domain, trl, "isListed", "askingPrice", "royaltyRate",
          "inventorId", "organizationId", "viewCount", "inquiryCount", "saveCount",
          "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW() - INTERVAL '30 days', NOW())
      `,
      values: [
        id, title, patentNumber, applicationNumber, status, type,
        abstract, domain, trl, isListed, price, royaltyRate,
        inventorId, orgId, views, inquiries, saves
      ]
    });

    // AI Report
    const aiId = `ai-uid-${i}`;
    const overall = 70 + (i * 7) % 28;
    const novelty = 68 + (i * 11) % 30;
    const comm = 72 + (i * 3) % 25;
    const fit = 70 + (i * 9) % 27;
    const legal = 75 + (i * 2) % 20;
    const tech = 65 + (i * 6) % 30;
    
    aiReportQueries.push({
      text: `
        INSERT INTO "AIReport" (
          id, "patentId", "overallScore", "noveltyScore", "commercialScore", "marketFitScore", "legalStrength", "techReadiness",
          "executiveSummary", "targetMarket", "licensingStrategy", "recommendedModel", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      `,
      values: [
        aiId, id, overall, novelty, comm, fit, legal, tech,
        `Market opportunity for ${title} is valued at $${(5 + i % 15)}B globally.`,
        `State-of-the-art deployment of ${base[1]} principles.`,
        `SaaS licensing or technology acquisition suggested.`,
        `Valuable core IP with minor workaround risks.`
      ]
    });
  }

  console.log('📦 Bulk inserting patents...');
  await runInBatches(patentQueries, 80);
  console.log('🤖 Bulk inserting AI reports...');
  await runInBatches(aiReportQueries, 80);

  // 5. Saved Patents
  console.log('⭐ Seeding saved patents...');
  const savedQueries = [];
  for (let i = 1; i <= 30; i++) {
    savedQueries.push({
      text: `INSERT INTO "SavedPatent" (id, "userId", "patentId") VALUES ($1, $2, $3)`,
      values: [`saved-${i}`, STARTUP_ID, `p-uid-${i * 5}`]
    });
    savedQueries.push({
      text: `INSERT INTO "SavedPatent" (id, "userId", "patentId") VALUES ($1, $2, $3)`,
      values: [`saved-ent-${i}`, ENTERPRISE_ID, `p-uid-${i * 7}`]
    });
  }
  await runInBatches(savedQueries, 30);

  // 6. Match Requests & Match Results
  console.log('🤖 Seeding Match Requests & Match Results...');
  const matchRequests = [
    ['mr-samsung-battery', ORG_SAMSUNG, ['ENERGY', 'SEMICONDUCTOR'], ['battery', 'solid-state'], 15000000],
    ['mr-tesla-solar', ORG_TESLA, ['ENERGY', 'CLEAN_TECH'], ['solar', 'perovskite'], 10000000],
    ['mr-bio-crispr', ORG_STARTUP, ['BIOTECH', 'AGRICULTURE'], ['CRISPR', 'gene'], 500000],
    ['mr-samsung-quantum', ORG_SAMSUNG, ['SEMICONDUCTOR', 'IT_SOFTWARE'], ['quantum', 'encryption'], 20000000],
    ['mr-tesla-glucose', ORG_TESLA, ['HEALTHCARE'], ['glucose', 'wearable'], 12000000],
    ['mr-bio-drone', ORG_STARTUP, ['AI_ML', 'AGRICULTURE'], ['drone', 'swarm'], 3000000]
  ];

  for (const mr of matchRequests) {
    await db.query(`
      INSERT INTO "MatchRequest" (id, "organizationId", domains, keywords, "maxBudget", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, mr);
  }

  // Match Results: Generate matches against patents (yielding ~1,200 match results)
  const matchResultQueries = [];
  let matchResultIdCounter = 1;
  for (const mr of matchRequests) {
    const mrId = mr[0];
    const targetDomains = mr[2];
    
    const { rows: matchingPatents } = await db.query(
      `SELECT id, domain FROM "Patent" WHERE domain = ANY($1) LIMIT 200`,
      [targetDomains]
    );

    for (const pat of matchingPatents) {
      const score = 65 + (matchResultIdCounter * 7) % 34; // 65-98
      const prob = 50 + (matchResultIdCounter * 3) % 45;  // 50-95
      const rev = 500000 + (matchResultIdCounter * 12345) % 10000000;
      matchResultQueries.push({
        text: `
          INSERT INTO "MatchResult" (id, "matchRequestId", "patentId", "matchScore", "dealProbability", "estimatedRevenue", status)
          VALUES ($1, $2, $3, $4, $5, $6, 'NEW')
        `,
        values: [`mr-res-${matchResultIdCounter}`, mrId, pat.id, score, prob, rev]
      });
      matchResultIdCounter++;
    }
  }
  await runInBatches(matchResultQueries, 80);

  // 7. Seeding 100 Deals
  console.log('🤝 Seeding 100 deals...');
  const dealStatuses = ['INQUIRY', 'NDA_SENT', 'NDA_SIGNED', 'TERM_SHEET', 'DUE_DILIGENCE', 'NEGOTIATING', 'AGREEMENT_DRAFT', 'SIGNED', 'ACTIVE', 'COMPLETED', 'TERMINATED'];
  const dealTypes = ['EXCLUSIVE_LICENSE', 'NON_EXCLUSIVE_LICENSE', 'CROSS_LICENSE', 'ASSIGNMENT', 'JOINT_VENTURE'];

  const dealQueries = [];
  const dealParticipantQueries = [];
  const dealPatentQueries = [];
  const dealMilestoneQueries = [];

  for (let i = 1; i <= 100; i++) {
    const dealId = `deal-uid-${i}`;
    const patentId = `p-uid-${i}`;
    const status = dealStatuses[i % dealStatuses.length];
    const type = dealTypes[i % dealTypes.length];
    const upfront = 200000 + (i * 12345) % 5000000;
    const rate = 1.5 + (i * 0.15) % 6.0;
    const duration = 3 + i % 10;
    
    dealQueries.push({
      text: `
        INSERT INTO "Deal" (id, title, status, type, "upfrontFee", "royaltyRate", duration, "companyId", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `,
      values: [
        dealId,
        `Deal negotiation for patent ID p-uid-${i}`,
        status,
        type,
        upfront,
        rate,
        duration,
        i % 2 === 0 ? ORG_SAMSUNG : ORG_TESLA
      ]
    });

    dealParticipantQueries.push({
      text: `INSERT INTO "DealParticipant" (id, "dealId", "userId", role) VALUES ($1, $2, $3, 'licensee')`,
      values: [`dp-l-${i}`, dealId, ENTERPRISE_ID]
    });
    dealParticipantQueries.push({
      text: `INSERT INTO "DealParticipant" (id, "dealId", "userId", role) VALUES ($1, $2, $3, 'licensor')`,
      values: [`dp-r-${i}`, dealId, INVENTOR_ID]
    });
    dealParticipantQueries.push({
      text: `INSERT INTO "DealParticipant" (id, "dealId", "userId", role) VALUES ($1, $2, $3, 'broker')`,
      values: [`dp-b-${i}`, dealId, BROKER_ID]
    });
    
    dealPatentQueries.push({
      text: `INSERT INTO "DealPatent" (id, "dealId", "patentId") VALUES ($1, $2, $3)`,
      values: [`dpat-${i}`, dealId, patentId]
    });

    dealMilestoneQueries.push({
      text: `
        INSERT INTO "DealMilestone" (id, "dealId", title, amount, "dueDate", "completedAt")
        VALUES ($1, $2, 'NDA Signed', null, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days')
      `,
      values: [`dm-1-${i}`, dealId]
    });
    dealMilestoneQueries.push({
      text: `
        INSERT INTO "DealMilestone" (id, "dealId", title, amount, "dueDate")
        VALUES ($1, $2, 'Final Agreement Signature', $3, NOW() + INTERVAL '30 days')
      `,
      values: [`dm-2-${i}`, dealId, upfront]
    });
  }

  await runInBatches(dealQueries, 50);
  await runInBatches(dealParticipantQueries, 80);
  await runInBatches(dealPatentQueries, 80);
  await runInBatches(dealMilestoneQueries, 80);

  // 8. Seeding 1,000 Messages (10 messages per deal for the first 100 deals)
  console.log('💬 Seeding 1,000 messages across deals...');
  const msgTemplates = [
    ['licensor', 'Hello, excited to begin discussions on this IP.'],
    ['licensee', 'Thanks for reaching out. We are evaluating the claims.'],
    ['broker', 'Let me know if you want me to share our valuation report.'],
    ['licensee', 'The TRL level is 7. Can we arrange a lab demonstration?'],
    ['licensor', 'Yes, we can schedule a session next week. I will send the NDA.'],
    ['broker', 'Draft NDA has been uploaded to documents section.'],
    ['licensee', 'Reviewing the NDA. Standard exclusions look fine.'],
    ['licensee', 'NDA signed and sent. Let us set up the technical call.'],
    ['licensor', 'Fantastic, call scheduled for Wednesday 2 PM.'],
    ['broker', 'Great progress. Let me know if you need assist with term sheets.']
  ];

  const messageQueries = [];
  let messageCounter = 1;
  for (let d = 1; d <= 100; d++) {
    const dealId = `deal-uid-${d}`;
    for (let m = 0; m < 10; m++) {
      const template = msgTemplates[m];
      const senderRole = template[0];
      const content = template[1];
      const senderId = senderRole === 'licensor' ? INVENTOR_ID : (senderRole === 'licensee' ? ENTERPRISE_ID : BROKER_ID);

      messageQueries.push({
        text: `
          INSERT INTO "Message" (id, "dealId", "senderId", content, type, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, 'TEXT', NOW() - INTERVAL '${(10 - m)} hours', NOW())
        `,
        values: [`msg-uid-${messageCounter}`, dealId, senderId, content]
      });
      messageCounter++;
    }
  }
  await runInBatches(messageQueries, 80);

  // 9. Seeding 200 Royalties
  console.log('💰 Seeding 200 royalty records...');
  const royaltyStatuses = ['PAID', 'PENDING', 'OVERDUE', 'DISPUTED'];
  const royaltyQueries = [];
  for (let i = 1; i <= 200; i++) {
    const dealId = `deal-uid-${(i % 100) + 1}`;
    const patentId = `p-uid-${(i % 100) + 1}`;
    const status = royaltyStatuses[i % royaltyStatuses.length];
    const amount = 50000 + (i * 2350) % 500000;
    
    royaltyQueries.push({
      text: `
        INSERT INTO "Royalty" (id, "dealId", "patentId", amount, period, "dueDate", status, "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '${(i - 100)} days', $6, NOW())
      `,
      values: [`royalty-uid-${i}`, dealId, patentId, amount, `Q${(i % 4) + 1} 2026`, status]
    });
  }
  await runInBatches(royaltyQueries, 80);

  // 10. Seeding 1,500 Audit Logs
  console.log('📋 Seeding 1,500 audit logs...');
  const actions = ['CREATE_PATENT', 'VIEW_PATENT', 'UPDATE_PATENT', 'CREATE_DEAL', 'UPDATE_DEAL_STATUS', 'SAVE_PATENT', 'LOGIN'];
  const logUsers = [ADMIN_ID, INVENTOR_ID, UNIVERSITY_ID, STARTUP_ID, ENTERPRISE_ID, BROKER_ID];
  const auditLogQueries = [];

  for (let i = 1; i <= 1500; i++) {
    const logId = `log-uid-${i}`;
    const action = actions[i % actions.length];
    const userId = logUsers[i % logUsers.length];
    const entity = action.includes('PATENT') ? 'Patent' : (action.includes('DEAL') ? 'Deal' : 'User');
    const entityId = entity === 'Patent' ? `p-uid-${(i % 10) + 1}` : (entity === 'Deal' ? `deal-uid-${(i % 10) + 1}` : userId);
    
    auditLogQueries.push({
      text: `
        INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", "ipAddress", "userAgent", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '${i * 4} minutes')
      `,
      values: [
        logId,
        userId,
        action,
        entity,
        entityId,
        `192.168.1.${(i % 254) + 1}`,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      ]
    });
  }
  await runInBatches(auditLogQueries, 80);

  // 11. Seeding 10 Reports
  console.log('📊 Seeding system reports...');
  const reportTypes = ['AI_PORTFOLIO', 'VALUATION', 'COMMERCIALIZATION', 'BUYER_MATCH', 'DEAL_SUMMARY', 'ROYALTY_COLLECTION', 'PLATFORM_ANALYTICS'];
  const reportQueries = [];
  for (let i = 1; i <= 10; i++) {
    reportQueries.push({
      text: `
        INSERT INTO "Report" (id, "userId", type, name, format, status)
        VALUES ($1, $2, $3, $4, 'PDF', 'READY')
      `,
      values: [`rep-uid-${i}`, ADMIN_ID, reportTypes[i % reportTypes.length], `Analytical Summary Report #${i}`]
    });
  }
  await runInBatches(reportQueries, 10);

  // Final Output Counts Verification
  const counts = await Promise.all([
    db.query(`SELECT COUNT(*) FROM "Organization"`),
    db.query(`SELECT COUNT(*) FROM "User"`),
    db.query(`SELECT COUNT(*) FROM "Patent"`),
    db.query(`SELECT COUNT(*) FROM "AIReport"`),
    db.query(`SELECT COUNT(*) FROM "MatchResult"`),
    db.query(`SELECT COUNT(*) FROM "Deal"`),
    db.query(`SELECT COUNT(*) FROM "Message"`),
    db.query(`SELECT COUNT(*) FROM "Royalty"`),
    db.query(`SELECT COUNT(*) FROM "AuditLog"`),
  ]);

  console.log('\n🎉 ALL DONE! Seeded Data Counts:');
  console.log(`  🏢 Organizations:   ${counts[0].rows[0].count}`);
  console.log(`  👤 Users:           ${counts[1].rows[0].count}`);
  console.log(`  📁 Patents:         ${counts[2].rows[0].count}`);
  console.log(`  🤖 AI Reports:      ${counts[3].rows[0].count}`);
  console.log(`  🧬 Match Results:   ${counts[4].rows[0].count}`);
  console.log(`  🏁 Deals:           ${counts[5].rows[0].count}`);
  console.log(`  💬 Messages:        ${counts[6].rows[0].count}`);
  console.log(`  💰 Royalties:       ${counts[7].rows[0].count}`);
  console.log(`  📋 Audit Logs:      ${counts[8].rows[0].count}`);

  pool.end();
}

main().catch(e => {
  console.error('❌ Failed:', e.message);
  pool.end();
  process.exit(1);
});
