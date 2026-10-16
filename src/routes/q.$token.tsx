import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Phone, MessageCircle, ChevronDown, Download, Check, X, MessagesSquare, CheckCircle2 } from "lucide-react";
import { setDB, useDB, pushStatus, type Status } from "@/lib/store";
import { totals, inr, lineAmount, lineRate, measureOf, measureLabel } from "@/lib/calc";
import { COMPANY, Sheet, StatusBadge, fmtDate, areaImage } from "@/components/qb";
import { cn } from "@/lib/utils";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/q/$token")({
  ssr: false,
  head: () => ({ meta: [{ title: "Your Quotation — Your Interior Design Company" }, { name: "description", content: "View and respond to your interior design quotation." }, { property: "og:title", content: "Your interior design quotation" }, { property: "og:description", content: "Review, approve or discuss your proposal." }, { name: "robots", content: "noindex" }] }),
  component: () => <PhoneFrame label="Customer view"><CustomerQuote /></PhoneFrame>,
});

const TERMS = [
  "50% advance on order confirmation, 40% before installation, 10% on handover.",
  "Quotation valid for 15 days from the date of issue.",
  "Measurements are subject to final site verification.",
  "Electrical, plumbing and civil work are excluded unless specified.",
  "Warranty: 5 years on carcass, 1 year on hardware.",
];

