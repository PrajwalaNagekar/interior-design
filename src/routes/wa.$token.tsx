import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCheck, Phone, Video } from "lucide-react";
import { useDB } from "@/lib/store";
import { PhoneFrame } from "@/components/PhoneFrame";
import { totals, inr } from "@/lib/calc";
import { COMPANY, customerUrl, IMAGES } from "@/components/qb";

export const Route = createFileRoute("/wa/$token")({
  ssr: false,
  head: () => ({ meta: [{ title: "WhatsApp preview — Interior Design" }, { name: "description", content: "Simulated WhatsApp message with a quotation link." }, { property: "og:title", content: "WhatsApp preview" }, { property: "og:description", content: "Simulated customer message." }] }),
  component: () => <PhoneFrame label="Customer · WhatsApp"><WA /></PhoneFrame>,
});

function WA() {
  const { token } = Route.useParams();
  const db = useDB((d) => d);
  const q = db.quotations.find((x) => x.token === token);
  if (!q) return <p className="p-8">Link not found.</p>;
  const sales = db.users.find((u) => u.id === q.salesId);
  const t = totals(q, db);
  return (
    <div className="flex min-h-full justify-center">
      <div className="flex min-h-[892px] w-full flex-col bg-whatsapp-bg">
        <header className="flex items-center gap-3 bg-whatsapp px-3 py-3 text-primary-foreground">
          <Link to="/"><ArrowLeft className="size-5" /></Link>
          <span className="grid size-9 place-items-center rounded-full bg-primary-foreground/20 font-semibold">YI</span>
          <div className="flex-1"><p className="font-semibold leading-tight">{COMPANY.name}</p><p className="text-xs opacity-80">online</p></div>
          <Video className="size-5" /><Phone className="size-5" />
        </header>
        <div className="flex-1 space-y-3 p-4">
          <p className="mx-auto w-fit rounded-lg bg-card/80 px-3 py-1 text-[11px] text-muted-foreground">TODAY</p>
          <div className="ml-auto max-w-[85%] overflow-hidden rounded-2xl rounded-tr-sm bg-whatsapp-bubble shadow-soft">
            <a href={customerUrl(q.token)} className="block bg-card/60">
              <img src={IMAGES.living} alt="" className="h-36 w-full object-cover" />
              <div className="p-3">
                <p className="text-sm font-semibold">Quotation {q.number}</p>
                <p className="text-xs text-muted-foreground">{COMPANY.name} · Total {inr(t.grand)}</p>
              </div>
            </a>
            <div className="p-3 text-sm">
              <p>Hi {q.customer.name.split(" ")[0]}, here is your interior design quotation for review. Tap the link to view, approve or discuss.</p>
              <a href={customerUrl(q.token)} className="mt-1 block break-all text-info underline">{customerUrl(q.token)}</a>
              <p className="mt-1 text-xs text-muted-foreground">— {sales?.name}</p>
              <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">10:42 <CheckCheck className="size-3.5 text-info" /></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
