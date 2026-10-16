import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { setDB, uid, useDB, type MatCat, type MeasureType } from "@/lib/store";
import { Field, Sheet, IMAGES } from "@/components/qb";
import { measureLabel } from "@/lib/calc";
import { PageHead } from "@/components/PageHead";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/materials")({ component: Materials });

const TABS = ["Items", "Material", "Finish", "Colour", "Hardware"] as const;

function Materials() {
  const db = useDB((d) => d);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Items");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("sqft");
  const [labour, setLabour] = useState(200);

  const add = () => {
    if (!name.trim()) return;
    setDB((d) => {
      if (tab === "Items") d.items.push({ id: uid("i"), name, measure: unit as MeasureType, labourRate: labour, image: "materials", description: "" });
      else d.materials.push({ id: uid("m"), name, category: tab as MatCat, unit, swatch: "oklch(0.75 0.04 70)" });
    });
    setName(""); setAdding(false);
  };

  return (
    <>
      <PageHead title="Materials & Items" sub="The catalogue Sales picks from on site." action={<button className="btn btn-primary" onClick={() => setAdding(true)}><Plus className="size-4" /> Add {tab === "Items" ? "item" : tab.toLowerCase()}</button>} />
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("rounded-full border px-4 py-2 text-sm font-semibold", tab === t ? "border-charcoal bg-charcoal text-charcoal-foreground" : "bg-card")}>{t === "Items" ? "Items" : t + "s"}</button>)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tab === "Items" ? db.items.map((it) => (
          <div key={it.id} className="card-lux overflow-hidden">
            <img src={IMAGES[it.image]} alt="" className="h-36 w-full object-cover" loading="lazy" />
            <div className="p-4"><p className="font-semibold">{it.name}</p><p className="text-xs text-muted-foreground">{it.description}</p>
              <p className="mt-2 text-xs">Measured in <b>{measureLabel(it.measure)}</b> · Labour ₹{it.labourRate}</p></div>
          </div>
        )) : db.materials.filter((m) => m.category === tab).map((m) => (
          <div key={m.id} className="card-lux overflow-hidden">
            <div className="h-28 relative" style={{ background: m.swatch }}>
              {tab !== "Colour" && <img src={IMAGES.materials} alt="" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-40" loading="lazy" />}
            </div>
            <div className="p-4"><p className="font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">Unit: {m.unit}</p></div>
          </div>
        ))}
      </div>
      <Sheet open={adding} onClose={() => setAdding(false)} title={`New ${tab === "Items" ? "item" : tab.toLowerCase()}`} side="center">
        <div className="space-y-3">
          <Field label="Name"><input className="input-lux" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Unit"><select className="input-lux" value={unit} onChange={(e) => setUnit(e.target.value)}>{(tab === "Items" ? ["sqft", "rft", "nos"] : ["sqft", "rft", "set", "nos", "-"]).map((u) => <option key={u}>{u}</option>)}</select></Field>
          {tab === "Items" && <Field label="Labour rate ₹"><input type="number" className="input-lux" value={labour} onChange={(e) => setLabour(Number(e.target.value))} /></Field>}
          <button className="btn btn-primary w-full" onClick={add}>Add</button>
        </div>
      </Sheet>
    </>
  );
}
