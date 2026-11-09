// Relevance ranking for type-ahead suggestions. Pure functions so they are easy to test.

const words = (text) => text.toLowerCase().split(/[^a-z0-9.]+/).filter(Boolean);

// Is `query` a subsequence of `text` (letters in order, gaps allowed)? Catches typos like "cemnt".
function isSubsequence(query, text) {
  let i = 0;
  for (const ch of text) if (ch === query[i]) i += 1;
  return i === query.length;
}

// Higher is more relevant; 0 means "don't show".
export function scoreOption(option, rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return 1;
  const name = option.name.toLowerCase();
  const nameWords = words(option.name);
  const keywordWords = words(option.keywords || '');
  const tokens = words(query);

  if (name === query) return 1000;
  if (name.startsWith(query)) return 900;
  if (nameWords.some((w) => w.startsWith(query))) return 700;
  if (keywordWords.some((w) => w.startsWith(query))) return 500;

  // Every typed word starts some word in the name/keywords: "tmt 12" -> "TMT ... 12 mm".
  const all = [...nameWords, ...keywordWords];
  if (tokens.length > 1 && tokens.every((t) => all.some((w) => w.startsWith(t)))) return 600;

  if (name.includes(query)) return 300;
  if (query.length >= 3 && isSubsequence(query.replace(/\s+/g, ''), name.replace(/\s+/g, ''))) return 100;
  return 0;
}

// Best matches first; ties keep catalogue order, which lists the common items first.
// Typo matches (score 100) only appear when nothing matches properly, so they don't add noise.
export function rankOptions(options, query, limit = 8) {
  const scored = options
    .map((option, index) => ({ option, index, score: scoreOption(option, query) }))
    .filter((r) => r.score > 0);
  const hasRealMatch = scored.some((r) => r.score > 100);
  return scored
    .filter((r) => !hasRealMatch || r.score > 100)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((r) => r.option);
}
