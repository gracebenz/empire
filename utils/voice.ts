import { Platform } from "react-native";
import * as Speech from "expo-speech";

/**
 * Returns the best available local voice for a stately narrator feel.
 * Returns undefined on web — the browser's voice API uses different
 * identifiers and can't be reliably targeted; better to let it default.
 *
 * On iOS, priority:
 *  1. UK English (en-GB) — prefer Arthur or Daniel at highest quality tier
 *  2. Australian English (en-AU)
 *  3. Any English, sorted by quality
 */
export async function getBestNarratorVoice(): Promise<string | undefined> {
  if (Platform.OS === "web") return undefined;

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
    else return -1;

    s += (v.quality ?? 0);

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
  pauseMs?: number;
  onDone?: () => void;
};

/**
 * Speaks an array of phrases in order with an optional pause between each.
 *
 * Uses polling (isSpeakingAsync) as the primary completion signal on native,
 * since onDone callbacks can silently drop on iOS when the TTS engine is
 * still warming up. onDone is kept as an early-exit optimisation.
 */
export function speakSequence(phrases: string[], opts: SpeakOptions = {}): void {
  const { voice, rate = 0.75, pitch = 0.85, pauseMs = 0, onDone } = opts;
  let cancelled = false;

  const speak = (index: number) => {
    if (cancelled || index >= phrases.length) {
      if (!cancelled) onDone?.();
      return;
    }

    let advanced = false;
    const advance = () => {
      if (advanced || cancelled) return;
      advanced = true;
      if (pauseMs > 0 && index < phrases.length - 1) {
        setTimeout(() => speak(index + 1), pauseMs);
      } else {
        speak(index + 1);
      }
    };

    Speech.speak(phrases[index], { voice, rate, pitch, onDone: advance });

    // Fallback: poll isSpeakingAsync in case onDone never fires (iOS quirk)
    if (Platform.OS !== "web") {
      const poll = () => {
        if (advanced || cancelled) return;
        Speech.isSpeakingAsync().then((speaking) => {
          if (!speaking) advance();
          else setTimeout(poll, 150);
        });
      };
      // Give TTS a moment to start before polling
      setTimeout(poll, 500);
    }
  };

  speak(0);

  // Return a cancel function (caller can ignore it)
  return Object.assign(() => { cancelled = true; Speech.stop(); });
}
