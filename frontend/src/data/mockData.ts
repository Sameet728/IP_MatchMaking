import type { Patent, Company, Deal, Royalty, Notification, User } from '../types';

// ─── USERS ────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: 'u1', email: 'dr.ramesh@iitbombay.edu', name: 'Dr. Ramesh Sharma',
    role: 'inventor', avatar: undefined, organization: 'IIT Bombay',
    verified: true, createdAt: '2024-01-15',
    profile: { patents: 12, licensedPatents: 4, totalRoyalties: 2800000, institution: 'IIT Bombay', department: 'Electrical Engineering', expertise: ['AI/ML', 'Semiconductor', 'IoT'] },
  },
  {
    id: 'u2', email: 'tto@iitdelhi.ac.in', name: 'IIT Delhi TTO',
    role: 'university', avatar: undefined, organization: 'IIT Delhi',
    verified: true, createdAt: '2023-06-01',
    profile: { name: 'IIT Delhi', departments: 24, totalPatents: 387, licensedPatents: 89, totalRevenue: 145000000, ranking: 3 },
  },
  {
    id: 'u3', email: 'cto@nexagen.ai', name: 'Priya Mehta',
    role: 'startup', avatar: undefined, organization: 'NexaGen AI',
    verified: true, createdAt: '2024-03-10',
    profile: { company: 'NexaGen AI', industry: 'Artificial Intelligence', stage: 'Series A', fundingRaised: 12000000, technologyNeeds: ['NLP', 'Computer Vision', 'Edge AI'] },
  },
  {
    id: 'u4', email: 'ip@tatainnovations.com', name: 'Vikram Nair',
    role: 'enterprise', avatar: undefined, organization: 'Tata Innovations',
    verified: true, createdAt: '2023-09-20',
    profile: { company: 'Tata Innovations', industry: 'Conglomerate', annualRevenue: 128000000000, ipBudget: 50000000, acquisitions: 23 },
  },
  {
    id: 'u5', email: 'rahul@ipbridges.in', name: 'Rahul Kapoor',
    role: 'broker', avatar: undefined, organization: 'IP Bridges',
    verified: true, createdAt: '2023-11-01',
    profile: { dealsCompleted: 47, totalCommissions: 8700000, activeDeals: 9, specializations: ['Pharma', 'Clean Energy', 'Defense'] },
  },
  {
    id: 'u6', email: 'admin@ipcos.io', name: 'Admin User',
    role: 'admin', avatar: undefined, organization: 'IP COS Platform',
    verified: true, createdAt: '2023-01-01',
  },
];

