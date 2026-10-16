import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { toast } from "sonner";
import { setDB, useDB } from "@/lib/store";
import { Field, Sheet, Kpi } from "@/components/qb";
import { PageHead } from "@/components/PageHead";

export const Route = createFileRoute("/admin/stock")({ component: StockPage });

function StockPage() {
  const db = useDB((d) => d);
  const [adj, setAdj] = useState<{ id: string; dir: 1 | -1 } | null>(null);
  const [qty, setQty] = useState(10);
  const low = db.stock.filter((s) => s.qty < s.reorder);
  const apply = () => {
    setDB((d) => { const s = d.stock.find((x) => x.materialId === adj!.id)!; s.qty = Math.max(0, s.qty + adj!.dir * qty); });
    toast.success(adj!.dir > 0 ? "Stock in recorded" : "Stock out recorded"); setAdj(null);
  };
  return (
    <>
      <PageHead title="Stock" sub="Material levels across the warehouse." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="SKUs tracked" value={db.stock.length} />
        <Kpi label="Low stock" value={low.length} tone="var(--destructive)" />
        <Kpi label="Healthy" value={db.stock.length - low.length} tone="var(--success)" />
      </div>
      {low.length > 0 && <div className="mb-6 flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm"><AlertTriangle className="size-5 text-destructive" /><span><b>Low stock:</b> {low.map((s) => db.materials.find((m) => m.id === s.materialId)?.name).join(", ")}</span></div>}
      <div className="card-lux overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card"><tr className="border-b text-left">{["Material", "Category", "On hand", "Reorder level", "Level", ""].map((h) => <th key={h} className="label-lux px-5 py-4">{h}</th>)}</tr></thead>
          <tbody>{db.stock.map((s) => {
            const m = db.materials.find((x) => x.id === s.materialId)!; const isLow = s.qty < s.reorder; const pct = Math.min(100, (s.qty / (s.reorder * 3)) * 100);
            return (
              <tr key={s.materialId} className="border-b last:border-0 hover:bg-muted/40">
                <td className="px-5 py-4 font-semibold"><span className="mr-2 inline-block size-3 rounded-full align-middle" style={{ background: m.swatch }} />{m.name}</td>
                <td className="px-5 py-4">{m.category}</td>
                <td className={`px-5 py-4 font-semibold ${isLow ? "text-destructive" : ""}`}>{s.qty} {s.unit}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.reorder} {s.unit}</td>
                <td className="px-5 py-4 w-48"><div className="h-1.5 rounded-full bg-muted"><div className={`h-full rounded-full ${isLow ? "bg-destructive" : "bg-gold"}`} style={{ width: `${pct}%` }} /></div></td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <button className="btn btn-ghost px-2 py-1.5 text-xs" onClick={() => setAdj({ id: s.materialId, dir: 1 })}><ArrowDownToLine className="size-3.5" /> In</button>
                  <button className="btn btn-ghost px-2 py-1.5 text-xs" onClick={() => setAdj({ id: s.materialId, dir: -1 })}><ArrowUpFromLine className="size-3.5" /> Out</button>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      <Sheet open={!!adj} onClose={() => setAdj(null)} title={adj?.dir === 1 ? "Stock in" : "Stock out"} side="center">
        <p className="mb-3 text-sm text-muted-foreground">{db.materials.find((m) => m.id === adj?.id)?.name}</p>
        <Field label="Quantity"><input type="number" className="input-lux" value={qty} onChange={(e) => setQty(Number(e.target.value))} /></Field>
        <button className="btn btn-primary mt-4 w-full" onClick={apply}>Record</button>
      </Sheet>
    </>
  );
}
