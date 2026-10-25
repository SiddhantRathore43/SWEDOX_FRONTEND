import { VyonixPayBrand } from "@/components/vyonixpay/brand";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  FileCheck2,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const offers = [
  {
    icon: CreditCard,
    title: "Credit Card Bill Payment",
    text: "Pay credit card bills across top Indian banks with instant verification and direct receipt tracking.",
    soon: false,
    to: "/dashboard/bill-payment",
  },
  {
    icon: WalletCards,
    title: "Personal Loans",
    text: "Access competitive loan products with transparent terms, digital KFS, and swift disbursals.",
    soon: true,
    to: "/dashboard/loans",
  },
  {
    icon: FileCheck2,
    title: "Insurance Plans",
    text: "Compare tailored insurance policies with clear benefits, transparent premiums, and paperless onboarding.",
    soon: true,
    to: "/dashboard/insurance",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose your service",
    text: "Pick credit card bill payment, personal loans, or insurance based on your immediate financial goals.",
  },
  {
    number: "02",
    title: "Verify & submit details",
    text: "Complete a streamlined, bank-grade secure flow requiring only the essential details.",
  },
  {
    number: "03",
    title: "Track & settle in real-time",
    text: "Receive instant confirmations, audit-ready logs, and complete transaction history.",
  },
];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-primary selection:text-black">
      <Helmet>
        <title>VyonixPay | Modern Financial Platform</title>
        <meta
          name="description"
          content="Manage credit card bills, explore personal loans, and get insured in one secure, unified platform with VyonixPay."
        />
      </Helmet>

      {/* Background Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,137,117,0.12)_0%,rgba(0,0,0,0)_70%)] blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
          <div className="flex items-center">
            <VyonixPayBrand />
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Main navigation">
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <a
                href="#services"
                className="flex items-center gap-1.5 text-zinc-300 transition-colors hover:text-white"
              >
                Services
                <ChevronDown className={`size-3.5 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
              </a>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 top-full z-50 mt-3 w-80 -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    {offers.map((offer) => (
                      <Link
                        key={offer.title}
                        to={offer.to}
                        className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-white/5"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <offer.icon className="size-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{offer.title}</span>
                            {offer.soon && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-400">
                                Soon
                              </span>
                            )}
                          </div>
                          <span className="mt-0.5 block text-xs text-zinc-400 line-clamp-2">{offer.text}</span>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#how-it-works" className="text-zinc-300 transition-colors hover:text-white">
              How it works
            </a>
            <a href="#security" className="text-zinc-300 transition-colors hover:text-white">
              Security
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-black shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg border border-white/10 text-zinc-300 md:hidden hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-zinc-950 px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-4">
              <a href="#services" onClick={() => setMenuOpen(false)} className="text-zinc-300 hover:text-white">
                Services
              </a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-zinc-300 hover:text-white">
                How it works
              </a>
              <a href="#security" onClick={() => setMenuOpen(false)} className="text-zinc-300 hover:text-white">
                Security
              </a>
              <Link to="/login" className="text-zinc-300 hover:text-white">
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-black"
              >
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pb-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:gap-16 lg:grid-cols-[1.1fr_.9fr] lg:px-10">
            <div>
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="size-3.5" />
                One Trusted Financial Home
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.08] text-white">
                Money matters, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#ff8975] via-[#ffa594] to-[#ffd2cb] bg-clip-text text-transparent">
                  made simpler.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-zinc-400">
                Pay credit card bills, find personal loans, and manage insurance—all through one high-velocity, bank-grade secure platform.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex h-13 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-black shadow-xl shadow-primary/25 transition-all hover:brightness-110 active:scale-95"
                >
                  Get Started
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <a
                  href="#services"
                  className="inline-flex h-13 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Explore Services
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-400">
                <span className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  Instant payment routing
                </span>
                <span className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  Bank-grade encryption
                </span>
                <span className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  Real-time status tracking
                </span>
              </div>
            </div>

            {/* Account Preview Card (Interactive Quick Actions) */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative rounded-2xl border border-white/15 bg-zinc-950/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
                {/* Subtle border glow effect */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl border border-primary/20" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total upcoming</p>
                    <p className="mt-1.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">₹24,580</p>
                  </div>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    This month
                  </span>
                </div>

                <div className="my-6 h-px bg-white/10" />

                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Quick actions</p>
                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  {offers.map((offer) => (
                    <Link
                      key={offer.title}
                      to={offer.to}
                      className="group relative rounded-xl border border-white/5 bg-zinc-900/60 p-3.5 transition-all hover:border-primary/40 hover:bg-zinc-800/80 hover:scale-[1.02] cursor-pointer block"
                    >
                      {offer.soon && (
                        <span className="absolute right-1.5 top-1.5 rounded-full border border-white/10 bg-white/5 px-1 py-0.5 text-[8px] font-bold uppercase text-zinc-400">
                          Soon
                        </span>
                      )}
                      <offer.icon className="size-5 text-primary group-hover:scale-110 transition-transform" />
                      <p className="mt-4 text-xs font-bold leading-tight text-zinc-200 group-hover:text-primary transition-colors">
                        {offer.title.replace("Credit Card ", "")}
                      </p>
                    </Link>
                  ))}
                </div>

                {/* Clickable Next Payment Banner */}
                <Link
                  to="/dashboard/bill-payment"
                  className="group mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/40 p-4 transition-all hover:border-primary/40 hover:bg-zinc-850 cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <CreditCard className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs text-zinc-400">Next payment</p>
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">HDFC Bank Credit Card</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-white">₹8,240</p>
                    <span className="text-[10px] font-bold uppercase text-primary inline-flex items-center gap-0.5">Pay Now <ArrowRight className="size-3" /></span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="border-t border-white/5 bg-[#0b0b0e] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">What we offer</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl text-white tracking-tight">
                Three essentials. One simpler experience.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed">
                Straightforward financial facilitation built with transparent terms and real-time reconciliation.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {offers.map((offer) => (
                <article
                  key={offer.title}
                  className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-900/40 p-8 transition-all duration-300 hover:border-primary/40 hover:bg-zinc-900/80 shadow-xl group"
                >
                  {offer.soon && (
                    <span className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase text-zinc-400">
                      Coming Soon
                    </span>
                  )}
                  <div>
                    <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                      <offer.icon className="size-6" />
                    </span>
                    <h3 className="mt-8 text-xl font-bold text-white">{offer.title}</h3>
                    <p className="mt-3 leading-relaxed text-sm text-zinc-400">{offer.text}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5">
                    {offer.soon ? (
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Under active rollout</span>
                    ) : (
                      <Link
                        to={offer.to}
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform"
                      >
                        Pay Bill Now
                        <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-t border-white/5 bg-[#09090b] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">How it works</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl text-white tracking-tight">
                  From choice to clarity in three steps.
                </h2>
                <p className="mt-4 text-zinc-400 leading-relaxed">
                  No complex paper trails or hidden hurdles. Everything is digital, instant, and transparent.
                </p>
              </div>

              <div className="divide-y divide-white/10 border-y border-white/10">
                {steps.map((step) => (
                  <article key={step.number} className="grid grid-cols-[3.5rem_1fr] gap-6 py-8">
                    <span className="text-lg font-extrabold text-primary">{step.number}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      <p className="mt-2 text-sm sm:text-base leading-relaxed text-zinc-400">{step.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Security Section (Bank-grade trust) */}
        <section id="security" className="border-t border-white/5 bg-[#0b0b0e] py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 lg:px-10 items-center">
            <div>
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="size-6" />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-primary">Built for trust</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl text-white tracking-tight">
                Your financial data stays protected.
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-400">
                VyonixPay is architected around bank-grade safeguards, isolated tenant boundaries, and end-to-end encrypted protocol channels.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-zinc-900/50 p-7 shadow-lg">
                <LockKeyhole className="size-6 text-primary" />
                <h3 className="mt-6 text-lg font-bold text-white">Encrypted Data</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Every payload is secured with 256-bit TLS in transit and encrypted data stores at rest.
                </p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-zinc-900/50 p-7 shadow-lg">
                <ShieldCheck className="size-6 text-primary" />
                <h3 className="mt-6 text-lg font-bold text-white">Bank-Grade Verification</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Strict multi-factor authentication, stateless JWT rotation, and proactive audit logging.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Government & RBI Regulatory Compliance Disclosure */}
      <footer className="border-t border-white/10 bg-[#070709] py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 items-center">
            <div>
              <VyonixPayBrand />
              <p className="mt-3 max-w-sm text-sm text-zinc-400">
                Modern financial facilitation platform for credit card bills, personal loans, and insurance.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 sm:justify-end text-sm font-medium">
              <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="text-zinc-400 hover:text-white transition-colors">
                Register
              </Link>
              <Link to="/legal/terms-&-condition" className="text-zinc-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/legal/privacy-policy" className="text-zinc-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/legal/cookie-policy" className="text-zinc-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>

          {/* Mandatory RBI LSP & Regulatory Compliance Notice */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-zinc-950/80 p-5 sm:p-6 text-xs text-zinc-400 leading-relaxed">
            <p className="font-bold text-zinc-200 uppercase tracking-wider mb-1.5">
              Regulatory Disclosures & Lending Service Provider (LSP) Notice
            </p>
            <p>
              VyonixPay operates strictly as a digital technology facilitation platform and acts as a Lending Service Provider (LSP) in adherence to the Reserve Bank of India (RBI) Digital Lending Guidelines. VyonixPay is not a Bank or NBFC and does not lend directly or accept deposits. All credit facilities are sanctioned, underwritten, and disbursed exclusively by partner RBI-regulated Banks and NBFCs. Credit card bill payments are routed through authorized Bharat BillPay (BBPS) and licensed payment aggregator rails. Customer data is stored within certified secure data centers in India in compliance with RBI Data Localization norms and the DPDP Act 2023.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-zinc-400 border-t border-white/5 pt-3">
              <span><strong>Grievance Redressal:</strong> grievance@vyonixpay.com</span>
              <span><strong>Support:</strong> support@vyonixpay.com</span>
              <span><strong>Resolution TAT:</strong> 24h ACK / Max 30 Days</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-3 border-t border-white/5 pt-6">
            <div>© 2026 VyonixPay. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>256-Bit TLS Secured</span>
              <span>•</span>
              <span>RBI LSP Aligned</span>
              <span>•</span>
              <span>Made in India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
