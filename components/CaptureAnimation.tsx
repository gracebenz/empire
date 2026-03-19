"use client";

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

type Props = {
  capturedName: string;
  capturingName: string;
  onComplete: () => void;
};

export default function CaptureAnimation({
  capturedName,
  capturingName,
  onComplete,
}: Props) {
  // ── Overlay ──────────────────────────────────────────────
  const overlayOpacity = useSharedValue(0);

  // ── Full name (shown before slash) ───────────────────────
  const nameScale = useSharedValue(0.4);
  const nameOpacity = useSharedValue(0);
  const fullNameVisible = useSharedValue(1); // multiplied out when split happens

  // ── Knife sweep ──────────────────────────────────────────
  const knifeX = useSharedValue(-SCREEN_WIDTH);
  const knifeOpacity = useSharedValue(0);

  // ── Slash line that lingers briefly ──────────────────────
  const slashOpacity = useSharedValue(0);
  const slashScaleX = useSharedValue(0);

  // ── Top half of split name ───────────────────────────────
  const topOpacity = useSharedValue(0);
  const topY = useSharedValue(0);
  const topX = useSharedValue(0);
  const topRotate = useSharedValue(0); // radians

  // ── Bottom half of split name ────────────────────────────
  const bottomOpacity = useSharedValue(0);
  const bottomY = useSharedValue(0);
  const bottomX = useSharedValue(0);
  const bottomRotate = useSharedValue(0);

  // ── Flash on impact ──────────────────────────────────────
  const flashOpacity = useSharedValue(0);

  // ── "Absorbed" label fade-in ─────────────────────────────
  const absorbOpacity = useSharedValue(0);

  useEffect(() => {
    // ── Phase 1: Overlay + name entrance (0–350ms) ──────────
    overlayOpacity.value = withTiming(1, { duration: 200 });
    nameOpacity.value = withTiming(1, { duration: 250 });
    nameScale.value = withSpring(1, { damping: 10, stiffness: 180 });

    // ── Phase 2: Knife sweeps across (starts 380ms) ─────────
    knifeOpacity.value = withDelay(380, withTiming(1, { duration: 60 }));
    knifeX.value = withDelay(
      380,
      withTiming(SCREEN_WIDTH + 80, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      }, () => {
        // ── Phase 3: Impact — runs on UI thread ─────────────

        // Flash of light
        flashOpacity.value = withSequence(
          withTiming(0.7, { duration: 40 }),
          withTiming(0, { duration: 250 })
        );

        // Slash scar line appears and fades
        slashOpacity.value = withSequence(
          withTiming(1, { duration: 30 }),
          withDelay(800, withTiming(0, { duration: 400 }))
        );
        slashScaleX.value = withTiming(1, { duration: 60 });

        // Hide full name, show two pieces
        fullNameVisible.value = withTiming(0, { duration: 40 });

        // Top piece: flies up-left, rotates counter-clockwise, fades out
        topOpacity.value = withSequence(
          withTiming(1, { duration: 30 }),
          withDelay(700, withTiming(0, { duration: 600 }))
        );
        topY.value = withSpring(-110, { damping: 6, stiffness: 85, mass: 0.8 });
        topX.value = withSpring(-50, { damping: 9, stiffness: 70 });
        topRotate.value = withSpring(-0.35, { damping: 8, stiffness: 75 });

        // Bottom piece: flies down-right, rotates clockwise, fades out
        // When it finishes fading, trigger completion
        bottomOpacity.value = withSequence(
          withTiming(1, { duration: 30 }),
          withDelay(700, withTiming(0, { duration: 600 }, () => {
            runOnJS(onComplete)();
          }))
        );
        bottomY.value = withSpring(110, { damping: 6, stiffness: 85, mass: 0.8 });
        bottomX.value = withSpring(50, { damping: 9, stiffness: 70 });
        bottomRotate.value = withSpring(0.35, { damping: 8, stiffness: 75 });

        // Show absorb label once pieces are clearly split apart
        absorbOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
      })
    );
  }, []);

  // ── Animated styles ──────────────────────────────────────

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const fullNameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value * fullNameVisible.value,
    transform: [{ scale: nameScale.value }],
  }));

  const knifeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: knifeX.value }, { rotate: "-15deg" }],
    opacity: knifeOpacity.value,
  }));

  const slashStyle = useAnimatedStyle(() => ({
    opacity: slashOpacity.value,
    transform: [{ scaleX: slashScaleX.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const topHalfStyle = useAnimatedStyle(() => ({
    opacity: topOpacity.value,
    transform: [
      { translateY: topY.value },
      { translateX: topX.value },
      { rotate: `${topRotate.value}rad` },
    ],
  }));

  const bottomHalfStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
    transform: [
      { translateY: bottomY.value },
      { translateX: bottomX.value },
      { rotate: `${bottomRotate.value}rad` },
    ],
  }));

  const absorbStyle = useAnimatedStyle(() => ({
    opacity: absorbOpacity.value,
  }));

  return (
    // pointerEvents="none" so taps pass through if needed
    <View style={[StyleSheet.absoluteFillObject, styles.root]} pointerEvents="box-none">
      {/* Dark backdrop */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, overlayStyle]} />

      {/* White flash on impact */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.flash, flashStyle]} />

      <View style={styles.center}>
        {/* Sword icon above the name */}
        <Text style={styles.swordIcon}>⚔️</Text>

        {/* Full name — visible before slash */}
        <Animated.View style={fullNameStyle}>
          <Text style={styles.capturedName}>{capturedName}</Text>
        </Animated.View>

        {/* Top piece — upper half flies up after slash */}
        <View style={styles.splitLayer} pointerEvents="none">
          <View style={styles.topClip}>
            <Animated.View style={topHalfStyle}>
              <Text style={styles.capturedName}>{capturedName}</Text>
            </Animated.View>
          </View>

          {/* Bottom piece — lower half flies down after slash */}
          <View style={styles.bottomClip}>
            <Animated.View style={bottomHalfStyle}>
              <Text style={[styles.capturedName, styles.bottomHalfText]}>
                {capturedName}
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Slash scar line */}
        <Animated.View style={[styles.slashLine, slashStyle]} />

        {/* Knife sweeping across */}
        <Animated.View style={[styles.knifeContainer, knifeStyle]} pointerEvents="none">
          <Text style={styles.knifeEmoji}>🗡️</Text>
        </Animated.View>

        {/* "Merged into the fold" label */}
        <Animated.Text style={[styles.absorbLabel, absorbStyle]}>
          Merged into the Fold
        </Animated.Text>

        <Animated.Text style={[styles.capturingLabel, absorbStyle]}>
          👑 {capturingName}
        </Animated.Text>
      </View>
    </View>
  );
}

