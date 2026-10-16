import { describe, it, expect } from "vitest";
import { lineCost, measureOf, totals } from "@/lib/calc";
import type { Item, QItem } from "@/lib/store";

const item: Item = { id: "i", name: "W", measure: "sqft", labourRate: 100, image: "", description: "" };
const qi: QItem = { id: "q", itemId: "i", materialId: "", finishId: "", colourId: "", hardwareId: "", length: 10, width: 5, height: 0, unit: "ft", qty: 2, notes: "", vendorId: "", materialRate: 200, labourRate: 100, hardwareCost: 500 };

describe("cost calc", () => {
  it("sq ft = L × W", () => expect(measureOf(qi, item)).toBe(50));
  it("line = (material×m + labour×m + hardware) × qty", () => expect(lineCost(qi, item)).toBe((200 * 50 + 100 * 50 + 500) * 2));
  it("GST is 18% on discounted subtotal", () => {
    const t = totals({ areas: [{ id: "a", name: "A", items: [qi] }], marginPct: 0, discountPct: 10 }, { items: [item] });
    expect(t.subtotal).toBe(31000);
    expect(t.discount).toBe(3100);
    expect(t.gst).toBe(5022);
    expect(t.grand).toBe(32922);
  });
});
