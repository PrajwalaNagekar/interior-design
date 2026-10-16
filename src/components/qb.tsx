import { useEffect, useState, type ReactNode } from "react";
import { X, Copy, Check, Lock } from "lucide-react";
import { STATUS_LABEL, type Status, type HistoryEntry } from "@/lib/store";
import { cn } from "@/lib/utils";
import living from "@/assets/living.jpg";
import kitchen from "@/assets/kitchen.jpg";
import bedroom from "@/assets/bedroom.jpg";
import materialsImg from "@/assets/materials.jpg";

export const IMAGES: Record<string, string> = { living, kitchen, bedroom, materials: materialsImg };
export const areaImage = (name: string) =>
  /kitchen|crockery/i.test(name) ? kitchen : /bed|guest|cabin|conference/i.test(name) ? bedroom : /living|reception|display/i.test(name) ? living : materialsImg;

const TONE: Record<Status, string> = {
  draft: "var(--taupe)", pending: "var(--warning)", approved: "var(--success)", approved_changes: "var(--gold)",
  sent: "var(--info)", cust_approved: "var(--success)", cust_rejected: "var(--destructive)", cust_discuss: "var(--warning)", returned: "var(--destructive)",
};

export function StatusBadge({ status, short }: { status: Status; short?: boolean }) {
  const c = TONE[status];
  const label = short ? STATUS_LABEL[status].replace("Back Office ", "").replace(" Approval", "") : STATUS_LABEL[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
      style={{ color: c, background: `color-mix(in oklab, ${c} 13%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c }} />
      {label}
    </span>
  );
}

export function Timeline({ history }: { history: HistoryEntry[] }) {
  return (
    <ol className="relative space-y-5 pl-6">
      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
      {[...history].reverse().map((h, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-6 top-1 size-3.5 rounded-full border-2 border-card" style={{ background: TONE[h.status] }} />
          <p className="text-sm font-semibold">{STATUS_LABEL[h.status]}</p>
          <p className="text-xs text-muted-foreground">{h.actor} · {fmtDate(h.at, true)}</p>
          {h.comment && <p className="mt-1.5 rounded-xl bg-muted px-3 py-2 text-xs italic">“{h.comment}”</p>}
        </li>
      ))}
    </ol>
  );
}

export const fmtDate = (iso: string, time = false) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) });

export function Field({ label, children, locked, className }: { label: string; children: ReactNode; locked?: boolean; className?: string }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="label-lux flex items-center gap-1">
        {label}
        {locked && (
          <span title="Captured on site by Sales — read-only" className="cursor-help"><Lock className="size-3" /></span>
        )}
      </span>
      {children}
    </label>
  );
}

export function Sheet({ open, onClose, title, children, side = "bottom" }: { open: boolean; onClose: () => void; title: string; children: ReactNode; side?: "bottom" | "center" }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center animate-in fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn("relative w-full max-w-lg bg-card p-6 shadow-lux animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] overflow-y-auto",
          side === "bottom" ? "rounded-t-[28px] sm:rounded-[28px]" : "rounded-[28px] m-4")}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost p-2" aria-label="Close"><X className="size-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-muted p-2 pl-3">
      <span className="truncate text-xs flex-1">{url}</span>
      <button className="btn btn-dark px-3 py-2 text-xs" onClick={() => { navigator.clipboard?.writeText(url); setOk(true); setTimeout(() => setOk(false), 1500); }}>
        {ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {ok ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function Swatch({ color, label }: { color: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card py-0.5 pl-0.5 pr-2.5 text-xs">
      <span className="size-4 rounded-full border" style={{ background: color }} />
      {label}
    </span>
  );
}

export function Kpi({ label, value, hint, tone = "var(--gold)" }: { label: string; value: ReactNode; hint?: string; tone?: string }) {
  return (
    <div className="card-lux p-5">
      <div className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: tone }} /><p className="label-lux">{label}</p></div>
      <p className="serif mt-3 text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const customerUrl = (token: string) =>
  (typeof window !== "undefined" ? window.location.origin : "") + `/q/${token}`;

export const COMPANY = {
  name: "Your Interior Design Company",
  address: "Studio 3, 21 Design District, Lower Parel, Mumbai 400013",
  phone: "+91 90000 00000",
  email: "hello@yourstudio.example",
  gst: "27XXXXX0000X1Z0",
};
