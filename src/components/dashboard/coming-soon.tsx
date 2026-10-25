import { Button } from "@/components/ui/button";
import { Clock, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ComingSoonProps {
  service: string;
  icon: LucideIcon;
  description: string;
  plural?: boolean;
}

export function ComingSoon({ service, icon: Icon, description, plural }: ComingSoonProps) {
  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-bold uppercase text-primary">VyonixPay account</p>
      <h1 className="mt-2 text-3xl font-bold">{service}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-md border border-dashed bg-background px-8 py-20 text-center">
        <div className="grid size-14 place-items-center rounded-md bg-secondary text-primary">
          <Icon className="size-6" />
        </div>
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase text-muted-foreground">
          <Clock className="size-3.5" />
          Coming Soon
        </span>
        <h2 className="mt-4 text-lg font-bold">{service} isn't live yet</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          We're rolling out VyonixPay in phases. Right now you can already pay your credit card bill — {service.toLowerCase()} {plural ? "are" : "is"} on the way.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard/bill-payment">Pay a Card Bill Instead</Link>
        </Button>
      </div>
    </section>
  );
}
