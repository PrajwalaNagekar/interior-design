import { Link } from "@tanstack/react-router";
import { useDB, type Quotation } from "@/lib/store";
import { totals, inr } from "@/lib/calc";
import { StatusBadge, fmtDate } from "./qb";

export function QuoteTable({ rows }: { rows: Quotation[] }) {
  const db = useDB((d) => d);
  return (
    <div className="card-lux overflow-hidden">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
            <tr className="border-b text-left">
              {["Quotation", "Customer", "Sales", "Areas", "Total", "Status", "Updated"].map((h) => <th key={h} className="label-lux px-5 py-4 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Nothing here right now.</td></tr>}
            {rows.map((q) => (
              <tr key={q.id} className="border-b last:border-0 transition hover:bg-muted/50">
                <td className="px-5 py-4"><Link to="/admin/quotations/$id" params={{ id: q.id }} className="font-semibold hover:text-gold">{q.number}</Link></td>
                <td className="px-5 py-4"><p className="font-medium">{q.customer.name}</p><p className="text-xs text-muted-foreground">{q.customer.projectType}</p></td>
                <td className="px-5 py-4">{db.users.find((u) => u.id === q.salesId)?.name}</td>
                <td className="px-5 py-4">{q.areas.length}</td>
                <td className="px-5 py-4 serif text-base">{inr(totals(q, db).grand)}</td>
                <td className="px-5 py-4"><StatusBadge status={q.status} /></td>
                <td className="px-5 py-4 text-muted-foreground">{fmtDate(q.history.at(-1)?.at ?? q.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
