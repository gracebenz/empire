import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/constants/theme";

export default function VictoryScreen() {
  const { empires, players, resetGame } = useGameStore();
  const winner = empires.length === 1 ? players.find((p) => p.id === empires[0].leaderId) : null;

  const handlePlayAgain = () => {
    resetGame();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.fireworks}>🎉</Text>
      <Text style={styles.label}>The Final Conquest!</Text>
      <Text style={styles.title}>One Empire Remains</Text>
      {winner && (
        <>
          <Text style={styles.winnerLabel}>All hail</Text>
          <Text style={styles.winnerName}>{winner.realName}</Text>
          <Text style={styles.winnerNickname}>"{winner.nickname}"</Text>
          <View style={styles.mortyBox}>
            <Text style={styles.morty}>🐭👑</Text>
            <Text style={styles.mortyText}>Morty bows to the conquering empire.</Text>
          </View>
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={handlePlayAgain}>
        <Text style={styles.buttonText}>Play Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  fireworks: { fontSize: 56 },
  label: {
    fontSize: 13,
    color: colors.inkLight,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 36,
    fontFamily: fonts.heading,
    color: colors.ink,
    letterSpacing: 1,
    textAlign: "center",
  },
  winnerLabel: {
    fontSize: 14,
    color: colors.inkLight,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 20,
  },
  winnerName: {
    fontSize: 48,
    fontFamily: fonts.heading,
    color: colors.midnightViolet,
    letterSpacing: 1,
  },
  winnerNickname: {
    fontSize: 20,
    fontFamily: fonts.body,
    color: colors.darkTeal,
    fontStyle: "italic",
  },
  mortyBox: { alignItems: "center", marginTop: 16, gap: 6 },
  morty: { fontSize: 56 },
  mortyText: {
    fontSize: 13,
    color: colors.inkLight,
    fontStyle: "italic",
    textAlign: "center",
  },
  button: {
    marginTop: 32,
    backgroundColor: colors.accent,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  buttonText: { color: colors.cream, fontSize: 13, fontFamily: fonts.button, letterSpacing: 4, textTransform: "uppercase" },
});
