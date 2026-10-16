import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { getDB, setDB, uid, useDB, pushStatus, type Area, type Customer, type QItem, type Quotation } from "@/lib/store";
import { useMe } from "@/lib/session";
import { applyRates, newLine } from "@/lib/pricing";
import { totals, inr, lineAmount, measureOf, measureLabel } from "@/lib/calc";
import { Field, Sheet, Swatch, IMAGES } from "@/components/qb";
import { cn } from "@/lib/utils";
import { TEMPLATES, loadTemplate } from "@/lib/templates";
const TYPE_IMG = { Apartment: IMAGES.living, Villa: IMAGES.bedroom, House: IMAGES.kitchen, Office: IMAGES.materials, Retail: IMAGES.living } as const;

export const Route = createFileRoute("/sales/new")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => (typeof s.id === "string" ? { id: s.id } : {}),
  component: Wizard,
});

const STEPS = ["Customer", "Areas", "Items", "Review"];
const ROOM_PRESETS = ["Living Room", "Master Bedroom", "Kitchen", "Guest Bedroom", "Kids Room", "Study", "Dining", "Foyer"];

function blank(salesId: string): Quotation {
  const n = getDB().quotations.length + 101;
  return {
    id: uid("q"), number: `QB-2026-${String(n).padStart(4, "0")}`, token: uid("tk") + Math.random().toString(36).slice(2, 10),
    salesId, customer: { name: "", phone: "", email: "", address: "", projectType: "Apartment" },
    areas: [], status: "draft", marginPct: 22, discountPct: 0, notes: "", boNotes: "",
    history: [], changeLog: [], createdAt: new Date().toISOString(), validDays: 15,
  };
}

