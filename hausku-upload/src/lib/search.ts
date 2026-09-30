/**
 * Typo-tolerant product search.
 *
 * The catalog is small (a handful of products), so we fetch candidates and
 * rank them in JavaScript instead of relying on MySQL LIKE alone. This gives
 * us edit-distance ("brottdose" → "Brotdose"), diacritic-insensitive matching
 * ("kuchen" → "Küche") and token-level matching ("laptp kissen" → Laptopkissen)
 * with zero extra dependencies.
 */

/** Lowercase, strip diacritics (ä→a, ü→u, ö→o, ß→ss), collapse whitespace. */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Classic Levenshtein edit distance (O(n·m)). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return dp[a.length][b.length];
}

/** Edit-distance threshold that still counts as a match for the given word. */
function fuzzyThreshold(wordLength: number): number {
  return Math.max(1, Math.floor(wordLength / 3));
}

interface Rankable {
  name: string;
  description?: string | null;
}

/**
 * Rank items by how well they match the query (best first).
 * Returns only items with a positive score. With an empty query, returns
 * everything in original order.
 */
export function rankProducts<T extends Rankable>(
  items: T[],
  rawQuery: string
): T[] {
  const query = normalizeSearch(rawQuery);
  if (!query) return items;

  const queryTokens = query.split(" ").filter(Boolean);

  const scored = items.map((item) => {
    const name = normalizeSearch(item.name);
    const desc = normalizeSearch(item.description ?? "");
    let score = 0;

    // Whole-name match (strongest signal)
    if (name === query) {
      score += 300;
    } else if (name.startsWith(query)) {
      score += 250;
    } else if (name.includes(query)) {
      score += 200;
    }

    // Token-level: query word vs product word (prefix / substring / fuzzy)
    const nameTokens = name.split(" ").filter(Boolean);
    for (const qt of queryTokens) {
      for (const nt of nameTokens) {
        if (!nt) continue;
        if (nt.startsWith(qt)) {
          score += 80;
        } else if (nt.includes(qt)) {
          score += 70;
        } else {
          const dist = levenshtein(nt, qt);
          if (dist <= fuzzyThreshold(qt.length)) {
            score += 60 - dist * 10;
          } else if (qt.length >= 4) {
            // Typo at the start of a longer compound word
            // (e.g. "laptpo" → "laptopkissen")
            const prefix = nt.slice(0, qt.length);
            const prefixDist = levenshtein(prefix, qt);
            if (prefixDist <= fuzzyThreshold(qt.length)) {
              score += 50 - prefixDist * 10;
            }
          }
        }
      }
    }

    // Description contains (weakest signal)
    if (desc.includes(query)) score += 40;

    return { item, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
