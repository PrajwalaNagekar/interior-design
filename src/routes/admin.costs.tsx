import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { setDB, uid, useDB } from "@/lib/store";
import { fmtDate } from "@/components/qb";
import { PageHead } from "@/components/PageHead";

export const Route = createFileRoute("/admin/costs")({ component: Costs });

function Costs() {
  const db = useDB((d) => d);
  const [f, setF] = useState("");
  const rows = db.costs.filter((c) => !f || c.vendorId === f);
  const upd = (id: string, patch: Record<string, string | number>) => {
    setDB((d) => { const c = d.costs.find((x) => x.id === id)!; Object.assign(c, patch, { updatedAt: new Date().toISOString() }); });
  };
  const add = () => setDB((d) => { d.costs.unshift({ id: uid("c"), vendorId: d.vendors[0].id, refId: d.materials[0].id, rate: 0, unit: "sqft", validTill: "2027-03-31", updatedAt: new Date().toISOString() }); });
  return (
    <>
      <PageHead title="Vendor Cost Master" sub="Rates here feed every new quotation automatically. Click a cell to edit."
        action={<div className="flex gap-2"><select className="input-lux w-56" value={f} onChange={(e) => setF(e.target.value)}><option value="">All vendors</option>{db.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select><button className="btn btn-primary" onClick={add}><Plus className="size-4" /> Add rate</button></div>} />
      <div className="card-lux max-h-[72vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card"><tr className="border-b text-left">{["Vendor", "Material / Item", "Rate ₹", "Unit", "Valid till", "Last updated"].map((h) => <th key={h} className="label-lux px-5 py-4">{h}</th>)}</tr></thead>
          <tbody>{rows.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/40">
              <td className="px-3 py-2"><select className="w-full rounded-lg bg-transparent px-2 py-2 hover:bg-muted focus:bg-card focus:outline-gold" value={c.vendorId} onChange={(e) => upd(c.id, { vendorId: e.target.value })}>{db.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></td>
              <td className="px-3 py-2"><select className="w-full rounded-lg bg-transparent px-2 py-2 font-medium hover:bg-muted focus:bg-card" value={c.refId} onChange={(e) => upd(c.id, { refId: e.target.value })}>{db.materials.filter((m) => m.category !== "Colour").map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></td>
              <td className="px-3 py-2"><input type="number" className="w-28 rounded-lg bg-transparent px-2 py-2 text-right font-semibold hover:bg-muted focus:bg-card" defaultValue={c.rate} onBlur={(e) => { const v = Number(e.target.value); if (v !== c.rate) { upd(c.id, { rate: v }); toast.success("Rate updated"); } }} /></td>
              <td className="px-3 py-2"><input className="w-20 rounded-lg bg-transparent px-2 py-2 hover:bg-muted focus:bg-card" defaultValue={c.unit} onBlur={(e) => upd(c.id, { unit: e.target.value })} /></td>
              <td className="px-3 py-2"><input type="date" className="rounded-lg bg-transparent px-2 py-2 hover:bg-muted focus:bg-card" value={c.validTill} onChange={(e) => upd(c.id, { validTill: e.target.value })} /></td>
              <td className="px-5 py-2 text-muted-foreground">{fmtDate(c.updatedAt)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