// ─── PATENTS ──────────────────────────────────────────────────
export const MOCK_PATENTS: Patent[] = [
  {
    id: 'p1', patentNumber: 'IN202341012345', title: 'AI-Powered Predictive Maintenance System for Industrial Equipment Using Edge Computing',
    abstract: 'A novel system combining edge AI with IoT sensors to predict mechanical failure 72 hours in advance with 94.7% accuracy across diverse industrial environments.',
    country: 'India', status: 'Granted', filingDate: '2023-03-15', grantDate: '2024-01-10',
    expiryDate: '2043-03-15', ipcCode: 'G06N 3/04', cpcCode: 'G06N 20/00',
    inventors: ['Dr. Ramesh Sharma', 'Prof. Anita Patel'],
    assignee: 'IIT Bombay', keywords: ['AI', 'Predictive Maintenance', 'Edge Computing', 'IoT', 'Industrial'],
    technologyDomain: 'Artificial Intelligence', industry: ['Manufacturing', 'Energy', 'Mining'],
    trl: 7, commercialReadiness: 'Market Ready', claims: 18, familySize: 4, citations: 23,
    listingPrice: 5000000, isListed: true, isFeatured: true, views: 2847, inquiries: 14,
    createdAt: '2023-03-15', updatedAt: '2024-06-01',
    aiReport: {
      id: 'ai1', patentId: 'p1', generatedAt: '2024-01-15',
      noveltyScore: 87, commercialScore: 91, marketFitScore: 88, legalStrength: 80, techReadiness: 75, 
      
      
      investmentReadiness: 89, licensingReadiness: 92, overallScore: 88,
      summary: 'High-value patent in the rapidly growing predictive maintenance market, estimated at $23.5B by 2029.',
      technicalSummary: 'Combines transformer-based time-series models with ONNX-optimized edge inference.',
      commercialSummary: 'Strong commercial potential with clear ROI for manufacturing clients.',
      noveltyAnalysis: 'Novel combination of federated learning with edge deployment for maintenance prediction.',
      competitiveAdvantage: '94.7% accuracy surpasses existing solutions by 12-18 percentage points.',
      swot: {
        strengths: ['Proven accuracy', 'Edge-native architecture', 'Domain-agnostic'],
        weaknesses: ['Requires 3-month training data', 'Hardware dependency'],
        opportunities: ['Industry 4.0 push', 'Government MSME schemes', 'Export potential'],
        threats: ['Large tech entrants', 'Open-source alternatives', 'Data privacy regulations'],
      },
      industryFit: ['Manufacturing', 'Oil & Gas', 'Mining', 'Utilities', 'Aviation'],
      potentialBuyers: [
        { company: 'Siemens AG', industry: 'Industrial Automation', matchScore: 94, reasoning: 'Direct fit with MindSphere platform strategy', contactSuggestion: 'Contact via innovation.hub@siemens.com' },
        { company: 'ABB Ltd', industry: 'Electrification', matchScore: 91, reasoning: 'Aligns with ABB Ability digital portfolio', contactSuggestion: 'Reach out to ABB Technology Ventures' },
        { company: 'Tata Steel', industry: 'Steel Manufacturing', matchScore: 88, reasoning: 'High-value deployment in blast furnace operations', contactSuggestion: 'Contact Chief Digital Officer' },
      ],
      licensingStrategy: 'Non-exclusive licensing to multiple OEMs with per-device royalty model recommended.',
      valuationEstimate: { low: 3500000, mid: 5200000, high: 8100000, currency: 'USD' },
      suggestedLicensingPrice: { upfront: 500000, royaltyRate: 4.5, currency: 'USD' },
      technologyTags: ['Edge AI', 'Predictive Analytics', 'IIoT', 'Machine Learning', 'ONNX'],
      sdgMapping: ['SDG 9: Industry Innovation', 'SDG 12: Responsible Consumption'],
      governmentSchemes: ['DSIR R&D Grant', 'PLI Scheme', 'Startup India Seed Fund'],
      riskFactors: ['Technology obsolescence risk: Low', 'Competitor patent risk: Medium'],
      monetizationOptions: ['OEM Licensing', 'SaaS Deployment', 'Technology Sale', 'JV Partnership'],
    },
  },
  {
    id: 'p2', patentNumber: 'IN202241067890', title: 'Biodegradable Nano-Composite Packaging with Active Antimicrobial Properties',
    abstract: 'A sustainable packaging material using cellulose nanocrystals embedded with plant-derived antimicrobial agents, extending food shelf life by 340% while remaining fully compostable.',
    country: 'India', status: 'Granted', filingDate: '2022-08-20', grantDate: '2023-09-05',
    expiryDate: '2042-08-20', ipcCode: 'B32B 5/02', cpcCode: 'B65D 81/28',
    inventors: ['Prof. Sunita Rao', 'Dr. Anil Kumar'],
    assignee: 'IISc Bangalore', keywords: ['Bioplastic', 'Antimicrobial', 'Nanocomposite', 'Sustainable Packaging'],
    technologyDomain: 'Materials Science', industry: ['Food & Beverage', 'Pharmaceuticals', 'FMCG'],
    trl: 6, commercialReadiness: 'Pilot', claims: 24, familySize: 6, citations: 41,
    listingPrice: 8000000, isListed: true, isFeatured: true, views: 3291, inquiries: 22,
    createdAt: '2022-08-20', updatedAt: '2024-05-15',
    aiReport: {
      id: 'ai2', patentId: 'p2', generatedAt: '2024-01-20',
      noveltyScore: 92, commercialScore: 85, marketFitScore: 90, legalStrength: 80, techReadiness: 75, 
      
      
      investmentReadiness: 83, licensingReadiness: 87, overallScore: 88,
      summary: 'Extremely timely patent aligned with global plastic ban regulations and ESG mandates.',
      technicalSummary: 'CNC-based matrix with turmeric and neem-derived active compounds.',
      commercialSummary: 'Global sustainable packaging market reaches $440B by 2030.',
      noveltyAnalysis: 'First patent combining CNC with traditional botanical antimicrobials at scale.',
      competitiveAdvantage: '340% shelf extension vs 80-120% for current alternatives.',
      swot: {
        strengths: ['Fully compostable', 'Regulatory tailwind', 'Cost-competitive at scale'],
        weaknesses: ['Scale-up complexity', 'Moisture sensitivity'],
        opportunities: ['EU plastics directive', 'Plastic credits market', 'D2C food brands'],
        threats: ['Competitor bio-plastics', 'Raw material volatility'],
      },
      industryFit: ['Food & Beverage', 'Pharmaceuticals', 'FMCG', 'E-commerce Logistics'],
      potentialBuyers: [
        { company: 'Amcor PLC', industry: 'Packaging', matchScore: 96, reasoning: 'Direct alignment with sustainability pledge', contactSuggestion: 'Contact sustainability.ventures@amcor.com' },
        { company: 'ITC Limited', industry: 'FMCG', matchScore: 89, reasoning: 'Synergy with ITC paperboards business', contactSuggestion: 'ITC Life Sciences & Technology Centre' },
      ],
      licensingStrategy: 'Exclusive territory licensing by geography (APAC, EU, North America).',
      valuationEstimate: { low: 6000000, mid: 9500000, high: 15000000, currency: 'USD' },
      suggestedLicensingPrice: { upfront: 1200000, royaltyRate: 5.5, currency: 'USD' },
      technologyTags: ['Nanotechnology', 'Biopolymer', 'Active Packaging', 'Cellulose', 'Green Chemistry'],
      sdgMapping: ['SDG 12: Responsible Consumption', 'SDG 14: Life Below Water', 'SDG 13: Climate Action'],
      governmentSchemes: ['BIRAC BIG Scheme', 'DST Nano Mission', 'Startup India Grant'],
      riskFactors: ['Scale-up risk: Medium', 'Regulatory approval timeline: Low'],
      monetizationOptions: ['Exclusive Licensing', 'Technology Transfer', 'JV with FMCG major', 'Spin-off company'],
    },
  },
  {
    id: 'p3', patentNumber: 'IN202141034567', title: 'Solid-State Lithium-Sulfur Battery with 3x Energy Density',
    abstract: 'A novel solid electrolyte architecture for lithium-sulfur batteries achieving 890 Wh/kg energy density with 1,200+ charge cycles, enabling next-generation EVs and grid storage.',
    country: 'India', status: 'Licensed', filingDate: '2021-05-12', grantDate: '2022-11-30',
    expiryDate: '2041-05-12', ipcCode: 'H01M 10/0562', cpcCode: 'H01M 4/38',
    inventors: ['Dr. Vikram Joshi', 'Prof. Leela Krishnan', 'Dr. Sanjay Gupta'],
    assignee: 'TIFR Mumbai', keywords: ['Battery', 'Energy Storage', 'EV', 'Solid State', 'Lithium-Sulfur'],
    technologyDomain: 'Energy Storage', industry: ['Electric Vehicles', 'Grid Storage', 'Consumer Electronics'],
    trl: 8, commercialReadiness: 'Commercial', claims: 31, familySize: 9, citations: 87,
    listingPrice: 25000000, isListed: false, isFeatured: false, views: 5891, inquiries: 38,
    createdAt: '2021-05-12', updatedAt: '2024-07-01',
    aiReport: {
      id: 'ai3', patentId: 'p3', generatedAt: '2024-02-10',
      noveltyScore: 95, commercialScore: 97, marketFitScore: 96, legalStrength: 80, techReadiness: 75, 
      
      
      investmentReadiness: 96, licensingReadiness: 98, overallScore: 96,
      summary: 'Landmark battery patent. Already licensed to two EV manufacturers.',
      technicalSummary: 'LLZO-based solid electrolyte with polysulfide shuttle suppression.',
      commercialSummary: 'EV battery market $400B+ by 2030. This patent addresses the core constraint.',
      noveltyAnalysis: 'First successful demonstration of 1000+ cycles at room temperature for Li-S.',
      competitiveAdvantage: '3x energy density over current Li-ion with cost reduction potential of 40%.',
      swot: {
        strengths: ['World-leading performance metrics', 'Strong patent family', 'Proven at prototype scale'],
        weaknesses: ['Manufacturing complexity', 'Precursor material costs'],
        opportunities: ['EV adoption surge', 'Grid-scale storage demand', 'Defense applications'],
        threats: ['Toyota/QuantumScape solid-state competition', 'Materials supply chain'],
      },
      industryFit: ['Electric Vehicles', 'Grid Storage', 'Aerospace', 'Defense', 'Consumer Electronics'],
      potentialBuyers: [
        { company: 'Ola Electric', industry: 'Electric Vehicles', matchScore: 97, reasoning: 'Strategic fit for domestic EV leadership', contactSuggestion: 'Direct CTO outreach' },
        { company: 'Samsung SDI', industry: 'Battery Manufacturing', matchScore: 94, reasoning: 'Core capability gap in Li-S technology', contactSuggestion: 'Samsung SDI R&D Center' },
      ],
      licensingStrategy: 'Exclusive licensing already secured. Additional territory expansion recommended.',
      valuationEstimate: { low: 20000000, mid: 32000000, high: 55000000, currency: 'USD' },
      suggestedLicensingPrice: { upfront: 5000000, royaltyRate: 7, currency: 'USD' },
      technologyTags: ['Solid-State', 'Li-S Battery', 'LLZO', 'Energy Density', 'EV'],
      sdgMapping: ['SDG 7: Affordable Clean Energy', 'SDG 13: Climate Action', 'SDG 9: Industry Innovation'],
      governmentSchemes: ['MNRE Grant', 'Automotive Mission Plan', 'FAME India', 'PM KUSUM'],
      riskFactors: ['Manufacturing scale-up: Medium', 'International patent challenge: Low'],
      monetizationOptions: ['Exclusive Licensing (Active)', 'Royalty Streams', 'Equity stake in licensee', 'SPAC listing'],
    },
  },
  {
    id: 'p4', patentNumber: 'IN202341078901', title: 'Quantum-Resistant Cryptographic Protocol for IoT Networks',
    abstract: 'A post-quantum cryptography scheme optimized for resource-constrained IoT devices, providing 256-bit quantum security with 40% lower power consumption than current NIST PQC standards.',
    country: 'India', status: 'Pending', filingDate: '2023-07-19',
    expiryDate: '2043-07-19', ipcCode: 'H04L 9/08',
    inventors: ['Dr. Meera Pillai'], assignee: 'IIT Madras',
    keywords: ['Post-Quantum', 'Cryptography', 'IoT', 'Security', 'Lattice-based'],
    technologyDomain: 'Cybersecurity', industry: ['IoT', 'Defense', 'Banking', 'Smart Cities'],
    trl: 5, commercialReadiness: 'Validated', claims: 14, familySize: 2, citations: 8,
    listingPrice: 3500000, isListed: true, isFeatured: false, views: 1243, inquiries: 7,
    createdAt: '2023-07-19', updatedAt: '2024-04-20',
    aiReport: {
      id: 'ai4', patentId: 'p4', generatedAt: '2024-03-01',
      noveltyScore: 88, commercialScore: 79, marketFitScore: 85, legalStrength: 80, techReadiness: 75, 
      
      
      investmentReadiness: 72, licensingReadiness: 74, overallScore: 79,
      summary: 'Timely patent as quantum computing threatens all current encryption within 5-10 years.',
      technicalSummary: 'Kyber-based KEM optimized for 8-bit and 32-bit microcontrollers.',
      commercialSummary: 'Post-quantum security market projected to reach $17.69B by 2030.',
      noveltyAnalysis: 'Unique optimization for constrained devices differentiates from NIST PQC reference implementations.',
      competitiveAdvantage: '40% power reduction enables deployment in battery-powered devices.',
      swot: {
        strengths: ['Future-proof technology', 'NIST alignment', 'Low-power design'],
        weaknesses: ['Pending grant', 'Limited proof-of-concept at scale'],
        opportunities: ['CERT-In mandates', 'Smart city contracts', 'Banking sector'],
        threats: ['NIST reference implementations', 'Open-source PQC libraries'],
      },
      industryFit: ['Defense', 'Smart Cities', 'Banking & Finance', 'Healthcare IT', 'Telecom'],
      potentialBuyers: [
        { company: 'DRDO', industry: 'Defense', matchScore: 92, reasoning: 'Strategic national security application', contactSuggestion: 'DRDO Technology Transfer Cell' },
      ],
      licensingStrategy: 'Government-first exclusive licensing, then enterprise commercial licensing.',
      valuationEstimate: { low: 2500000, mid: 4200000, high: 7000000, currency: 'USD' },
      suggestedLicensingPrice: { upfront: 300000, royaltyRate: 3.5, currency: 'USD' },
      technologyTags: ['Post-Quantum', 'Lattice Cryptography', 'Kyber', 'IoT Security', 'NIST PQC'],
      sdgMapping: ['SDG 16: Peace and Justice', 'SDG 9: Industry Innovation'],
      governmentSchemes: ['CERT-In Grants', 'MeitY R&D Fund', 'DSIR Industrial R&D'],
      riskFactors: ['Patent grant risk: Low', 'Standardization risk: Medium'],
      monetizationOptions: ['Government Licensing', 'Enterprise SaaS', 'SDK Licensing', 'Consulting Services'],
    },
  },
  {
    id: 'p5', patentNumber: 'IN202141056789', title: 'CRISPR-Based Rapid Pathogen Detection Platform (15-Minute)',
    abstract: 'A portable CRISPR-Cas13 diagnostic platform delivering clinical-grade pathogen detection in 15 minutes at < ₹50 per test cost, validated for 23 infectious diseases.',
    country: 'India', status: 'Granted', filingDate: '2021-11-03', grantDate: '2023-04-18',
    expiryDate: '2041-11-03', ipcCode: 'C12N 15/10', cpcCode: 'C12Q 1/6895',
    inventors: ['Dr. Anjali Singh', 'Dr. Rakesh Mohan', 'Prof. Deepak Verma'],
    assignee: 'AIIMS Delhi', keywords: ['CRISPR', 'Diagnostics', 'Pathogen Detection', 'Point-of-Care', 'Cas13'],
    technologyDomain: 'Biotechnology', industry: ['Healthcare', 'Diagnostics', 'Global Health'],
    trl: 7, commercialReadiness: 'Market Ready', claims: 27, familySize: 5, citations: 63,
    listingPrice: 12000000, isListed: true, isFeatured: true, views: 4127, inquiries: 31,
    createdAt: '2021-11-03', updatedAt: '2024-06-15',
    aiReport: {
      id: 'ai5', patentId: 'p5', generatedAt: '2024-02-28',
      noveltyScore: 91, commercialScore: 93, marketFitScore: 92, legalStrength: 80, techReadiness: 75, 
      
      
      investmentReadiness: 91, licensingReadiness: 94, overallScore: 92,
      summary: 'Post-pandemic diagnostics paradigm shift. WHO and ICMR have expressed interest.',
      technicalSummary: 'Cas13-based SHERLOCK approach with paper microfluidics for POC deployment.',
      commercialSummary: 'Global POC diagnostics market $47B by 2027. India alone $8B opportunity.',
      noveltyAnalysis: 'Combination of Cas13 with lateral flow eliminates expensive qPCR equipment.',
      competitiveAdvantage: '15-min test at Rs.50 vs 4-hour PCR at Rs.500-2000.',
      swot: {
        strengths: ['Price advantage', 'Speed', 'Multi-pathogen capable', 'ICMR validation data'],
        weaknesses: ['Cold chain requirements', 'Regulatory timeline'],
        opportunities: ['NHM procurement', 'Global health organizations', 'Private lab chains'],
        threats: ['Abbott, Roche rapid tests', 'AI-based symptom screening'],
      },
      industryFit: ['Diagnostics', 'Global Health', 'Government Healthcare', 'Insurance'],
      potentialBuyers: [
        { company: 'Dr. Lal PathLabs', industry: 'Diagnostics', matchScore: 95, reasoning: 'Network of 3500+ collection centers for rapid rollout', contactSuggestion: 'Contact Innovation Cell' },
        { company: 'Thyrocare Technologies', industry: 'Diagnostics', matchScore: 91, reasoning: 'Strong rural distribution for POC deployment', contactSuggestion: 'CEO direct outreach' },
        { company: 'Molbio Diagnostics', industry: 'Molecular Diagnostics', matchScore: 93, reasoning: 'Existing CRISPR capability and distribution', contactSuggestion: 'Technical BD team' },
      ],
      licensingStrategy: 'Non-exclusive manufacturing license to 2-3 diagnostics firms with volume-based royalty.',
      valuationEstimate: { low: 8000000, mid: 14000000, high: 22000000, currency: 'USD' },
      suggestedLicensingPrice: { upfront: 1500000, royaltyRate: 6, currency: 'USD' },
      technologyTags: ['CRISPR-Cas13', 'SHERLOCK', 'Point-of-Care', 'Molecular Diagnostics', 'Microfluidics'],
      sdgMapping: ['SDG 3: Good Health', 'SDG 10: Reduced Inequalities', 'SDG 1: No Poverty'],
      governmentSchemes: ['BIRAC BIPP', 'ICMR Task Force Grant', 'DBT BioNEST', 'PM-Atmanirbhar Bharat'],
      riskFactors: ['Regulatory approval: Medium', 'Cold chain dependency: Low'],
      monetizationOptions: ['Manufacturing License', 'Technology Transfer', 'Govt Procurement Deal', 'WHO UNITAID'],
    },
  },
  { id: 'p6', patentNumber: 'IN202241089012', title: 'Self-Healing Polymer Coating for Automotive and Aerospace Applications', abstract: 'Microcapsule-based self-healing coating restoring 98% of mechanical properties after damage, with 5x corrosion resistance over conventional epoxy coatings.', country: 'India', status: 'Granted', filingDate: '2022-02-14', grantDate: '2023-10-20', expiryDate: '2042-02-14', ipcCode: 'C09D 5/00', inventors: ['Dr. Kavita Sharma'], assignee: 'NIT Trichy', keywords: ['Self-Healing', 'Polymer', 'Coating', 'Automotive', 'Aerospace'], technologyDomain: 'Materials Science', industry: ['Automotive', 'Aerospace', 'Marine'], trl: 6, commercialReadiness: 'Pilot', claims: 19, familySize: 3, citations: 29, listingPrice: 6500000, isListed: true, isFeatured: false, views: 1876, inquiries: 11, createdAt: '2022-02-14', updatedAt: '2024-05-01' },
  { id: 'p7', patentNumber: 'IN202341023456', title: 'Low-Power Neuromorphic Chip for Real-Time Gesture Recognition', abstract: 'Spiking neural network chip consuming 0.8mW for real-time 3D gesture recognition, enabling hands-free HMI in AR/VR, robotics, and medical prosthetics.', country: 'India', status: 'Filed', filingDate: '2023-09-01', ipcCode: 'G06N 3/063', inventors: ['Dr. Arjun Nair', 'Dr. Suresh Rajan'], assignee: 'IIT Hyderabad', keywords: ['Neuromorphic', 'SNN', 'Gesture Recognition', 'Low Power', 'Edge AI'], technologyDomain: 'Semiconductor', industry: ['AR/VR', 'Robotics', 'Medical Devices'], trl: 4, commercialReadiness: 'Prototype', claims: 11, familySize: 1, citations: 4, listingPrice: 4000000, isListed: false, isFeatured: false, views: 342, inquiries: 3, createdAt: '2023-09-01', updatedAt: '2024-02-10' },
  { id: 'p8', patentNumber: 'IN202041045678', title: 'Atmospheric Water Generation System for Arid Regions', abstract: 'Sorption-based atmospheric water harvester producing 20L/day/m² with solar-driven regeneration, operable in 10-70% RH with zero external power.', country: 'India', status: 'Licensed', filingDate: '2020-06-30', grantDate: '2022-03-15', expiryDate: '2040-06-30', ipcCode: 'E03B 3/28', inventors: ['Prof. Narayan Das', 'Dr. Priya Iyer'], assignee: 'JNCASR', keywords: ['Water Harvesting', 'Atmospheric Water', 'Solar', 'Arid', 'Sorption'], technologyDomain: 'Clean Technology', industry: ['Water Technology', 'Agriculture', 'Defense'], trl: 8, commercialReadiness: 'Commercial', claims: 22, familySize: 7, citations: 55, listingPrice: 9000000, isListed: false, isFeatured: false, views: 3241, inquiries: 18, createdAt: '2020-06-30', updatedAt: '2024-07-01' },
  { id: 'p9', patentNumber: 'IN202341056789', title: 'Federated Learning Framework for Healthcare Data Collaboration', abstract: 'Privacy-preserving federated learning system enabling hospitals to collaboratively train diagnostic AI models without sharing patient data, achieving 91% accuracy on rare disease classification.', country: 'India', status: 'Pending', filingDate: '2023-05-22', ipcCode: 'G06N 20/00', inventors: ['Dr. Smita Ghosh', 'Dr. Tanveer Ahmed'], assignee: 'CMC Vellore', keywords: ['Federated Learning', 'Healthcare AI', 'Privacy', 'Distributed ML', 'Rare Disease'], technologyDomain: 'Healthcare AI', industry: ['Healthcare', 'Medical Research', 'Insurance'], trl: 5, commercialReadiness: 'Validated', claims: 16, familySize: 2, citations: 12, listingPrice: 4500000, isListed: true, isFeatured: false, views: 921, inquiries: 6, createdAt: '2023-05-22', updatedAt: '2024-03-10' },
  { id: 'p10', patentNumber: 'IN202141067890', title: 'Graphene-Enhanced Cement Composite for Ultra-High Strength Construction', abstract: 'Graphene oxide reinforced cement showing 180% improvement in compressive strength and 95% reduction in micro-cracking, enabling 40% material reduction in construction.', country: 'India', status: 'Granted', filingDate: '2021-08-17', grantDate: '2023-02-28', expiryDate: '2041-08-17', ipcCode: 'C04B 14/38', inventors: ['Prof. Rajan Menon', 'Dr. Shalini Devi'], assignee: 'BITS Pilani', keywords: ['Graphene', 'Cement', 'Construction', 'Nanocomposite', 'Strength'], technologyDomain: 'Construction Technology', industry: ['Construction', 'Infrastructure', 'Real Estate'], trl: 7, commercialReadiness: 'Market Ready', claims: 20, familySize: 4, citations: 38, listingPrice: 7000000, isListed: true, isFeatured: true, views: 2654, inquiries: 17, createdAt: '2021-08-17', updatedAt: '2024-06-01' },
];

