import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { colors, fonts } from "@/constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

// ── Per-character shard ───────────────────────────────────────────────────────
// Each character of the captured name becomes its own animated shard.

type ShardProps = {
  char: string;
  dx: number;      // final translateX
  dy: number;      // final translateY
  rotation: number; // final rotation in radians
  delay: number;   // stagger delay in ms
};

function CharShard({ char, dx, dy, rotation, delay }: ShardProps) {
  const x       = useSharedValue(0);
  const y       = useSharedValue(0);
  const rot     = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Flash in immediately, then linger and fade slowly
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 20 }),
      withDelay(600, withTiming(0, { duration: 800 }))
    ));
    // Explode outward with springy physics
    x.value = withDelay(delay, withSpring(dx, { damping: 4, stiffness: 45, mass: 1.1 }));
    y.value = withDelay(delay, withSpring(dy, { damping: 5, stiffness: 50 }));
    rot.value = withDelay(delay, withSpring(rotation, { damping: 6, stiffness: 55 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rot.value}rad` },
    ],
  }));

  // Spaces become a fixed-width gap so the row stays centred
  if (char === " ") return <View style={styles.spaceGap} />;

  return <Animated.Text style={[styles.shardChar, style]}>{char}</Animated.Text>;
}

// Deterministic direction for each shard based on its position in the name
function getShardProps(index: number, total: number): Omit<ShardProps, "char"> {
  const progress    = total <= 1 ? 0.5 : index / (total - 1); // 0 → 1 across the name
  const centerBias  = progress - 0.5;                          // −0.5 → 0.5

  // Horizontal: spread outward from the center of the name
  const dx = centerBias * 320;

  // Vertical: alternate up/down so shards fan out; middle chars go further up
  const upDown = index % 2 === 0 ? -1 : 1;
  const dy = upDown * (120 + Math.abs(centerBias) * 100);

  // Rotation: mirrors horizontal direction, with alternating spin
  const rotation = centerBias * 2.4 + (index % 2 === 0 ? -0.5 : 0.5);

  // Light stagger so they don't all explode at the exact same frame
  const delay = index * 30;

  return { dx, dy, rotation, delay };
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  capturedName: string;
  capturingName: string;
  onComplete: () => void;
};

export default function CaptureAnimation({ capturedName, capturingName, onComplete }: Props) {
  const [shardsVisible, setShardsVisible] = useState(false);

  // Overlay
  const overlayOpacity  = useSharedValue(0);

  // Full name (pre-slash)
  const nameScale       = useSharedValue(0.4);
  const nameOpacity     = useSharedValue(0);
  const fullNameVisible = useSharedValue(1);

  // Knife sweep — starts top-left, slashes diagonally to bottom-right
  const knifeX          = useSharedValue(-SCREEN_WIDTH / 2 - 60);
  const knifeY          = useSharedValue(-120);
  const knifeOpacity    = useSharedValue(0);

  // Slash scar line
  const slashOpacity    = useSharedValue(0);
  const slashScaleX     = useSharedValue(0);

  // White flash on impact
  const flashOpacity    = useSharedValue(0);

  // "Merged into the Fold" label
  const absorbOpacity   = useSharedValue(0);

  const showShards = () => setShardsVisible(true);

  useEffect(() => {
    // ── Phase 1: Overlay + name entrance (0–350ms) ───────────
    overlayOpacity.value = withTiming(1, { duration: 200 });
    nameOpacity.value    = withTiming(1, { duration: 250 });
    nameScale.value      = withSpring(1, { damping: 10, stiffness: 180 });

    // ── Phase 2: Knife sweeps diagonally (starts 900ms, sweeps 550ms) ──
    knifeOpacity.value = withDelay(900, withTiming(1, { duration: 80 }));
    // Diagonal Y track — top to bottom as knife crosses
    knifeY.value = withDelay(900, withTiming(120, { duration: 550, easing: Easing.inOut(Easing.quad) }));
    knifeX.value = withDelay(
      900,
      withTiming(SCREEN_WIDTH / 2 + 60, {
        duration: 550,
        easing: Easing.inOut(Easing.quad),
      }, () => {
        // ── Phase 3: Impact ───────────────────────────────────
        // White flash
        flashOpacity.value = withSequence(
          withTiming(0.75, { duration: 40 }),
          withTiming(0, { duration: 300 })
        );

        // Slash scar lingers for 1.2s then fades
        slashOpacity.value = withSequence(
          withTiming(1, { duration: 30 }),
          withDelay(1200, withTiming(0, { duration: 400 }))
        );
        slashScaleX.value = withTiming(1, { duration: 60 });

        // Hide the full name and reveal the shards
        fullNameVisible.value = withTiming(0, { duration: 30 });
        runOnJS(showShards)();

        // ── Phase 4: "Merged into the Fold" appears at 1 000ms
        //            then onComplete fires at 3 200ms (≈2.2s to read) ──
        absorbOpacity.value = withDelay(
          1000,
          withTiming(1, { duration: 400 }, () => {
            // Give the player plenty of time to read the label
            runOnJS(setTimeout)(onComplete, 2200);
          })
        );
      })
    );
  }, []);

  // ── Animated styles ───────────────────────────────────────

  const overlayStyle    = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const fullNameStyle   = useAnimatedStyle(() => ({
    opacity: nameOpacity.value * fullNameVisible.value,
    transform: [{ scale: nameScale.value }],
  }));
  const knifeStyle      = useAnimatedStyle(() => ({
    transform: [
      { translateX: knifeX.value },
      { translateY: knifeY.value },
      { rotate: "35deg" },
    ],
    opacity: knifeOpacity.value,
  }));
  const slashStyle      = useAnimatedStyle(() => ({
    opacity: slashOpacity.value,
    transform: [{ scaleX: slashScaleX.value }],
  }));
  const flashStyle      = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const absorbStyle     = useAnimatedStyle(() => ({ opacity: absorbOpacity.value }));

  const chars = capturedName.split("");

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.root]} pointerEvents="box-none">
      {/* Dark backdrop */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, overlayStyle]} />

      {/* White flash on impact */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.flash, flashStyle]} />

      <View style={styles.center}>
        <Text style={styles.swordIcon}>⚔️</Text>

        {/* Full name — visible before the slash */}
        <Animated.View style={fullNameStyle}>
          <Text style={styles.capturedName}>{capturedName}</Text>
        </Animated.View>

        {/* Shards — individual characters that explode outward */}
        {shardsVisible && (
          <View style={styles.shardsRow}>
            {chars.map((char, i) => (
              <CharShard
                key={i}
                char={char}
                {...getShardProps(i, chars.length)}
              />
            ))}
          </View>
        )}

        {/* Slash scar line */}
        <Animated.View style={[styles.slashLine, slashStyle]} />

        {/* Knife */}
        <Animated.View style={[styles.knifeContainer, knifeStyle]} pointerEvents="none">
          <Text style={styles.knifeEmoji}>🗡️</Text>
        </Animated.View>

        {/* Result label */}
        <Animated.View style={[styles.absorbContainer, absorbStyle]}>
          <Text style={styles.absorbLabel}>Merged into the Fold</Text>
          <Text style={styles.capturingLabel}>👑 {capturingName}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { zIndex: 999 },
  overlay: { backgroundColor: colors.ink },
  flash:   { backgroundColor: "#fff" },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  swordIcon: { fontSize: 36, marginBottom: 12 },

  // Full name (pre-slash)
  capturedName: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.lightGold,
    letterSpacing: 3,
    textAlign: "center",
  },

  // Shard row — same position as the full name, characters lay in a row
  shardsRow: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  shardChar: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.lightGold,
    letterSpacing: 3,
  },
  spaceGap: { width: 12 },

  // Slash scar
  slashLine: {
    position: "absolute",
    width: "80%",
    height: 2,
    backgroundColor: colors.lightGold,
    opacity: 0.9,
    transform: [{ rotate: "20deg" }],
  },

  knifeContainer: { position: "absolute" },
  knifeEmoji:     { fontSize: 52 },

  absorbContainer: {
    marginTop: 60,
    alignItems: "center",
    gap: 8,
  },
  absorbLabel: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.vanillaCustard,
    fontStyle: "italic",
    letterSpacing: 1,
  },
  capturingLabel: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.lightGold,
    letterSpacing: 2,
  },
});
