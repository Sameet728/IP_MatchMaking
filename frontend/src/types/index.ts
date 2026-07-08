// ============================================================
// IP Commercialization OS — Core Type Definitions
// ============================================================

// ----- USER & AUTH -----

export type UserRole =
  | 'inventor'
  | 'university'
  | 'startup'
  | 'enterprise'
  | 'broker'
  | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  verified: boolean;
  createdAt: string;
  profile?: InventorProfile | UniversityProfile | StartupProfile | EnterpriseProfile | BrokerProfile;
}

export interface InventorProfile {
  patents: number;
  licensedPatents: number;
  totalRoyalties: number;
  institution: string;
  department: string;
  expertise: string[];
}

export interface UniversityProfile {
  name: string;
  departments: number;
  totalPatents: number;
  licensedPatents: number;
  totalRevenue: number;
  ranking?: number;
}

export interface StartupProfile {
  company: string;
  industry: string;
  stage: 'Pre-seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C+';
  fundingRaised: number;
  technologyNeeds: string[];
}

export interface EnterpriseProfile {
  company: string;
  industry: string;
  annualRevenue: number;
  ipBudget: number;
  acquisitions: number;
}

export interface BrokerProfile {
  dealsCompleted: number;
  totalCommissions: number;
  activeDeals: number;
  specializations: string[];
}

// ----- PATENT -----

export type PatentStatus =
  | 'Filed'
  | 'Pending'
  | 'Granted'
  | 'Licensed'
  | 'Abandoned'
  | 'Expired'
  | 'Opposition';

export type TRLLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CommercialReadiness =
  | 'Concept'
  | 'Prototype'
  | 'Validated'
  | 'Pilot'
  | 'Market Ready'
  | 'Commercial';

export interface Patent {
  id: string;
  patentNumber: string;
  title: string;
  abstract: string;
  country: string;
  status: PatentStatus;
  filingDate: string;
  grantDate?: string;
  expiryDate?: string;
  ipcCode: string;
  cpcCode?: string;
  inventors: string[];
  assignee: string;
  keywords: string[];
  technologyDomain: string;
  industry: string[];
  trl: TRLLevel;
  commercialReadiness: CommercialReadiness;
  claims: number;
  familySize: number;
  citations: number;
  aiReport?: AIReport;
  listingPrice?: number;
  isListed: boolean;
  isFeatured?: boolean;
  views: number;
  inquiries: number;
  createdAt: string;
  updatedAt: string;
}

// ----- AI REPORT -----

export interface AIReport {
  id: string;
  patentId: string;
  generatedAt: string;
  noveltyScore: number;           // 0-100
  commercialScore: number;        // 0-100
  marketFitScore: number;         // 0-100
  legalStrength: number;          // 0-100
  techReadiness: number;          // 0-100
  investmentReadiness: number;    // 0-100
  licensingReadiness: number;     // 0-100
  overallScore: number;           // 0-100
  summary: string;
  technicalSummary: string;
  commercialSummary: string;
  noveltyAnalysis: string;
  competitiveAdvantage: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  industryFit: string[];
  potentialBuyers: PotentialBuyer[];
  licensingStrategy: string;
  valuationEstimate: {
    low: number;
    mid: number;
    high: number;
    currency: string;
  };
  suggestedLicensingPrice: {
    upfront: number;
    royaltyRate: number;
    currency: string;
  };
  technologyTags: string[];
  sdgMapping: string[];
  governmentSchemes: string[];
  riskFactors: string[];
  monetizationOptions: string[];
}

export interface PotentialBuyer {
  company: string;
  industry: string;
  matchScore: number;
  reasoning: string;
  contactSuggestion: string;
}

// ----- DEAL & LICENSE -----

export type DealStatus =
  | 'Inquiry'
  | 'NDA Signed'
  | 'Negotiating'
  | 'Term Sheet'
  | 'Due Diligence'
  | 'Signed'
  | 'Active'
  | 'Completed'
  | 'Terminated';

export type LicenseType =
  | 'Exclusive'
  | 'Non-Exclusive'
  | 'Co-Exclusive'
  | 'Sub-licensable'
  | 'Assignment';

export interface Deal {
  id: string;
  patentId: string;
  patentTitle: string;
  licenseeId: string;
  licenseeName: string;
  licensorId: string;
  licensorName: string;
  brokerId?: string;
  status: DealStatus;
  licenseType: LicenseType;
  territory: string[];
  duration: number; // years
  upfrontFee: number;
  royaltyRate: number;
  minimumRoyalty?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  patents?: any[];
  company?: any;
  type?: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  amount?: number;
  status: 'Pending' | 'Met' | 'Overdue' | 'Waived';
}

// ----- ROYALTY -----

export interface Royalty {
  id: string;
  dealId: string;
  patentTitle: string;
  licenseeName: string;
  period: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Received' | 'Overdue' | 'Disputed';
  dueDate: string;
  receivedDate?: string;
}

// ----- COMPANY -----

export interface Company {
  id: string;
  name: string;
  type: 'Startup' | 'Enterprise' | 'University' | 'Research Institute' | 'Government';
  industry: string;
  country: string;
  size: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  revenue?: number;
  employees?: number;
  technologyNeeds: string[];
  ipBudget?: number;
  logo?: string;
  matchScore?: number;
}

// ----- ANALYTICS -----

export interface DashboardKPI {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  value?: number;
}

// ----- NOTIFICATION -----

export interface Notification {
  id: string;
  type: 'deal' | 'patent' | 'royalty' | 'message' | 'system' | 'ai';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// ----- MESSAGING -----

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments?: string[];
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  dealId?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  subject: string;
}
