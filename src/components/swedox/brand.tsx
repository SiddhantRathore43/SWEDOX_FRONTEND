import { Landmark } from "lucide-react";
import { Link } from "react-router-dom";

export function SwedoxBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 text-foreground" aria-label="Swedox home">
      <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
        <Landmark className="size-5" aria-hidden="true" />
      </span>
      {!compact && <span className="text-xl font-bold">Swedox</span>}
    </Link>
  );
}