// Additional 40 patents (abbreviated for space efficiency)
const additionalPatentTitles = [
  'Perovskite Solar Cell with 31% Efficiency and 25-Year Stability',
  'AI-Driven Drug Discovery Platform for Protein Folding',
  'Smart Grid Load Balancing using Reinforcement Learning',
  'Microplastic Filtration System using Biochar Membranes',
  'Wearable Sweat-Based Glucose Monitor with 98% Accuracy',
  'Autonomous Drone Swarm Coordination Protocol',
  'Blockchain-Based Land Registry and Title Verification',
  'Room-Temperature Superconducting Wire for Power Transmission',
  'Quantum Dot LED Display with 10,000 nit Brightness',
  'Neural Interface for Paralysis Patients — 256-Channel BCI',
  'Vertical Farming AI Optimization System',
  'Ceramic Thermal Barrier Coating for Gas Turbines (1800°C)',
  'P2P Energy Trading Platform for Microgrids',
  'Anti-Drone Electronic Countermeasure System',
  'Compressed Air Energy Storage using Aquifer Caverns',
  'mRNA Vaccine Delivery Nanoparticle Formulation',
  'Autonomous Underwater Vehicle Navigation System',
  'High-Performance Computing Cooling using Phase-Change Materials',
  'Bioprinted Cartilage for Orthopedic Regeneration',
  'AI-Powered Traffic Signal Optimization (40% Reduction)',
  'Carbon Capture using Ionic Liquid Solvents',
  'Photocatalytic Air Purification for Indoor Spaces',
  'DNA Data Storage at 1 Petabyte per Gram',
  'Tactile Sensing Skin for Surgical Robots',
  'Smart Concrete with Embedded Strain Sensors',
  'Hydrogen Fuel Cell for Two-Wheeler Applications',
  'Soft Robotic Gripper for Fragile Object Handling',
  'Terahertz Imaging for Pharmaceutical Quality Control',
  'Epigenetic Clock for Biological Age Determination',
  'Piezoelectric Floor Tiles for Energy Harvesting',
  'AI-Based Satellite Image Analysis for Crop Yield',
  'Zero-Liquid Discharge System for Textile Effluents',
  'Flexible Perovskite-CIGS Tandem Solar Module',
  'Neuroplasticity Stimulation Device for Stroke Rehab',
  'Smart Prosthetic Hand with Tactile Feedback',
  'Photonic Computing Chip for AI Inference (100x faster)',
  'Acoustic Levitation Drug Delivery System',
  'Bifacial Solar Panel Tracker with AI Optimization',
  'Anti-Counterfeiting Nanoparticle Security Label',
  'Soil Carbon Sequestration Measurement Platform',
];

