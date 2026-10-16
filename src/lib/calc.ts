import type { DB, Item, QItem, Quotation } from "./store";

export const GST = 0.18;

export function toFeet(v: number, unit: QItem["unit"]) {
  return unit === "ft" ? v : unit === "in" ? v / 12 : v / 304.8;
}

export function measureOf(qi: QItem, item?: Item) {
  if (!item) return 0;
  const l = toFeet(qi.length || 0, qi.unit);
  const w = toFeet(qi.width || 0, qi.unit);
  if (item.measure === "sqft") return round2(l * w);
  if (item.measure === "rft") return round2(l);
  return 1;
}
export const measureLabel = (m: Item["measure"]) => (m === "sqft" ? "sq ft" : m === "rft" ? "rft" : "nos");

/** Base (cost) amount for a line: (material × measure + labour × measure + hardware) × qty */
export function lineCost(qi: QItem, item?: Item) {
  const m = measureOf(qi, item);
  return (qi.materialRate * m + qi.labourRate * m + qi.hardwareCost) * (qi.qty || 0);
}

/** Selling amount including margin */
export function lineAmount(qi: QItem, item: Item | undefined, marginPct: number) {
  return round2(lineCost(qi, item) * (1 + marginPct / 100));
}

export function lineRate(qi: QItem, item: Item | undefined, marginPct: number) {
  const m = measureOf(qi, item) || 1;
  return round2(lineAmount(qi, item, marginPct) / ((qi.qty || 1) * m));
}

export function totals(q: Pick<Quotation, "areas" | "marginPct" | "discountPct">, db: Pick<DB, "items">) {
  const areaTotals = q.areas.map((a) =>
    a.items.reduce((s, qi) => s + lineAmount(qi, db.items.find((i) => i.id === qi.itemId), q.marginPct), 0),
  );
  const subtotal = round2(areaTotals.reduce((a, b) => a + b, 0));
  const discount = round2((subtotal * (q.discountPct || 0)) / 100);
  const taxable = subtotal - discount;
  const gst = round2(taxable * GST);
  const grand = round2(taxable + gst);
  return { areaTotals, subtotal, discount, gst, grand };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
