import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/constants/theme";

export default function WelcomeScreen() {
  const resetGame = useGameStore((s) => s.resetGame);

  const handleBegin = () => {
    resetGame();
    router.push("/throne-room");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Empire</Text>
        <Text style={styles.subtitle}>A Game of Nicknames & Conquest</Text>
        <Image source={require("@/assets/morty_blue_background.jpg")} style={styles.morty} />
        <Text style={styles.mortyName}>Morty awaits your command</Text>
        <TouchableOpacity style={styles.button} onPress={handleBegin}>
          <Text style={styles.buttonText}>New Game</Text>
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
  content: { alignItems: "center", gap: 12, paddingHorizontal: 32 },
  title: {
    fontSize: 52,
    fontFamily: fonts.heading,
    color: colors.ink,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.button,
    color: colors.inkLight,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  morty: { width: 180, height: 180, marginTop: 8 },
  mortyName: { fontSize: 13, color: colors.inkLight, fontStyle: "italic", fontFamily: fonts.body },
  button: {
    marginTop: 32,
    backgroundColor: colors.accent,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 999,
  },
  buttonText: {
    color: colors.cream,
    fontSize: 15,
    fontFamily: fonts.button,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
});
