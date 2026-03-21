import { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/constants/theme";
import CaptureAnimation from "@/components/CaptureAnimation";
import { getBestNarratorVoice, speakSequence } from "@/utils/voice";

export default function ConquestScreen() {
  const { players, empires, capture, undoCapture, captureHistory, phase } = useGameStore();
  const [capturingFor, setCapturingFor] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<{
    capturedId: string;
    capturingId: string;
  } | null>(null);
  const voiceRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    getBestNarratorVoice().then((id) => { voiceRef.current = id; });
  }, []);

  useEffect(() => {
    if (phase === "victory") router.replace("/victory");
  }, [phase]);

  const getPlayer = (id: string) => players.find((p) => p.id === id)!;

  const rereadNames = () => {
    setIsReading(true);
    const phrases = [
      "The names once more.",
      ...players.map((p) => p.nickname),
    ];
    speakSequence(phrases, {
      voice: voiceRef.current,
      rate: 0.75,
      pitch: 0.85,
      pauseMs: 1500,
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
          const disciples = empire.memberIds.map(getPlayer);
          return (
            <View key={empire.leaderId} style={styles.empireCard}>
              <View style={styles.empireHeader}>
                <Text style={styles.empireLeader}>{leader.realName}</Text>
                <Text style={styles.empireSize}>
                  {empire.memberIds.length} disciple{empire.memberIds.length !== 1 ? "s" : ""}
                </Text>
              </View>
              {disciples.length > 0 && (
                <View style={styles.members}>
                  {disciples.map((m) => (
                    <View key={m.id} style={styles.discipleRow}>
                      <Text style={styles.discipleName}>{m.realName}</Text>
                      <Text style={styles.discipleNickname}>({m.nickname})</Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={() => setCapturingFor(empire.leaderId)}
              >
                <Text style={styles.captureButtonText}>
                  <Text style={styles.captureButtonName}>{leader.realName}</Text> made a capture
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={[styles.rereadButton, isReading && styles.disabled]}
          onPress={rereadNames}
          disabled={isReading}
        >
          <Text style={styles.rereadText}>
            {isReading ? "Reading..." : "Re-read the Names"}
          </Text>
        </TouchableOpacity>
        {captureHistory.length > 0 && (
          <TouchableOpacity style={styles.undoButton} onPress={undoCapture}>
            <Text style={styles.undoText}>↩ Undo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Knife-fight animation overlay */}
      {pendingCapture && (
        <CaptureAnimation
          capturedName={getPlayer(pendingCapture.capturedId).nickname}
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
  members: {
    marginTop: 4,
    marginBottom: 10,
    gap: 0,
    borderTopWidth: 1,
    borderTopColor: colors.scrollBorder + "44",
  },
  discipleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.scrollBorder + "44",
  },
  discipleName: { fontSize: 14, fontFamily: fonts.body, color: colors.ink },
  discipleNickname: { fontSize: 12, fontFamily: fonts.body, color: colors.inkLight, fontStyle: "italic" },
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
  captureButtonName: { fontFamily: fonts.heading, fontSize: 12 },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginVertical: 16,
  },
  rereadButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.scrollBorder,
    backgroundColor: colors.scrollBg,
  },
  rereadText: { color: colors.inkLight, fontFamily: fonts.button, fontSize: 13, letterSpacing: 3, textTransform: "uppercase" },
  undoButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.scrollBorder,
    backgroundColor: colors.background,
  },
  undoText: { color: colors.inkLight, fontFamily: fonts.button, fontSize: 13, letterSpacing: 3, textTransform: "uppercase" },
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
  cancelText: { color: colors.inkLight, fontFamily: fonts.button, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" },
});