function CustomerQuote() {
  const { token } = Route.useParams();
  const db = useDB((d) => d);
  const q = db.quotations.find((x) => x.token === token);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [terms, setTerms] = useState(false);
  const [sheet, setSheet] = useState<null | "cust_rejected" | "cust_discuss">(null);
  const [comment, setComment] = useState("");

  if (!q || q.status === "draft" || q.status === "pending" || q.status === "returned")
    return <div className="grid min-h-full place-items-center p-8 text-center"><div><h1 className="text-3xl">Link unavailable</h1><p className="mt-2 text-muted-foreground">This quotation link is invalid or not yet shared.</p></div></div>;

  const t = totals(q, db);
  const valid = new Date(q.history.find((h) => h.status === "sent")?.at ?? q.createdAt); valid.setDate(valid.getDate() + q.validDays);
  const sentAt = q.history.find((h) => h.status === "sent")?.at ?? q.createdAt;
  const done = ["cust_approved", "cust_rejected", "cust_discuss"].includes(q.status);
  const act = (s: Status, c?: string) => setDB((d) => { const x = d.quotations.find((y) => y.id === q.id)!; pushStatus(x, s, `${q.customer.name} (Customer)`, c || undefined); });
  const wa = `https://wa.me/${COMPANY.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, regarding quotation ${q.number}`)}`;

  if (done && !open.__view) {
    const map = { cust_approved: ["Thank you!", "Your approval has been received. Our team will reach out to schedule the next steps.", "var(--success)"], cust_rejected: ["Response recorded", "We're sorry this wasn't the right fit. Your feedback has been shared with our team.", "var(--destructive)"], cust_discuss: ["We'll be in touch", "Your designer will contact you shortly to discuss the quotation.", "var(--warning)"] } as const;
    const [h, p, c] = map[q.status as keyof typeof map];
    return (
      <div className="grid min-h-full place-items-center bg-background p-6 page-enter">
        <div className="card-lux w-full max-w-md p-8 text-center shadow-lux">
          <span className="mx-auto grid size-16 place-items-center rounded-full" style={{ background: `color-mix(in oklab, ${c} 14%, transparent)`, color: c }}><CheckCircle2 className="size-8" /></span>
          <h1 className="mt-5 text-3xl">{h}</h1>
          <p className="mt-2 text-muted-foreground">{p}</p>
          <div className="mt-5"><StatusBadge status={q.status} /></div>
          <p className="mt-6 text-xs text-muted-foreground">{q.number} · {inr(t.grand)}</p>
          <button className="btn btn-outline mt-6 w-full" onClick={() => setOpen({ ...open, __view: true })}>View quotation</button>
          {localStorage.getItem("qb_customer") && <Link to="/c" className="btn btn-primary mt-2 w-full">Back to my quotations</Link>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background pb-44 print:pb-0">
      <div className="mx-auto max-w-4xl">
        <header className="relative overflow-hidden">
          {typeof window !== "undefined" && localStorage.getItem("qb_customer") && (
            <Link to="/c" className="no-print absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-card/85 px-3 py-1.5 text-xs font-semibold backdrop-blur"><ArrowLeft className="size-3.5" /> My quotations</Link>
          )}
          <img src={areaImage(q.areas[0]?.name ?? "")} alt="" className="h-56 w-full object-cover print:h-40" />
          <div className="absolute inset-0 hero-fade" />
          <div className="absolute inset-x-5 bottom-5 text-primary-foreground">
            <p className="label-lux text-primary-foreground/80">Interior design proposal</p>
            <h1 className="mt-1 text-3xl">{q.customer.name}</h1>
          </div>
        </header>

        <div className="space-y-5 px-5 pt-6">
          <section className="card-lux p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="serif text-xl">{COMPANY.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{COMPANY.address}</p>
                <p className="text-sm text-muted-foreground">{COMPANY.phone} · {COMPANY.email}</p>
                <p className="text-xs text-muted-foreground">GSTIN {COMPANY.gst}</p>
              </div>
              <div className="flex gap-2 no-print">
                <a href={`tel:${COMPANY.phone}`} className="btn btn-outline p-3" aria-label="Call"><Phone className="size-4" /></a>
                <a href={wa} target="_blank" rel="noreferrer" className="btn bg-whatsapp p-3 text-primary-foreground" aria-label="WhatsApp"><MessageCircle className="size-4" /></a>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 text-sm">
              <div><p className="label-lux">Quotation</p><p className="font-semibold">{q.number}</p></div>
              <div><p className="label-lux">Date</p><p className="font-semibold">{fmtDate(sentAt)}</p></div>
              <div><p className="label-lux">Valid until</p><p className="font-semibold">{fmtDate(valid.toISOString())}</p></div>
              <div><p className="label-lux">Project</p><p className="font-semibold">{q.customer.projectType}</p></div>
              <div className="col-span-2"><p className="label-lux">Prepared for</p><p className="font-semibold">{q.customer.name}</p><p className="text-muted-foreground">{q.customer.address} · {q.customer.phone}</p></div>
            </div>
          </section>

          {q.areas.map((a, ai) => {
            const isOpen = open[a.id] ?? ai === 0;
            return (
              <section key={a.id} className="card-lux overflow-hidden">
                <button onClick={() => setOpen({ ...open, [a.id]: !isOpen })} className="flex w-full items-center gap-4 p-5 text-left">
                  <img src={areaImage(a.name)} alt="" className="size-14 rounded-2xl object-cover" loading="lazy" />
                  <div className="flex-1"><h2 className="text-xl">{a.name}</h2><p className="text-xs text-muted-foreground">{a.items.length} items</p></div>
                  <span className="serif text-lg">{inr(t.areaTotals[ai])}</span>
                  <ChevronDown className={cn("size-5 transition no-print", isOpen && "rotate-180")} />
                </button>
                <div className={cn("border-t", !isOpen && "hidden print:block")}>
                  <div className="divide-y">
                    {a.items.map((qi) => { const it = db.items.find((x) => x.id === qi.itemId)!; const mat = (id: string) => db.materials.find((m) => m.id === id)?.name; return (
                      <div key={qi.id} className="p-5">
                        <div className="flex justify-between gap-3"><p className="font-semibold">{it.name}</p><p className="font-semibold">{inr(lineAmount(qi, it, q.marginPct))}</p></div>
                        <p className="mt-1 text-sm text-muted-foreground">{it.description}</p>
                        <p className="mt-2 text-xs">{mat(qi.materialId)} · {mat(qi.finishId)} · {mat(qi.colourId)}</p>
                        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted p-3 text-xs">
                          <div><p className="text-muted-foreground">Size</p><p className="font-semibold">{measureOf(qi, it)} {measureLabel(it.measure)}</p></div>
                          <div><p className="text-muted-foreground">Qty</p><p className="font-semibold">{qi.qty}</p></div>
                          <div><p className="text-muted-foreground">Rate</p><p className="font-semibold">{inr(lineRate(qi, it, q.marginPct))}</p></div>
                        </div>
                      </div>
                    ); })}
                  </div>
                  <table className="hidden w-full text-sm print:table">
                    <thead><tr className="bg-muted/50 text-left">{["Description", "Material / Finish", "Measure", "Qty", "Rate", "Amount"].map((h) => <th key={h} className="label-lux px-5 py-3">{h}</th>)}</tr></thead>
                    <tbody>{a.items.map((qi) => { const it = db.items.find((x) => x.id === qi.itemId)!; const mat = (id: string) => db.materials.find((m) => m.id === id)?.name; return (
                      <tr key={qi.id} className="border-t align-top">
                        <td className="px-5 py-4"><p className="font-semibold">{it.name}</p><p className="text-xs text-muted-foreground">{it.description}</p></td>
                        <td className="px-5 py-4 text-xs">{mat(qi.materialId)}<br />{mat(qi.finishId)} · {mat(qi.colourId)}</td>
                        <td className="px-5 py-4 whitespace-nowrap">{measureOf(qi, it)} {measureLabel(it.measure)}</td>
                        <td className="px-5 py-4">{qi.qty}</td>
                        <td className="px-5 py-4 whitespace-nowrap">{inr(lineRate(qi, it, q.marginPct))}</td>
                        <td className="px-5 py-4 text-right font-semibold whitespace-nowrap">{inr(lineAmount(qi, it, q.marginPct))}</td>
                      </tr>
                    ); })}</tbody>
                  </table>
                </div>
              </section>
            );
          })}

          <section className="card-lux gold-gradient p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{inr(t.subtotal)}</span></div>
              {t.discount > 0 && <div className="flex justify-between text-gold"><span>Discount ({q.discountPct}%)</span><span>− {inr(t.discount)}</span></div>}
              <div className="flex justify-between"><span>GST (18%)</span><span>{inr(t.gst)}</span></div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t pt-4"><span className="label-lux">Grand total incl. GST</span><span className="serif text-4xl">{inr(t.grand)}</span></div>
          </section>

          <section className="card-lux">
            <button onClick={() => setTerms(!terms)} className="flex w-full items-center justify-between p-5"><span className="serif text-lg">Terms & conditions</span><ChevronDown className={cn("size-5 transition no-print", terms && "rotate-180")} /></button>
            <ol className={cn("list-decimal space-y-1.5 border-t px-10 py-5 text-sm text-muted-foreground", !terms && "hidden print:block")}>{TERMS.map((x) => <li key={x}>{x}</li>)}</ol>
          </section>

          <button onClick={() => window.print()} className="btn btn-outline w-full no-print"><Download className="size-4" /> Download PDF</button>
          {done && <div className="text-center no-print"><StatusBadge status={q.status} /></div>}
        </div>
      </div>

      {!done && (
        <div className="glass-nav fixed inset-x-0 bottom-0 z-30 no-print">
          <div className="mx-auto max-w-4xl px-4 pb-5 pt-3">
            <div className="mb-3 flex items-baseline justify-between px-1"><span className="text-xs text-muted-foreground">Total incl. GST</span><span className="serif text-2xl">{inr(t.grand)}</span></div>
            <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
              <button onClick={() => setSheet("cust_rejected")} className="btn btn-outline px-2 py-3.5"><X className="size-4" /> Reject</button>
              <button onClick={() => setSheet("cust_discuss")} className="btn btn-outline px-2 py-3.5"><MessagesSquare className="size-4" /> Discuss</button>
              <button onClick={() => act("cust_approved")} className="btn btn-primary py-3.5"><Check className="size-4" /> Approve</button>
            </div>
          </div>
        </div>
      )}

      <Sheet open={!!sheet} onClose={() => setSheet(null)} title={sheet === "cust_rejected" ? "Reject quotation" : "Request a discussion"}>
        <p className="mb-3 text-sm text-muted-foreground">Add a comment for your designer (optional).</p>
        <textarea className="input-lux" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={sheet === "cust_rejected" ? "Let us know why…" : "What would you like to discuss?"} />
        <button onClick={() => { act(sheet!, comment); setSheet(null); }} className={cn("btn mt-4 w-full py-3.5", sheet === "cust_rejected" ? "btn-dark" : "btn-primary")}>Submit</button>
      </Sheet>
    </div>
  );
}
