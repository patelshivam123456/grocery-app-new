import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import SafeRemoteImage from "./SafeRemoteImage";

export default function ProductImageViewer({ images, initialIndex = 0, productName, onImageChange, onClose }) {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pagerRef = React.useRef(null);
  const thumbnailsRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(() => Math.max(0, Math.min(initialIndex, images.length - 1)));
  const [zoomed, setZoomed] = React.useState(false);
  const [viewport, setViewport] = React.useState({ width: window.width - insets.left - insets.right, height: 400 });
  const indexRef = React.useRef(activeIndex);
  const multiple = images.length > 1;

  const updateIndex = (index) => {
    indexRef.current = index;
    setActiveIndex(index);
    setZoomed(false);
    onImageChange?.(index);
  };
  const goTo = (index) => {
    if (index < 0 || index >= images.length || index === indexRef.current) return;
    updateIndex(index);
    pagerRef.current?.scrollTo({ x: index * viewport.width, animated: true });
  };

  React.useEffect(() => {
    // Keep the selected photo in view when opening or rotating the device.
    const frame = requestAnimationFrame(() => pagerRef.current?.scrollTo({ x: indexRef.current * viewport.width, animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [viewport.width]);

  React.useEffect(() => {
    thumbnailsRef.current?.scrollTo({ x: Math.max(0, activeIndex * 64 - viewport.width / 2 + 32), animated: true });
  }, [activeIndex, viewport.width]);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose} onShow={() => pagerRef.current?.scrollTo({ x: indexRef.current * viewport.width, animated: false })}>
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.root}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text numberOfLines={1} style={styles.title}>{productName}</Text>
            <Text accessibilityLiveRegion="polite" style={styles.count}>{activeIndex + 1} / {images.length}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close photo viewer" onPress={onClose} style={styles.iconButton}><Feather name="x" size={24} color="#FFFFFF" /></Pressable>
        </View>
        <View style={styles.stage} onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width > 0 && height > 0 && (width !== viewport.width || height !== viewport.height)) setViewport({ width, height });
        }}>
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            bounces={false}
            scrollEnabled={!zoomed}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => updateIndex(Math.max(0, Math.min(images.length - 1, Math.round(event.nativeEvent.contentOffset.x / viewport.width))))}
          >
            {images.map((item, index) => (
              <View key={item.label || index} style={{ width: viewport.width, height: viewport.height }}>
                <ScrollView
                  key={`${index}-${activeIndex === index}`}
                  style={styles.photoScroll}
                  contentContainerStyle={[styles.photoContent, { minHeight: viewport.height }]}
                  maximumZoomScale={3}
                  minimumZoomScale={1}
                  centerContent
                  bouncesZoom={false}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={32}
                  onScroll={(event) => { if (index === indexRef.current) setZoomed((event.nativeEvent.zoomScale || 1) > 1.01); }}
                >
                  <SafeRemoteImage uri={item.image} imageSize={1000} accessibilityLabel={`${productName}, photo ${index + 1}`} style={{ width: viewport.width, height: viewport.height }} resizeMode="contain" fallback={item.image} fallbackStyle={styles.fallback} />
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        </View>
        {multiple ? <View style={styles.footer}>
          <View style={styles.controls}>
            <Pressable accessibilityRole="button" accessibilityLabel="Previous photo" accessibilityState={{ disabled: activeIndex === 0 }} disabled={activeIndex === 0} onPress={() => goTo(activeIndex - 1)} style={[styles.iconButton, activeIndex === 0 && styles.disabled]}><Feather name="chevron-left" size={23} color="#FFFFFF" /></Pressable>
            <Text style={styles.hint}>Swipe to view photos</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Next photo" accessibilityState={{ disabled: activeIndex === images.length - 1 }} disabled={activeIndex === images.length - 1} onPress={() => goTo(activeIndex + 1)} style={[styles.iconButton, activeIndex === images.length - 1 && styles.disabled]}><Feather name="chevron-right" size={23} color="#FFFFFF" /></Pressable>
          </View>
          <ScrollView ref={thumbnailsRef} horizontal style={styles.thumbnailStrip} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
            {images.map((item, index) => <Pressable key={item.label || index} accessibilityRole="button" accessibilityLabel={`Show photo ${index + 1}`} accessibilityState={{ selected: activeIndex === index }} onPress={() => goTo(index)} style={[styles.thumbnail, activeIndex === index && styles.thumbnailActive]}>
              <SafeRemoteImage uri={item.image} style={styles.thumbnailPhoto} resizeMode="contain" fallback={item.image} fallbackStyle={styles.thumbnailFallback} />
            </Pressable>)}
          </ScrollView>
        </View> : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#111815" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  heading: { flex: 1, gap: 4 },
  title: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  count: { color: "#A9BBB0", fontSize: 12 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#27332D", alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.3 },
  stage: { flex: 1, overflow: "hidden" },
  photoScroll: { flex: 1 },
  photoContent: { alignItems: "center", justifyContent: "center" },
  fallback: { color: "#FFFFFF", fontSize: 120 },
  footer: { paddingBottom: 10, gap: 12 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  hint: { color: "#B7C7BD", fontSize: 12 },
  thumbnails: { paddingHorizontal: 16, gap: 8 },
  thumbnailStrip: { flexGrow: 0, height: 56 },
  thumbnail: { width: 56, height: 56, padding: 4, backgroundColor: "#FFFFFF", borderRadius: 9, borderWidth: 2, borderColor: "transparent" },
  thumbnailActive: { borderColor: "#56CF9E" },
  thumbnailPhoto: { width: "100%", height: "100%", borderRadius: 5 },
  thumbnailFallback: { fontSize: 24 }
});
