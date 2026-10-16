import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowUpRight, Bell } from "lucide-react";
import { useDB } from "@/lib/store";
import { useMe } from "@/lib/session";
import { totals, inr } from "@/lib/calc";
import { StatusBadge, areaImage } from "@/components/qb";
import living from "@/assets/living.jpg";

export const Route = createFileRoute("/sales/")({ component: SalesHome });

function SalesHome() {
  const me = useMe();
  const db = useDB((d) => d);
  const mine = db.quotations.filter((q) => q.salesId === me?.id);
  const pipeline = mine.filter((q) => !["draft", "cust_rejected"].includes(q.status)).reduce((s, q) => s + totals(q, db).grand, 0);
  const actionable = mine.filter((q) => q.status === "approved" || q.status === "approved_changes" || q.status === "returned" || q.status.startsWith("cust_"));
  const recent = [...mine].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <div className="page-enter">
      <div className="relative h-72 overflow-hidden">
        <img src={living} alt="" className="absolute inset-0 h-full w-full object-cover" width={1024} height={768} />
        <div className="absolute inset-0 hero-fade" />
        <div className="absolute inset-x-5 top-6 flex items-center justify-between text-primary-foreground">
          <div><p className="text-xs opacity-80">Good morning</p><p className="font-semibold">{me?.name}</p></div>
          <span className="grid size-10 place-items-center rounded-full bg-primary-foreground/20 backdrop-blur"><Bell className="size-4" /></span>
        </div>
        <div className="absolute inset-x-5 bottom-6 text-primary-foreground">
          <p className="label-lux text-primary-foreground/70">Active pipeline</p>
          <p className="serif text-4xl">{inr(pipeline)}</p>
        </div>
      </div>

      <div className="-mt-5 relative px-5">
        <Link to="/sales/new" search={{ id: undefined }} className="card-lux flex items-center gap-4 p-4 shadow-lux">
          <span className="grid size-12 place-items-center rounded-2xl btn-primary"><Plus className="size-5" /></span>
          <span className="flex-1"><span className="block font-semibold">New quotation</span><span className="text-xs text-muted-foreground">Capture site measurements & build</span></span>
          <ArrowUpRight className="size-5 text-muted-foreground" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 px-5">
        {[["Drafts", mine.filter((q) => q.status === "draft").length], ["Pending", mine.filter((q) => q.status === "pending").length], ["Won", mine.filter((q) => q.status === "cust_approved").length]].map(([l, v]) => (
          <div key={l} className="card-lux p-3 text-center"><p className="serif text-2xl">{v}</p><p className="text-[11px] text-muted-foreground">{l}</p></div>
        ))}
      </div>

      {actionable.length > 0 && (
        <section className="mt-7 px-5">
          <h2 className="text-xl">Updates & actions</h2>
          <div className="mt-3 space-y-2">
            {actionable.map((q) => (
              <Link key={q.id} to="/sales/quotations/$id" params={{ id: q.id }} className="card-lux flex items-center justify-between gap-3 p-4 gold-gradient">
                <div className="min-w-0"><p className="truncate font-semibold">{q.customer.name}</p><StatusBadge status={q.status} short /></div>
                <ArrowUpRight className="size-4 shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-7 px-5">
        <div className="flex items-baseline justify-between"><h2 className="text-xl">Recent</h2><Link to="/sales/quotations" className="text-xs font-semibold text-gold">View all</Link></div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {recent.map((q) => (
            <Link key={q.id} to="/sales/quotations/$id" params={{ id: q.id }} className="card-lux overflow-hidden">
              <img src={areaImage(q.areas[0]?.name ?? "")} alt="" className="h-24 w-full object-cover" loading="lazy" />
              <div className="p-3"><p className="truncate text-sm font-semibold">{q.customer.name}</p><p className="serif text-lg">{inr(totals(q, db).grand)}</p></div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
