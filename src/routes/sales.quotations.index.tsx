import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useDB, STATUS_LABEL, type Status } from "@/lib/store";
import { useMe } from "@/lib/session";
import { totals, inr } from "@/lib/calc";
import { StatusBadge, fmtDate } from "@/components/qb";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sales/quotations/")({ component: List });

function List() {
  const me = useMe();
  const db = useDB((d) => d);
  const [q, setQ] = useState("");
  const [f, setF] = useState<Status | "all">("all");
  const mine = db.quotations.filter((x) => x.salesId === me?.id)
    .filter((x) => f === "all" || x.status === f)
    .filter((x) => (x.customer.name + x.number).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const statuses = Object.keys(STATUS_LABEL) as Status[];

  return (
    <div className="page-enter px-5 pt-8">
      <h1 className="text-3xl">Quotations</h1>
      <div className="relative mt-5">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input className="input-lux pl-10" placeholder="Search customer or number" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2">
        {(["all", ...statuses] as const).map((s) => (
          <button key={s} onClick={() => setF(s)} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition", f === s ? "border-charcoal bg-charcoal text-charcoal-foreground" : "bg-card")}>
            {s === "all" ? "All" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {mine.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">No quotations match.</p>}
        {mine.map((x) => (
          <Link key={x.id} to="/sales/quotations/$id" params={{ id: x.id }} className="card-lux block p-4 transition active:scale-[.99]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><p className="truncate font-semibold">{x.customer.name}</p><p className="text-xs text-muted-foreground">{x.number} · {fmtDate(x.createdAt)}</p></div>
              <p className="serif text-lg">{["draft","pending","returned"].includes(x.status) ? "Awaiting pricing" : inr(totals(x, db).grand)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between"><StatusBadge status={x.status} /><span className="text-xs text-muted-foreground">{x.areas.length} areas</span></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
