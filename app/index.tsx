import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { colors } from "@/constants/theme";

export default function WelcomeScreen() {
  const resetGame = useGameStore((s) => s.resetGame);

  const handleBegin = () => {
    resetGame();
    router.push("/throne-room");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.title}>Empire</Text>
        <Text style={styles.subtitle}>A Game of Nicknames & Conquest</Text>
        <Text style={styles.morty}>🐭</Text>
        <Text style={styles.mortyName}>Morty awaits your command</Text>
        <TouchableOpacity style={styles.button} onPress={handleBegin}>
          <Text style={styles.buttonText}>Begin a New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  crown: { fontSize: 48 },
  title: {
    fontSize: 52,
    fontFamily: "serif",
    color: colors.ink,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkLight,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  morty: { fontSize: 72, marginTop: 16 },
  mortyName: {
    fontSize: 13,
    color: colors.inkLight,
    fontStyle: "italic",
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
  buttonText: {
    color: colors.cream,
    fontSize: 16,
    fontFamily: "serif",
    letterSpacing: 1,
  },
});
