export type Segment = "brand" | "creator" | "friend" | "spam" | "unknown";

export type Account = {
  username: string;
  fullname?: string;
  bio?: string;
  private?: boolean;
  isVerified?: boolean;
  followers?: number;
  following?: number;
  segments: Segment[];
};

const BRAND_TOKENS = [
  "official","store","shop","brand","inc","llc","ltd","studio","co","company",
  "app","io","ai","hq","global","wear","labs","media","records","club"
];

const CREATOR_TOKENS = [
  "creator","artist","musician","producer","filmmaker","photographer","writer",
  "designer","coach","athlete","gamer","streamer","youtuber","tiktoker","blogger"
];

const SPAM_TOKENS = [
  "free","win","followers","giveaway","forex","crypto","bet","xxx","nsfw","loan",
  "trader","earn","profits","promo","discount","code","coupon"
];

const REALNAME_REGEX = /^[a-z]+[._-]?[a-z]+$/i;
const NUMERIC_TAIL = /\d{4,}$/;

function hasToken(text: string | undefined, dict: string[]) {
  if (!text) return false;
  const t = text.toLowerCase();
  return dict.some(k => t.includes(k));
}

export function classifyAccount(a: Omit<Account, "segments">): Segment[] {
  const u = a.username?.toLowerCase() || "";
  const bio = a.bio?.toLowerCase() || "";

  const segments: Segment[] = [];

  const brandScore = (hasToken(u, BRAND_TOKENS) ? 2 : 0) + (hasToken(bio, BRAND_TOKENS) ? 2 : 0) + (a.isVerified ? 1 : 0);
  if (brandScore >= 2) segments.push("brand");

  const creatorScore = (hasToken(u, CREATOR_TOKENS) ? 1 : 0) + (hasToken(bio, CREATOR_TOKENS) ? 2 : 0) + ((a.followers && a.followers > 10000) ? 1 : 0);
  if (creatorScore >= 2) segments.push("creator");

  const looksSpam = hasToken(u, SPAM_TOKENS) || hasToken(bio, SPAM_TOKENS) || NUMERIC_TAIL.test(u);
  if (looksSpam) segments.push("spam");

  const realnameLike = REALNAME_REGEX.test(u);
  const smallishAudience = (a.followers ?? 0) < 2000 && (a.following ?? 0) < 2000;
  const privateSignal = !!a.private;
  if ((realnameLike && smallishAudience) || privateSignal) segments.push("friend");

  if (!segments.length) segments.push("unknown");
  return [...new Set(segments)];
}


