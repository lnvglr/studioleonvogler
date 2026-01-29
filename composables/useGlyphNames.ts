/**
 * Lazy-loads readable Unicode character names from block files (split by high byte).
 * Only fetches the block file for the requested character's codepoint, keeping the bundle small.
 */
const blockCache = new Map<string, Record<string, string>>();

function getBlockId(codePoint: number): string {
  return (codePoint >> 8).toString(16).toUpperCase();
}

function getCpKey(codePoint: number): string {
  return codePoint.toString(16).toUpperCase().padStart(4, "0");
}

/** Normalize block keys to uppercase so lookup works regardless of JSON key casing. */
function normalizeBlockKeys(data: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    out[key.toUpperCase()] = value;
  }
  return out;
}

export function useGlyphNames() {
  const displayedName = ref<string>("");

  /**
   * Load the readable name for a character. Sets displayedName to fallback immediately,
   * then fetches the block file if needed and updates displayedName when the name is found.
   * @param charForLookup - The character whose codepoint to look up (use baseChar for Arabic).
   * @param fallback - Name to show until the block loads (e.g. from Samsa or character).
   * @param isStillCurrent - Optional. If provided, we only update displayedName when the fetch completes if this returns true (avoids showing the wrong name when switching characters quickly).
   */
  async function loadForChar(
    charForLookup: string,
    fallback: string,
    isStillCurrent?: () => boolean
  ): Promise<void> {
    if (!charForLookup || charForLookup === " ") {
      displayedName.value = fallback;
      return;
    }
    const codePoint = charForLookup.codePointAt(0);
    if (codePoint === undefined) {
      displayedName.value = fallback;
      return;
    }
    displayedName.value = fallback;
    const blockId = getBlockId(codePoint);
    const cpKey = getCpKey(codePoint);
    const cached = blockCache.get(blockId);
    if (cached) {
      const name = cached[cpKey];
      if (name && (!isStillCurrent || isStillCurrent())) displayedName.value = name;
      return;
    }
    try {
      // Request without cache so updated block files (e.g. after running generate-glyph-map) are used
      const res = await fetch(`/codepoint-names/${blockId}.json`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Record<string, string>;
      const normalized = normalizeBlockKeys(data);
      blockCache.set(blockId, normalized);
      const name = normalized[cpKey];
      if (name && (!isStillCurrent || isStillCurrent())) displayedName.value = name;
    } catch {
      // Keep fallback
    }
  }

  /**
   * Get readable name synchronously if the block is already in cache.
   * Use loadForChar first to ensure the block is loaded; this is for optional sync read.
   */
  function getCachedName(charForLookup: string): string | null {
    if (!charForLookup || charForLookup === " ") return null;
    const codePoint = charForLookup.codePointAt(0);
    if (codePoint === undefined) return null;
    const blockId = getBlockId(codePoint);
    const cpKey = getCpKey(codePoint);
    const cached = blockCache.get(blockId);
    return cached?.[cpKey] ?? null;
  }

  return { displayedGlyphName: displayedName, loadForChar, getCachedName };
}
