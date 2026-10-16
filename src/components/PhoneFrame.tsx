import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/** iPhone Pro Max canvas (430×932) scaled to fit the window at 100% browser zoom. */
const W = 430, H = 932;

export function PhoneFrame({ children, label }: { children: ReactNode; label: string }) {
  const [scale, setScale] = useState(1);
  const [native, setNative] = useState(false);
  useEffect(() => {
    const fit = () => {
      const isPhone = window.innerWidth <= 500;
      setNative(isPhone);
      setScale(Math.min(1, (window.innerHeight - 56) / (H + 24), (window.innerWidth - 32) / (W + 24)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  if (native) return <div className="min-h-screen bg-background">{children}</div>;

  return (
    <div className="flex h-screen flex-col items-center overflow-hidden bg-secondary">
      <div className="flex h-12 w-full shrink-0 items-center justify-between px-6 text-xs">
        <Link to="/" className="flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3.5" /> Suite</Link>
        <span className="label-lux">{label} · iPhone Pro Max</span>
        <span className="w-12" />
      </div>
      <div style={{ width: (W + 24) * scale, height: (H + 24) * scale }} className="shrink-0">
        <div
          style={{ width: W + 24, height: H + 24, transform: `scale(${scale})`, transformOrigin: "top left" }}
          className="rounded-[64px] bg-charcoal p-3 shadow-lux"
        >
          {/* transform makes this the containing block for fixed bars & sheets */}
          <div style={{ width: W, height: H, transform: "translateZ(0)" }} className="relative overflow-hidden rounded-[52px] bg-background">
            <div className="pointer-events-none absolute left-1/2 top-3 z-[60] h-8 w-32 -translate-x-1/2 rounded-full bg-charcoal" />
            <div className="h-full overflow-y-auto overflow-x-hidden pt-10 [scrollbar-width:none]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
