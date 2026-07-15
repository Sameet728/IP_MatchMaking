-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('INVENTOR', 'UNIVERSITY', 'STARTUP', 'ENTERPRISE', 'BROKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "PatentStatus" AS ENUM ('PROVISIONAL', 'FILED', 'PUBLISHED', 'GRANTED', 'ABANDONED', 'EXPIRED', 'LICENSED');

-- CreateEnum
CREATE TYPE "PatentType" AS ENUM ('UTILITY', 'DESIGN', 'PLANT', 'PCT', 'CONTINUATION', 'DIVISIONAL');

-- CreateEnum
CREATE TYPE "TechDomain" AS ENUM ('AI_ML', 'BIOTECH', 'CLEAN_TECH', 'SEMICONDUCTOR', 'HEALTHCARE', 'ENERGY', 'AGRICULTURE', 'MANUFACTURING', 'MATERIALS', 'DEFENSE', 'IT_SOFTWARE', 'AUTOMOTIVE', 'PHARMA', 'NANOTECHNOLOGY', 'OTHER');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('INQUIRY', 'NDA_SENT', 'NDA_SIGNED', 'TERM_SHEET', 'DUE_DILIGENCE', 'NEGOTIATING', 'AGREEMENT_DRAFT', 'SIGNED', 'ACTIVE', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('EXCLUSIVE_LICENSE', 'NON_EXCLUSIVE_LICENSE', 'CROSS_LICENSE', 'ASSIGNMENT', 'JOINT_VENTURE', 'SPONSORED_RESEARCH', 'OPTION_AGREEMENT');

-- CreateEnum
CREATE TYPE "RoyaltyStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'DISPUTED', 'WAIVED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'FILE', 'DEAL_PROPOSAL', 'NDA_REQUEST', 'COUNTER_OFFER', 'SYSTEM', 'MILESTONE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DEAL', 'PATENT', 'AI', 'ROYALTY', 'MESSAGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('AI_PORTFOLIO', 'VALUATION', 'COMMERCIALIZATION', 'BUYER_MATCH', 'DEAL_SUMMARY', 'ROYALTY_COLLECTION', 'PLATFORM_ANALYTICS');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATING', 'READY', 'FAILED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV', 'JSON');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UserRole" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "pincode" TEXT,
    "logo" TEXT,
    "universityId" TEXT,
    "dstRating" TEXT,
    "naacGrade" TEXT,
    "cin" TEXT,
    "gstin" TEXT,
    "industry" TEXT,
    "employeeCount" INTEGER,
    "revenue" DOUBLE PRECISION,
    "stage" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "phone" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "designation" TEXT,
    "linkedinUrl" TEXT,
    "googleScholar" TEXT,
    "organizationId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "refreshTokenExp" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "patentNumber" TEXT,
    "applicationNumber" TEXT,
    "status" "PatentStatus" NOT NULL DEFAULT 'FILED',
    "type" "PatentType" NOT NULL DEFAULT 'UTILITY',
    "filingDate" TIMESTAMP(3),
    "grantDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "publicationDate" TIMESTAMP(3),
    "country" TEXT NOT NULL DEFAULT 'India',
    "ipcCodes" TEXT[],
    "cpcCodes" TEXT[],
    "abstract" TEXT NOT NULL,
    "description" TEXT,
    "claims" TEXT,
    "domain" "TechDomain" NOT NULL,
    "subDomain" TEXT,
    "keywords" TEXT[],
    "trl" INTEGER NOT NULL DEFAULT 1,
    "isListed" BOOLEAN NOT NULL DEFAULT false,
    "listingDate" TIMESTAMP(3),
    "askingPrice" DOUBLE PRECISION,
    "royaltyRate" DOUBLE PRECISION,
    "licenseType" TEXT,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "inventorId" TEXT NOT NULL,
    "organizationId" TEXT,
    "coInventors" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "inquiryCount" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatentDocument" (
    "id" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatentFamily" (
    "id" TEXT NOT NULL,
    "primaryPatentId" TEXT NOT NULL,
    "memberPatentId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,

    CONSTRAINT "PatentFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReport" (
    "id" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "noveltyScore" INTEGER NOT NULL,
    "commercialScore" INTEGER NOT NULL,
    "marketFitScore" INTEGER NOT NULL,
    "legalStrength" INTEGER NOT NULL,
    "techReadiness" INTEGER NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "opportunities" TEXT[],
    "threats" TEXT[],
    "targetMarket" TEXT NOT NULL,
    "tamValue" DOUBLE PRECISION,
    "samValue" DOUBLE PRECISION,
    "somValue" DOUBLE PRECISION,
    "marketGrowthRate" DOUBLE PRECISION,
    "revenueProjections" JSONB,
    "competitors" JSONB,
    "licensingStrategy" TEXT NOT NULL,
    "recommendedModel" TEXT NOT NULL,
    "recommendedUpfront" DOUBLE PRECISION,
    "recommendedRoyalty" DOUBLE PRECISION,
    "minimumRoyalty" DOUBLE PRECISION,
    "risks" JSONB,
    "topBuyers" JSONB,
    "executiveSummary" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAnalysisJob" (
    "id" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIAnalysisJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "domains" "TechDomain"[],
    "keywords" TEXT[],
    "minTrl" INTEGER NOT NULL DEFAULT 1,
    "maxBudget" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" TEXT NOT NULL,
    "matchRequestId" TEXT,
    "patentId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "reasons" TEXT[],
    "risks" TEXT[],
    "dealProbability" INTEGER NOT NULL,
    "estimatedRevenue" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'new',
    "contactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'INQUIRY',
    "type" "DealType" NOT NULL DEFAULT 'NON_EXCLUSIVE_LICENSE',
    "upfrontFee" DOUBLE PRECISION,
    "royaltyRate" DOUBLE PRECISION,
    "minimumRoyalty" DOUBLE PRECISION,
    "maximumLiability" DOUBLE PRECISION,
    "duration" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "territory" TEXT[] DEFAULT ARRAY['India']::TEXT[],
    "sublicensing" BOOLEAN NOT NULL DEFAULT false,
    "sublicenseRate" DOUBLE PRECISION,
    "exclusiveField" TEXT,
    "ndaSignedAt" TIMESTAMP(3),
    "termSheetAt" TIMESTAMP(3),
    "agreementAt" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "notes" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealParticipant" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "DealParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealPatent" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,

    CONSTRAINT "DealPatent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealMilestone" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "fileName" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "proposal" JSONB,
    "readBy" TEXT[],
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Royalty" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "patentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "period" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "RoyaltyStatus" NOT NULL DEFAULT 'PENDING',
    "paymentRef" TEXT,
    "invoiceUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Royalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPatent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patentId" TEXT NOT NULL,
    "notes" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPatent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATING',
    "format" "ReportFormat" NOT NULL DEFAULT 'PDF',
    "period" TEXT,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "pageCount" INTEGER,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "params" JSONB,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "yearlyPrice" DOUBLE PRECISION,
    "features" TEXT[],
    "maxPatents" INTEGER,
    "maxDeals" INTEGER,
    "maxUsers" INTEGER,
    "aiCredits" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Patent_patentNumber_key" ON "Patent"("patentNumber");

-- CreateIndex
CREATE INDEX "Patent_status_idx" ON "Patent"("status");

-- CreateIndex
CREATE INDEX "Patent_domain_idx" ON "Patent"("domain");

-- CreateIndex
CREATE INDEX "Patent_inventorId_idx" ON "Patent"("inventorId");

-- CreateIndex
CREATE INDEX "Patent_isListed_idx" ON "Patent"("isListed");

-- CreateIndex
CREATE INDEX "Patent_patentNumber_idx" ON "Patent"("patentNumber");

-- CreateIndex
CREATE INDEX "PatentDocument_patentId_idx" ON "PatentDocument"("patentId");

-- CreateIndex
CREATE UNIQUE INDEX "PatentFamily_primaryPatentId_memberPatentId_key" ON "PatentFamily"("primaryPatentId", "memberPatentId");

-- CreateIndex
CREATE UNIQUE INDEX "AIReport_patentId_key" ON "AIReport"("patentId");

-- CreateIndex
CREATE INDEX "AIReport_patentId_idx" ON "AIReport"("patentId");

-- CreateIndex
CREATE INDEX "AIAnalysisJob_patentId_idx" ON "AIAnalysisJob"("patentId");

-- CreateIndex
CREATE INDEX "AIAnalysisJob_userId_idx" ON "AIAnalysisJob"("userId");

-- CreateIndex
CREATE INDEX "AIAnalysisJob_status_idx" ON "AIAnalysisJob"("status");

-- CreateIndex
CREATE INDEX "MatchResult_patentId_idx" ON "MatchResult"("patentId");

-- CreateIndex
CREATE INDEX "MatchResult_matchRequestId_idx" ON "MatchResult"("matchRequestId");

-- CreateIndex
CREATE INDEX "Deal_status_idx" ON "Deal"("status");

-- CreateIndex
CREATE INDEX "Deal_companyId_idx" ON "Deal"("companyId");

-- CreateIndex
CREATE INDEX "DealParticipant_dealId_idx" ON "DealParticipant"("dealId");

-- CreateIndex
CREATE INDEX "DealParticipant_userId_idx" ON "DealParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DealParticipant_dealId_userId_key" ON "DealParticipant"("dealId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DealPatent_dealId_patentId_key" ON "DealPatent"("dealId", "patentId");

-- CreateIndex
CREATE INDEX "DealMilestone_dealId_idx" ON "DealMilestone"("dealId");

-- CreateIndex
CREATE INDEX "Message_dealId_idx" ON "Message"("dealId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Royalty_dealId_idx" ON "Royalty"("dealId");

-- CreateIndex
CREATE INDEX "Royalty_status_idx" ON "Royalty"("status");

-- CreateIndex
CREATE INDEX "Royalty_dueDate_idx" ON "Royalty"("dueDate");

-- CreateIndex
CREATE INDEX "SavedPatent_userId_idx" ON "SavedPatent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPatent_userId_patentId_key" ON "SavedPatent"("userId", "patentId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patent" ADD CONSTRAINT "Patent_inventorId_fkey" FOREIGN KEY ("inventorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patent" ADD CONSTRAINT "Patent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatentDocument" ADD CONSTRAINT "PatentDocument_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "Patent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatentFamily" ADD CONSTRAINT "PatentFamily_primaryPatentId_fkey" FOREIGN KEY ("primaryPatentId") REFERENCES "Patent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatentFamily" ADD CONSTRAINT "PatentFamily_memberPatentId_fkey" FOREIGN KEY ("memberPatentId") REFERENCES "Patent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIReport" ADD CONSTRAINT "AIReport_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "Patent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysisJob" ADD CONSTRAINT "AIAnalysisJob_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "Patent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysisJob" ADD CONSTRAINT "AIAnalysisJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRequest" ADD CONSTRAINT "MatchRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_matchRequestId_fkey" FOREIGN KEY ("matchRequestId") REFERENCES "MatchRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "Patent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealParticipant" ADD CONSTRAINT "DealParticipant_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealParticipant" ADD CONSTRAINT "DealParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealPatent" ADD CONSTRAINT "DealPatent_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealPatent" ADD CONSTRAINT "DealPatent_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "Patent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealMilestone" ADD CONSTRAINT "DealMilestone_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Royalty" ADD CONSTRAINT "Royalty_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Royalty" ADD CONSTRAINT "Royalty_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "Patent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPatent" ADD CONSTRAINT "SavedPatent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPatent" ADD CONSTRAINT "SavedPatent_patentId_fkey" FOREIGN KEY ("patentId") REFERENCES "Patent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

