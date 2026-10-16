import { uid, type Area, type Customer, type DB } from "./store";
import { newLine } from "./pricing";

type T = { area: string; items: { id: string; l: number; w: number; qty?: number }[] }[];

/** Starter rooms + items loaded by project type; Sales edits measurements on site. */
export const TEMPLATES: Record<Customer["projectType"], T> = {
  Apartment: [
    { area: "Living Room", items: [{ id: "i3", l: 10, w: 0 }, { id: "i6", l: 16, w: 12 }] },
    { area: "Master Bedroom", items: [{ id: "i1", l: 8, w: 9 }, { id: "i7", l: 11, w: 9 }] },
    { area: "Kitchen", items: [{ id: "i4", l: 10, w: 0 }, { id: "i5", l: 8, w: 0 }] },
    { area: "Foyer", items: [{ id: "i10", l: 0, w: 0 }] },
  ],
  Villa: [
    { area: "Living Room", items: [{ id: "i3", l: 14, w: 0 }, { id: "i6", l: 24, w: 18 }, { id: "i7", l: 16, w: 10 }] },
    { area: "Dining", items: [{ id: "i9", l: 6, w: 7 }, { id: "i6", l: 14, w: 12 }] },
    { area: "Master Bedroom", items: [{ id: "i1", l: 10, w: 9 }, { id: "i7", l: 13, w: 9 }] },
    { area: "Guest Bedroom", items: [{ id: "i2", l: 7, w: 8 }] },
    { area: "Kids Room", items: [{ id: "i2", l: 6, w: 8 }, { id: "i8", l: 5, w: 0 }] },
    { area: "Kitchen", items: [{ id: "i4", l: 14, w: 0 }, { id: "i5", l: 12, w: 0 }] },
  ],
  House: [
    { area: "Living Room", items: [{ id: "i3", l: 12, w: 0 }, { id: "i6", l: 18, w: 14 }] },
    { area: "Master Bedroom", items: [{ id: "i1", l: 9, w: 9 }] },
    { area: "Second Bedroom", items: [{ id: "i2", l: 7, w: 8 }] },
    { area: "Kitchen", items: [{ id: "i4", l: 12, w: 0 }, { id: "i5", l: 10, w: 0 }] },
    { area: "Study", items: [{ id: "i8", l: 6, w: 0 }] },
  ],
  Office: [
    { area: "Reception", items: [{ id: "i7", l: 14, w: 9 }, { id: "i6", l: 20, w: 16 }] },
    { area: "Cabin", items: [{ id: "i8", l: 7, w: 0, qty: 2 }] },
    { area: "Conference Room", items: [{ id: "i7", l: 18, w: 9 }, { id: "i6", l: 22, w: 16 }] },
  ],
  Retail: [
    { area: "Display Area", items: [{ id: "i3", l: 16, w: 0 }, { id: "i6", l: 24, w: 20 }] },
    { area: "Billing Counter", items: [{ id: "i8", l: 8, w: 0 }] },
    { area: "Trial Room", items: [{ id: "i7", l: 8, w: 8 }] },
  ],
};

export function loadTemplate(db: DB, type: Customer["projectType"]): Area[] {
  return TEMPLATES[type].map((t) => ({
    id: uid("a"), name: t.area,
    items: t.items.map((x) => ({ ...newLine(db, x.id), length: x.l, width: x.w, qty: x.qty ?? 1 })),
  }));
}
