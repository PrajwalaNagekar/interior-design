import type { ReactNode } from "react";

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-4xl">{title}</h1>{sub && <p className="mt-1 text-muted-foreground">{sub}</p>}</div>
      {action}
    </div>
  );
}
