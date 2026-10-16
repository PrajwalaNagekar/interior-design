import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Clock, FileText, Truck, Layers, Boxes, IndianRupee, Users, LogOut, ChevronDown, Bell } from "lucide-react";
import { logout, useDB, getSession } from "@/lib/store";
import { useMe } from "@/lib/session";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: () => {
    const s = getSession();
    if (!s || s.role !== "backoffice") throw redirect({ to: "/backoffice" });
  },
  head: () => ({ meta: [{ title: "Back Office — Interior Design" }, { name: "description", content: "Review, price and approve quotations." }, { property: "og:title", content: "Back Office" }, { property: "og:description", content: "Quotation approvals and cost master." }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/approvals", label: "Approvals", icon: Clock },
  { to: "/admin/quotations", label: "Quotations", icon: FileText },
  { to: "/admin/vendors", label: "Vendors", icon: Truck },
  { to: "/admin/materials", label: "Materials & Items", icon: Layers },
  { to: "/admin/stock", label: "Stock", icon: Boxes },
  { to: "/admin/costs", label: "Cost Master", icon: IndianRupee },
  { to: "/admin/users", label: "Users", icon: Users },
] as const;

function AdminLayout() {
  const me = useMe();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  const pending = useDB((d) => d.quotations.filter((q) => q.status === "pending").length);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-charcoal text-charcoal-foreground shadow-lux">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
          <Link to="/admin" className="flex shrink-0 items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl btn-primary serif text-lg">Q</span>
            <span className="leading-tight"><span className="serif block text-lg">Interior Design</span><span className="block text-[10px] uppercase tracking-[0.2em] text-gold">Back Office</span></span>
          </Link>
          <div className="flex-1" />
          <Link to="/admin/approvals" className="relative grid size-10 place-items-center rounded-full hover:bg-charcoal-foreground/10" aria-label="Pending approvals">
            <Bell className="size-4" />
            {pending > 0 && <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-gold text-[10px] font-bold text-charcoal">{pending}</span>}
          </Link>
          <div className="relative">
            <button onClick={() => setMenu(!menu)} className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-charcoal-foreground/10">
              <span className="grid size-8 place-items-center rounded-full bg-gold text-xs font-bold text-charcoal">{me?.name.split(" ").map((p) => p[0]).join("")}</span>
              <span className="hidden text-left text-sm sm:block"><span className="block font-semibold leading-tight">{me?.name}</span><span className="block text-[11px] text-charcoal-foreground/60">{me?.title}</span></span>
              <ChevronDown className="size-4 opacity-60" />
            </button>
            {menu && (
              <div className="absolute right-0 top-12 w-48 rounded-2xl border bg-card p-1.5 text-foreground shadow-lux">
                <Link to="/" className="block rounded-xl px-3 py-2 text-sm hover:bg-muted">Back to Suite</Link>
                <button onClick={() => { logout(); nav({ to: "/backoffice", replace: true }); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-muted"><LogOut className="size-4" /> Sign out</button>
              </div>
            )}
          </div>
        </div>
        <nav className="border-t border-charcoal-foreground/10">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }}
                className="relative flex items-center gap-2 whitespace-nowrap px-3.5 py-3 text-sm text-charcoal-foreground/65 transition hover:text-charcoal-foreground data-[status=active]:text-gold data-[status=active]:after:absolute data-[status=active]:after:inset-x-3 data-[status=active]:after:bottom-0 data-[status=active]:after:h-0.5 data-[status=active]:after:rounded-full data-[status=active]:after:bg-gold">
                <n.icon className="size-4" />{n.label}
                {n.to === "/admin/approvals" && pending > 0 && <span className="rounded-full bg-gold/20 px-1.5 text-[10px] font-bold text-gold">{pending}</span>}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl p-6 lg:p-10 page-enter"><Outlet /></main>
    </div>
  );
}
