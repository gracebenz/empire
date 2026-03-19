import * as Speech from "expo-speech";

/**
 * Returns the best available local voice for a stately narrator feel.
 *
 * Priority:
 *  1. UK English (en-GB) — sounds most regal; prefer higher quality tiers
 *  2. Australian English (en-AU) — also formal, good fallback
 *  3. Any English voice sorted by quality
 *  4. null — let the OS pick
 *
 * Within each language group, voices named "Arthur" or "Daniel" are
 * preferred (deep, authoritative iOS voices).
 */
export async function getBestNarratorVoice(): Promise<string | undefined> {
  let voices: Speech.Voice[] = [];
  try {
    voices = await Speech.getAvailableVoicesAsync();
  } catch {
    return undefined;
  }

  if (!voices.length) return undefined;

  const score = (v: Speech.Voice): number => {
    let s = 0;
    const lang = v.language?.toLowerCase() ?? "";
    const name = v.name?.toLowerCase() ?? "";

    if (lang.startsWith("en-gb")) s += 100;
    else if (lang.startsWith("en-au")) s += 50;
    else if (lang.startsWith("en")) s += 10;
    else return -1; // non-English voices not useful here

    // Higher quality tiers have larger numeric values in expo-speech
    s += (v.quality ?? 0);

    // Prefer authoritative-sounding voices by name
    if (name.includes("arthur")) s += 30;
    if (name.includes("daniel")) s += 20;

    return s;
  };

  const ranked = voices
    .map((v) => ({ v, s: score(v) }))
    .filter(({ s }) => s >= 0)
    .sort((a, b) => b.s - a.s);

  return ranked[0]?.v.identifier ?? undefined;
}

type SpeakOptions = {
  voice?: string;
  rate?: number;
  pitch?: number;
  pauseMs?: number;  // gap between each phrase
  onDone?: () => void;
};

/**
 * Speaks an array of phrases in order, with an optional pause between each.
 */
export function speakSequence(phrases: string[], opts: SpeakOptions = {}): void {
  const { voice, rate = 0.75, pitch = 0.85, pauseMs = 0, onDone } = opts;

  const speak = (index: number) => {
    if (index >= phrases.length) {
      onDone?.();
      return;
    }
    Speech.speak(phrases[index], {
      voice,
      rate,
      pitch,
      onDone: () => {
        if (index < phrases.length - 1 && pauseMs > 0) {
          setTimeout(() => speak(index + 1), pauseMs);
        } else {
          speak(index + 1);
        }
      },
    });
  };

  speak(0);
}
