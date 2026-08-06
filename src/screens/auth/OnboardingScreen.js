import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import Screen from "../../components/Screen";
import AppButton from "../../components/AppButton";
import { completeOnboarding } from "../../store/slices/authSlice";
import { colors } from "../../theme/colors";
import { type } from "../../theme/typography";

const slides = [
  {
    icon: "🥬",
    title: "Welcome to Just Harvst",
    text: "Fresh groceries, farm produce and daily essentials delivered to your door in minutes."
  },
  {
    icon: "🛒",
    title: "Browse with ease",
    text: "Search products, explore categories, and add favorites while you shop."
  },
  {
    icon: "📦",
    title: "Easy delivery tracking",
    text: "Save multiple addresses, choose delivery windows, and track orders live."
  },
  {
    icon: "💳",
    title: "Fast checkout & savings",
    text: "Use secure payments, wallet credits and quick reorder features for every purchase."
  }
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const dispatch = useDispatch();
  const slide = slides[index];
  const done = () => dispatch(completeOnboarding());

  return (
    <Screen scroll={false} contentStyle={styles.wrap}>
      <Pressable onPress={done} style={styles.skip}><Text style={styles.skipText}>Skip</Text></Pressable>
      <View style={styles.art}><Text style={styles.icon}>{slide.icon}</Text></View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.text}>{slide.text}</Text>
      <View style={styles.dots}>{slides.map((_, i) => <View key={i} style={[styles.dot, i === index && styles.dotActive]} />)}</View>
      <AppButton title={index === slides.length - 1 ? "Get Started" : "Next"} onPress={() => (index === slides.length - 1 ? done() : setIndex(index + 1))} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", padding: 24 },
  skip: { position: "absolute", top: 18, right: 20 },
  skipText: { color: colors.primary, fontWeight: "800" },
  art: { height: 180, borderRadius: 8, backgroundColor: "#E6F7EB", alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 82 },
  title: { fontSize: type.heading, fontWeight: "900", color: colors.text, textAlign: "center" },
  text: { color: colors.muted, textAlign: "center", fontSize: type.body, lineHeight: 16 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginVertical: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.faint },
  dotActive: { width: 24, backgroundColor: colors.primary }
});
