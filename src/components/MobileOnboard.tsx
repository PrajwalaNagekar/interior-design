import { useState, type ReactNode } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

type F = { label: string; value: string; type?: string };

export function MobileOnboard({ image, eyebrow, title, text, loginTitle, fields, onLogin, hint }: {
  image: string; eyebrow: string; title: ReactNode; text: string; loginTitle: string;
  fields: F[]; onLogin: (values: string[]) => string | void; hint: string;
}) {
  const [step, setStep] = useState<"start" | "login">("start");
  const [vals, setVals] = useState(fields.map((f) => f.value));
  const [err, setErr] = useState("");

  if (step === "start")
    return (
      <div className="relative h-[892px] page-enter">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-fade" />
        <div className="absolute inset-x-6 bottom-10 text-primary-foreground">
          <p className="label-lux text-gold">{eyebrow}</p>
          <h1 className="mt-3 text-5xl">{title}</h1>
          <p className="mt-3 text-sm opacity-80">{text}</p>
          <div className="mt-6 flex gap-1.5"><span className="h-1 w-8 rounded-full bg-gold" /><span className="h-1 w-3 rounded-full bg-primary-foreground/40" /></div>
          <button onClick={() => setStep("login")} className="btn btn-primary mt-6 w-full py-4 text-base">Get started <ArrowRight className="size-4" /></button>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-[892px] flex-col px-6 pt-4 page-enter">
      <button onClick={() => setStep("start")} className="btn btn-ghost -ml-3 w-fit p-2"><ArrowLeft className="size-5" /></button>
      <div className="mt-4 h-40 overflow-hidden rounded-3xl"><img src={image} alt="" className="h-full w-full object-cover" /></div>
      <p className="label-lux mt-6 text-gold">{eyebrow}</p>
      <h1 className="mt-2 text-4xl">{loginTitle}</h1>
      <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); const r = onLogin(vals); if (r) setErr(r); }}>
        {fields.map((f, i) => (
          <label key={f.label} className="block space-y-1.5"><span className="label-lux">{f.label}</span>
            <input type={f.type ?? "text"} className="input-lux py-3.5" value={vals[i]} onChange={(e) => setVals(vals.map((v, j) => (j === i ? e.target.value : v)))} /></label>
        ))}
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button className="btn btn-primary w-full py-4 text-base">Sign in <ArrowRight className="size-4" /></button>
      </form>
      <div className="mt-5 rounded-2xl bg-accent/60 p-4 text-xs text-accent-foreground"><b>Demo:</b> {hint}</div>
    </div>
  );
}
