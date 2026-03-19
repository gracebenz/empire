import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/constants/theme";

export default function ThroneRoomScreen() {
  const { players, removePlayer, startProclamation } = useGameStore();

  const handleSealArchive = () => {
    startProclamation();
    router.push("/proclamation");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Throne Room</Text>
      <Text style={styles.subtitle}>
        Pass the phone. Each player shall inscribe their secret name.
      </Text>

      {/* Sealed scroll list */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {players.length === 0 ? (
          <Text style={styles.empty}>~ The archive hungers for names ~</Text>
        ) : (
          players.map((p, i) => (
            <View key={p.id} style={styles.sealedRow}>
              <Text style={styles.sealedIndex}>{i + 1}.</Text>
              <Text style={styles.sealedName}>{p.realName}</Text>
              <Text style={styles.sealedGlyph}>✦ ✦ ✦</Text>
              <TouchableOpacity onPress={() => removePlayer(p.id)}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Center action */}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/secret-scroll")}>
        <Text style={styles.addButtonText}>+ Add Name</Text>
      </TouchableOpacity>

      {/* Bottom seal — only appears with 2+ players */}
      {players.length >= 2 && (
        <TouchableOpacity style={styles.sealButton} onPress={handleSealArchive}>
          <Text style={styles.sealButtonText}>🐭  Seal the Archive</Text>
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
  title: {
    fontSize: 32,
    fontFamily: fonts.heading,
    color: colors.ink,
    letterSpacing: 3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: colors.inkLight,
    textAlign: "center",
    fontStyle: "italic",
    fontFamily: fonts.body,
    marginBottom: 24,
    lineHeight: 20,
  },
  list: { width: "100%", flex: 1 },
  listContent: { gap: 10, paddingBottom: 16 },
  empty: {
    textAlign: "center",
    color: colors.inkLight,
    fontStyle: "italic",
    fontFamily: fonts.body,
    marginTop: 40,
    letterSpacing: 1,
  },
  sealedRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.scrollBg,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.scrollBorder,
    gap: 8,
  },
  sealedIndex: { color: colors.inkLight, fontSize: 13, width: 20, fontFamily: fonts.body },
  sealedName: { flex: 1, fontSize: 16, color: colors.ink, fontFamily: fonts.heading, letterSpacing: 1 },
  sealedGlyph: { fontSize: 13, color: colors.inkLight, letterSpacing: 2 },
  remove: { fontSize: 14, color: colors.inkLight, paddingHorizontal: 4 },
  addButton: {
    backgroundColor: colors.scrollBg,
    borderWidth: 2,
    borderColor: colors.scrollBorder,
    borderRadius: 4,
    paddingVertical: 18,
    paddingHorizontal: 48,
    marginBottom: 16,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: fonts.button,
    color: colors.ink,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  sealButton: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingVertical: 18,
    paddingHorizontal: 48,
    marginBottom: 48,
    borderWidth: 2,
    borderColor: colors.ink,
    width: "100%",
    alignItems: "center",
  },
  sealButtonText: {
    color: colors.cream,
    fontSize: 14,
    fontFamily: fonts.button,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
});
