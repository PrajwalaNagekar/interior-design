import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { setDB, uid, useDB, type Vendor } from "@/lib/store";
import { Field, Sheet } from "@/components/qb";
import { PageHead } from "@/components/PageHead";

export const Route = createFileRoute("/admin/vendors")({ component: Vendors });

const empty = (): Vendor => ({ id: uid("v"), name: "", contact: "", phone: "", gst: "", category: "", terms: "30 days", active: true });

function Vendors() {
  const vendors = useDB((d) => d.vendors);
  const [edit, setEdit] = useState<Vendor | null>(null);
  const save = () => { if (!edit?.name) return; setDB((d) => { const i = d.vendors.findIndex((v) => v.id === edit.id); if (i < 0) d.vendors.push(edit); else d.vendors[i] = edit; }); setEdit(null); };
  return (
    <>
      <PageHead title="Vendors" sub="Suppliers and contractors feeding the cost master." action={<button className="btn btn-primary" onClick={() => setEdit(empty())}><Plus className="size-4" /> Add vendor</button>} />
      <div className="card-lux overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card"><tr className="border-b text-left">{["Vendor", "Contact", "GST no.", "Category", "Payment terms", "Status", ""].map((h) => <th key={h} className="label-lux px-5 py-4">{h}</th>)}</tr></thead>
          <tbody>{vendors.map((v) => (
            <tr key={v.id} className="border-b last:border-0 hover:bg-muted/40">
              <td className="px-5 py-4 font-semibold">{v.name}</td>
              <td className="px-5 py-4">{v.contact}<p className="text-xs text-muted-foreground">{v.phone}</p></td>
              <td className="px-5 py-4 font-mono text-xs">{v.gst}</td>
              <td className="px-5 py-4">{v.category}</td>
              <td className="px-5 py-4">{v.terms}</td>
              <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${v.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{v.active ? "Active" : "Inactive"}</span></td>
              <td className="px-5 py-4"><button className="btn btn-ghost p-2" onClick={() => setEdit({ ...v })}><Pencil className="size-4" /></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit && vendors.some((v) => v.id === edit.id) ? "Edit vendor" : "New vendor"} side="center">
        {edit && <div className="space-y-3">
          {([["name", "Name"], ["contact", "Contact person"], ["phone", "Phone"], ["gst", "GST no."], ["category", "Category"], ["terms", "Payment terms"]] as const).map(([k, l]) => (
            <Field key={k} label={l}><input className="input-lux" value={edit[k]} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></Field>
          ))}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} className="accent-gold size-4" /> Active</label>
          <button className="btn btn-primary w-full" onClick={save}>Save</button>
        </div>}
      </Sheet>
    </>
  );
}