const statuses: Patent['status'][] = ['Granted', 'Pending', 'Filed', 'Licensed', 'Granted', 'Granted'];
const domains = ['Artificial Intelligence', 'Biotechnology', 'Clean Technology', 'Materials Science', 'Semiconductor', 'Healthcare AI', 'Energy Storage', 'Cybersecurity', 'Robotics', 'Quantum Technology'];
const universities = ['IIT Bombay', 'IIT Delhi', 'IISc Bangalore', 'IIT Madras', 'TIFR Mumbai', 'NIT Trichy', 'BITS Pilani', 'AIIMS Delhi', 'IIT Hyderabad', 'JNCASR'];

for (let i = 0; i < additionalPatentTitles.length; i++) {
  const idx = i + 11;
  MOCK_PATENTS.push({
    id: `p${idx}`,
    patentNumber: `IN20${21 + (i % 3)}41${String(idx * 1234).padStart(6, '0')}`,
    title: additionalPatentTitles[i],
    abstract: `Advanced technology patent covering novel approaches in ${domains[i % domains.length]} with significant commercial potential in Indian and global markets.`,
    country: 'India',
    status: statuses[i % statuses.length],
    filingDate: `202${1 + (i % 3)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    grantDate: statuses[i % statuses.length] === 'Granted' ? `202${2 + (i % 2)}-${String((i % 12) + 1).padStart(2, '0')}-15` : undefined,
    expiryDate: `204${1 + (i % 3)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    ipcCode: ['G06N 3/04', 'H01M 10/05', 'C12N 15/10', 'B32B 5/02', 'H04L 9/08'][i % 5],
    inventors: [`Dr. Researcher ${idx}`, `Prof. Scientist ${idx}`],
    assignee: universities[i % universities.length],
    keywords: [domains[i % domains.length], 'Innovation', 'India', 'Patent'],
    technologyDomain: domains[i % domains.length],
    industry: [['Manufacturing', 'Healthcare', 'Energy', 'Agriculture', 'Defense'][i % 5]],
    trl: ((i % 9) + 1) as Patent['trl'],
    commercialReadiness: (['Concept', 'Prototype', 'Validated', 'Pilot', 'Market Ready', 'Commercial'] as const)[i % 6],
    claims: 10 + (i % 25),
    familySize: 1 + (i % 8),
    citations: i * 3 + (i % 15),
    listingPrice: (2 + (i % 20)) * 1000000,
    isListed: i % 3 !== 0,
    isFeatured: i % 7 === 0,
    views: Math.floor(Math.random() * 3000) + 200,
    inquiries: Math.floor(Math.random() * 25) + 1,
    createdAt: `202${1 + (i % 3)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
    updatedAt: '2024-07-01',
  });
}

// ─── COMPANIES ────────────────────────────────────────────────
export const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'Tata Innovations', type: 'Enterprise', industry: 'Conglomerate', country: 'India', size: 'Enterprise', revenue: 128000000000, employees: 935000, technologyNeeds: ['AI', 'Energy Storage', 'Materials'], ipBudget: 50000000, matchScore: 94 },
  { id: 'c2', name: 'Siemens Healthineers India', type: 'Enterprise', industry: 'Medical Technology', country: 'India', size: 'Enterprise', revenue: 5800000000, employees: 4200, technologyNeeds: ['Diagnostics', 'AI/ML', 'Imaging'], ipBudget: 15000000, matchScore: 91 },
  { id: 'c3', name: 'NexaGen AI', type: 'Startup', industry: 'Artificial Intelligence', country: 'India', size: 'Small', revenue: 2000000, employees: 47, technologyNeeds: ['NLP', 'Computer Vision', 'Edge AI'], ipBudget: 1000000, matchScore: 88 },
  { id: 'c4', name: 'GreenPack Technologies', type: 'Startup', industry: 'Sustainable Packaging', country: 'India', size: 'Small', revenue: 800000, employees: 23, technologyNeeds: ['Bioplastics', 'Nanocomposites'], ipBudget: 500000, matchScore: 96 },
  { id: 'c5', name: 'Ola Electric', type: 'Enterprise', industry: 'Electric Vehicles', country: 'India', size: 'Large', revenue: 1200000000, employees: 3500, technologyNeeds: ['Battery Tech', 'Motor Control', 'BMS'], ipBudget: 25000000, matchScore: 97 },
  { id: 'c6', name: 'Mahindra Research Valley', type: 'Enterprise', industry: 'Automotive', country: 'India', size: 'Enterprise', revenue: 22000000000, employees: 260000, technologyNeeds: ['EV', 'Autonomy', 'Materials'], ipBudget: 40000000, matchScore: 85 },
  { id: 'c7', name: 'BioSynth Diagnostics', type: 'Startup', industry: 'Diagnostics', country: 'India', size: 'Medium', revenue: 4500000, employees: 120, technologyNeeds: ['CRISPR', 'Microfluidics', 'POC'], ipBudget: 2000000, matchScore: 93 },
  { id: 'c8', name: 'Adani New Industries', type: 'Enterprise', industry: 'Clean Energy', country: 'India', size: 'Enterprise', revenue: 8000000000, employees: 15000, technologyNeeds: ['Solar', 'Battery', 'Hydrogen'], ipBudget: 100000000, matchScore: 89 },
  { id: 'c9', name: 'HCL Technologies IP Division', type: 'Enterprise', industry: 'Information Technology', country: 'India', size: 'Enterprise', revenue: 12700000000, employees: 227000, technologyNeeds: ['Cybersecurity', 'Cloud AI', 'Blockchain'], ipBudget: 30000000, matchScore: 82 },
  { id: 'c10', name: 'Niramai Health Analytix', type: 'Startup', industry: 'Healthcare AI', country: 'India', size: 'Small', revenue: 1200000, employees: 65, technologyNeeds: ['Medical AI', 'Thermography', 'Diagnostics'], ipBudget: 800000, matchScore: 87 },
  { id: 'c11', name: 'Reliance New Energy', type: 'Enterprise', industry: 'Renewable Energy', country: 'India', size: 'Enterprise', revenue: 102000000000, employees: 236000, technologyNeeds: ['Solar Cells', 'Hydrogen', 'Battery'], ipBudget: 200000000, matchScore: 90 },
  { id: 'c12', name: 'SteelBird Technologies', type: 'Enterprise', industry: 'Automotive Components', country: 'India', size: 'Large', revenue: 800000000, employees: 8000, technologyNeeds: ['Coatings', 'Composites', 'Sensors'], ipBudget: 5000000, matchScore: 84 },
  { id: 'c13', name: 'Cyient Defense', type: 'Enterprise', industry: 'Defense Technology', country: 'India', size: 'Large', revenue: 950000000, employees: 15000, technologyNeeds: ['Drones', 'Sensors', 'Cybersecurity', 'Navigation'], ipBudget: 20000000, matchScore: 91 },
  { id: 'c14', name: 'AgriTech Vision', type: 'Startup', industry: 'AgriTech', country: 'India', size: 'Small', revenue: 500000, employees: 18, technologyNeeds: ['AI', 'Satellite Imaging', 'IoT Sensors'], ipBudget: 200000, matchScore: 78 },
  { id: 'c15', name: 'Dr. Reddy\'s Laboratories', type: 'Enterprise', industry: 'Pharmaceuticals', country: 'India', size: 'Enterprise', revenue: 3200000000, employees: 24000, technologyNeeds: ['Drug Delivery', 'Biotech', 'Formulation'], ipBudget: 35000000, matchScore: 86 },
];

// ─── DEALS ────────────────────────────────────────────────────
export const MOCK_DEALS: Deal[] = [
  {
    id: 'd1', patentId: 'p3', patentTitle: 'Solid-State Lithium-Sulfur Battery', licenseeId: 'c5',
    licenseeName: 'Ola Electric', licensorId: 'u1', licensorName: 'TIFR Mumbai',
    status: 'Active', licenseType: 'Exclusive', territory: ['India', 'Southeast Asia'],
    duration: 10, upfrontFee: 5000000, royaltyRate: 7, minimumRoyalty: 500000, currency: 'USD',
    startDate: '2024-01-01', endDate: '2034-01-01',
    milestones: [
      { id: 'm1', title: 'First commercial production run', dueDate: '2024-06-01', amount: 500000, status: 'Met' },
      { id: 'm2', title: '10,000 unit deployment', dueDate: '2024-12-31', amount: 750000, status: 'Pending' },
    ],
    createdAt: '2023-10-15', updatedAt: '2024-06-01',
  },
  {
    id: 'd2', patentId: 'p1', patentTitle: 'AI-Powered Predictive Maintenance System', licenseeId: 'c1',
    licenseeName: 'Tata Innovations', licensorId: 'u1', licensorName: 'IIT Bombay',
    status: 'Negotiating', licenseType: 'Non-Exclusive', territory: ['India'],
    duration: 5, upfrontFee: 750000, royaltyRate: 4.5, currency: 'USD',
    milestones: [],
    createdAt: '2024-03-01', updatedAt: '2024-06-15',
  },
  {
    id: 'd3', patentId: 'p2', patentTitle: 'Biodegradable Nano-Composite Packaging', licenseeId: 'c4',
    licenseeName: 'GreenPack Technologies', licensorId: 'u1', licensorName: 'IISc Bangalore',
    status: 'NDA Signed', licenseType: 'Exclusive', territory: ['India', 'ASEAN'],
    duration: 7, upfrontFee: 1200000, royaltyRate: 5.5, currency: 'USD',
    milestones: [],
    createdAt: '2024-04-10', updatedAt: '2024-06-20',
  },
  {
    id: 'd4', patentId: 'p5', patentTitle: 'CRISPR-Based Rapid Pathogen Detection', licenseeId: 'c7',
    licenseeName: 'BioSynth Diagnostics', licensorId: 'u2', licensorName: 'AIIMS Delhi',
    status: 'Term Sheet', licenseType: 'Non-Exclusive', territory: ['India', 'SAARC'],
    duration: 8, upfrontFee: 1500000, royaltyRate: 6, currency: 'USD',
    milestones: [
      { id: 'm3', title: 'CDSCO regulatory filing', dueDate: '2025-03-01', amount: 200000, status: 'Pending' },
    ],
    createdAt: '2024-02-15', updatedAt: '2024-06-25',
  },
  {
    id: 'd5', patentId: 'p8', patentTitle: 'Atmospheric Water Generation System', licenseeId: 'c8',
    licenseeName: 'Adani New Industries', licensorId: 'u2', licensorName: 'JNCASR',
    status: 'Signed', licenseType: 'Co-Exclusive', territory: ['India', 'Middle East', 'Africa'],
    duration: 15, upfrontFee: 3000000, royaltyRate: 5, minimumRoyalty: 300000, currency: 'USD',
    startDate: '2023-06-01', endDate: '2038-06-01',
    milestones: [
      { id: 'm4', title: 'Pilot plant 100 unit deployment', dueDate: '2023-12-01', amount: 500000, status: 'Met' },
      { id: 'm5', title: 'Commercial plant commissioning', dueDate: '2024-09-01', amount: 1000000, status: 'Pending' },
    ],
    createdAt: '2023-03-01', updatedAt: '2024-06-01',
  },
];

// ─── ROYALTIES ────────────────────────────────────────────────
export const MOCK_ROYALTIES: Royalty[] = [
  { id: 'r1', dealId: 'd1', patentTitle: 'Solid-State Lithium-Sulfur Battery', licenseeName: 'Ola Electric', period: 'Q2 2024', amount: 875000, currency: 'USD', status: 'Received', dueDate: '2024-07-15', receivedDate: '2024-07-10' },
  { id: 'r2', dealId: 'd1', patentTitle: 'Solid-State Lithium-Sulfur Battery', licenseeName: 'Ola Electric', period: 'Q1 2024', amount: 650000, currency: 'USD', status: 'Received', dueDate: '2024-04-15', receivedDate: '2024-04-12' },
  { id: 'r3', dealId: 'd5', patentTitle: 'Atmospheric Water Generation', licenseeName: 'Adani New Industries', period: 'Q2 2024', amount: 350000, currency: 'USD', status: 'Received', dueDate: '2024-07-15', receivedDate: '2024-07-08' },
  { id: 'r4', dealId: 'd5', patentTitle: 'Atmospheric Water Generation', licenseeName: 'Adani New Industries', period: 'Q1 2024', amount: 300000, currency: 'USD', status: 'Received', dueDate: '2024-04-15', receivedDate: '2024-04-14' },
  { id: 'r5', dealId: 'd2', patentTitle: 'AI-Powered Predictive Maintenance', licenseeName: 'Tata Innovations', period: 'Q3 2024', amount: 425000, currency: 'USD', status: 'Pending', dueDate: '2024-10-15' },
  { id: 'r6', dealId: 'd4', patentTitle: 'CRISPR-Based Rapid Pathogen Detection', licenseeName: 'BioSynth Diagnostics', period: 'Q3 2024', amount: 280000, currency: 'USD', status: 'Pending', dueDate: '2024-10-01' },
  { id: 'r7', dealId: 'd3', patentTitle: 'Biodegradable Nano-Composite Packaging', licenseeName: 'GreenPack Technologies', period: 'Q2 2024', amount: 190000, currency: 'USD', status: 'Overdue', dueDate: '2024-07-01' },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'deal', title: 'New Deal Inquiry', message: 'Siemens Healthineers has requested licensing terms for Patent IN202341012345', read: false, createdAt: new Date(Date.now() - 1800000).toISOString(), link: '/deals/d1' },
  { id: 'n2', type: 'royalty', title: 'Royalty Payment Received', message: 'Ola Electric has paid Q2 2024 royalty of $875,000', read: false, createdAt: new Date(Date.now() - 7200000).toISOString(), link: '/royalties' },
  { id: 'n3', type: 'ai', title: 'AI Analysis Complete', message: 'AI report generated for patent: Quantum-Resistant Cryptographic Protocol', read: false, createdAt: new Date(Date.now() - 14400000).toISOString(), link: '/patents/p4' },
  { id: 'n4', type: 'deal', title: 'NDA Signed', message: 'GreenPack Technologies has signed the NDA for biodegradable packaging patent', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'n5', type: 'patent', title: 'Patent Granted', message: 'IN202341012345 has been officially granted by Indian Patent Office', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'n6', type: 'royalty', title: 'Royalty Overdue', message: 'GreenPack Technologies Q2 2024 royalty payment is overdue by 6 days', read: false, createdAt: new Date(Date.now() - 518400000).toISOString() },
  { id: 'n7', type: 'message', title: 'New Message from Ola Electric', message: 'Vikram Singh has sent you a message regarding milestone progress', read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

// ─── CHART DATA ───────────────────────────────────────────────
export const REVENUE_TREND = [
  { month: 'Jan 2024', revenue: 1250000, deals: 3, inquiries: 12 },
  { month: 'Feb 2024', revenue: 1480000, deals: 4, inquiries: 18 },
  { month: 'Mar 2024', revenue: 1320000, deals: 3, inquiries: 15 },
  { month: 'Apr 2024', revenue: 1750000, deals: 5, inquiries: 22 },
  { month: 'May 2024', revenue: 1920000, deals: 6, inquiries: 27 },
  { month: 'Jun 2024', revenue: 2100000, deals: 7, inquiries: 31 },
  { month: 'Jul 2024', revenue: 2350000, deals: 8, inquiries: 35 },
];

export const LICENSING_FUNNEL = [
  { stage: 'Patent Listed', count: 127, value: 0 },
  { stage: 'Inquiries Received', count: 89, value: 0 },
  { stage: 'NDA Signed', count: 43, value: 0 },
  { stage: 'Negotiations', count: 22, value: 0 },
  { stage: 'Term Sheet', count: 11, value: 0 },
  { stage: 'Deal Signed', count: 6, value: 0 },
];

export const DOMAIN_BREAKDOWN = [
  { domain: 'Artificial Intelligence', count: 24, revenue: 8500000 },
  { domain: 'Biotechnology', count: 18, revenue: 12200000 },
  { domain: 'Clean Technology', count: 16, revenue: 6800000 },
  { domain: 'Materials Science', count: 14, revenue: 5400000 },
  { domain: 'Semiconductor', count: 11, revenue: 4200000 },
  { domain: 'Healthcare AI', count: 9, revenue: 3700000 },
  { domain: 'Energy Storage', count: 8, revenue: 9100000 },
  { domain: 'Cybersecurity', count: 7, revenue: 2800000 },
  { domain: 'Others', count: 13, revenue: 3100000 },
];

export const UNIVERSITY_DEPARTMENTS = [
  { dept: 'Electrical Engineering', patents: 47, licensed: 18, revenue: 12500000 },
  { dept: 'Biotechnology', patents: 38, licensed: 12, revenue: 8700000 },
  { dept: 'Computer Science', patents: 52, licensed: 21, revenue: 15200000 },
  { dept: 'Mechanical Engineering', patents: 33, licensed: 9, revenue: 5400000 },
  { dept: 'Chemical Engineering', patents: 29, licensed: 7, revenue: 6100000 },
  { dept: 'Materials Science', patents: 24, licensed: 6, revenue: 4800000 },
  { dept: 'Physics', patents: 19, licensed: 4, revenue: 3200000 },
  { dept: 'Civil Engineering', patents: 16, licensed: 3, revenue: 2100000 },
];

export const MATCH_SCORES_DATA = [
  { company: 'Ola Electric', score: 97, industry: 'EV', patents: 3 },
  { company: 'Amcor PLC', score: 96, industry: 'Packaging', patents: 1 },
  { company: 'Dr. Lal PathLabs', score: 95, industry: 'Diagnostics', patents: 2 },
  { company: 'Siemens AG', score: 94, industry: 'Industrial', patents: 4 },
  { company: 'Samsung SDI', score: 94, industry: 'Battery', patents: 2 },
  { company: 'DRDO', score: 92, industry: 'Defense', patents: 5 },
  { company: 'Molbio Diagnostics', score: 93, industry: 'Diagnostics', patents: 2 },
  { company: 'Reliance New Energy', score: 90, industry: 'Energy', patents: 6 },
];

export const PLATFORM_STATS = {
  totalPatents: 387,
  listedPatents: 127,
  grantedPatents: 243,
  pendingPatents: 89,
  totalDeals: 47,
  activeDeals: 12,
  completedDeals: 35,
  totalRevenue: 145000000,
  totalRoyalties: 28500000,
  totalUsers: 1247,
  totalCompanies: 389,
  totalUniversities: 24,
  avgMatchScore: 87,
  totalInquiries: 892,
};


