import { getSession, useDB } from "./store";

export function useMe() {
  const s = getSession();
  return useDB((d) => d.users.find((u) => u.id === s?.userId)) ?? null;
}
