import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, RotateCcw, Mail, Phone, Trophy, TrendingUp, FileText, ChevronRight, Home } from "lucide-react";
import { toast } from "sonner";
import { logout, resetDB, useDB, type Status } from "@/lib/store";
import { useMe } from "@/lib/session";
import { totals, inr } from "@/lib/calc";
import { StatusBadge } from "@/components/qb";
import bedroom from "@/assets/bedroom.jpg";

export const Route = createFileRoute("/sales/profile")({ component: Profile });

const TARGET = 2500000;

function Profile() {
  const me = useMe();
  const nav = useNavigate();
  const db = useDB((d) => d);
  const mine = db.quotations.filter((q) => q.salesId === me?.id);
  const won = mine.filter((q) => q.status === "cust_approved");
  const wonValue = won.reduce((s, q) => s + totals(q, db).grand, 0);
  const decided = mine.filter((q) => ["cust_approved", "cust_rejected"].includes(q.status)).length;
  const conv = decided ? Math.round((won.length / decided) * 100) : 0;
  const avg = mine.length ? mine.reduce((s, q) => s + totals(q, db).grand, 0) / mine.length : 0;
  const byType = (["Apartment", "Villa", "House", "Office", "Retail"] as const).map((t) => [t, mine.filter((q) => q.customer.projectType === t).length] as const).filter(([, n]) => n);
  const statusCounts = (["pending", "approved_changes", "sent", "cust_discuss"] as Status[]).map((s) => [s, mine.filter((q) => q.status === s).length] as const);
  const pct = Math.min(100, Math.round((wonValue / TARGET) * 100));

  return (
    <div className="page-enter">
      <div className="relative h-44">
        <img src={bedroom} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-fade" />
      </div>
      <div className="-mt-12 relative flex flex-col items-center px-5 text-center">
        <span className="grid size-24 place-items-center rounded-full border-4 border-background btn-primary serif text-3xl">{me?.name.split(" ").map((p) => p[0]).join("")}</span>
        <h1 className="mt-3 text-2xl">{me?.name}</h1>
        <p className="text-sm text-muted-foreground">{me?.title} · Sales</p>
      </div>

      <div className="mx-5 mt-6 card-lux gold-gradient p-5">
        <div className="flex items-center justify-between"><p className="label-lux flex items-center gap-1.5"><Trophy className="size-3.5 text-gold" /> Quarter target</p><span className="text-xs font-semibold">{pct}%</span></div>
        <p className="serif mt-2 text-3xl">{inr(wonValue)}</p>
        <p className="text-xs text-muted-foreground">of {inr(TARGET)} won</p>
        <div className="mt-3 h-2 rounded-full bg-card"><div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="mx-5 mt-3 grid grid-cols-3 gap-3">
        {[[FileText, mine.length, "Quotes"], [TrendingUp, `${conv}%`, "Win rate"], [Home, inr(avg).replace("₹", "₹ "), "Avg value"]].map(([Icon, v, l], i) => {
          const I = Icon as typeof FileText;
          return <div key={i} className="card-lux p-3 text-center"><I className="mx-auto size-4 text-gold" /><p className="serif mt-1 truncate text-lg">{v as string}</p><p className="text-[10px] text-muted-foreground">{l as string}</p></div>;
        })}
      </div>

      <section className="mx-5 mt-6">
        <h2 className="text-lg">Pipeline</h2>
        <div className="card-lux mt-2 divide-y">
          {statusCounts.map(([s, n]) => (
            <Link key={s} to="/sales/quotations" className="flex items-center justify-between p-3.5"><StatusBadge status={s} short /><span className="flex items-center gap-1 text-sm font-semibold">{n}<ChevronRight className="size-4 text-muted-foreground" /></span></Link>
          ))}
        </div>
      </section>

      {byType.length > 0 && (
        <section className="mx-5 mt-6">
          <h2 className="text-lg">Projects by type</h2>
          <div className="mt-2 flex flex-wrap gap-2">{byType.map(([t, n]) => <span key={t} className="rounded-full border bg-card px-3 py-1.5 text-xs font-semibold">{t} · {n}</span>)}</div>
        </section>
      )}

      <section className="mx-5 mt-6">
        <h2 className="text-lg">Contact</h2>
        <div className="card-lux mt-2 divide-y text-sm">
          <div className="flex items-center gap-3 p-3.5"><Mail className="size-4 text-muted-foreground" />{me?.email}</div>
          <div className="flex items-center gap-3 p-3.5"><Phone className="size-4 text-muted-foreground" />{me?.phone}</div>
        </div>
      </section>

      <div className="mx-5 mt-6 space-y-2">
        <button className="btn btn-outline w-full" onClick={() => { resetDB(); toast.success("Demo data reset"); }}><RotateCcw className="size-4" /> Reset demo data</button>
        <button className="btn btn-dark w-full" onClick={() => { logout(); nav({ to: "/app", replace: true }); }}><LogOut className="size-4" /> Sign out</button>
      </div>
    </div>
  );
}
