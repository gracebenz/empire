import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { colors } from "@/constants/theme";

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
      <Text style={styles.title}>One Empire Remains!</Text>
      {winner && (
        <>
          <Text style={styles.winnerLabel}>All hail</Text>
          <Text style={styles.winnerName}>{winner.realName}</Text>
          <Text style={styles.winnerNickname}>"{winner.nickname}"</Text>
          <Text style={styles.morty}>🐭👑</Text>
          <Text style={styles.mortyText}>
            Morty bows to the conquering empire.
          </Text>
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
    backgroundColor: colors.parchment,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  fireworks: { fontSize: 56 },
  title: {
    fontSize: 32,
    fontFamily: "serif",
    color: colors.ink,
    letterSpacing: 2,
    textAlign: "center",
  },
  winnerLabel: {
    fontSize: 14,
    color: colors.inkLight,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 16,
  },
  winnerName: {
    fontSize: 44,
    fontFamily: "serif",
    color: colors.forest,
    letterSpacing: 1,
  },
  winnerNickname: {
    fontSize: 20,
    fontFamily: "serif",
    color: colors.grape,
    fontStyle: "italic",
  },
  morty: { fontSize: 56, marginTop: 16 },
  mortyText: {
    fontSize: 13,
    color: colors.inkLight,
    fontStyle: "italic",
    textAlign: "center",
  },
  button: {
    marginTop: 32,
    backgroundColor: colors.forest,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  buttonText: {
    color: colors.cream,
    fontSize: 16,
    fontFamily: "serif",
    letterSpacing: 1,
  },
});
