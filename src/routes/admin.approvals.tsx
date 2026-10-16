import { createFileRoute } from "@tanstack/react-router";
import { useDB } from "@/lib/store";
import { PageHead } from "@/components/PageHead";
import { QuoteTable } from "@/components/QuoteTable";

export const Route = createFileRoute("/admin/approvals")({ component: () => <Approvals /> });

function Approvals() {
  const rows = useDB((d) => d.quotations.filter((q) => q.status === "pending"));
  return (<><PageHead title="Pending Approvals" sub="Quotations submitted by Sales, awaiting review." /><QuoteTable rows={rows} /></>);
}
