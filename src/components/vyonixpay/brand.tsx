import { Landmark } from "lucide-react";
import { Link } from "react-router-dom";

export function VyonixPayBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 text-foreground group" aria-label="VyonixPay home">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-black font-extrabold shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
        <Landmark className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-white">
          Vyonix<span className="text-primary font-black">Pay</span>
        </span>
      )}
    </Link>
  );
}
