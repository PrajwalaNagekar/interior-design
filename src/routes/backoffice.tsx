import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { login } from "@/lib/store";
import living from "@/assets/living.jpg";

export const Route = createFileRoute("/backoffice")({
  ssr: false,
  head: () => ({ meta: [{ title: "Back Office sign in — Interior Design" }, { name: "description", content: "Sign in to the Back Office dashboard." }, { property: "og:title", content: "Back Office" }, { property: "og:description", content: "Review and price quotations." }] }),
  component: BOLogin,
});

function BOLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@studio.demo");
  const [password, setPassword] = useState("demo123");
  const [err, setErr] = useState("");
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={living} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-fade" />
        <p className="serif absolute bottom-12 left-12 text-5xl text-primary-foreground">Every space,<br />precisely priced.</p>
      </div>
      <div className="flex items-center justify-center p-8 page-enter">
        <form className="w-full max-w-sm space-y-4" onSubmit={(e) => { e.preventDefault(); const r = login(email, password, "backoffice"); if (typeof r === "string") return setErr(r); nav({ to: "/admin" }); }}>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Suite</Link>
          <p className="label-lux text-gold">Back Office</p>
          <h1 className="text-4xl">Welcome back</h1>
          <label className="block space-y-1.5"><span className="label-lux">Email</span><input className="input-lux" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block space-y-1.5"><span className="label-lux">Password</span><input type="password" className="input-lux" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button className="btn btn-primary w-full py-3.5">Sign in <ArrowRight className="size-4" /></button>
          <p className="rounded-2xl bg-accent/60 p-3 text-xs text-accent-foreground"><b>Demo:</b> admin@studio.demo / demo123</p>
        </form>
      </div>
    </div>
  );
}
