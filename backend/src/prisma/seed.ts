import 'dotenv/config';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Starting comprehensive database seed for Production...');

  // ─── Clean up existing data ───
  await prisma.message.deleteMany();
  await prisma.royalty.deleteMany();
  await prisma.dealMilestone.deleteMany();
  await prisma.dealParticipant.deleteMany();
  await prisma.dealPatent.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.aIReport.deleteMany();
  await prisma.savedPatent.deleteMany();
  await prisma.matchResult.deleteMany();
  await prisma.matchRequest.deleteMany();
  await prisma.patentFamily.deleteMany();
  await prisma.patentDocument.deleteMany();
  await prisma.patent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.organization.deleteMany();

  // ─── Create Subscription Plans ───
  await prisma.subscriptionPlan.createMany({
    data: [
      {
        name: 'Starter',
        description: 'For independent inventors and small teams.',
        price: 999,
        yearlyPrice: 9990,
        features: ['Up to 5 Patents', 'Basic Analytics', 'Standard Support'],
        maxPatents: 5,
        maxDeals: 2,
        maxUsers: 1,
        aiCredits: 10,
        isActive: true,
      },
      {
        name: 'Professional',
        description: 'For growing startups and research labs.',
        price: 4999,
        yearlyPrice: 49990,
        features: ['Up to 50 Patents', 'Advanced Analytics', 'Priority Support', 'AI Matchmaking'],
        maxPatents: 50,
        maxDeals: 20,
        maxUsers: 5,
        aiCredits: 100,
        isActive: true,
      },
      {
        name: 'Enterprise',
        description: 'For large organizations and universities.',
        price: 19999,
        yearlyPrice: 199990,
        features: ['Unlimited Patents', 'Custom Reports', 'Dedicated Account Manager', 'API Access'],
        maxPatents: null,
        maxDeals: null,
        maxUsers: null,
        aiCredits: 1000,
        isActive: true,
      }
    ]
  });

  // ─── Create Organizations ───
  console.log('Building Organizations...');
  const orgUniv = await prisma.organization.create({
    data: { name: 'Stanford Innovation Lab', type: 'UNIVERSITY', country: 'USA', isVerified: true, industry: 'Education', employeeCount: 15000, revenue: 1500000000, website: 'stanford.edu' }
  });
  
  const orgStartup = await prisma.organization.create({
    data: { name: 'BioGenesis Tech', type: 'STARTUP', country: 'USA', isVerified: true, industry: 'Biotech', employeeCount: 45, stage: 'Series A', website: 'biogenesis.tech' }
  });

  const orgEnterprise = await prisma.organization.create({
    data: { name: 'Samsung Electronics', type: 'ENTERPRISE', country: 'South Korea', isVerified: true, industry: 'Consumer Electronics', employeeCount: 260000, revenue: 200000000000, website: 'samsung.com' }
  });

  const orgBroker = await prisma.organization.create({
    data: { name: 'Global IP Exchange', type: 'BROKER', country: 'UK', isVerified: true, industry: 'Legal Services', employeeCount: 120, website: 'globalip.net' }
  });

  const orgAuto = await prisma.organization.create({
    data: { name: 'Tesla Motors', type: 'ENTERPRISE', country: 'USA', isVerified: true, industry: 'Automotive', employeeCount: 140000, revenue: 95000000000, website: 'tesla.com' }
  });

  // ─── Create Users (One for each role) ───
  console.log('Building Users...');
  const passwordHash = await bcrypt.hash('password123', 10); // Use 10 for faster seeding

  const admin = await prisma.user.create({
    data: { email: 'admin@ipcos.in', name: 'System Admin', role: 'ADMIN', status: 'ACTIVE', passwordHash, emailVerified: true }
  });

  const inventor = await prisma.user.create({
    data: { email: 'inventor@demo.com', name: 'Dr. Sarah Connor', role: 'INVENTOR', status: 'ACTIVE', passwordHash, emailVerified: true, organizationId: orgUniv.id, designation: 'Lead Researcher' }
  });

  const university = await prisma.user.create({
    data: { email: 'university@demo.com', name: 'James Doe', role: 'UNIVERSITY', status: 'ACTIVE', passwordHash, emailVerified: true, organizationId: orgUniv.id, designation: 'Tech Transfer Director' }
  });

  const startup = await prisma.user.create({
    data: { email: 'startup@demo.com', name: 'Alice Chen', role: 'STARTUP', status: 'ACTIVE', passwordHash, emailVerified: true, organizationId: orgStartup.id, designation: 'CEO' }
  });

  const enterprise = await prisma.user.create({
    data: { email: 'enterprise@demo.com', name: 'Elon Musk', role: 'ENTERPRISE', status: 'ACTIVE', passwordHash, emailVerified: true, organizationId: orgAuto.id, designation: 'CEO' }
  });

  const broker = await prisma.user.create({
    data: { email: 'broker@demo.com', name: 'Robert Smith', role: 'BROKER', status: 'ACTIVE', passwordHash, emailVerified: true, organizationId: orgBroker.id, designation: 'Managing Partner' }
  });

  // ─── Create 10 Patents ───
  console.log('Building Patents and AI Reports...');
  
  const patentsData = [
    {
      title: 'Solid-State Battery Architecture',
      abstract: 'A novel solid-state battery design offering 3x energy density and 10-minute charging times without thermal runaway risks.',
      domain: 'ENERGY',
      status: 'GRANTED',
      patentNumber: 'US11223344B2',
      trl: 7,
      keywords: ['solid-state', 'battery', 'EV', 'energy'],
      askingPrice: 5000000,
      royaltyRate: 4.5,
      isListed: true,
      orgId: orgUniv.id,
      aiData: { overallScore: 92, noveltyScore: 95, commercialScore: 94, marketFitScore: 88, targetMarket: 'EV & Consumer Electronics' }
    },
    {
      title: 'CRISPR-Cas9 Variant for Drought Resistance',
      abstract: 'An optimized CRISPR-Cas9 delivery mechanism targeting plant genomes to significantly enhance drought resistance in staple crops like wheat and corn.',
      domain: 'AGRICULTURE',
      status: 'PUBLISHED',
      patentNumber: 'US10998877A1',
      trl: 5,
      keywords: ['crispr', 'biotech', 'agriculture', 'drought'],
      askingPrice: 2000000,
      royaltyRate: 2.0,
      isListed: true,
      orgId: orgStartup.id,
      aiData: { overallScore: 88, noveltyScore: 92, commercialScore: 85, marketFitScore: 90, targetMarket: 'AgriTech & Seed Manufacturers' }
    },
    {
      title: 'Neuromorphic Computing Chip',
      abstract: 'A low-power neuromorphic chip architecture mimicking brain synapses, enabling 100x efficiency in on-device AI inference.',
      domain: 'SEMICONDUCTOR',
      status: 'FILED',
      patentNumber: 'US20240112233',
      trl: 4,
      keywords: ['semiconductor', 'ai', 'edge computing'],
      askingPrice: 8000000,
      royaltyRate: 3.5,
      isListed: true,
      orgId: orgUniv.id,
      aiData: { overallScore: 96, noveltyScore: 98, commercialScore: 95, marketFitScore: 92, targetMarket: 'Mobile Devices & IoT' }
    },
    {
      title: 'Biodegradable Polymer for Packaging',
      abstract: 'A seaweed-based polymer that fully biodegrades in marine environments within 30 days while matching the tensile strength of PET plastics.',
      domain: 'MATERIALS',
      status: 'GRANTED',
      patentNumber: 'US11334455B1',
      trl: 8,
      keywords: ['biodegradable', 'packaging', 'eco-friendly'],
      askingPrice: 1500000,
      royaltyRate: 5.0,
      isListed: true,
      orgId: orgStartup.id,
      aiData: { overallScore: 89, noveltyScore: 85, commercialScore: 92, marketFitScore: 95, targetMarket: 'FMCG Packaging' }
    },
    {
      title: 'Autonomous Drone Navigation via Swarm Intelligence',
      abstract: 'Algorithms allowing drone swarms to navigate complex urban environments using decentralized local communication without GPS.',
      domain: 'AI_ML',
      status: 'PUBLISHED',
      patentNumber: 'EP3456789A1',
      trl: 6,
      keywords: ['drones', 'swarm', 'ai', 'navigation'],
      askingPrice: 3000000,
      royaltyRate: 2.5,
      isListed: true,
      orgId: orgUniv.id,
      aiData: { overallScore: 84, noveltyScore: 88, commercialScore: 80, marketFitScore: 85, targetMarket: 'Defense & Delivery Services' }
    },
    {
      title: 'Quantum Key Distribution Repeater',
      abstract: 'A photonic repeater allowing quantum key distribution (QKD) over optical fibers exceeding distances of 1000km without signal degradation.',
      domain: 'IT_SOFTWARE',
      status: 'FILED',
      patentNumber: 'US20250011222',
      trl: 3,
      keywords: ['quantum', 'cryptography', 'security'],
      askingPrice: 10000000,
      royaltyRate: 1.5,
      isListed: true,
      orgId: orgUniv.id,
      aiData: { overallScore: 91, noveltyScore: 99, commercialScore: 82, marketFitScore: 80, targetMarket: 'Telecom & Defense Security' }
    },
    {
      title: 'Non-Invasive Continuous Glucose Monitor',
      abstract: 'A wearable sensor utilizing near-infrared spectroscopy for real-time, non-invasive continuous glucose monitoring from the wrist.',
      domain: 'HEALTHCARE',
      status: 'GRANTED',
      patentNumber: 'US11998877B2',
      trl: 9,
      keywords: ['healthcare', 'wearables', 'diabetes', 'sensor'],
      askingPrice: 12000000,
      royaltyRate: 6.0,
      isListed: true,
      orgId: orgStartup.id,
      aiData: { overallScore: 98, noveltyScore: 90, commercialScore: 99, marketFitScore: 100, targetMarket: 'Consumer Health & MedTech' }
    },
    {
      title: 'Carbon Capture Metal-Organic Framework',
      abstract: 'A highly porous MOF specifically synthesized for direct air capture of CO2 with 5x greater capacity than traditional amine scrubbers.',
      domain: 'CLEAN_TECH',
      status: 'PUBLISHED',
      patentNumber: 'US20240998877',
      trl: 5,
      keywords: ['carbon capture', 'mof', 'climate tech'],
      askingPrice: 4000000,
      royaltyRate: 3.0,
      isListed: true,
      orgId: orgUniv.id,
      aiData: { overallScore: 87, noveltyScore: 91, commercialScore: 84, marketFitScore: 90, targetMarket: 'Heavy Industry & Energy' }
    },
    {
      title: 'Haptic Feedback Textile for VR',
      abstract: 'A woven textile incorporating micro-actuators that provide localized haptic feedback for immersive virtual reality environments.',
      domain: 'MANUFACTURING',
      status: 'GRANTED',
      patentNumber: 'US10887766B1',
      trl: 7,
      keywords: ['vr', 'haptics', 'wearables', 'textile'],
      askingPrice: 2500000,
      royaltyRate: 4.0,
      isListed: true,
      orgId: orgStartup.id,
      aiData: { overallScore: 82, noveltyScore: 85, commercialScore: 80, marketFitScore: 85, targetMarket: 'Gaming & Virtual Reality' }
    },
    {
      title: 'High-Efficiency Perovskite Solar Cell',
      abstract: 'A stabilized perovskite solar cell achieving 29% power conversion efficiency with a demonstrated 20-year operational lifespan.',
      domain: 'ENERGY',
      status: 'FILED',
      patentNumber: 'WO2025001122A1',
      trl: 6,
      keywords: ['solar', 'perovskite', 'renewable energy'],
      askingPrice: 6000000,
      royaltyRate: 3.0,
      isListed: true,
      orgId: orgUniv.id,
      aiData: { overallScore: 94, noveltyScore: 92, commercialScore: 96, marketFitScore: 95, targetMarket: 'Solar Energy Providers' }
    }
  ];

  const createdPatents = [];
  for (const p of patentsData) {
    const patent = await prisma.patent.create({
      data: {
        title: p.title,
        abstract: p.abstract,
        domain: p.domain as any,
        status: p.status as any,
        patentNumber: p.patentNumber,
        trl: p.trl,
        keywords: p.keywords,
        askingPrice: p.askingPrice,
        royaltyRate: p.royaltyRate,
        isListed: p.isListed,
        inventorId: inventor.id,
        organizationId: p.orgId,
      }
    });
    createdPatents.push(patent);

    await prisma.aIReport.create({
      data: {
        patentId: patent.id,
        overallScore: p.aiData.overallScore,
        noveltyScore: p.aiData.noveltyScore,
        commercialScore: p.aiData.commercialScore,
        marketFitScore: p.aiData.marketFitScore,
        legalStrength: Math.floor(Math.random() * 20 + 80),
        techReadiness: Math.floor(Math.random() * 30 + 70),
        executiveSummary: `Highly commercializable technology targeting ${p.aiData.targetMarket}.`,
        strengths: ['Innovative methodology', 'Cost-effective scaling', 'Strong initial IP'],
        weaknesses: ['Requires specialized manufacturing', 'Initial setup cost'],
        opportunities: ['Expanding global demand', 'Regulatory pushes'],
        threats: ['Emerging alternative techs'],
        targetMarket: p.aiData.targetMarket,
        licensingStrategy: 'Exclusive regional licensing or Global non-exclusive.',
        recommendedModel: 'Upfront + Running Royalty',
        topBuyers: [
          { company: 'Tesla', matchScore: 95, industry: 'Automotive', reason: 'Direct alignment with R&D goals' },
          { company: 'Samsung', matchScore: 88, industry: 'Electronics', reason: 'Complements existing product portfolio' }
        ]
      }
    });
  }

  // ─── Create Deals ───
  console.log('Building Deals & Messages...');
  
  // Deal 1: Active
  const deal1 = await prisma.deal.create({
    data: {
      title: 'Exclusive Battery Tech License',
      type: 'EXCLUSIVE_LICENSE',
      status: 'ACTIVE',
      companyId: orgAuto.id,
      upfrontFee: 2500000,
      royaltyRate: 4.5,
      duration: 10,
      territory: ['Global'],
      participants: {
        create: [
          { userId: inventor.id, role: 'lead_inventor' },
          { userId: enterprise.id, role: 'company_rep' }
        ]
      },
      patents: {
        create: [{ patentId: createdPatents[0].id }]
      }
    }
  });

  // Deal 2: Negotiating
  const deal2 = await prisma.deal.create({
    data: {
      title: 'Neuromorphic Chip Evaluation',
      type: 'NON_EXCLUSIVE_LICENSE',
      status: 'NEGOTIATING',
      companyId: orgEnterprise.id,
      upfrontFee: 8000000,
      royaltyRate: 3.5,
      duration: 5,
      territory: ['Asia', 'North America'],
      participants: {
        create: [
          { userId: inventor.id, role: 'lead_inventor' },
          { userId: broker.id, role: 'broker' }
        ]
      },
      patents: {
        create: [{ patentId: createdPatents[2].id }]
      }
    }
  });

  // Deal 3: Due Diligence
  const deal3 = await prisma.deal.create({
    data: {
      title: 'Glucose Monitor Acquisition',
      type: 'ASSIGNMENT',
      status: 'DUE_DILIGENCE',
      companyId: orgEnterprise.id,
      upfrontFee: 12000000,
      territory: ['Global'],
      participants: {
        create: [
          { userId: startup.id, role: 'company_rep' },
          { userId: broker.id, role: 'broker' }
        ]
      },
      patents: {
        create: [{ patentId: createdPatents[6].id }]
      }
    }
  });

  // Messages for Deal 1
  await prisma.message.createMany({
    data: [
      { dealId: deal1.id, senderId: enterprise.id, content: 'We are very interested in the Solid-State Battery patent. Our EV division has been looking for exactly this technology.', type: 'TEXT', createdAt: new Date(Date.now() - 4 * 60 * 60000) },
      { dealId: deal1.id, senderId: inventor.id, content: 'Thank you for reaching out. I am happy to discuss a potential licensing arrangement.', type: 'TEXT', createdAt: new Date(Date.now() - 3.5 * 60 * 60000) },
      { dealId: deal1.id, senderId: inventor.id, content: 'Initial Term Sheet for Review', type: 'DEAL_PROPOSAL', proposal: { title: 'Solid-State Battery License — Term Sheet', amount: 2500000, royalty: 4.5, duration: 10 }, createdAt: new Date(Date.now() - 2.7 * 60 * 60000) }
    ]
  });

  // Messages for Deal 2
  await prisma.message.createMany({
    data: [
      { dealId: deal2.id, senderId: broker.id, content: 'The client is requesting a reduction in the upfront fee to $6M.', type: 'TEXT', createdAt: new Date(Date.now() - 24 * 60 * 60000) },
      { dealId: deal2.id, senderId: inventor.id, content: 'We can accept $6M upfront if the royalty rate is increased to 4.5%.', type: 'TEXT', createdAt: new Date(Date.now() - 22 * 60 * 60000) },
    ]
  });

  // Royalties for Deal 1
  await prisma.royalty.createMany({
    data: [
      { dealId: deal1.id, patentId: createdPatents[0].id, amount: 150000, period: 'Q1 2024', dueDate: new Date('2024-04-15'), status: 'PAID', paidAt: new Date('2024-04-10') },
      { dealId: deal1.id, patentId: createdPatents[0].id, amount: 185000, period: 'Q2 2024', dueDate: new Date('2024-07-15'), status: 'PAID', paidAt: new Date('2024-07-12') },
      { dealId: deal1.id, patentId: createdPatents[0].id, amount: 210000, period: 'Q3 2024', dueDate: new Date('2024-10-15'), status: 'PENDING' },
    ]
  });

  // ─── Create AI Match Data ───
  console.log('Building AI Match Data...');
  
  const matchReq1 = await prisma.matchRequest.create({
    data: {
      organizationId: orgStartup.id,
      domains: ['ENERGY'],
      keywords: ['solid-state', 'battery', 'EV'],
      minTrl: 5,
      maxBudget: 3000000,
      notes: 'Looking for solid-state battery patents or exclusive licenses.',
    }
  });

  const matchReq2 = await prisma.matchRequest.create({
    data: {
      organizationId: orgAuto.id,
      domains: ['AI_ML'],
      keywords: ['navigation', 'autonomous', 'drone'],
      minTrl: 6,
      maxBudget: 5000000,
      notes: 'Acquiring IP related to autonomous drone or vehicle navigation.',
    }
  });

  await prisma.matchResult.createMany({
    data: [
      {
        matchRequestId: matchReq1.id,
        patentId: createdPatents[0].id,
        matchScore: 94,
        reasons: ['Exact match on solid-state battery technology', 'TRL exceeds minimum requirement', 'Budget alignment is favorable'],
        risks: ['Pricing negotiation required'],
        status: 'new',
        dealProbability: 75,
        estimatedRevenue: 2500000,
      },
      {
        matchRequestId: matchReq1.id,
        patentId: createdPatents[9].id,
        matchScore: 78,
        reasons: ['Domain match (Energy)', 'TRL 6 is acceptable'],
        risks: ['Perovskite solar cell is not directly related to battery storage'],
        status: 'new',
        dealProbability: 20,
        estimatedRevenue: 1000000,
      },
      {
        matchRequestId: matchReq2.id,
        patentId: createdPatents[4].id,
        matchScore: 92,
        reasons: ['Direct hit for autonomous navigation without GPS', 'AI/ML domain matches precisely'],
        risks: [],
        status: 'contacted',
        dealProbability: 85,
        estimatedRevenue: 3000000,
      }
    ]
  });

  console.log('✅ Seed completed successfully!');
  console.log('====================================');
  console.log('Test Users (Password: password123)');
  console.log('------------------------------------');
  console.log('Admin:      admin@ipcos.in');
  console.log('Inventor:   inventor@demo.com');
  console.log('University: university@demo.com');
  console.log('Startup:    startup@demo.com');
  console.log('Enterprise: enterprise@demo.com');
  console.log('Broker:     broker@demo.com');
  console.log('====================================');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
