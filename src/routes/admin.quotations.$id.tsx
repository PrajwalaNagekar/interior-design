import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Undo2, History, MessageCircle, Wand2, Loader2, Copy } from "lucide-react";
import { askAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import { getDB, setDB, useDB, pushStatus, type Quotation, type ChangeEntry } from "@/lib/store";
import { useMe } from "@/lib/session";
import { totals, inr, lineAmount, measureOf, measureLabel } from "@/lib/calc";
import { vendorRate } from "@/lib/pricing";
import { StatusBadge, Timeline, Field, Sheet, Swatch, fmtDate, CopyLink, customerUrl } from "@/components/qb";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/quotations/$id")({ component: Review });

type LineKey = "vendorId" | "materialRate" | "labourRate" | "hardwareCost" | "notes";

function Review() {
  const { id } = Route.useParams();
  const me = useMe()!;
  const nav = useNavigate();
  const db = useDB((d) => d);
  const orig = db.quotations.find((x) => x.id === id);
  const [q, setQ] = useState<Quotation | null>(() => (orig ? structuredClone(orig) : null));
  const [back, setBack] = useState(false);
  const [comment, setComment] = useState("");
  const [wa, setWa] = useState(false);
  const [confirmA, setConfirmA] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [aiOut, setAiOut] = useState<{ mode: "advisor" | "whatsapp"; text: string } | null>(null);

  const changes = useMemo<ChangeEntry[]>(() => {
    if (!q || !orig) return [];
    const out: ChangeEntry[] = [];
    const at = new Date().toISOString(), actor = me.name;
    const vName = (v: string) => db.vendors.find((x) => x.id === v)?.name ?? v;
    if (q.marginPct !== orig.marginPct) out.push({ field: "Margin %", old: String(orig.marginPct), new: String(q.marginPct), at, actor });
    if (q.discountPct !== orig.discountPct) out.push({ field: "Discount %", old: String(orig.discountPct), new: String(q.discountPct), at, actor });
    if (q.boNotes !== orig.boNotes) out.push({ field: "Back Office notes", old: orig.boNotes || "—", new: q.boNotes, at, actor });
    q.areas.forEach((a, ai) => a.items.forEach((qi, ii) => {
      const o = orig.areas[ai].items[ii];
      const name = `${a.name} · ${db.items.find((x) => x.id === qi.itemId)?.name}`;
      (["vendorId", "materialRate", "labourRate", "hardwareCost", "notes"] as LineKey[]).forEach((k) => {
        if (qi[k] !== o[k]) out.push({ field: `${name} – ${k === "vendorId" ? "Vendor" : k.replace("Rate", " rate").replace("Cost", " cost")}`, old: k === "vendorId" ? vName(String(o[k])) : String(o[k]), new: k === "vendorId" ? vName(String(qi[k])) : String(qi[k]), at, actor });
      });
    }));
    return out;
  }, [q, orig, db, me.name]);

  if (!q || !orig) return <p>Quotation not found.</p>;
  const t = totals(q, db);
  const tOrig = totals(orig, db);
  const reviewable = orig.status === "pending";
  const dirty = changes.length > 0;

  const setLine = (ai: number, ii: number, patch: Partial<Record<LineKey, string | number>>) =>
    setQ((p) => { const n = structuredClone(p!); Object.assign(n.areas[ai].items[ii], patch); return n; });

  const approve = () => {
    setDB((d) => {
      const x = d.quotations.find((y) => y.id === q.id)!;
      const next = structuredClone(q);
      next.areas.forEach((a, ai) => a.items.forEach((qi, ii) => {
        const o = orig.areas[ai].items[ii];
        qi.edited = (["vendorId", "materialRate", "labourRate", "hardwareCost", "notes"] as LineKey[]).filter((k) => qi[k] !== o[k]);
      }));
      Object.assign(x, next, { history: x.history, changeLog: [...x.changeLog, ...changes] });
      pushStatus(x, dirty ? "approved_changes" : "approved", `${me.name} (Back Office)`);
    });
    toast.success(dirty ? "Approved with changes — ready to send to customer" : "Approved — ready to send to customer");
    setQ(structuredClone(getDB().quotations.find((y) => y.id === id)!));
  };
  const sendBack = () => {
    setDB((d) => { const x = d.quotations.find((y) => y.id === q.id)!; pushStatus(x, "returned", `${me.name} (Back Office)`, comment || undefined); });
    toast("Sent back to Sales");
    nav({ to: "/admin/approvals" });
  };

  const sendWA = () => {
    if (orig.status === "approved" || orig.status === "approved_changes")
      setDB((d) => { const x = d.quotations.find((y) => y.id === q.id)!; pushStatus(x, "sent", `${me.name} (Back Office) via WhatsApp`); });
    setWa(true);
  };
  const canSend = ["approved", "approved_changes"].includes(orig.status);
  const shared = ["sent", "cust_approved", "cust_rejected", "cust_discuss"].includes(orig.status);
  const link = customerUrl(q.token);
  const waMsg = `Hello ${q.customer.name}, your interior design quotation ${q.number} (total ${inr(t.grand)}) is ready. View, approve or discuss here: ${link}`;

  const runAI = async (mode: "advisor" | "whatsapp") => {
    setAiBusy(mode);
    const lines = q.areas.flatMap((a, ai) => a.items.map((qi) => {
      const it = db.items.find((x) => x.id === qi.itemId);
      const m = (id: string) => db.materials.find((x) => x.id === id)?.name ?? "-";
      return `${a.name}: ${it?.name} | ${qi.length}x${qi.width}x${qi.height}${qi.unit} qty ${qi.qty} | ${m(qi.materialId)}, ${m(qi.finishId)}, ${m(qi.colourId)} | material ₹${qi.materialRate}, labour ₹${qi.labourRate}, hardware ₹${qi.hardwareCost} | vendor ${db.vendors.find((v) => v.id === qi.vendorId)?.name ?? "-"}`;
    }).concat(`${a.name} total ${inr(t.areaTotals[ai])}`));
    const summary = `Customer: ${q.customer.name}, ${q.customer.projectType}, ${q.customer.address}\nMargin ${q.marginPct}% Discount ${q.discountPct}%\nSubtotal ${inr(t.subtotal)} GST ${inr(t.gst)} Grand ${inr(t.grand)}\nSales notes: ${q.notes || "-"}\n${lines.join("\n")}`;
    try {
      const r = await askAI({ data: { mode, summary } });
      if (!r.ok) toast.error(r.error);
      else setAiOut({ mode, text: mode === "whatsapp" ? r.text.replace("{LINK}", link) : r.text });
    } catch { toast.error("AI request failed. Try again."); }
    setAiBusy(null);
  };

  const num = "input-lux py-1.5 px-2 text-right w-24";
  const changed = (a: unknown, b: unknown) => (a !== b ? "border-gold bg-gold-soft" : "");

  return (
    <>
      <Link to="/admin/quotations" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All quotations</Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-muted-foreground">{q.number} · Created {fmtDate(q.createdAt)} by {db.users.find((u) => u.id === q.salesId)?.name}</p><h1 className="mt-1 text-4xl">{q.customer.name}</h1></div>
        <StatusBadge status={orig.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6 min-w-0">
          <section className="card-lux p-6">
            <h2 className="mb-4 text-xl">Customer details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {([["Name", q.customer.name], ["Phone", q.customer.phone], ["Email", q.customer.email], ["Project type", q.customer.projectType], ["Site address", q.customer.address]] as const).map(([l, v]) => (
                <Field key={l} label={l} locked className={l === "Site address" ? "sm:col-span-2" : ""}><input className="input-lux" readOnly value={v} /></Field>
              ))}
            </div>
          </section>

          {q.areas.map((a, ai) => (
            <section key={a.id} className="card-lux overflow-hidden">
              <div className="flex items-baseline justify-between p-6 pb-3"><h2 className="text-xl">{a.name}</h2><span className="serif text-lg">{inr(t.areaTotals[ai])}</span></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-y bg-muted/50 text-left">{["Item & spec", "Measurements 🔒", "Qty 🔒", "Vendor", "Material ₹", "Labour ₹", "Hardware ₹", "Amount"].map((h) => <th key={h} className="label-lux px-4 py-3 whitespace-nowrap" title={h.includes("🔒") ? "Captured on site by Sales — read-only" : undefined}>{h.replace(" 🔒", "")}{h.includes("🔒") && " 🔒"}</th>)}</tr></thead>
                  <tbody>
                    {a.items.map((qi, ii) => {
                      const it = db.items.find((x) => x.id === qi.itemId)!;
                      const o = orig.areas[ai].items[ii];
                      const mats = [qi.materialId, qi.finishId, qi.colourId, qi.hardwareId].map((m) => db.materials.find((x) => x.id === m)).filter(Boolean);
                      const vendorOpts = db.vendors.filter((v) => db.costs.some((c) => c.vendorId === v.id && c.refId === qi.materialId));
                      return (
                        <tr key={qi.id} className="border-b align-top last:border-0">
                          <td className="px-4 py-4 min-w-56">
                            <p className="font-semibold">{it.name}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1">{mats.map((m) => <Swatch key={m!.id} color={m!.swatch} label={m!.name} />)}</div>
                            <input className={cn("input-lux mt-2 py-1.5 text-xs", changed(qi.notes, o.notes))} disabled={!reviewable} placeholder="Notes" value={qi.notes} onChange={(e) => setLine(ai, ii, { notes: e.target.value })} />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-muted-foreground" title="Captured on site by Sales — read-only">{qi.length}×{qi.width}{qi.height ? `×${qi.height}` : ""} {qi.unit}<br /><b className="text-foreground">{measureOf(qi, it)} {measureLabel(it.measure)}</b></td>
                          <td className="px-4 py-4 text-muted-foreground">{qi.qty}</td>
                          <td className="px-4 py-4">
                            <select disabled={!reviewable} className={cn("input-lux py-1.5 px-2 w-40", changed(qi.vendorId, o.vendorId))} value={qi.vendorId}
                              onChange={(e) => { const v = e.target.value; const base = vendorRate(getDB(), qi.materialId, v); const fin = db.costs.find((c) => c.refId === qi.finishId)?.rate ?? 0; setLine(ai, ii, { vendorId: v, ...(base != null ? { materialRate: base + fin } : {}) }); }}>
                              {vendorOpts.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                          </td>
                          {(["materialRate", "labourRate", "hardwareCost"] as const).map((k) => (
                            <td key={k} className="px-4 py-4"><input type="number" disabled={!reviewable} className={cn(num, changed(qi[k], o[k]))} value={qi[k]} onChange={(e) => setLine(ai, ii, { [k]: Number(e.target.value) })} /></td>
                          ))}
                          <td className="px-4 py-4 text-right font-semibold whitespace-nowrap">{inr(lineAmount(qi, it, q.marginPct))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section className="card-lux p-6"><h2 className="mb-5 text-xl">Status timeline</h2><Timeline history={orig.history} /></section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="card-lux p-6">
            <p className="label-lux">Grand total incl. GST</p>
            <p className="serif mt-1 text-4xl">{inr(t.grand)}</p>
            {t.grand !== tOrig.grand && <p className="mt-1 text-xs text-muted-foreground">was <s>{inr(tOrig.grand)}</s></p>}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Field label="Margin %"><input type="number" disabled={!reviewable} className={cn("input-lux", changed(q.marginPct, orig.marginPct))} value={q.marginPct} onChange={(e) => setQ({ ...q, marginPct: Number(e.target.value) })} /></Field>
              <Field label="Discount %"><input type="number" disabled={!reviewable} className={cn("input-lux", changed(q.discountPct, orig.discountPct))} value={q.discountPct} onChange={(e) => setQ({ ...q, discountPct: Number(e.target.value) })} /></Field>
            </div>
            <div className="mt-5 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(t.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>− {inr(t.discount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST 18%</span><span>{inr(t.gst)}</span></div>
            </div>
            <Field label="Back Office notes" className="mt-4"><textarea disabled={!reviewable} rows={3} className={cn("input-lux", changed(q.boNotes, orig.boNotes))} value={q.boNotes} onChange={(e) => setQ({ ...q, boNotes: e.target.value })} /></Field>
            {reviewable ? (
              <div className="mt-5 space-y-2">
                <button onClick={() => setConfirmA(true)} className="btn btn-primary w-full py-3.5"><Check className="size-4" /> {dirty ? "Approve with Changes" : "Approve"}</button>
                <button onClick={() => setBack(true)} className="btn btn-outline w-full"><Undo2 className="size-4" /> Send back to Sales</button>
                {dirty && <button onClick={() => setQ(structuredClone(orig))} className="btn btn-ghost w-full text-xs">Discard changes</button>}
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                {canSend && <button onClick={sendWA} className="btn w-full bg-whatsapp py-3.5 text-primary-foreground"><MessageCircle className="size-4" /> Send to customer on WhatsApp</button>}
                {shared && <button onClick={() => setWa(true)} className="btn btn-outline w-full"><MessageCircle className="size-4" /> Resend WhatsApp link</button>}
                {shared && <a href={link} target="_blank" rel="noreferrer" className="btn btn-ghost w-full text-xs">Open customer view</a>}
                {!canSend && !shared && <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">Waiting on Sales — editing is available while a quotation is pending approval.</p>}
              </div>
            )}
          </div>

          <div className="card-lux p-6">
            <p className="mb-1 flex items-center gap-2 font-semibold"><Wand2 className="size-4 text-gold" /> AI Pricing Advisor</p>
            <p className="mb-4 text-xs text-muted-foreground">Checks rates, margin and risks, and drafts the customer WhatsApp message.</p>
            <div className="grid grid-cols-2 gap-2">
              <button disabled={!!aiBusy} onClick={() => runAI("advisor")} className="btn btn-primary text-xs">{aiBusy === "advisor" ? <Loader2 className="size-4 animate-spin" /> : "Analyse quote"}</button>
              <button disabled={!!aiBusy} onClick={() => runAI("whatsapp")} className="btn btn-outline text-xs">{aiBusy === "whatsapp" ? <Loader2 className="size-4 animate-spin" /> : "Draft message"}</button>
            </div>
          </div>

          <div className="card-lux p-6">
            <p className="mb-3 flex items-center gap-2 font-semibold"><History className="size-4 text-gold" /> Change log</p>
            {[...orig.changeLog, ...(reviewable ? changes : [])].length === 0 && <p className="text-xs text-muted-foreground">No changes yet.</p>}
            <ul className="space-y-2 text-xs">
              {[...orig.changeLog, ...(reviewable ? changes : [])].map((c, i) => (
                <li key={i} className="rounded-lg bg-muted/60 p-2"><p className="font-semibold">{c.field}</p><p><s className="text-muted-foreground">{c.old}</s> → <b className="text-gold">{c.new}</b></p><p className="text-muted-foreground">{c.actor}{i >= orig.changeLog.length ? " · unsaved" : ` · ${fmtDate(c.at, true)}`}</p></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Sheet open={wa} onClose={() => setWa(false)} title="Sent via WhatsApp" side="center">
        <div className="rounded-2xl bg-whatsapp-bg p-4">
          <p className="mb-2 text-center text-[11px] text-muted-foreground">To {q.customer.name} · {q.customer.phone}</p>
          <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-whatsapp-bubble p-3 text-sm shadow-soft">{waMsg}</div>
        </div>
        <div className="mt-4"><CopyLink url={link} /></div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={`https://wa.me/${q.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noreferrer" className="btn bg-whatsapp text-primary-foreground"><MessageCircle className="size-4" /> Open WhatsApp</a>
          <a href={link} target="_blank" rel="noreferrer" className="btn btn-outline">Customer view</a>
        </div>
      </Sheet>

      <Sheet open={back} onClose={() => setBack(false)} title="Send back to Sales" side="center">
        <textarea className="input-lux" rows={4} placeholder="What should Sales revise?" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button onClick={sendBack} className="btn btn-dark mt-4 w-full">Send back</button>
      </Sheet>
      <Sheet open={!!aiOut} onClose={() => setAiOut(null)} title={aiOut?.mode === "whatsapp" ? "AI WhatsApp draft" : "AI Pricing Advisor"} side="center">
        <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">{aiOut?.text}</div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(aiOut?.text ?? ""); toast.success("Copied"); }} className="btn btn-outline flex-1"><Copy className="size-4" /> Copy</button>
          {aiOut?.mode === "whatsapp" && <a href={`https://wa.me/${q.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(aiOut.text)}`} target="_blank" rel="noreferrer" className="btn flex-1 bg-whatsapp text-primary-foreground"><MessageCircle className="size-4" /> Open WhatsApp</a>}
        </div>
      </Sheet>
      <Sheet open={confirmA} onClose={() => setConfirmA(false)} title={dirty ? "Approve with changes?" : "Approve quotation?"} side="center">
        <p className="text-sm text-muted-foreground">Grand total <b className="text-foreground">{inr(totals(q, db).grand)}</b>. After approval you can send it to {q.customer.name} on WhatsApp.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button className="btn btn-outline" onClick={() => setConfirmA(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { setConfirmA(false); approve(); }}><Check className="size-4" /> Approve</button>
        </div>
      </Sheet>
    </>
  );
}
