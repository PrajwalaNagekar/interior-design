import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Phone, LogOut, ArrowUpRight, Check, X, MessagesSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { setDB, useDB, pushStatus, type Quotation, type Status } from "@/lib/store";
import { totals, inr } from "@/lib/calc";
import { PhoneFrame } from "@/components/PhoneFrame";
import { COMPANY, StatusBadge, Sheet, fmtDate, areaImage } from "@/components/qb";
import { cn } from "@/lib/utils";

const CKEY = "qb_customer";
export const getCustomerPhone = () => (typeof window === "undefined" ? null : localStorage.getItem(CKEY));
const norm = (s: string) => s.replace(/\D/g, "");
const SHARED: Status[] = ["sent", "cust_approved", "cust_rejected", "cust_discuss"];

export const Route = createFileRoute("/c")({
  ssr: false,
  beforeLoad: () => { if (!getCustomerPhone()) throw redirect({ to: "/customer" }); },
  head: () => ({ meta: [{ title: "My Quotations — Your Interior Design Company" }, { name: "description", content: "Your interior design quotations and messages." }, { property: "og:title", content: "My quotations" }, { property: "og:description", content: "Review and respond to your proposals." }] }),
  component: () => <PhoneFrame label="Customer"><CustomerHome /></PhoneFrame>,
});

function CustomerHome() {
  const nav = useNavigate();
  const phone = getCustomerPhone() ?? "";
  const db = useDB((d) => d);
  const mine = db.quotations.filter((q) => norm(q.customer.phone) === norm(phone) && SHARED.includes(q.status));
  const [tab, setTab] = useState<"quotes" | "messages">("quotes");
  const [sheet, setSheet] = useState<{ q: Quotation; s: "cust_rejected" | "cust_discuss" } | null>(null);
  const [comment, setComment] = useState("");
  const name = mine[0]?.customer.name ?? "there";
  const pendingQ = mine.find((q) => q.status === "sent");
  const messages = mine.flatMap((q) => q.history.filter((h) => h.status === "sent").map((h) => ({ q, at: h.at }))).sort((a, b) => b.at.localeCompare(a.at));

  const act = (q: Quotation, s: Status, c?: string) => {
    setDB((d) => { const x = d.quotations.find((y) => y.id === q.id)!; pushStatus(x, s, `${q.customer.name} (Customer)`, c || undefined); });
    toast.success(s === "cust_approved" ? "Quotation approved — thank you!" : "Response sent to your designer");
  };

  return (
    <div className="page-enter pb-10">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="min-w-0"><p className="text-xs text-muted-foreground">Welcome back</p><h1 className="truncate text-2xl">{name}</h1></div>
        <button onClick={() => { localStorage.removeItem(CKEY); nav({ to: "/customer", replace: true }); }} className="grid size-10 shrink-0 place-items-center rounded-full border bg-card" aria-label="Sign out"><LogOut className="size-4" /></button>
      </div>

      {pendingQ ? (
        <div className="mx-5 mt-5 overflow-hidden rounded-[28px] shadow-lux">
          <div className="relative h-44">
            <img src={areaImage(pendingQ.areas[0]?.name ?? "")} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 hero-fade" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-card/85 px-2.5 py-1 text-[11px] font-semibold backdrop-blur"><Sparkles className="size-3 text-gold" /> Awaiting your approval</span>
            <div className="absolute inset-x-4 bottom-4 text-primary-foreground"><p className="text-xs opacity-80">{pendingQ.number} · {pendingQ.areas.length} rooms</p><p className="serif text-3xl">{inr(totals(pendingQ, db).grand)}</p></div>
          </div>
          <div className="bg-card p-4">
            <Link to="/q/$token" params={{ token: pendingQ.token }} className="btn btn-dark w-full">View full quotation <ArrowUpRight className="size-4" /></Link>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button onClick={() => setSheet({ q: pendingQ, s: "cust_rejected" })} className="btn btn-outline px-2 text-xs"><X className="size-3.5" /> Reject</button>
              <button onClick={() => setSheet({ q: pendingQ, s: "cust_discuss" })} className="btn btn-outline px-2 text-xs"><MessagesSquare className="size-3.5" /> Discuss</button>
              <button onClick={() => act(pendingQ, "cust_approved")} className="btn btn-primary px-2 text-xs"><Check className="size-3.5" /> Approve</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-lux mx-5 mt-5 gold-gradient p-5"><p className="serif text-xl">You're all caught up</p><p className="mt-1 text-sm text-muted-foreground">We'll message you on WhatsApp when a new quotation is ready.</p></div>
      )}

      <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
        <a href={`tel:${COMPANY.phone}`} className="card-lux flex items-center gap-3 p-3.5"><span className="grid size-9 place-items-center rounded-full bg-accent"><Phone className="size-4" /></span><span className="text-sm font-semibold">Call studio</span></a>
        <a href={`https://wa.me/${norm(COMPANY.phone)}`} target="_blank" rel="noreferrer" className="card-lux flex items-center gap-3 p-3.5"><span className="grid size-9 place-items-center rounded-full bg-whatsapp text-primary-foreground"><MessageCircle className="size-4" /></span><span className="text-sm font-semibold">WhatsApp</span></a>
      </div>

      <div className="mx-5 mt-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-semibold">
        {(["quotes", "messages"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-full py-2 transition", tab === t ? "bg-card shadow-soft" : "text-muted-foreground")}>{t === "quotes" ? `Quotations (${mine.length})` : `Messages (${messages.length})`}</button>
        ))}
      </div>

      {tab === "quotes" ? (
        <div className="mx-5 mt-4 space-y-3">
          {mine.map((q) => (
            <Link key={q.id} to="/q/$token" params={{ token: q.token }} className="card-lux flex gap-3 p-3">
              <img src={areaImage(q.areas[0]?.name ?? "")} alt="" className="size-20 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{q.number}</p>
                <p className="serif text-xl">{inr(totals(q, db).grand)}</p>
                <div className="mt-1"><StatusBadge status={q.status} short /></div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mx-5 mt-4 space-y-3 rounded-3xl bg-whatsapp-bg p-4">
          {messages.map((m, i) => (
            <div key={i} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-card p-3 text-sm shadow-soft">
              <p className="text-[11px] font-semibold text-whatsapp">{COMPANY.name}</p>
              <p className="mt-1">Your quotation {m.q.number} ({inr(totals(m.q, db).grand)}) is ready to review.</p>
              <Link to="/q/$token" params={{ token: m.q.token }} className="mt-1 block text-info underline">Open quotation</Link>
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{fmtDate(m.at, true)}</p>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.s === "cust_rejected" ? "Reject quotation" : "Request a discussion"}>
        <textarea className="input-lux" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment (optional)" />
        <button onClick={() => { act(sheet!.q, sheet!.s, comment); setSheet(null); setComment(""); }} className="btn btn-primary mt-4 w-full py-3.5">Submit</button>
      </Sheet>
    </div>
  );
}
