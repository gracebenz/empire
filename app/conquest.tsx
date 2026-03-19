import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
} from "react-native";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/constants/theme";
import CaptureAnimation from "@/components/CaptureAnimation";

export default function ConquestScreen() {
  const { players, empires, capture, phase } = useGameStore();
  const [capturingFor, setCapturingFor] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<{
    capturedId: string;
    capturingId: string;
  } | null>(null);

  useEffect(() => {
    if (phase === "victory") router.replace("/victory");
  }, [phase]);

  const getPlayer = (id: string) => players.find((p) => p.id === id)!;

  const rereadNames = () => {
    setIsReading(true);
    const names = players.map((p) => p.nickname).join(". ");
    Speech.speak(`The names once more: ${names}`, {
      rate: 0.8,
      pitch: 0.9,
      onDone: () => setIsReading(false),
    });
  };

  const handleCapture = (capturedId: string) => {
    if (!capturingFor) return;
    // Close the modal and start the knife-fight animation
    setCapturingFor(null);
    setPendingCapture({ capturedId, capturingId: capturingFor });
  };

  const handleAnimationComplete = () => {
    if (!pendingCapture) return;
    capture(pendingCapture.capturingId, pendingCapture.capturedId);
    setPendingCapture(null);
  };

  const captureTargets = capturingFor
    ? players.filter((p) => {
        const guesserEmpire = empires.find((e) => e.leaderId === capturingFor);
        if (!guesserEmpire) return false;
        const isLeader = empires.some((e) => e.leaderId === p.id);
        return isLeader && p.id !== capturingFor && !guesserEmpire.memberIds.includes(p.id);
      })
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Conquest</Text>

      <ScrollView style={styles.empireList} showsVerticalScrollIndicator={false}>
        {empires.map((empire) => {
          const leader = getPlayer(empire.leaderId);
          const members = empire.memberIds.map(getPlayer);
          return (
            <View key={empire.leaderId} style={styles.empireCard}>
              <View style={styles.empireHeader}>
                <Text style={styles.empireLeader}>👑 {leader.realName}</Text>
                <Text style={styles.empireSize}>
                  {empire.memberIds.length + 1} member{empire.memberIds.length !== 0 ? "s" : ""}
                </Text>
              </View>
              {members.length > 0 && (
                <View style={styles.members}>
                  {members.map((m) => (
                    <Text key={m.id} style={styles.member}>• {m.realName}</Text>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={() => setCapturingFor(empire.leaderId)}
              >
                <Text style={styles.captureButtonText}>
                  ⚔️  {leader.realName} made a capture
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.rereadButton, isReading && styles.disabled]}
        onPress={rereadNames}
        disabled={isReading}
      >
        <Text style={styles.rereadText}>
          {isReading ? "🐭 Reading..." : "🐭 Re-read the Names"}
        </Text>
      </TouchableOpacity>

      {/* Knife-fight animation overlay */}
      {pendingCapture && (
        <CaptureAnimation
          capturedName={getPlayer(pendingCapture.capturedId).realName}
          capturingName={getPlayer(pendingCapture.capturingId).realName}
          onComplete={handleAnimationComplete}
        />
      )}

      <Modal
        visible={!!capturingFor}
        transparent
        animationType="slide"
        onRequestClose={() => setCapturingFor(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>A Royal Revelation!</Text>
            <Text style={styles.modalSubtitle}>
              Which player's secret was spilled?
            </Text>
            {captureTargets.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.targetRow}
                onPress={() => handleCapture(p.id)}
              >
                <Text style={styles.targetName}>{p.realName}</Text>
                <Text style={styles.targetArrow}>→</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCapturingFor(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 72,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.heading,
    color: colors.ink,
    letterSpacing: 2,
    marginBottom: 20,
  },
  empireList: { width: "100%", flex: 1 },
  empireCard: {
    backgroundColor: colors.scrollBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.scrollBorder,
    padding: 16,
    marginBottom: 14,
  },
  empireHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  empireLeader: { fontSize: 18, fontFamily: fonts.body, color: colors.ink },
  empireSize: { fontSize: 12, color: colors.inkLight, fontStyle: "italic" },
  members: { marginBottom: 10, gap: 2 },
  member: { fontSize: 14, color: colors.inkLight, paddingLeft: 8 },
  captureButton: {
    backgroundColor: colors.celadon,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.scrollBorder,
    marginTop: 4,
  },
  captureButtonText: { color: colors.ink, fontFamily: fonts.button, fontSize: 11, letterSpacing: 3, textTransform: "uppercase" },
  rereadButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.scrollBorder,
    marginVertical: 16,
    backgroundColor: colors.scrollBg,
  },
  rereadText: { color: colors.inkLight, fontFamily: fonts.button, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" },
  disabled: { opacity: 0.5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(66,32,64,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    gap: 12,
  },
  modalTitle: { fontSize: 22, fontFamily: fonts.heading, color: colors.ink, textAlign: "center" },
  modalSubtitle: {
    fontSize: 13,
    color: colors.inkLight,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 4,
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.scrollBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.scrollBorder,
  },
  targetName: { fontSize: 18, fontFamily: fonts.body, color: colors.ink },
  targetArrow: { fontSize: 18, color: colors.inkLight },
  cancelButton: { paddingVertical: 12, alignItems: "center" },
  cancelText: { color: colors.inkLight, textDecorationLine: "underline", fontSize: 14 },
});
