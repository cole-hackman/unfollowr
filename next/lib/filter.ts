import type { Account, Segment } from "@/lib/classify";

export function filterAccounts(
  accounts: Account[],
  segment: Segment | "all",
  letter?: string,
  search?: string
) {
  let result = accounts;
  if (segment !== "all") {
    result = result.filter(a => a.segments?.includes(segment));
  }
  if (letter && letter !== "All") {
    result = result.filter(a => a.username?.[0]?.toLowerCase() === letter.toLowerCase());
  }
  if (search?.trim()) {
    const q = search.toLowerCase();
    result = result.filter(a =>
      (a.username?.toLowerCase().includes(q)) ||
      (a.fullname?.toLowerCase().includes(q)) ||
      (a.bio?.toLowerCase().includes(q))
    );
  }
  return result;
}

export function countsBySegment(accounts: Account[]) {
  return {
    all: accounts.length,
    brand: accounts.filter(a => a.segments?.includes("brand")).length,
    creator: accounts.filter(a => a.segments?.includes("creator")).length,
    friend: accounts.filter(a => a.segments?.includes("friend")).length,
    spam: accounts.filter(a => a.segments?.includes("spam")).length,
  } as Record<Segment | "all", number>;
}


