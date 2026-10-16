import { useSyncExternalStore } from "react";

export type Role = "sales" | "backoffice";
export type User = { id: string; name: string; email: string; phone: string; role: Role; title: string; password: string; active: boolean };
export type Vendor = { id: string; name: string; contact: string; phone: string; gst: string; category: string; terms: string; active: boolean };
export type MatCat = "Material" | "Finish" | "Colour" | "Hardware";
export type Material = { id: string; name: string; category: MatCat; unit: string; swatch: string; image?: string };
export type MeasureType = "sqft" | "rft" | "nos";
export type Item = { id: string; name: string; measure: MeasureType; labourRate: number; image: string; description: string };
export type VendorCost = { id: string; vendorId: string; refId: string; rate: number; unit: string; validTill: string; updatedAt: string };
export type Stock = { materialId: string; qty: number; unit: string; reorder: number };

export type Status =
  | "draft" | "pending" | "approved" | "approved_changes" | "sent"
  | "cust_approved" | "cust_rejected" | "cust_discuss" | "returned";

export const STATUS_LABEL: Record<Status, string> = {
  draft: "Draft",
  pending: "Pending Back Office Approval",
  approved: "Approved by Back Office",
  approved_changes: "Approved with Changes",
  sent: "Submitted to Customer",
  cust_approved: "Approved by Customer",
  cust_rejected: "Rejected by Customer",
  cust_discuss: "Customer Requested Discussion",
  returned: "Sent back to Sales",
};

export type QItem = {
  id: string; itemId: string; materialId: string; finishId: string; colourId: string; hardwareId: string;
  length: number; width: number; height: number; unit: "ft" | "in" | "mm"; qty: number; notes: string;
  vendorId: string; materialRate: number; labourRate: number; hardwareCost: number; edited?: string[];
};
export type Area = { id: string; name: string; items: QItem[] };
export type Customer = { name: string; phone: string; email: string; address: string; projectType: "Apartment" | "Villa" | "House" | "Office" | "Retail" };
export type HistoryEntry = { status: Status; at: string; actor: string; comment?: string };
export type ChangeEntry = { field: string; old: string; new: string; at: string; actor: string };
export type Quotation = {
  id: string; number: string; token: string; salesId: string; customer: Customer; areas: Area[];
  status: Status; marginPct: number; discountPct: number; notes: string; boNotes: string;
  history: HistoryEntry[]; changeLog: ChangeEntry[]; createdAt: string; validDays: number;
};

export type DB = {
  users: User[]; vendors: Vendor[]; materials: Material[]; items: Item[];
  costs: VendorCost[]; stock: Stock[]; quotations: Quotation[];
};

