import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/constants/theme";
import { getBestNarratorVoice, speakSequence } from "@/utils/voice";

export default function ProclamationScreen() {
  const { players, startConquest } = useGameStore();
  const [hasRead, setHasRead] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const voiceRef = useRef<string | undefined>(undefined);

  const readNames = () => {
    setIsReading(true);
    const phrases = [
      "Hear ye, hear ye. The secret names of this gathering are as follows.",
      ...players.map((p) => p.nickname),
      "Let the conquest begin.",
    ];
    speakSequence(phrases, {
      voice: voiceRef.current,
      rate: 0.75,
      pitch: 0.85,
      pauseMs: 1500,
      onDone: () => { setIsReading(false); setHasRead(true); },
    });
  };

  useEffect(() => {
    getBestNarratorVoice().then((id) => {
      voiceRef.current = id;
      readNames();
    });
    return () => { Speech.stop(); };
  }, []);

  const handleBeginConquest = () => {
    startConquest();
    router.push("/conquest");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.crown}>👑</Text>
      <Text style={styles.title}>The Proclamation</Text>
      <Text style={styles.subtitle}>Morty reads the names aloud. Remember them well.</Text>

      <View style={styles.nameList}>
        {players.map((p, i) => (
          <View key={p.id} style={styles.nameRow}>
            <Text style={styles.nameNumber}>{i + 1}.</Text>
            <Text style={styles.nickname}>{p.nickname}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.rereadButton, isReading && styles.disabled]}
        onPress={readNames}
        disabled={isReading}
      >
        <Text style={styles.rereadText}>
          {isReading ? "🐭 Reading..." : "🐭 Read Again"}
        </Text>
      </TouchableOpacity>

      {hasRead && (
        <TouchableOpacity style={styles.conquestButton} onPress={handleBeginConquest}>
          <Text style={styles.conquestButtonText}>⚔️  Begin the Conquest</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 72,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  crown: { fontSize: 40 },
  title: {
    fontSize: 32,
    fontFamily: fonts.heading,
    color: colors.ink,
    letterSpacing: 2,
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.inkLight,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 24,
  },
  nameList: { width: "100%", flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.scrollBorder,
  },
  nameNumber: { width: 24, fontSize: 14, color: colors.inkLight, fontStyle: "italic" },
  nickname: { fontSize: 20, fontFamily: fonts.body, color: colors.ink, letterSpacing: 0.5 },
  rereadButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.scrollBorder,
    marginBottom: 16,
    backgroundColor: colors.scrollBg,
  },
  rereadText: { color: colors.inkLight, fontFamily: fonts.button, fontSize: 13, letterSpacing: 3, textTransform: "uppercase" },
  conquestButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginBottom: 40,
  },
  conquestButtonText: { color: colors.cream, fontSize: 13, fontFamily: fonts.button, letterSpacing: 4, textTransform: "uppercase" },
  disabled: { opacity: 0.5 },
});
