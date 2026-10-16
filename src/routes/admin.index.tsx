import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useDB, STATUS_LABEL, type Status } from "@/lib/store";
import { totals, inr } from "@/lib/calc";
import { Kpi, StatusBadge, fmtDate } from "@/components/qb";
import { PageHead } from "@/components/PageHead";
import { QuoteTable } from "@/components/QuoteTable";

export const Route = createFileRoute("/admin/")({ component: Dash });

function Dash() {
  const db = useDB((d) => d);
  const by = (s: Status[]) => db.quotations.filter((q) => s.includes(q.status));
  const won = by(["cust_approved"]).reduce((s, q) => s + totals(q, db).grand, 0);
  const activity = db.quotations.flatMap((q) => q.history.map((h) => ({ ...h, q }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  const lowStock = db.stock.filter((s) => s.qty < s.reorder).length;
  return (
    <>
      <PageHead title="Good morning, Neha" sub="Here's what's happening across the studio." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Pending approval" value={by(["pending"]).length} tone="var(--warning)" hint="Awaiting your review" />
        <Kpi label="With customers" value={by(["sent", "cust_discuss"]).length} tone="var(--info)" hint="Sent or in discussion" />
        <Kpi label="Won value" value={inr(won)} tone="var(--success)" hint={`${by(["cust_approved"]).length} approved by customer`} />
        <Kpi label="Low stock" value={lowStock} tone="var(--destructive)" hint="Materials below reorder" />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
          <span key={s} className="card-lux flex items-center gap-2 px-3 py-2 text-xs"><StatusBadge status={s} short /><b>{by([s]).length}</b></span>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between"><h2 className="text-2xl">Pending approvals</h2><Link to="/admin/approvals" className="flex items-center gap-1 text-sm font-semibold text-gold">View all <ArrowRight className="size-3.5" /></Link></div>
          <QuoteTable rows={by(["pending"])} />
        </div>
        <div>
          <h2 className="mb-3 text-2xl">Recent activity</h2>
          <div className="card-lux divide-y">
            {activity.map((a, i) => (
              <Link key={i} to="/admin/quotations/$id" params={{ id: a.q.id }} className="block p-4 hover:bg-muted/50">
                <p className="text-sm"><b>{a.actor}</b></p>
                <p className="text-xs text-muted-foreground">{STATUS_LABEL[a.status]} · {a.q.number}</p>
                <p className="text-[11px] text-muted-foreground">{fmtDate(a.at, true)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
