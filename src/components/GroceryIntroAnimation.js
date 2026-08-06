import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const INTRO_DURATION = 7000;

const floatingItems = [
  { label: "🍎", x: 14, y: 15, size: 58, delay: 0, drift: 28 },
  { label: "🥬", x: 78, y: 15, size: 60, delay: 250, drift: 24 },
  { label: "🥕", x: 22, y: 38, size: 40, delay: 500, drift: 22 },
  { label: "🛒", x: 72, y: 38, size: 56, delay: 750, drift: 20 },
  { label: "🍇", x: 12, y: 63, size: 62, delay: 1000, drift: 26 },
  { label: "🛍️", x: 77, y: 64, size: 56, delay: 1250, drift: 24 },
  { label: "🌿", x: 36, y: 80, size: 56, delay: 1500, drift: 22 },
  { label: "🍅", x: 65, y: 80, size: 58, delay: 1750, drift: 24 },
  { label: "🥛", x: 48, y: 13, size: 46, delay: 2000, drift: 21 },
  { label: "🍚", x: 20, y: 76, size: 46, delay: 2250, drift: 19 },
  { label: "🌾", x: 83, y: 77, size: 48, delay: 2500, drift: 21 },
  { label: "🫘", x: 50, y: 86, size: 42, delay: 2750, drift: 18 }
];

const particles = Array.from({ length: 16 }, (_, index) => ({
  id: `particle-${index}`,
  x: (index * 19) % 94,
  y: 7 + ((index * 27) % 82),
  delay: index * 120,
  size: 5 + (index % 3) * 4
}));

const titles = ["Organic & Fresh", "Vegetables", "Dairy", "Rice, atta and daal", "Fresh fruits"];

export { INTRO_DURATION };

export default function GroceryIntroAnimation({ onComplete }) {
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);
  const [titleIndex, setTitleIndex] = React.useState(0);

  React.useEffect(() => {
    progress.value = withTiming(1, { duration: INTRO_DURATION, easing: Easing.inOut(Easing.cubic) });
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1300 })), -1, true);
    const titleTimer = setInterval(() => setTitleIndex((current) => (current + 1) % titles.length), 1400);
    const doneTimer = setTimeout(() => onComplete?.(), INTRO_DURATION);
    return () => {
      clearInterval(titleTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete, progress, pulse]);

  const centerStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.94 ? 1 : 1 - (progress.value - 0.94) / 0.06,
    transform: [{ scale: 0.98 + pulse.value * 0.025 }]
  }));

  return (
    <View style={styles.root}>
      {particles.map((particle) => <Particle key={particle.id} particle={particle} />)}
      {floatingItems.map((item) => <FloatingItem key={item.label + item.delay} item={item} />)}
      <Animated.View style={[styles.centerpiece, centerStyle]}>
        <View style={styles.sunCircle}>
          <View style={styles.arcOne} />
          <View style={styles.arcTwo} />
          <Text style={styles.organic}>ORGANIC</Text>
          <Text style={styles.basket}>🧺</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Fresh</Text>
            <Text style={styles.badge}>Local</Text>
            <Text style={styles.badge}>Fast</Text>
          </View>
        </View>
        <AnimatedTitle key={titleIndex} text={titles[titleIndex]} />
      </Animated.View>
      <Text style={styles.loading}>Preparing fresh products...</Text>
    </View>
  );
}

function FloatingItem({ item }) {
  const { width, height } = useWindowDimensions();
  const entrance = useSharedValue(0);
  const float = useSharedValue(0);

  React.useEffect(() => {
    entrance.value = withDelay(item.delay, withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.3)) }));
    float.value = withDelay(item.delay, withRepeat(withSequence(withTiming(1, { duration: 2100 }), withTiming(0, { duration: 2100 })), -1, true));
  }, [entrance, float, item.delay]);

  const style = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [
      { translateY: -item.drift * float.value },
      { translateX: Math.sin(float.value * Math.PI) * 12 },
      { rotate: `${(float.value - 0.5) * 14}deg` },
      { scale: 0.7 + entrance.value * 0.3 + float.value * 0.04 }
    ]
  }));

  return (
    <Animated.View style={[styles.floatItem, { left: (item.x / 100) * width, top: (item.y / 100) * height }, style]}>
      <Text style={[styles.floatText, { fontSize: item.size }]}>{item.label}</Text>
    </Animated.View>
  );
}

function Particle({ particle }) {
  const drift = useSharedValue(0);

  React.useEffect(() => {
    drift.value = withDelay(particle.delay, withRepeat(withSequence(withTiming(1, { duration: 1800 }), withTiming(0, { duration: 1800 })), -1, true));
  }, [drift, particle.delay]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.18 + drift.value * 0.42,
    transform: [{ translateY: -18 * drift.value }, { scale: 0.8 + drift.value * 0.35 }]
  }));

  return <Animated.View style={[styles.particle, { left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size, borderRadius: particle.size / 2 }, style]} />;
}

function AnimatedTitle({ text }) {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
      withDelay(1650, withTiming(0, { duration: 360, easing: Easing.in(Easing.cubic) }))
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: (1 - opacity.value) * 12 }]
  }));

  return (
    <Animated.View style={[styles.titleWrap, style]}>
      <Text style={styles.title}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FBF5", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  centerpiece: { alignItems: "center", justifyContent: "center" },
  sunCircle: { width: 320, height: 320, borderRadius: 160, backgroundColor: "#FFF0B8", alignItems: "center", justifyContent: "center" },
  arcOne: { position: "absolute", width: 276, height: 276, borderRadius: 138, borderWidth: 1, borderColor: "rgba(46,125,50,0.18)", borderStyle: "dashed" },
  arcTwo: { position: "absolute", width: 238, height: 238, borderRadius: 119, borderWidth: 1, borderColor: "rgba(255,255,255,0.75)" },
  organic: { color: "#0E7C52", fontSize: 14, fontWeight: "900", backgroundColor: "#EFFFF2", borderRadius: 8, overflow: "hidden", paddingHorizontal: 14, paddingVertical: 8, marginBottom: 18 },
  basket: { fontSize: 118, lineHeight: 126 },
  badgeRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  badge: { color: "#5B311B", backgroundColor: "rgba(255,255,255,0.46)", borderRadius: 8, overflow: "hidden", paddingHorizontal: 14, paddingVertical: 8, fontWeight: "900", fontSize: 14 },
  titleWrap: { minHeight: 38, alignItems: "center", justifyContent: "center", marginTop: -16 },
  title: { color: "#111F17", fontSize: 16, lineHeight: 22, fontWeight: "900", textAlign: "center" },
  loading: { position: "absolute", bottom: 42, color: "#6C7A72", fontSize: 16, fontWeight: "900" },
  floatItem: { position: "absolute", width: 76, height: 76, alignItems: "center", justifyContent: "center" },
  floatText: { textShadowColor: "rgba(255,255,255,0.9)", textShadowRadius: 8 },
  particle: { position: "absolute", backgroundColor: "rgba(19,148,74,0.16)" }
});
