import { useEffect } from "react";
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

// When the blade starts and how long it takes to cross the name
const SLASH_START    = 500;  // ms before blade appears
const SWEEP_DURATION = 500;  // ms to cross the full name

// ── Per-character shard ───────────────────────────────────────────────────────

type ShardProps = {
  char: string;
  dx: number;
  dy: number;
  rotation: number;
  delay: number; // absolute ms — when this letter gets hit by the blade
};

function CharShard({ char, dx, dy, rotation, delay }: ShardProps) {
  const x       = useSharedValue(0);
  const y       = useSharedValue(0);
  const rot     = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Snap visible the moment the blade hits, then linger and fade
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 16 }),
      withDelay(700, withTiming(0, { duration: 900 }))
    ));
    // Explode outward with springy physics — also triggered by the blade hit
    x.value   = withDelay(delay, withSpring(dx,       { damping: 4, stiffness: 40, mass: 1.2 }));
    y.value   = withDelay(delay, withSpring(dy,       { damping: 5, stiffness: 45 }));
    rot.value = withDelay(delay, withSpring(rotation, { damping: 6, stiffness: 50 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rot.value}rad` },
    ],
  }));

  if (char === " ") return <View style={styles.spaceGap} />;
  return <Animated.Text style={[styles.shardChar, style]}>{char}</Animated.Text>;
}

// Compute direction for each shard — spreads out from its position in the name
function getShardProps(index: number, total: number): Omit<ShardProps, "char"> {
  const progress   = total <= 1 ? 0.5 : index / (total - 1); // 0 → 1
  const centerBias = progress - 0.5;                          // −0.5 → 0.5

  // Spread horizontally from the name's center
  const dx = centerBias * 300;

  // Alternate up/down; outer chars travel further
  const upDown = index % 2 === 0 ? -1 : 1;
  const dy = upDown * (110 + Math.abs(centerBias) * 90);

  // Spin direction mirrors horizontal spread
  const rotation = centerBias * 2.2 + (index % 2 === 0 ? -0.45 : 0.45);

  // Each char's delay = moment the blade crosses it (left → right)
  const delay = SLASH_START + (progress * SWEEP_DURATION);

  return { dx, dy, rotation, delay };
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  capturedName: string;
  capturingName: string;
  onComplete: () => void;
};

export default function CaptureAnimation({ capturedName, capturingName, onComplete }: Props) {
  // Overlay
  const overlayOpacity  = useSharedValue(0);

  // Full name — fades out at the moment the blade starts
  const nameScale       = useSharedValue(0.4);
  const nameOpacity     = useSharedValue(0);
  const fullNameVisible = useSharedValue(1);

  // Blade — a thin glowing View that sweeps left → right
  const bladeX          = useSharedValue(-SCREEN_WIDTH / 2 - 20);
  const bladeOpacity    = useSharedValue(0);

  // Slash scar — grows from left to right as the blade sweeps
  const slashWidth      = useSharedValue(0);
  const slashOpacity    = useSharedValue(0);

  // White flash on final impact
  const flashOpacity    = useSharedValue(0);

  // "Merged into the Fold" label
  const absorbOpacity   = useSharedValue(0);

  useEffect(() => {
    // ── Phase 1: Overlay + name springs in (0–400ms) ─────────
    overlayOpacity.value = withTiming(1, { duration: 200 });
    nameOpacity.value    = withTiming(1, { duration: 250 });
    nameScale.value      = withSpring(1, { damping: 10, stiffness: 180 });

    // ── Phase 2: Blade sweeps across (SLASH_START → +SWEEP_DURATION) ─
    bladeOpacity.value = withDelay(SLASH_START, withTiming(1, { duration: 60 }));

    // Scar line grows in sync with the blade
    slashOpacity.value = withDelay(SLASH_START, withTiming(0.85, { duration: 60 }));
    slashWidth.value   = withDelay(
      SLASH_START,
      withTiming(SCREEN_WIDTH * 0.8, { duration: SWEEP_DURATION, easing: Easing.linear })
    );

    // Hide full name the moment the blade starts
    fullNameVisible.value = withDelay(SLASH_START, withTiming(0, { duration: 30 }));

    // Blade sweeps and fades out at the end
    bladeX.value = withDelay(
      SLASH_START,
      withTiming(SCREEN_WIDTH / 2 + 20, {
        duration: SWEEP_DURATION,
        easing: Easing.linear,
      }, () => {
        // ── Phase 3: Impact flash ────────────────────────────
        flashOpacity.value = withSequence(
          withTiming(0.5, { duration: 40 }),
          withTiming(0, { duration: 250 })
        );
        // Blade fades out after crossing
        bladeOpacity.value = withTiming(0, { duration: 150 });

        // Scar lingers then fades
        slashOpacity.value = withDelay(900, withTiming(0, { duration: 500 }));

        // ── Phase 4: Label + completion ──────────────────────
        absorbOpacity.value = withDelay(
          600,
          withTiming(1, { duration: 400 }, () => {
            runOnJS(setTimeout)(onComplete, 2400);
          })
        );
      })
    );
  }, []);

  // ── Animated styles ───────────────────────────────────────

  const overlayStyle  = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const fullNameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value * fullNameVisible.value,
    transform: [{ scale: nameScale.value }],
  }));
  const bladeStyle    = useAnimatedStyle(() => ({
    transform: [{ translateX: bladeX.value }],
    opacity: bladeOpacity.value,
  }));
  const slashStyle    = useAnimatedStyle(() => ({
    width: slashWidth.value,
    opacity: slashOpacity.value,
  }));
  const flashStyle    = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const absorbStyle   = useAnimatedStyle(() => ({ opacity: absorbOpacity.value }));

  const chars = capturedName.split("");

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.root]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, overlayStyle]} />
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.flash, flashStyle]} />

      <View style={styles.center}>
        {/* Full name — visible before the blade hits */}
        <Animated.View style={fullNameStyle}>
          <Text style={styles.capturedName}>{capturedName}</Text>
        </Animated.View>

        {/* Shards — appear letter-by-letter as blade crosses */}
        <View style={styles.shardsRow} pointerEvents="none">
          {chars.map((char, i) => (
            <CharShard key={i} char={char} {...getShardProps(i, chars.length)} />
          ))}
        </View>

        {/* Scar line — grows left to right in sync with the blade */}
        <Animated.View style={[styles.slashLine, slashStyle]} />

        {/* Blade — a glowing white sliver */}
        <Animated.View style={[styles.bladeContainer, bladeStyle]} pointerEvents="none">
          <View style={styles.bladeGlow} />
          <View style={styles.bladeCore} />
          <View style={styles.bladeGlow} />
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
  root:    { zIndex: 999 },
  overlay: { backgroundColor: colors.ink },
  flash:   { backgroundColor: "#fff" },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  capturedName: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.lightGold,
    letterSpacing: 3,
    textAlign: "center",
  },

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

  // Scar line — starts at left edge of name, grows rightward
  slashLine: {
    position: "absolute",
    height: 2,
    backgroundColor: colors.lightGold,
    // Anchored to the left so it grows rightward
    left: "10%",
  },

  // Blade — three layered views for a glow effect
  bladeContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
  },
  bladeGlow: {
    width: 6,
    height: 80,
    backgroundColor: "#fff",
    opacity: 0.25,
    borderRadius: 3,
  },
  bladeCore: {
    width: 3,
    height: 90,
    backgroundColor: "#fff",
    opacity: 0.95,
    borderRadius: 1.5,
  },

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
