import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone, LayoutDashboard, UserRound, ArrowRight } from "lucide-react";
import living from "@/assets/living.jpg";
import kitchen from "@/assets/kitchen.jpg";
import bedroom from "@/assets/bedroom.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quotation Builder Suite" },
      { name: "description", content: "Sales mobile, Customer mobile and Back Office dashboard for bespoke interior quotations." },
      { property: "og:title", content: "Quotation Builder Suite" },
      { property: "og:description", content: "One suite for Sales, Customers and Back Office." },
    ],
  }),
  component: Suite,
});

const CARDS = [
  { to: "/app", title: "Sales", sub: "Mobile · iPhone Pro Max", text: "Capture site details & build quotations", img: bedroom, icon: Smartphone },
  { to: "/customer", title: "Customer", sub: "Mobile · iPhone Pro Max", text: "View, approve, reject or discuss", img: kitchen, icon: UserRound },
  { to: "/backoffice", title: "Back Office", sub: "Web dashboard", text: "Review, price & approve quotations", img: living, icon: LayoutDashboard },
] as const;

function Suite() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10 page-enter">
      <p className="label-lux text-gold">Quotation Builder</p>
      <h1 className="mt-2 text-center text-4xl md:text-5xl">The Suite</h1>
      <p className="mt-2 text-center text-muted-foreground">Choose an experience.</p>
      <div className="mt-8 grid w-full max-w-5xl gap-5 md:grid-cols-3">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to} className="card-lux group overflow-hidden transition hover:-translate-y-1 hover:shadow-lux">
            <div className="relative h-40 overflow-hidden">
              <img src={c.img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 hero-fade" />
              <span className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-card/85 backdrop-blur"><c.icon className="size-5 text-gold" /></span>
            </div>
            <div className="p-5">
              <p className="label-lux">{c.sub}</p>
              <p className="serif mt-1 text-2xl">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">Open <ArrowRight className="size-4" /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