export const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}`;
const daysAgo = (d: number, h = 10) => { const t = new Date("2026-10-16T10:00:00Z"); t.setDate(t.getDate() - d); t.setHours(h); return t.toISOString(); };

const users: User[] = [
  { id: "u1", name: "Aarav Mehta", email: "sales@studio.demo", phone: "+91 98200 11111", role: "sales", title: "Senior Designer", password: "demo123", active: true },
  { id: "u2", name: "Riya Kapoor", email: "riya@studio.demo", phone: "+91 98200 22222", role: "sales", title: "Sales Consultant", password: "demo123", active: true },
  { id: "u3", name: "Neha Iyer", email: "admin@studio.demo", phone: "+91 98200 33333", role: "backoffice", title: "Back Office Manager", password: "demo123", active: true },
  { id: "u4", name: "Kabir Shah", email: "kabir@studio.demo", phone: "+91 98200 44444", role: "sales", title: "Designer", password: "demo123", active: false },
];

const vendors: Vendor[] = [
  { id: "v1", name: "Greenply Industries", contact: "Sanjay Rao", phone: "+91 22 4000 1000", gst: "27AABCG1234F1Z5", category: "Plywood & Boards", terms: "30 days", active: true },
  { id: "v2", name: "Merino Laminates", contact: "Pooja Nair", phone: "+91 11 4500 2000", gst: "07AACCM5678K1Z2", category: "Laminates", terms: "45 days", active: true },
  { id: "v3", name: "Hettich India", contact: "Arjun Das", phone: "+91 20 6600 3000", gst: "27AAACH9012L1Z8", category: "Hardware", terms: "30 days", active: true },
  { id: "v4", name: "Century Veneers", contact: "Meera Joshi", phone: "+91 33 2200 4000", gst: "19AABCC3456M1Z1", category: "Veneers", terms: "60 days", active: true },
  { id: "v5", name: "Urban Craft Labour Co.", contact: "Ravi Kumar", phone: "+91 80 4100 5000", gst: "29AAFCU7890N1Z4", category: "Labour & Ceiling", terms: "15 days", active: false },
];

const materials: Material[] = [
  { id: "m1", name: "BWP Plywood 18mm", category: "Material", unit: "sqft", swatch: "oklch(0.72 0.07 70)" },
  { id: "m2", name: "MR Plywood 18mm", category: "Material", unit: "sqft", swatch: "oklch(0.78 0.06 75)" },
  { id: "m3", name: "MDF 18mm", category: "Material", unit: "sqft", swatch: "oklch(0.7 0.04 60)" },
  { id: "m4", name: "HDF 12mm", category: "Material", unit: "sqft", swatch: "oklch(0.6 0.05 55)" },
  { id: "m5", name: "Walnut Veneer", category: "Material", unit: "sqft", swatch: "oklch(0.42 0.06 50)" },
  { id: "m6", name: "Matte Laminate 1mm", category: "Finish", unit: "sqft", swatch: "oklch(0.85 0.02 80)" },
  { id: "m7", name: "High Gloss Acrylic", category: "Finish", unit: "sqft", swatch: "oklch(0.95 0.01 90)" },
  { id: "m8", name: "Suede Texture Laminate", category: "Finish", unit: "sqft", swatch: "oklch(0.7 0.02 70)" },
  { id: "m9", name: "PU Lacquer", category: "Finish", unit: "sqft", swatch: "oklch(0.9 0.015 85)" },
  { id: "m10", name: "Ivory White", category: "Colour", unit: "-", swatch: "oklch(0.96 0.015 85)" },
  { id: "m11", name: "Taupe Grey", category: "Colour", unit: "-", swatch: "oklch(0.65 0.02 60)" },
  { id: "m12", name: "Smoked Oak", category: "Colour", unit: "-", swatch: "oklch(0.5 0.05 55)" },
  { id: "m13", name: "Charcoal", category: "Colour", unit: "-", swatch: "oklch(0.28 0.005 260)" },
  { id: "m14", name: "Hettich Soft-close Hinge Set", category: "Hardware", unit: "set", swatch: "oklch(0.7 0.01 250)" },
  { id: "m15", name: "Brushed Brass Profile Handle", category: "Hardware", unit: "set", swatch: "oklch(0.7 0.1 80)" },
];

const items: Item[] = [
  { id: "i1", name: "Sliding Wardrobe", measure: "sqft", labourRate: 260, image: "bedroom", description: "Full-height sliding wardrobe with internal drawers" },
  { id: "i2", name: "Hinged Wardrobe", measure: "sqft", labourRate: 240, image: "bedroom", description: "Shutter wardrobe with loft" },
  { id: "i3", name: "TV Unit", measure: "rft", labourRate: 650, image: "living", description: "Wall-mounted TV console with back panel" },
  { id: "i4", name: "Modular Kitchen – Base", measure: "rft", labourRate: 900, image: "kitchen", description: "Base cabinets with drawers & tandem boxes" },
  { id: "i5", name: "Modular Kitchen – Wall", measure: "rft", labourRate: 700, image: "kitchen", description: "Wall cabinets with lift-up shutters" },
  { id: "i6", name: "False Ceiling (Gypsum)", measure: "sqft", labourRate: 95, image: "living", description: "Gypsum ceiling with cove lighting" },
  { id: "i7", name: "Fluted Wall Panelling", measure: "sqft", labourRate: 180, image: "bedroom", description: "Vertical fluted panels with veneer finish" },
  { id: "i8", name: "Study Table", measure: "rft", labourRate: 550, image: "materials", description: "Wall-hung desk with overhead storage" },
  { id: "i9", name: "Crockery Unit", measure: "sqft", labourRate: 280, image: "kitchen", description: "Glass-front crockery display" },
  { id: "i10", name: "Shoe Cabinet", measure: "nos", labourRate: 3500, image: "materials", description: "Entry shoe rack with seating" },
];

const costs: VendorCost[] = [
  ["v1", "m1", 165], ["v1", "m2", 125], ["v1", "m3", 95], ["v1", "m4", 80], ["v4", "m5", 340],
  ["v2", "m6", 55], ["v2", "m7", 210], ["v2", "m8", 75], ["v2", "m9", 260],
  ["v3", "m14", 1800], ["v3", "m15", 2400],
  ["v4", "m1", 172], ["v2", "m3", 99],
].map(([v, r, rate], i) => ({ id: `c${i + 1}`, vendorId: v as string, refId: r as string, rate: rate as number, unit: materials.find((m) => m.id === r)!.unit, validTill: "2027-03-31", updatedAt: daysAgo(i * 3) }));

const stock: Stock[] = materials.filter((m) => m.category !== "Colour").map((m, i) => ({
  materialId: m.id, qty: [1200, 340, 860, 90, 140, 2200, 60, 410, 180, 0, 0, 0, 0, 45, 18][i] ?? 100,
  unit: m.unit, reorder: m.category === "Hardware" ? 30 : 200,
}));

function mkItem(itemId: string, materialId: string, finishId: string, colourId: string, hardwareId: string, l: number, w: number, qty = 1, notes = ""): QItem {
  const it = items.find((x) => x.id === itemId)!;
  const c = costs.find((x) => x.refId === materialId)!;
  const f = costs.find((x) => x.refId === finishId);
  const h = costs.find((x) => x.refId === hardwareId);
  return { id: uid("qi"), itemId, materialId, finishId, colourId, hardwareId, length: l, width: w, height: 0, unit: "ft", qty, notes,
    vendorId: c.vendorId, materialRate: c.rate + (f?.rate ?? 0), labourRate: it.labourRate, hardwareCost: h?.rate ?? 0 };
}

function mkQuote(n: number, salesId: string, customer: Customer, status: Status, ago: number, areas: Area[], extra: Partial<Quotation> = {}): Quotation {
  const flow: Status[] = ["draft", "pending", status === "approved_changes" || n % 2 === 0 ? "approved_changes" : "approved", "sent"];
  const idx: Record<Status, number> = { draft: 0, pending: 1, approved: 2, approved_changes: 2, returned: 1, sent: 3, cust_approved: 4, cust_rejected: 4, cust_discuss: 4 };
  const history: HistoryEntry[] = [];
  const sales = users.find((u) => u.id === salesId)!.name;
  for (let i = 0; i <= Math.min(idx[status], 3); i++) {
    const st = i === 2 && (status === "approved" || status === "approved_changes") ? status : flow[i];
    history.push({ status: st, at: daysAgo(ago - i), actor: i === 2 ? "Neha Iyer (Back Office)" : sales });
  }
  if (idx[status] === 4) history.push({ status, at: daysAgo(ago - 4), actor: `${customer.name} (Customer)`, comment: status === "cust_discuss" ? "Can we discuss a lighter veneer option for the TV unit?" : status === "cust_rejected" ? "Budget is higher than expected." : undefined });
  return { id: `q${n}`, number: `QB-2026-${String(100 + n).padStart(4, "0")}`, token: `${["k7f2","p9x4","m3q8","z5w1","h2r6","t8n3","c4v9","b6j5"][n - 1]}${n}a${(n * 7919).toString(36)}`,
    salesId, customer, areas, status, marginPct: 22, discountPct: 0, notes: "", boNotes: "", history, changeLog: [], createdAt: daysAgo(ago), validDays: 15, ...extra };
}

const quotations: Quotation[] = [
  mkQuote(1, "u1", { name: "Ananya & Vikram Rao", phone: "+91 98111 20001", email: "ananya.rao@mail.demo", address: "Tower B-1402, Lodha Park, Worli, Mumbai", projectType: "Apartment" }, "pending", 2, [
    { id: uid("a"), name: "Living Room", items: [mkItem("i3", "m5", "m9", "m12", "m15", 10, 0), mkItem("i6", "m3", "m9", "m10", "", 18, 14)] },
    { id: uid("a"), name: "Master Bedroom", items: [mkItem("i1", "m1", "m8", "m11", "m14", 8, 9), mkItem("i7", "m4", "m6", "m12", "", 12, 9)] },
    { id: uid("a"), name: "Kitchen", items: [mkItem("i4", "m1", "m7", "m10", "m15", 12, 0), mkItem("i5", "m2", "m7", "m10", "m14", 10, 0)] },
  ]),
  mkQuote(2, "u1", { name: "Siddharth Malhotra", phone: "+91 98111 20002", email: "sid.m@mail.demo", address: "Villa 7, Palm Meadows, Whitefield, Bengaluru", projectType: "Villa" }, "approved_changes", 6, [
    { id: uid("a"), name: "Living Room", items: [mkItem("i3", "m1", "m6", "m13", "m15", 12, 0), mkItem("i6", "m3", "m9", "m10", "", 22, 16)] },
    { id: uid("a"), name: "Guest Bedroom", items: [mkItem("i2", "m2", "m6", "m10", "m14", 7, 8)] },
  ], { marginPct: 20, discountPct: 5, boNotes: "Applied 5% festive discount; vendor revised for TV unit.", changeLog: [
    { field: "Discount %", old: "0", new: "5", at: daysAgo(4), actor: "Neha Iyer" },
    { field: "Margin %", old: "22", new: "20", at: daysAgo(4), actor: "Neha Iyer" },
  ] }),
  mkQuote(3, "u1", { name: "Kavya Menon", phone: "+91 98111 20003", email: "kavya.menon@mail.demo", address: "12 Boat Club Road, Pune", projectType: "Apartment" }, "sent", 9, [
    { id: uid("a"), name: "Kitchen", items: [mkItem("i4", "m1", "m8", "m11", "m15", 14, 0), mkItem("i5", "m2", "m8", "m11", "m14", 12, 0), mkItem("i9", "m3", "m7", "m10", "m14", 5, 7)] },
    { id: uid("a"), name: "Study", items: [mkItem("i8", "m2", "m6", "m12", "m15", 6, 0)] },
  ]),
  mkQuote(4, "u1", { name: "Orbit Fintech Pvt Ltd", phone: "+91 98111 20004", email: "admin@orbit.demo", address: "Level 5, One BKC, Mumbai", projectType: "Office" }, "cust_approved", 15, [
    { id: uid("a"), name: "Reception", items: [mkItem("i7", "m5", "m9", "m12", "", 16, 10), mkItem("i6", "m3", "m9", "m10", "", 30, 20)] },
    { id: uid("a"), name: "Cabin", items: [mkItem("i8", "m1", "m6", "m13", "m15", 7, 0, 2)] },
  ]),
  mkQuote(5, "u1", { name: "Meher Boutique", phone: "+91 98111 20005", email: "meher@boutique.demo", address: "Shop 4, Khan Market, New Delhi", projectType: "Retail" }, "cust_discuss", 12, [
    { id: uid("a"), name: "Display Area", items: [mkItem("i3", "m5", "m9", "m12", "m15", 16, 0), mkItem("i10", "m2", "m6", "m10", "", 0, 0, 3)] },
  ]),
  mkQuote(6, "u2", { name: "Rahul & Sneha Gupta", phone: "+91 98111 20006", email: "gupta.home@mail.demo", address: "A-21, DLF Phase 2, Gurugram", projectType: "Apartment" }, "cust_rejected", 20, [
    { id: uid("a"), name: "Master Bedroom", items: [mkItem("i1", "m5", "m9", "m12", "m14", 9, 9)] },
  ]),
  mkQuote(7, "u1", { name: "Ishaan Verma", phone: "+91 98111 20007", email: "ishaan.v@mail.demo", address: "Flat 802, Prestige Shantiniketan, Bengaluru", projectType: "Apartment" }, "draft", 1, [
    { id: uid("a"), name: "Living Room", items: [mkItem("i3", "m2", "m6", "m11", "m15", 9, 0)] },
  ]),
  mkQuote(8, "u2", { name: "Tara Holdings", phone: "+91 98111 20008", email: "ops@tara.demo", address: "Cyber City, Gurugram", projectType: "Office" }, "pending", 1, [
    { id: uid("a"), name: "Conference Room", items: [mkItem("i7", "m4", "m8", "m13", "", 20, 9), mkItem("i6", "m3", "m9", "m10", "", 24, 18)] },
  ]),
];

const seed = (): DB => JSON.parse(JSON.stringify({ users, vendors, materials, items, costs, stock, quotations }));

const KEY = "qb_db_v1";
let state: DB = seed();
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = JSON.parse(raw); } catch { /* ignore */ }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) { state = JSON.parse(e.newValue); listeners.forEach((l) => l()); }
  });
}

export function getDB() { ensureLoaded(); return state; }
export function setDB(fn: (db: DB) => DB | void) {
  ensureLoaded();
  const draft: DB = structuredClone(state);
  state = fn(draft) ?? draft;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function resetDB() { setDB(() => seed()); }

export function useDB<T>(sel: (db: DB) => T): T {
  const snap = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getDB,
    () => state,
  );
  return sel(snap);
}

// ---------- session ----------
const SKEY = "qb_session";
export type Session = { userId: string; role: Role } | null;
export function getSession(): Session {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SKEY) || "null"); } catch { return null; }
}
export function login(email: string, password: string, role: Role): User | string {
  const u = getDB().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
  if (!u) return "Invalid email or password";
  if (u.role !== role) return `This account is not a ${role === "sales" ? "Sales" : "Back Office"} user`;
  if (!u.active) return "This user is inactive";
  localStorage.setItem(SKEY, JSON.stringify({ userId: u.id, role: u.role }));
  return u;
}
export function logout() { localStorage.removeItem(SKEY); }

// ---------- actions ----------
export function pushStatus(q: Quotation, status: Status, actor: string, comment?: string) {
  q.status = status;
  q.history.push({ status, at: new Date().toISOString(), actor, comment });
}
