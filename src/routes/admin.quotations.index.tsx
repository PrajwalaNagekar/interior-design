import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useDB, STATUS_LABEL, type Status } from "@/lib/store";
import { PageHead } from "@/components/PageHead";
import { QuoteTable } from "@/components/QuoteTable";

export const Route = createFileRoute("/admin/quotations/")({ component: All });

function All() {
  const all = useDB((d) => d.quotations);
  const [q, setQ] = useState("");
  const [s, setS] = useState<Status | "">("");
  const rows = all.filter((x) => (!s || x.status === s) && (x.customer.name + x.number).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <PageHead title="All Quotations" sub={`${all.length} quotations across all sales users`} action={
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="input-lux w-64 pl-9" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="input-lux w-56" value={s} onChange={(e) => setS(e.target.value as Status)}>
            <option value="">All statuses</option>
            {(Object.keys(STATUS_LABEL) as Status[]).map((k) => <option key={k} value={k}>{STATUS_LABEL[k]}</option>)}
          </select>
        </div>} />
      <QuoteTable rows={rows} />
    </>
  );
}
