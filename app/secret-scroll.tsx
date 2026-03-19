import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { colors } from "@/constants/theme";

type Step = "closed" | "real-name" | "nickname" | "sealed";

export default function SecretScrollScreen() {
  const addPlayer = useGameStore((s) => s.addPlayer);
  const [step, setStep] = useState<Step>("closed");
  const [realName, setRealName] = useState("");
  const [nickname, setNickname] = useState("");

  const handleUnroll = () => setStep("real-name");

  const handleRealNameNext = () => {
    if (!realName.trim()) return;
    setStep("nickname");
  };

  const handleSeal = () => {
    if (!nickname.trim()) return;
    addPlayer(realName.trim(), nickname.trim());
    setStep("sealed");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {step === "closed" && (
        <View style={styles.center}>
          <Text style={styles.scrollEmoji}>📜</Text>
          <Text style={styles.title}>A Secret Scroll</Text>
          <Text style={styles.hint}>Tap to unroll and inscribe your name</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleUnroll}>
            <Text style={styles.primaryButtonText}>Unroll the Scroll</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "real-name" && (
        <View style={styles.center}>
          <Text style={styles.scrollEmoji}>📜</Text>
          <Text style={styles.title}>Your True Name</Text>
          <Text style={styles.hint}>
            Shown to others so they know who to guess at — not your nickname.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Grace"
            placeholderTextColor={colors.scrollBorder}
            value={realName}
            onChangeText={setRealName}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={handleRealNameNext}
          />
          <TouchableOpacity
            style={[styles.primaryButton, !realName.trim() && styles.disabled]}
            onPress={handleRealNameNext}
            disabled={!realName.trim()}
          >
            <Text style={styles.primaryButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "nickname" && (
        <View style={styles.center}>
          <Text style={styles.scrollEmoji}>🤫</Text>
          <Text style={styles.title}>Your Secret Nickname</Text>
          <Text style={styles.hint}>
            Choose wisely. No one must see this but you.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. The Grumpy Grape"
            placeholderTextColor={colors.scrollBorder}
            value={nickname}
            onChangeText={setNickname}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSeal}
          />
          <TouchableOpacity
            style={[styles.primaryButton, !nickname.trim() && styles.disabled]}
            onPress={handleSeal}
            disabled={!nickname.trim()}
          >
            <Text style={styles.primaryButtonText}>🔒  Seal the Scroll</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "sealed" && (
        <View style={styles.center}>
          <Text style={styles.scrollEmoji}>🎀</Text>
          <Text style={styles.title}>Scroll Sealed!</Text>
          <Text style={styles.hint}>
            Hand the phone to the next player, or return to the Throne Room.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setStep("closed");
              setRealName("");
              setNickname("");
            }}
          >
            <Text style={styles.primaryButtonText}>Next Player</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Back to Throne Room</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGold,
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  scrollEmoji: { fontSize: 72 },
  title: {
    fontSize: 28,
    fontFamily: "serif",
    color: colors.ink,
    letterSpacing: 1,
    textAlign: "center",
  },
  hint: {
    fontSize: 13,
    color: colors.inkLight,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
  },
  input: {
    width: "100%",
    backgroundColor: colors.cream,
    borderWidth: 1.5,
    borderColor: colors.scrollBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: "serif",
    color: colors.ink,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 32,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderWidth: 2,
    borderColor: colors.ink,
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.cream,
    fontSize: 16,
    fontFamily: "serif",
    letterSpacing: 1,
  },
  secondaryButton: { paddingVertical: 12 },
  secondaryButtonText: {
    color: colors.inkLight,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  disabled: { opacity: 0.4 },
});
