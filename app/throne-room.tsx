import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { colors } from "@/constants/theme";

export default function ThroneRoomScreen() {
  const { players, removePlayer, startProclamation } = useGameStore();

  const handleAddPlayer = () => router.push("/secret-scroll");

  const handleSealArchive = () => {
    startProclamation();
    router.push("/proclamation");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Throne Room</Text>
      <Text style={styles.subtitle}>
        Pass the phone. Each player shall inscribe their secret name.
      </Text>

      <View style={styles.scrollList}>
        {players.length === 0 ? (
          <Text style={styles.empty}>No scrolls yet...</Text>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(p) => p.id}
            renderItem={({ item, index }) => (
              <View style={styles.playerRow}>
                <Text style={styles.playerIndex}>{index + 1}.</Text>
                <Text style={styles.playerName}>{item.realName}</Text>
                <Text style={styles.playerSealed}>📜 Sealed</Text>
                <TouchableOpacity onPress={() => removePlayer(item.id)}>
                  <Text style={styles.remove}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
        <Text style={styles.addButtonText}>+ Add a Player</Text>
      </TouchableOpacity>

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
    fontFamily: "serif",
    color: colors.ink,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.inkLight,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 32,
    lineHeight: 20,
  },
  scrollList: { width: "100%", flex: 1 },
  empty: {
    textAlign: "center",
    color: colors.inkLight,
    fontStyle: "italic",
    marginTop: 32,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.scrollBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.scrollBorder,
    gap: 8,
  },
  playerIndex: { color: colors.inkLight, fontSize: 14, width: 20 },
  playerName: { flex: 1, fontSize: 16, color: colors.ink, fontFamily: "serif" },
  playerSealed: { fontSize: 12, color: colors.inkLight },
  remove: { fontSize: 16, color: colors.inkLight, paddingHorizontal: 4 },
  addButton: {
    backgroundColor: colors.scrollBg,
    borderWidth: 1.5,
    borderColor: colors.scrollBorder,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 15,
    color: colors.inkLight,
    fontFamily: "serif",
    letterSpacing: 1,
  },
  sealButton: {
    backgroundColor: colors.accent,
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  sealButtonText: {
    color: colors.cream,
    fontSize: 16,
    fontFamily: "serif",
    letterSpacing: 1,
  },
});
