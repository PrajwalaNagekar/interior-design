import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { login } from "@/lib/store";
import { PhoneFrame } from "@/components/PhoneFrame";
import { MobileOnboard } from "@/components/MobileOnboard";
import bedroom from "@/assets/bedroom.jpg";

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sales App — Quotation Builder" }, { name: "description", content: "Get started with the Quotation Builder Sales app." }, { property: "og:title", content: "Quotation Builder Sales app" }, { property: "og:description", content: "Quote bespoke interiors on site." }] }),
  component: () => <PhoneFrame label="Sales app"><SalesStart /></PhoneFrame>,
});

function SalesStart() {
  const nav = useNavigate();
  return (
    <MobileOnboard image={bedroom} eyebrow="Quotation Builder · Sales" title="Quote every room, beautifully."
      text="Capture customer and site details, rooms, items and measurements, then submit for approval."
      loginTitle="Sales sign in" hint="sales@studio.demo / demo123"
      fields={[{ label: "Email", value: "sales@studio.demo" }, { label: "Password", value: "demo123", type: "password" }]}
      onLogin={([e, p]) => { const r = login(e, p, "sales"); if (typeof r === "string") return r; nav({ to: "/sales/new", search: {} }); return undefined; }} />
  );
}
