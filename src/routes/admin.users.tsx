import { createFileRoute } from "@tanstack/react-router";
import { setDB, useDB } from "@/lib/store";
import { PageHead } from "@/components/PageHead";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const db = useDB((d) => d);
  return (
    <>
      <PageHead title="Users" sub="Sales and Back Office team members." />
      <div className="card-lux overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card"><tr className="border-b text-left">{["Name", "Email", "Phone", "Role", "Quotations", "Active"].map((h) => <th key={h} className="label-lux px-5 py-4">{h}</th>)}</tr></thead>
          <tbody>{db.users.map((u) => (
            <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
              <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-accent text-xs font-bold">{u.name.split(" ").map((p) => p[0]).join("")}</span><div><p className="font-semibold">{u.name}</p><p className="text-xs text-muted-foreground">{u.title}</p></div></div></td>
              <td className="px-5 py-4">{u.email}</td>
              <td className="px-5 py-4">{u.phone}</td>
              <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${u.role === "backoffice" ? "bg-charcoal text-charcoal-foreground" : "bg-gold-soft text-accent-foreground"}`}>{u.role === "backoffice" ? "Back Office" : "Sales"}</span></td>
              <td className="px-5 py-4">{db.quotations.filter((q) => q.salesId === u.id).length}</td>
              <td className="px-5 py-4"><input type="checkbox" className="accent-gold size-4" checked={u.active} onChange={(e) => setDB((d) => { d.users.find((x) => x.id === u.id)!.active = e.target.checked; })} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
