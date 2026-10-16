import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Send, Pencil, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { setDB, useDB, pushStatus } from "@/lib/store";
import { useMe } from "@/lib/session";
import { totals, inr, lineAmount, measureOf, measureLabel } from "@/lib/calc";
import { StatusBadge, Timeline, Sheet, CopyLink, customerUrl, areaImage } from "@/components/qb";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sales/quotations/$id")({ component: Detail });

function Detail() {
  const { id } = Route.useParams();
  const me = useMe();
  const db = useDB((d) => d);
  const q = db.quotations.find((x) => x.id === id && x.salesId === me?.id);
  const [share, setShare] = useState(false);
  if (!q) return <p className="p-8">Quotation not found.</p>;
  const t = totals(q, db);
  const editable = q.status === "draft" || q.status === "returned";
  const canSend = false;
  const priced = !["draft", "pending", "returned"].includes(q.status);
  const shared = ["sent", "cust_approved", "cust_rejected", "cust_discuss"].includes(q.status);
  const returnedNote = [...q.history].reverse().find((h) => h.status === "returned")?.comment;

  const submit = () => {
    setDB((d) => { const x = d.quotations.find((y) => y.id === q.id)!; pushStatus(x, "sent", me!.name); });
    toast.success("Customer link generated");
    setShare(true);
  };

  return (
    <div className="page-enter">
      <div className="relative h-52">
        <img src={areaImage(q.areas[0]?.name ?? "")} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-fade" />
        <Link to="/sales/quotations" className="absolute left-4 top-5 grid size-10 place-items-center rounded-full bg-card/80 backdrop-blur"><ArrowLeft className="size-4" /></Link>
        <div className="absolute inset-x-5 bottom-5 text-primary-foreground">
          <p className="text-xs opacity-80">{q.number}</p>
          <h1 className="text-2xl">{q.customer.name}</h1>
        </div>
      </div>

      <div className="space-y-5 px-5 pt-5">
        <div className="flex items-center justify-between"><StatusBadge status={q.status} /><span className="text-xs text-muted-foreground">{q.customer.projectType}</span></div>

        {returnedNote && q.status === "returned" && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm"><p className="font-semibold text-destructive">Back Office comment</p><p className="mt-1">{returnedNote}</p></div>
        )}

        {q.changeLog.length > 0 && (
          <div className="card-lux gold-gradient p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="size-4 text-gold" /> Back Office changes</p>
            <ul className="mt-2 space-y-1 text-xs">
              {q.changeLog.map((c, i) => <li key={i}><span className="text-muted-foreground">{c.field}:</span> <s className="text-muted-foreground">{c.old}</s> → <b>{c.new}</b></li>)}
            </ul>
            {q.boNotes && <p className="mt-2 text-xs italic">“{q.boNotes}”</p>}
          </div>
        )}

        {priced ? <div className="card-lux p-5">
          <p className="label-lux">Grand total incl. GST</p>
          <p className="serif mt-1 text-4xl">{inr(t.grand)}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div><p className="text-muted-foreground">Subtotal</p><p className="font-semibold">{inr(t.subtotal)}</p></div>
            <div><p className="text-muted-foreground">Discount</p><p className={cn("font-semibold", q.discountPct > 0 && "text-gold")}>{inr(t.discount)}</p></div>
            <div><p className="text-muted-foreground">GST</p><p className="font-semibold">{inr(t.gst)}</p></div>
          </div>
        </div> : <div className="card-lux gold-gradient p-5"><p className="label-lux">Pricing</p><p className="mt-1 text-sm">Back Office is preparing the pricing. You'll see it here once it's sent to the customer.</p></div>}

        {q.areas.map((a, i) => (
          <div key={a.id} className="card-lux p-4">
            <div className="flex justify-between"><p className="font-semibold">{a.name}</p>{priced && <p className="font-semibold">{inr(t.areaTotals[i])}</p>}</div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {a.items.map((qi) => { const it = db.items.find((x) => x.id === qi.itemId)!; const ed = (qi.edited?.length ?? 0) > 0; return (
                <li key={qi.id} className={cn("flex justify-between rounded-lg px-2 py-1 -mx-2", ed && "bg-gold-soft")}>
                  <span className="text-muted-foreground">{it.name} · {measureOf(qi, it)} {measureLabel(it.measure)}{ed && <b className="ml-1 text-[10px] text-gold">EDITED</b>}</span>
                  <span>{priced ? inr(lineAmount(qi, it, q.marginPct)) : `× ${qi.qty}`}</span>
                </li>
              ); })}
            </ul>
          </div>
        ))}

        <div className="card-lux p-5"><p className="label-lux mb-4">Status timeline</p><Timeline history={q.history} /></div>

        <div className="space-y-2 pb-4">
          {editable && <Link to="/sales/new" search={{ id: q.id }} className="btn btn-dark w-full py-3.5"><Pencil className="size-4" /> Continue editing</Link>}
          {canSend && <button onClick={submit} className="btn btn-primary w-full py-3.5"><Send className="size-4" /> Submit to Customer</button>}
          {shared && <button onClick={() => setShare(true)} className="btn btn-outline w-full py-3.5"><MessageCircle className="size-4" /> Share customer link</button>}
        </div>
      </div>

      <Sheet open={share} onClose={() => setShare(false)} title="Share via WhatsApp">
        <div className="rounded-2xl bg-whatsapp-bg p-4">
          <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-whatsapp-bubble p-3 text-sm shadow-soft">
            Hi {q.customer.name.split(" ")[0]}, your quotation {q.number} is ready: <span className="break-all text-info underline">{customerUrl(q.token)}</span>
          </div>
        </div>
        <div className="mt-4"><CopyLink url={customerUrl(q.token)} /></div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to="/wa/$token" params={{ token: q.token }} className="btn bg-whatsapp text-primary-foreground"><MessageCircle className="size-4" /> Send on WhatsApp</Link>
          <a href={customerUrl(q.token)} target="_blank" rel="noreferrer" className="btn btn-outline">Open link</a>
        </div>
      </Sheet>
    </div>
  );
}
