import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './layouts/AppShell';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OTPPage, ForgotPasswordPage } from './pages/auth/OTPPage';
import { DashboardRouter } from './router/DashboardRouter';
import { PlaceholderPage } from './pages/PlaceholderPage';

// Phase 2 — Patent System
import { PatentPortfolioPage } from './pages/patents/PatentPortfolioPage';
import { PatentUploadPage } from './pages/patents/PatentUploadPage';
import { PatentBulkUploadPage } from './pages/patents/PatentBulkUploadPage';
import { PatentDetailPage } from './pages/patents/PatentDetailPage';

// Phase 3 — AI Intelligence Engine
import { AIAnalysisDashboard } from './pages/ai/AIAnalysisDashboard';
import { AIReportPage } from './pages/ai/AIReportPage';

// Marketplace, Deals, Royalties
import { MarketplacePage } from './pages/marketplace/MarketplacePage';
import { DealsPage } from './pages/deals/DealsPage';
import { RoyaltiesPage } from './pages/royalties/RoyaltiesPage';

// Phase 4 — Matching & Messaging Engine
import { AIMatchPage } from './pages/ai/AIMatchPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { SavedPatentsPage } from './pages/patents/SavedPatentsPage';

// Milestone 1 - Sub-Dashboards & Features
import { DealDetailsPage } from './pages/deals/DealDetailsPage';
import { LicensingEnginePage } from './pages/marketplace/LicensingEnginePage';
import { AcquisitionsPage } from './pages/deals/AcquisitionsPage';
import { DueDiligencePage } from './pages/deals/DueDiligencePage';
import { CommissionTrackerPage } from './pages/royalties/CommissionTrackerPage';
import { DepartmentsPage } from './pages/dashboards/DepartmentsPage';
import { InventorsPage } from './pages/dashboards/InventorsPage';

// Milestone 1 - Admin Suite
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { OrganizationsPage } from './pages/admin/OrganizationsPage';
import { PatentAdminPage } from './pages/admin/PatentAdminPage';
import { DealAdminPage } from './pages/admin/DealAdminPage';
import { AIAdminPage } from './pages/admin/AIAdminPage';
import { ModerationPage } from './pages/admin/ModerationPage';
import { RoyaltyAdminPage } from './pages/admin/RoyaltyAdminPage';
import { SubscriptionsPage } from './pages/admin/SubscriptionsPage';
import { PlatformAnalyticsPage } from './pages/admin/PlatformAnalyticsPage';
import { ReportsAdminPage } from './pages/admin/ReportsAdminPage';
import { SupportAdminPage } from './pages/admin/SupportAdminPage';
import { LogsPage } from './pages/admin/LogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/verify-otp" element={<OTPPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* App routes (protected by AppShell) */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardRouter />} />

            {/* Patents */}
            <Route path="/patents" element={<PatentPortfolioPage />} />
            <Route path="/patents/upload" element={<PatentUploadPage />} />
            <Route path="/patents/bulk-upload" element={<PatentBulkUploadPage />} />
            <Route path="/patents/:id" element={<PatentDetailPage />} />
            <Route path="/patents/saved" element={<SavedPatentsPage />} />

            {/* Phase 3 — AI Intelligence Engine */}
            <Route path="/ai-analysis" element={<AIAnalysisDashboard />} />
            <Route path="/ai-analysis/:id" element={<AIReportPage />} />
            <Route path="/ai-match" element={<AIMatchPage />} />

            {/* Marketplace, Deals, Royalties */}
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/deals/:id" element={<DealDetailsPage />} />
            <Route path="/royalties" element={<RoyaltiesPage />} />

            {/* Phase 4 — Matching & Messaging */}
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/licensing" element={<LicensingEnginePage />} />
            <Route path="/saved" element={<SavedPatentsPage />} />
            <Route path="/portfolio" element={<PatentPortfolioPage />} />
            <Route path="/acquisitions" element={<AcquisitionsPage />} />
            <Route path="/due-diligence" element={<DueDiligencePage />} />
            <Route path="/commissions" element={<CommissionTrackerPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/inventors" element={<InventorsPage />} />

            {/* Admin routes */}
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/organizations" element={<OrganizationsPage />} />
            <Route path="/admin/patents" element={<PatentAdminPage />} />
            <Route path="/admin/deals" element={<DealAdminPage />} />
            <Route path="/admin/ai" element={<AIAdminPage />} />
            <Route path="/admin/moderation" element={<ModerationPage />} />
            <Route path="/admin/royalties" element={<RoyaltyAdminPage />} />
            <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
            <Route path="/admin/reports" element={<ReportsAdminPage />} />
            <Route path="/admin/support" element={<SupportAdminPage />} />
            <Route path="/admin/logs" element={<LogsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />

            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
