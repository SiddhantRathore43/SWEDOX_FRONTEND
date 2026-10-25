import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminGuard from "@/components/admin/admin-guard";
import { ComingSoon } from "@/components/dashboard/coming-soon";
import RequireAuth from "@/components/dashboard/require-auth";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ShieldCheck, WalletCards } from "lucide-react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/about";
import Contact from "./pages/contact";
import { DashboardShell } from "./components/vyonixpay/dashboard-shell";
import AdminPage from "./pages/dashboard/admin";
import BillPaymentPage from "./pages/dashboard/bill-payment";
import OverviewPage from "./pages/dashboard/overview";
import ProfilePage from "./pages/dashboard/profile";
import EarlyAccess from "./pages/early-access";
import Feature from "./pages/feature";
import Home from "./pages/home";
import Integration from "./pages/integration";
import IntegrationDetailsPage from "./pages/integration/[slug]";
import CookiePolicyPage from "./pages/legal/cookie-policy";
import PrivacyPolicyPage from "./pages/legal/privacy-&-policy";
import TermsAndConditionPage from "./pages/legal/terms-&-condition";
import LoginPage from "./pages/login";
import NotFound from "./pages/not-found";
import SignupPage from "./pages/signup";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/feature" element={<Feature />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/integration" element={<Integration />} />
              <Route path="/integration/:slug" element={<IntegrationDetailsPage />} />
              <Route path="/early-access" element={<EarlyAccess />} />

              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <DashboardShell />
                  </RequireAuth>
                }
              >
                <Route index element={<OverviewPage />} />
                <Route
                  path="loans"
                  element={
                    <ComingSoon
                      service="Personal Loans"
                      icon={WalletCards}
                      description="Apply for a loan and track your applications."
                      plural
                    />
                  }
                />
                <Route
                  path="insurance"
                  element={
                    <ComingSoon
                      service="Insurance"
                      icon={ShieldCheck}
                      description="Get a quote, choose a plan, and manage your policies."
                    />
                  }
                />
                <Route path="bill-payment" element={<BillPaymentPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route
                  path="admin"
                  element={
                    <AdminGuard>
                      <AdminPage />
                    </AdminGuard>
                  }
                />
              </Route>

              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/legal/terms-&-condition" element={<TermsAndConditionPage />} />
              <Route path="/legal/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/legal/cookie-policy" element={<CookiePolicyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
