import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getDB } from "@/lib/store";
import { PhoneFrame } from "@/components/PhoneFrame";
import { MobileOnboard } from "@/components/MobileOnboard";
import kitchen from "@/assets/kitchen.jpg";

export const Route = createFileRoute("/customer")({
  ssr: false,
  head: () => ({ meta: [{ title: "Customer — Quotation Builder" }, { name: "description", content: "View and respond to your interior quotation." }, { property: "og:title", content: "Your quotation" }, { property: "og:description", content: "Approve, reject or discuss your proposal." }] }),
  component: () => <PhoneFrame label="Customer"><CustomerStart /></PhoneFrame>,
});

const SHARED = ["sent", "cust_approved", "cust_rejected", "cust_discuss"];

function CustomerStart() {
  const nav = useNavigate();
  const def = getDB().quotations.find((q) => q.status === "sent") ?? getDB().quotations.find((q) => SHARED.includes(q.status));
  return (
    <MobileOnboard image={kitchen} eyebrow="Your Interior Design Company" title="Your dream space, in detail."
      text="Review your personalised interior quotation and approve, reject or ask for a discussion."
      loginTitle="View your quotation" hint={`${def?.customer.phone ?? ""} / OTP 123456`}
      fields={[{ label: "Mobile number", value: def?.customer.phone ?? "" }, { label: "OTP", value: "123456", type: "password" }]}
      onLogin={([phone, otp]) => {
        if (otp !== "123456") return "Invalid OTP";
        const norm = (s: string) => s.replace(/\D/g, "");
        const qs = getDB().quotations.filter((q) => SHARED.includes(q.status) && norm(q.customer.phone) === norm(phone));
        if (!qs.length) return "No quotation has been shared with this number yet";
        localStorage.setItem("qb_customer", phone);
        nav({ to: "/c" });
        return undefined;
      }} />
  );
}
