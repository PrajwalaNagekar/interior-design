import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { Home, PlusCircle, FileText, User } from "lucide-react";
import { getSession } from "@/lib/store";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/sales")({
  ssr: false,
  beforeLoad: () => {
    const s = getSession();
    if (!s || s.role !== "sales") throw redirect({ to: "/app" });
  },
  head: () => ({ meta: [{ title: "Sales — Interior Design" }, { name: "description", content: "Sales mobile app for creating interior quotations." }, { property: "og:title", content: "Sales app" }, { property: "og:description", content: "Create and track quotations." }] }),
  component: SalesLayout,
});

const NAV = [
  { to: "/sales", label: "Home", icon: Home, exact: true },
  { to: "/sales/new", label: "New", icon: PlusCircle, search: {} },
  { to: "/sales/quotations", label: "Quotations", icon: FileText },
  { to: "/sales/profile", label: "Profile", icon: User },
] as const;

function SalesLayout() {
  return (
    <PhoneFrame label="Sales app">
      <main className="pb-28"><Outlet /></main>
      <nav className="glass-nav fixed bottom-0 left-1/2 z-30 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 px-3 pb-6 pt-2">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }}
            className="flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold text-muted-foreground transition data-[status=active]:text-gold">
            <n.icon className="size-5" />{n.label}
          </Link>
        ))}
      </nav>
    </PhoneFrame>
  );
}
