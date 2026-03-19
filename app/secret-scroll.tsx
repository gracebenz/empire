import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/constants/theme";

type Step = "entry" | "sealed";

export default function SecretScrollScreen() {
  const { addPlayer, players } = useGameStore();
  const [step, setStep] = useState<Step>("entry");
  const [realName, setRealName] = useState("");
  const [nickname, setNickname] = useState("");

  const canSeal = realName.trim().length > 0 && nickname.trim().length > 0;

  const handleSeal = () => {
    if (!canSeal) return;
    addPlayer(realName.trim(), nickname.trim());
    setStep("sealed");
  };

  const handleNextPlayer = () => {
    setRealName("");
    setNickname("");
    setStep("entry");
  };

  if (step === "sealed") {
    return (
      <View style={styles.sealedContainer}>
        <Text style={styles.sealEmoji}>🎀</Text>
        <Text style={styles.sealedTitle}>Scroll Sealed!</Text>
        <Text style={styles.sealedHint}>
          Hand the phone to the next player, or return to the Throne Room.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNextPlayer}>
          <Text style={styles.primaryButtonText}>Next Player</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostButton} onPress={() => router.back()}>
          <Text style={styles.ghostButtonText}>Back to Throne Room</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Scroll header */}
      <View style={styles.scrollHeader}>
        <Text style={styles.scrollHeaderRule}>— ✦ —</Text>
        <Text style={styles.scrollTitle}>The Secret{"\n"}Name Scroll</Text>
        <Text style={styles.scrollHeaderRule}>— ✦ —</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
        {/* Previously sealed names */}
        {players.length > 0 && (
          <View style={styles.sealedSection}>
            <Text style={styles.sealedSectionLabel}>Oaths Already Sworn</Text>
            {players.map((p, i) => (
              <View key={p.id} style={styles.sealedEntry}>
                <Text style={styles.sealedEntryName}>{p.realName}</Text>
                <Text style={styles.sealedEntryGlyph}>✦ ✦ ✦ ✦ ✦</Text>
              </View>
            ))}
            <View style={styles.divider} />
          </View>
        )}

        {/* Inputs */}
        <Text style={styles.inputLabel}>Your True Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Grace"
          placeholderTextColor={colors.scrollBorder}
          value={realName}
          onChangeText={setRealName}
          returnKeyType="next"
          autoFocus
        />

        <Text style={styles.inputLabel}>Your Secret Nickname</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The Grumpy Grape"
          placeholderTextColor={colors.scrollBorder}
          value={nickname}
          onChangeText={setNickname}
          returnKeyType="done"
          onSubmitEditing={handleSeal}
        />

        <TouchableOpacity
          style={[styles.primaryButton, !canSeal && styles.disabled]}
          onPress={handleSeal}
          disabled={!canSeal}
        >
          <Text style={styles.primaryButtonText}>🔒  Seal the Scroll</Text>
        </TouchableOpacity>

        <Text style={styles.scrollFooterRule}>— ✦ —</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.scrollBg,
  },
  scrollHeader: {
    alignItems: "center",
    paddingTop: 64,
    paddingBottom: 20,
    paddingHorizontal: 32,
    backgroundColor: colors.scrollBg,
  },
  scrollHeaderRule: {
    fontSize: 16,
    color: colors.inkLight,
    letterSpacing: 4,
  },
  scrollTitle: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: 2,
    textAlign: "center",
    lineHeight: 40,
    marginVertical: 8,
  },
  scrollBody: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    gap: 12,
  },
  sealedSection: { marginBottom: 8 },
  sealedSectionLabel: {
    fontFamily: fonts.button,
    fontSize: 10,
    color: colors.inkLight,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 10,
  },
  sealedEntry: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.scrollBorder + "55",
  },
  sealedEntryName: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  sealedEntryGlyph: { fontSize: 12, color: colors.inkLight, letterSpacing: 3 },
  divider: {
    height: 1,
    backgroundColor: colors.scrollBorder,
    marginVertical: 16,
    opacity: 0.4,
  },
  inputLabel: {
    fontFamily: fonts.button,
    fontSize: 10,
    color: colors.inkLight,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.scrollBorder,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: fonts.body,
    color: colors.ink,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.ink,
    marginTop: 16,
  },
  primaryButtonText: {
    color: colors.cream,
    fontSize: 13,
    fontFamily: fonts.button,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  scrollFooterRule: {
    textAlign: "center",
    fontSize: 16,
    color: colors.inkLight,
    letterSpacing: 4,
    marginTop: 8,
  },
  disabled: { opacity: 0.4 },

  // Sealed confirmation
  sealedContainer: {
    flex: 1,
    backgroundColor: colors.scrollBg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  sealEmoji: { fontSize: 64 },
  sealedTitle: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: 3,
  },
  sealedHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkLight,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 22,
  },
  ghostButton: { paddingVertical: 12 },
  ghostButtonText: {
    color: colors.inkLight,
    fontFamily: fonts.button,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    textDecorationLine: "underline",
  },
});