function Wizard() {
  const { id } = Route.useSearch();
  const me = useMe()!;
  const nav = useNavigate();
  const db = useDB((d) => d);
  const [q, setQ] = useState<Quotation>(() => structuredClone(getDB().quotations.find((x) => x.id === id) ?? blank(me.id)));
  const [step, setStep] = useState(0);
  const t = useMemo(() => totals(q, db), [q, db]);

  const setCust = (k: keyof Customer, v: string) => setQ((p) => ({ ...p, customer: { ...p.customer, [k]: v } }));
  const setAreas = (fn: (a: Area[]) => Area[]) => setQ((p) => ({ ...p, areas: fn(p.areas) }));

  const canNext = [
    q.customer.name.trim() && q.customer.phone.trim() && q.customer.address.trim(),
    q.areas.length > 0,
    q.areas.length > 0 && q.areas.every((a) => a.items.length > 0),
    true,
  ][step];

  const save = (submit: boolean) => {
    setDB((d) => {
      const i = d.quotations.findIndex((x) => x.id === q.id);
      const next = structuredClone(q);
      if (i < 0) next.history.push({ status: "draft", at: new Date().toISOString(), actor: me.name });
      if (submit) pushStatus(next, "pending", me.name);
      if (i < 0) d.quotations.push(next); else d.quotations[i] = next;
    });
    toast.success(submit ? "Submitted for Back Office approval" : "Draft saved");
    nav({ to: "/sales/quotations/$id", params: { id: q.id } });
  };

  return (
    <div className="page-enter">
      <div className="sticky top-0 z-20 bg-background/90 px-5 pb-4 pt-6 backdrop-blur">
        <div className="flex items-center justify-between">
          <button onClick={() => (step ? setStep(step - 1) : nav({ to: "/sales" }))} className="btn btn-ghost -ml-3 p-2"><ArrowLeft className="size-5" /></button>
          <p className="text-xs text-muted-foreground">{q.number}</p>
          <button onClick={() => save(false)} className="text-xs font-semibold text-gold">Save draft</button>
        </div>
        <h1 className="mt-2 text-2xl">{STEPS[step]}</h1>
        <div className="mt-4 flex gap-1.5">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => i < step && setStep(i)} className="flex-1">
              <span className={cn("block h-1 rounded-full transition-all", i <= step ? "bg-gold" : "bg-border")} />
              <span className={cn("mt-1.5 block text-[10px] font-semibold", i === step ? "text-foreground" : "text-muted-foreground")}>{i + 1}. {s}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-40">
        {step === 0 && (
          <div className="space-y-4">
            <Field label="Customer name"><input className="input-lux" value={q.customer.name} onChange={(e) => setCust("name", e.target.value)} placeholder="e.g. Ananya Rao" /></Field>
            <Field label="Phone"><input className="input-lux" inputMode="tel" value={q.customer.phone} onChange={(e) => setCust("phone", e.target.value)} placeholder="+91" /></Field>
            <Field label="Email"><input className="input-lux" type="email" value={q.customer.email} onChange={(e) => setCust("email", e.target.value)} /></Field>
            <Field label="Site address"><textarea className="input-lux" rows={3} value={q.customer.address} onChange={(e) => setCust("address", e.target.value)} /></Field>
            <div>
              <p className="label-lux mb-1">Project type</p>
              <p className="mb-3 text-xs text-muted-foreground">Selecting a type loads its standard rooms & items — adjust them on site.</p>
              <div className="grid grid-cols-2 gap-3">
                {(["Apartment", "Villa", "House", "Office", "Retail"] as const).map((p) => {
                  const tpl = TEMPLATES[p]; const active = q.customer.projectType === p;
                  return (
                    <button key={p} onClick={() => setQ((prev) => ({ ...prev, customer: { ...prev.customer, projectType: p }, areas: loadTemplate(getDB(), p) }))}
                      className={cn("card-lux relative overflow-hidden text-left transition", active && "ring-2 ring-gold border-gold", p === "Apartment" && "col-span-2")}>
                      <img src={TYPE_IMG[p]} alt="" className={cn("w-full object-cover", p === "Apartment" ? "h-28" : "h-20")} />
                      {active && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-gold text-primary-foreground"><Check className="size-3.5" /></span>}
                      <div className="p-3"><p className="text-sm font-semibold">{p}</p><p className="text-[11px] text-muted-foreground">{tpl.length} rooms · {tpl.reduce((s, r) => s + r.items.length, 0)} items</p></div>
                    </button>
                  );
                })}
              </div>
              {q.areas.length > 0 && <p className="mt-3 rounded-xl bg-gold-soft px-3 py-2 text-xs text-accent-foreground"><b>{q.customer.projectType} template loaded:</b> {q.areas.map((a) => a.name).join(", ")}</p>}
            </div>
          </div>
        )}

        {step === 1 && <AreasStep areas={q.areas} setAreas={setAreas} />}
        {step === 2 && <ItemsStep q={q} setAreas={setAreas} />}
        {step === 3 && <Review q={q} />}
      </div>

      <div className="fixed bottom-[84px] left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 px-4">
        <div className="card-lux flex items-center gap-3 p-3 pl-5 shadow-lux">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total incl. GST</p>
            <p className="serif text-xl leading-tight">{inr(t.grand)}</p>
          </div>
          {step < 3 ? (
            <button disabled={!canNext} onClick={() => setStep(step + 1)} className="btn btn-primary">Next <ArrowRight className="size-4" /></button>
          ) : (
            <button onClick={() => save(true)} className="btn btn-primary">Submit for Approval</button>
          )}
        </div>
      </div>
    </div>
  );
}

