import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useGameStore } from "@/store/gameStore";
import { colors } from "@/constants/theme";

export default function ProclamationScreen() {
  const { players, startConquest } = useGameStore();
  const [hasRead, setHasRead] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const readNames = () => {
    setIsReading(true);
    const intro = "Hear ye, hear ye. The secret names of this gathering are as follows.";
    const names = players.map((p) => p.nickname).join(". ");
    const outro = "Let the conquest begin.";
    Speech.speak(`${intro} ${names}. ${outro}`, {
      rate: 0.8,
      pitch: 0.9,
      onDone: () => { setIsReading(false); setHasRead(true); },
    });
  };

  useEffect(() => {
    readNames();
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
    fontFamily: "serif",
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
  nickname: { fontSize: 20, fontFamily: "serif", color: colors.ink, letterSpacing: 0.5 },
  rereadButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.scrollBorder,
    marginBottom: 16,
    backgroundColor: colors.scrollBg,
  },
  rereadText: { color: colors.inkLight, fontFamily: "serif", fontSize: 14 },
  conquestButton: {
    backgroundColor: colors.accent,
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderWidth: 2,
    borderColor: colors.ink,
    marginBottom: 40,
  },
  conquestButtonText: { color: colors.cream, fontSize: 16, fontFamily: "serif", letterSpacing: 1 },
  disabled: { opacity: 0.5 },
});
