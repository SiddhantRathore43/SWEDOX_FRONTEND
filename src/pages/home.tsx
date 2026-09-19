import { SwedoxBrand } from "@/components/swedox/brand";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, CreditCard, FileCheck2, Landmark, LockKeyhole, Menu, ShieldCheck, WalletCards, X } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const offers = [
  { icon: CreditCard, title: "Credit Card Bill Payment", text: "Pay your credit card bills from one place and keep every payment easy to track.", soon: false },
  { icon: WalletCards, title: "Personal Loans", text: "Explore straightforward personal loan options with a clear application journey.", soon: true },
  { icon: FileCheck2, title: "Insurance", text: "Move from quote to policy with simple choices and transparent next steps.", soon: true },
];

const steps = [
  { number: "01", title: "Choose a service", text: "Select bill payment, personal loans, or insurance." },
  { number: "02", title: "Share your details", text: "Complete a clear, guided form with only what is needed." },
  { number: "03", title: "Track your progress", text: "Return to your account for updates and next actions." },
];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Swedox | Bills, Loans & Insurance</title><meta name="description" content="Manage credit card bills, personal loans, and insurance in one secure place with Swedox." /></Helmet>
      <header className="absolute inset-x-0 top-0 z-40 border-b border-primary-foreground/15 text-primary-foreground">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-10">
          <Link to="/" className="flex items-center gap-2" aria-label="Swedox home"><span className="grid size-9 place-items-center rounded-md bg-accent text-accent-foreground"><Landmark className="size-5" /></span><span className="text-xl font-bold">Swedox</span></Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex" aria-label="Main navigation">
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <a href="#services" className="flex items-center gap-1 opacity-80 transition-opacity hover:opacity-100">
                Services
                <ChevronDown className={`size-3.5 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
              </a>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute left-1/2 top-full z-50 mt-3 w-80 -translate-x-1/2 rounded-md border bg-card p-2 text-foreground shadow-card"
                  >
                    {offers.map((offer) => (
                      <a
                        key={offer.title}
                        href="#services"
                        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-secondary"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                          <offer.icon className="size-4" />
                        </span>
                        <span>
                          <span className="flex items-center gap-2">
                            <span className="block text-sm font-bold">{offer.title}</span>
                            {offer.soon && (
                              <span className="rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
                                Soon
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{offer.text}</span>
                        </span>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a href="#how-it-works" className="opacity-80 transition-opacity hover:opacity-100">How it works</a><a href="#security" className="opacity-80 transition-opacity hover:opacity-100">Security</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex"><Button asChild variant="ghost"><Link to="/login">Log in</Link></Button><Button asChild variant="accent"><Link to="/signup">Get Started</Link></Button></div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</Button>
        </div>
        {menuOpen && <div className="border-t border-primary-foreground/15 bg-primary px-5 py-5 md:hidden"><nav className="flex flex-col gap-4"><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#security" onClick={() => setMenuOpen(false)}>Security</a><Link to="/login">Log in</Link><Button asChild variant="accent"><Link to="/signup">Get Started</Link></Button></nav></div>}
      </header>

      <main>
        <section className="overflow-hidden bg-primary text-primary-foreground">
          <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-5 pb-20 pt-36 lg:grid-cols-[1.08fr_.92fr] lg:px-10">
            <div className="max-w-2xl animate-fade-in">
              <p className="mb-6 text-sm font-bold uppercase text-accent">One trusted financial home</p>
              <h1 className="text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">Money matters, made simpler.</h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-primary-foreground/75">Pay credit card bills, find a personal loan, and get insured—all in one clear, secure place.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" variant="accent"><Link to="/signup">Get Started<ArrowRight /></Link></Button><Button asChild size="lg" variant="inverseOutline"><a href="#services">Explore services</a></Button></div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-primary-foreground/70"><span className="flex items-center gap-2"><Check className="size-4 text-accent" />Clear next steps</span><span className="flex items-center gap-2"><Check className="size-4 text-accent" />Secure by design</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-lg" aria-label="Swedox account overview preview">
              <div className="rounded-md border border-primary-foreground/15 bg-primary-foreground p-5 text-foreground shadow-card sm:p-7">
                <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase text-muted-foreground">Total upcoming</p><p className="mt-2 text-3xl font-bold">₹24,580</p></div><span className="rounded-md bg-secondary px-3 py-2 text-xs font-bold text-primary">This month</span></div>
                <div className="my-6 h-px bg-border" />
                <p className="text-sm font-bold">Quick actions</p>
                <div className="mt-4 grid grid-cols-3 gap-2">{offers.map((offer) => <div key={offer.title} className="relative rounded-md bg-secondary p-3">{offer.soon && <span className="absolute right-1.5 top-1.5 rounded-full border px-1 py-0.5 text-[8px] font-bold uppercase text-muted-foreground">Soon</span>}<offer.icon className="size-5 text-primary" /><p className="mt-5 text-xs font-bold leading-4">{offer.title.replace("Credit Card ", "")}</p></div>)}</div>
                <div className="mt-5 flex items-center justify-between rounded-md border p-4"><div><p className="text-xs text-muted-foreground">Next payment</p><p className="mt-1 text-sm font-bold">Credit card bill</p></div><p className="font-bold">₹8,240</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 sm:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-10"><div className="max-w-2xl"><p className="text-sm font-bold uppercase text-primary">What we offer</p><h2 className="mt-3 text-3xl font-bold sm:text-5xl">Three essentials. One simpler experience.</h2><p className="mt-5 text-lg text-muted-foreground">Straightforward tools for everyday financial decisions.</p></div><div className="mt-12 grid gap-4 md:grid-cols-3">{offers.map((offer) => <article key={offer.title} className="relative rounded-md border bg-card p-7">{offer.soon && <span className="absolute right-7 top-7 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Coming Soon</span>}<span className="grid size-11 place-items-center rounded-md bg-secondary text-primary"><offer.icon /></span><h3 className="mt-8 text-xl font-bold">{offer.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{offer.text}</p>{offer.soon ? <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">Coming soon</span> : <Link to="/signup" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">Learn more<ArrowRight className="size-4" /></Link>}</article>)}</div></div></section>

        <section id="how-it-works" className="border-y bg-secondary py-20 sm:py-28"><div className="mx-auto max-w-7xl px-5 lg:px-10"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-bold uppercase text-primary">How it works</p><h2 className="mt-3 text-3xl font-bold sm:text-5xl">From choice to clarity in three steps.</h2></div><div className="divide-y border-y">{steps.map((step) => <article key={step.number} className="grid grid-cols-[3rem_1fr] gap-5 py-7 sm:grid-cols-[4rem_1fr]"><span className="text-sm font-bold text-accent-foreground">{step.number}</span><div><h3 className="text-xl font-bold">{step.title}</h3><p className="mt-2 text-muted-foreground">{step.text}</p></div></article>)}</div></div></div></section>

        <section id="security" className="bg-foreground py-20 text-background sm:py-28"><div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 lg:px-10"><div><span className="grid size-12 place-items-center rounded-md bg-accent text-accent-foreground"><ShieldCheck /></span><p className="mt-8 text-sm font-bold uppercase text-accent">Built for trust</p><h2 className="mt-3 text-3xl font-bold sm:text-5xl">Your financial information stays protected.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-background/65">Swedox is designed around bank-grade safeguards, careful access controls, and encrypted data handling.</p></div><div className="grid gap-4 sm:grid-cols-2"><article className="rounded-md border border-background/15 p-6"><LockKeyhole className="text-accent" /><h3 className="mt-8 text-lg font-bold">Encrypted data</h3><p className="mt-2 text-sm leading-6 text-background/60">Information is protected in transit and at rest.</p></article><article className="rounded-md border border-background/15 p-6"><ShieldCheck className="text-accent" /><h3 className="mt-8 text-lg font-bold">Secure access</h3><p className="mt-2 text-sm leading-6 text-background/60">Account controls are designed to protect every session.</p></article></div></div></section>
      </main>

      <footer className="border-t bg-background"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:px-10"><div><SwedoxBrand /><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">A simpler place for bills, personal loans, and insurance.</p></div><div className="flex gap-8 sm:justify-end"><Link to="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Log in</Link><Link to="/signup" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Register</Link><a href="#security" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Security</a></div></div><div className="border-t"><div className="mx-auto max-w-7xl px-5 py-5 text-xs text-muted-foreground lg:px-10">© 2026 Swedox. All rights reserved.</div></div></footer>
    </div>
  );
};

export default Home;
