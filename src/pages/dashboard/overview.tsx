import { useAuth } from "@/hooks/use-auth";
import { ArrowUpRight, CreditCard, ShieldCheck, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { name: "Pay a card bill", note: "Settle your credit card balance", icon: CreditCard, to: "/dashboard/bill-payment", soon: false },
  { name: "Explore loans", note: "See personal loan options", icon: WalletCards, to: "/dashboard/loans", soon: true },
  { name: "Get insured", note: "Request an insurance quote", icon: ShieldCheck, to: "/dashboard/insurance", soon: true },
];

export default function OverviewPage() {
  const { user } = useAuth();
  const displayName = user?.email.split("@")[0] ?? "";

  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-bold uppercase text-primary">Overview</p>
      <h1 className="mt-2 text-3xl font-bold">Welcome back, {displayName}</h1>
      <p className="mt-2 text-muted-foreground">Here's a clear view of your Swedox account.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {services.map((service) => (
          <Link key={service.name} to={service.to} className="relative rounded-md border bg-background p-6 transition-colors hover:bg-secondary/40">
            {service.soon && (
              <span className="absolute right-4 top-4 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                Soon
              </span>
            )}
            <service.icon className="size-6 text-primary" />
            <h2 className="mt-8 font-bold">{service.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{service.note}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
              {service.soon ? "Coming Soon" : "Open"} <ArrowUpRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
