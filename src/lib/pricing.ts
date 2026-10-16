import { uid, type DB, type QItem } from "./store";

const rateOf = (db: DB, refId: string, vendorId?: string) => {
  const list = db.costs.filter((c) => c.refId === refId);
  return (vendorId && list.find((c) => c.vendorId === vendorId)) || list[0];
};

/** Pull rates for a quotation line from the Vendor Cost Master. */
export function applyRates(db: DB, qi: QItem): QItem {
  const m = rateOf(db, qi.materialId);
  const f = qi.finishId ? rateOf(db, qi.finishId) : undefined;
  const h = qi.hardwareId ? rateOf(db, qi.hardwareId) : undefined;
  const item = db.items.find((i) => i.id === qi.itemId);
  return { ...qi, vendorId: m?.vendorId ?? "", materialRate: (m?.rate ?? 0) + (f?.rate ?? 0), hardwareCost: h?.rate ?? 0, labourRate: item?.labourRate ?? 0 };
}

export function newLine(db: DB, itemId: string): QItem {
  const mats = db.materials;
  return applyRates(db, {
    id: uid("qi"), itemId,
    materialId: mats.find((m) => m.category === "Material")!.id,
    finishId: mats.find((m) => m.category === "Finish")!.id,
    colourId: mats.find((m) => m.category === "Colour")!.id,
    hardwareId: mats.find((m) => m.category === "Hardware")!.id,
    length: 8, width: 8, height: 0, unit: "ft", qty: 1, notes: "",
    vendorId: "", materialRate: 0, labourRate: 0, hardwareCost: 0,
  });
}

export function vendorRate(db: DB, refId: string, vendorId: string) {
  return db.costs.find((c) => c.refId === refId && c.vendorId === vendorId)?.rate;
}