// Half-height of the name text — used for the clip views
const HALF_HEIGHT = 24;

const styles = StyleSheet.create({
  root: {
    zIndex: 999,
  },
  overlay: {
    backgroundColor: colors.ink,
  },
  flash: {
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  swordIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  capturedName: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.lightGold,
    letterSpacing: 3,
    textAlign: "center",
  },

  // The two clip views sit on top of each other in absolute space,
  // each showing only one half of the text.
  splitLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  topClip: {
    overflow: "hidden",
    height: HALF_HEIGHT,
    // Push the clip up by half so it sits on top of center
    marginBottom: HALF_HEIGHT,
  },
  bottomClip: {
    overflow: "hidden",
    height: HALF_HEIGHT,
    marginTop: -HALF_HEIGHT * 2,
  },
  // Shift the bottom-half text up so only its lower portion is visible
  bottomHalfText: {
    marginTop: -HALF_HEIGHT,
  },

  slashLine: {
    position: "absolute",
    width: "80%",
    height: 2,
    backgroundColor: colors.lightGold,
    opacity: 0.8,
    // Slight diagonal tilt matching the knife angle
    transform: [{ rotate: "-3deg" }],
  },

  knifeContainer: {
    position: "absolute",
  },
  knifeEmoji: {
    fontSize: 48,
  },

  absorbLabel: {
    marginTop: 40,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.vanillaCustard,
    fontStyle: "italic",
    letterSpacing: 1,
  },
  capturingLabel: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.lightGold,
    letterSpacing: 2,
  },
});
