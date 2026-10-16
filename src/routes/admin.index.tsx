import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Clock, Send, Trophy, PackageX, FileText, Eye } from "lucide-react";
import { useDB, STATUS_LABEL, type Status, type Quotation } from "@/lib/store";
import { totals, inr } from "@/lib/calc";
import { StatusBadge, fmtDate, Sheet } from "@/components/qb";
import { PageHead } from "@/components/PageHead";

export const Route = createFileRoute("/admin/")({ component: Dash });

const FLOW: { s: Status[]; label: string; tone: string }[] = [
  { s: ["draft"], label: "Draft", tone: "var(--muted-foreground)" },
  { s: ["pending", "returned"], label: "In review", tone: "var(--warning)" },
  { s: ["approved", "approved_changes"], label: "Priced", tone: "var(--gold)" },
  { s: ["sent", "cust_discuss"], label: "With customer", tone: "var(--info)" },
  { s: ["cust_approved"], label: "Won", tone: "var(--success)" },
  { s: ["cust_rejected"], label: "Lost", tone: "var(--destructive)" },
];

function Dash() {
  const db = useDB((d) => d);
  const [view, setView] = useState<Quotation | null>(null);
  const [kpi, setKpi] = useState<{ title: string; rows: Quotation[] } | null>(null);
  const by = (s: Status[]) => db.quotations.filter((q) => s.includes(q.status));
  const won = by(["cust_approved"]);
  const wonVal = won.reduce((s, q) => s + totals(q, db).grand, 0);
  const pending = by(["pending"]);
  const withCust = by(["sent", "cust_discuss"]);
  const low = db.stock.filter((s) => s.qty < s.reorder);
  const total = db.quotations.length || 1;
  const activity = db.quotations.flatMap((q) => q.history.map((h) => ({ ...h, q }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
  const sales = db.users.filter((u) => u.role === "sales").map((u) => {
    const m = db.quotations.filter((q) => q.salesId === u.id);
    return { u, n: m.length, val: m.filter((q) => q.status === "cust_approved").reduce((s, q) => s + totals(q, db).grand, 0) };
  }).sort((a, b) => b.val - a.val);

  const cards = [
    { icon: Clock, label: "Pending approval", value: pending.length, hint: "Needs pricing", tone: "var(--warning)", rows: pending },
    { icon: Send, label: "With customers", value: withCust.length, hint: "Sent / discussing", tone: "var(--info)", rows: withCust },
    { icon: Trophy, label: "Won value", value: inr(wonVal), hint: `${won.length} approved`, tone: "var(--success)", rows: won },
  ];

  return (
    <>
      <PageHead title="Overview" sub="Everything happening across the studio today." action={<Link to="/admin/approvals" className="btn btn-primary">Review approvals <ArrowRight className="size-4" /></Link>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button key={c.label} onClick={() => setKpi({ title: c.label, rows: c.rows })} className="card-lux p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lux">
            <div className="flex items-center justify-between"><p className="label-lux">{c.label}</p><span className="grid size-9 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${c.tone} 14%, transparent)`, color: c.tone }}><c.icon className="size-4" /></span></div>
            <p className="serif mt-3 text-3xl">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
          </button>
        ))}
        <Link to="/admin/stock" className="card-lux p-5 transition hover:-translate-y-0.5 hover:shadow-lux">
          <div className="flex items-center justify-between"><p className="label-lux">Low stock</p><span className="grid size-9 place-items-center rounded-xl bg-destructive/10 text-destructive"><PackageX className="size-4" /></span></div>
          <p className="serif mt-3 text-3xl">{low.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Below reorder level</p>
        </Link>
      </div>

      <div className="card-lux mt-6 p-5">
        <div className="flex items-baseline justify-between"><h2 className="text-xl">Quotation pipeline</h2><span className="text-xs text-muted-foreground">{db.quotations.length} quotations</span></div>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted">
          {FLOW.map((f) => <div key={f.label} style={{ width: `${(by(f.s).length / total) * 100}%`, background: f.tone }} />)}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          {FLOW.map((f) => (
            <button key={f.label} onClick={() => setKpi({ title: f.label, rows: by(f.s) })} className="rounded-xl p-2 text-left hover:bg-muted/60">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2 rounded-full" style={{ background: f.tone }} />{f.label}</p>
              <p className="serif text-2xl">{by(f.s).length}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card-lux p-5 lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between"><h2 className="text-xl">Waiting for pricing</h2><Link to="/admin/approvals" className="flex items-center gap-1 text-sm font-semibold text-gold">View all <ArrowRight className="size-3.5" /></Link></div>
          {pending.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">All caught up — nothing to price.</p>}
          <div className="divide-y">
            {pending.slice(0, 5).map((q) => (
              <div key={q.id} className="flex items-center gap-3 py-3">
                <span className="grid size-10 place-items-center rounded-xl bg-accent"><FileText className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{q.customer.name} <span className="font-normal text-muted-foreground">· {q.number}</span></p>
                  <p className="text-xs text-muted-foreground">{q.customer.projectType} · {q.areas.length} rooms · {db.users.find((u) => u.id === q.salesId)?.name}</p>
                </div>
                <button onClick={() => setView(q)} className="btn btn-ghost px-3 py-2 text-xs"><Eye className="size-3.5" /> Preview</button>
                <Link to="/admin/quotations/$id" params={{ id: q.id }} className="btn btn-primary px-3 py-2 text-xs">Price it</Link>
              </div>
            ))}
          </div>
        </div>
        <div className="card-lux p-5">
          <h2 className="mb-3 text-xl">Recent activity</h2>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <button key={i} onClick={() => setView(a.q)} className="flex w-full gap-3 rounded-xl p-2 text-left hover:bg-muted/60">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" />
                <div><p className="text-sm"><b>{a.actor}</b></p><p className="text-xs text-muted-foreground">{STATUS_LABEL[a.status]} · {a.q.number}</p><p className="text-[11px] text-muted-foreground">{fmtDate(a.at, true)}</p></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card-lux mt-6 p-5">
        <h2 className="mb-3 text-xl">Sales team</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sales.map(({ u, n, val }) => (
            <div key={u.id} className="rounded-2xl border p-4">
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-muted-foreground">{n} quotations</p>
              <p className="serif mt-2 text-xl">{inr(val)}</p><p className="text-[11px] text-muted-foreground">won</p>
            </div>
          ))}
        </div>
      </div>

      <Sheet open={!!kpi} onClose={() => setKpi(null)} title={kpi?.title ?? ""} side="center">
        {kpi?.rows.length === 0 && <p className="text-sm text-muted-foreground">No quotations here.</p>}
        <div className="divide-y">
          {kpi?.rows.map((q) => (
            <Link key={q.id} to="/admin/quotations/$id" params={{ id: q.id }} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
              <div><p className="text-sm font-semibold">{q.customer.name}</p><p className="text-xs text-muted-foreground">{q.number}</p></div>
              <StatusBadge status={q.status} short />
            </Link>
          ))}
        </div>
      </Sheet>

      <Sheet wide open={!!view} onClose={() => setView(null)} title={view ? `${view.number} · ${view.customer.name}` : ""} side="center">
        {view && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><StatusBadge status={view.status} /><span className="text-xs text-muted-foreground">{view.customer.projectType} · {view.customer.phone} · {view.customer.address}</span></div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {view.areas.map((a) => <div key={a.id} className="rounded-xl bg-muted/50 px-3 py-2 text-sm"><p className="truncate font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.items.length} items</p></div>)}
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-3">
              <div className="text-sm"><span className="text-muted-foreground">Grand total </span><b className="serif text-lg">{inr(totals(view, db).grand)}</b></div>
              <Link to="/admin/quotations/$id" params={{ id: view.id }} className="btn btn-primary">Open quotation <ArrowRight className="size-4" /></Link>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