function AreasStep({ areas, setAreas }: { areas: Area[]; setAreas: (fn: (a: Area[]) => Area[]) => void }) {
  const [custom, setCustom] = useState("");
  const add = (name: string) => name.trim() && setAreas((a) => [...a, { id: uid("a"), name: name.trim(), items: [] }]);
  return (
    <div>
      <p className="text-sm text-muted-foreground">Add every room or zone you measured on site.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {ROOM_PRESETS.map((r) => (
          <button key={r} onClick={() => add(r)} className="rounded-full border bg-card px-3.5 py-2 text-sm hover:border-gold"><Plus className="mr-1 inline size-3.5" />{r}</button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="input-lux" placeholder="Custom area name" value={custom} onChange={(e) => setCustom(e.target.value)} />
        <button className="btn btn-dark" onClick={() => { add(custom); setCustom(""); }}>Add</button>
      </div>
      <div className="mt-6 space-y-2">
        {areas.map((a, i) => (
          <div key={a.id} className="card-lux flex items-center gap-3 p-3">
            <span className="grid size-9 place-items-center rounded-xl bg-accent serif">{i + 1}</span>
            <input className="flex-1 bg-transparent font-semibold outline-none" value={a.name} onChange={(e) => setAreas((all) => all.map((x) => (x.id === a.id ? { ...x, name: e.target.value } : x)))} />
            <span className="text-xs text-muted-foreground">{a.items.length} items</span>
            <button onClick={() => setAreas((all) => all.filter((x) => x.id !== a.id))} className="btn btn-ghost p-2"><Trash2 className="size-4 text-destructive" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemsStep({ q, setAreas }: { q: Quotation; setAreas: (fn: (a: Area[]) => Area[]) => void }) {
  const db = useDB((d) => d);
  const [picker, setPicker] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const t = totals(q, db);
  const updateLine = (areaId: string, qi: QItem, reprice = false) =>
    setAreas((all) => all.map((a) => (a.id === areaId ? { ...a, items: a.items.map((x) => (x.id === qi.id ? (reprice ? applyRates(db, qi) : qi) : x)) } : a)));

  return (
    <div className="space-y-6">
      {q.areas.map((a, ai) => (
        <section key={a.id}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg">{a.name}</h2>
            <span className="text-sm font-semibold">{inr(t.areaTotals[ai])}</span>
          </div>
          <div className="mt-3 space-y-2">
            {a.items.map((qi) => {
              const item = db.items.find((i) => i.id === qi.itemId)!;
              const isOpen = open === qi.id;
              const opt = (cat: string) => db.materials.filter((m) => m.category === cat);
              return (
                <div key={qi.id} className="card-lux overflow-hidden">
                  <button onClick={() => setOpen(isOpen ? null : qi.id)} className="flex w-full items-center gap-3 p-3 text-left">
                    <img src={IMAGES[item.image]} alt="" className="size-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{measureOf(qi, item)} {measureLabel(item.measure)} × {qi.qty}</p>
                    </div>
                    <span className="text-sm font-semibold">{inr(lineAmount(qi, item, q.marginPct))}</span>
                    <ChevronDown className={cn("size-4 transition", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="space-y-3 border-t bg-muted/40 p-4">
                      {(["Material", "Finish", "Colour", "Hardware"] as const).map((cat) => {
                        const key = { Material: "materialId", Finish: "finishId", Colour: "colourId", Hardware: "hardwareId" }[cat] as "materialId";
                        return (
                          <div key={cat}>
                            <p className="label-lux mb-1.5">{cat}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {opt(cat).map((m) => (
                                <button key={m.id} onClick={() => updateLine(a.id, { ...qi, [key]: m.id }, true)} className={cn("rounded-full", qi[key] === m.id && "ring-2 ring-gold")}>
                                  <Swatch color={m.swatch} label={m.name} />
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      <div className="grid grid-cols-4 gap-2">
                        {(["length", "width", "height"] as const).map((k) => (
                          <Field key={k} label={k[0].toUpperCase() + k.slice(1, 1) + k.slice(1)}>
                            <input className="input-lux px-2" inputMode="decimal" type="number" value={qi[k] || ""} onChange={(e) => updateLine(a.id, { ...qi, [k]: Number(e.target.value) })} />
                          </Field>
                        ))}
                        <Field label="Unit">
                          <select className="input-lux px-2" value={qi.unit} onChange={(e) => updateLine(a.id, { ...qi, unit: e.target.value as QItem["unit"] })}>
                            <option>ft</option><option>in</option><option>mm</option>
                          </select>
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Quantity"><input className="input-lux" type="number" min={1} value={qi.qty} onChange={(e) => updateLine(a.id, { ...qi, qty: Number(e.target.value) })} /></Field>
                        <div className="rounded-xl bg-card p-2.5 text-xs">
                          <p className="text-muted-foreground">Auto measure</p>
                          <p className="font-semibold">{measureOf(qi, item)} {measureLabel(item.measure)}</p>
                        </div>
                      </div>
                      <Field label="Notes"><input className="input-lux" value={qi.notes} onChange={(e) => updateLine(a.id, { ...qi, notes: e.target.value })} /></Field>
                      <div className="rounded-xl bg-card p-3 text-xs text-muted-foreground">
                        Material ₹{qi.materialRate}/{measureLabel(item.measure)} + Labour ₹{qi.labourRate} + Hardware ₹{qi.hardwareCost} · from Vendor Cost Master
                      </div>
                      <button onClick={() => setAreas((all) => all.map((x) => (x.id === a.id ? { ...x, items: x.items.filter((y) => y.id !== qi.id) } : x)))} className="text-xs font-semibold text-destructive">Remove item</button>
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={() => setPicker(a.id)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-sm font-semibold text-gold hover:bg-card"><Plus className="size-4" /> Add item</button>
          </div>
        </section>
      ))}
      <Sheet open={!!picker} onClose={() => setPicker(null)} title="Item catalogue">
        <div className="grid grid-cols-2 gap-3">
          {db.items.map((it) => (
            <button key={it.id} onClick={() => {
              const line = newLine(db, it.id);
              setAreas((all) => all.map((x) => (x.id === picker ? { ...x, items: [...x.items, line] } : x)));
              setOpen(line.id); setPicker(null);
            }} className="card-lux overflow-hidden text-left hover:border-gold">
              <img src={IMAGES[it.image]} alt="" className="h-20 w-full object-cover" loading="lazy" />
              <div className="p-2.5"><p className="text-sm font-semibold leading-tight">{it.name}</p><p className="text-[11px] text-muted-foreground">per {measureLabel(it.measure)}</p></div>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

function Review({ q }: { q: Quotation }) {
  const db = useDB((d) => d);
  const t = totals(q, db);
  return (
    <div className="space-y-4">
      <div className="card-lux p-4">
        <p className="label-lux">Customer</p>
        <p className="mt-1 font-semibold">{q.customer.name}</p>
        <p className="text-sm text-muted-foreground">{q.customer.phone} · {q.customer.projectType}</p>
        <p className="text-sm text-muted-foreground">{q.customer.address}</p>
      </div>
      {q.areas.map((a, i) => (
        <div key={a.id} className="card-lux p-4">
          <div className="flex justify-between"><p className="font-semibold">{a.name}</p><p className="font-semibold">{inr(t.areaTotals[i])}</p></div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {a.items.map((qi) => { const it = db.items.find((x) => x.id === qi.itemId)!; return (
              <li key={qi.id} className="flex justify-between"><span>{it.name} · {measureOf(qi, it)} {measureLabel(it.measure)}</span><span>{inr(lineAmount(qi, it, q.marginPct))}</span></li>
            ); })}
          </ul>
        </div>
      ))}
      <div className="card-lux space-y-2 p-4 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{inr(t.subtotal)}</span></div>
        <div className="flex justify-between"><span>GST 18%</span><span>{inr(t.gst)}</span></div>
        <div className="flex justify-between border-t pt-2 serif text-xl"><span>Grand total</span><span>{inr(t.grand)}</span></div>
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-4 text-success" /> Back Office will review rates before it reaches the customer.</p>
    </div>
  );
}
