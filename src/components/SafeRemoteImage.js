import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const IMAGE_SIZES = [64, 80, 140, 180, 320, 500, 520, 1000];

function sizedImageUrl(uri, size) {
  if (!uri || !String(uri).startsWith("http") || !size) return null;
  const [, path, suffix = ""] = String(uri).match(/^([^?#]*)(.*)$/);
  const base = path.replace(/\/(?:64x64\.avif|80x80\.avif|140x140\.avif|180x180\.avif|320x320\.avif|500x500\.avif|520x520\.avif|1000x1000\.webp)\/?$/, "").replace(/\/+$/, "");
  return `${base}/${size}x${size}.${size === 1000 ? "webp" : "avif"}${suffix}`;
}

export default function SafeRemoteImage({ uri, style, resizeMode = "cover", fallback = "▣", fallbackStyle, fallbackSource, imageSize }) {
  const [failed, setFailed] = React.useState(false);
  const [layoutSize, setLayoutSize] = React.useState(0);
  const { width, height } = StyleSheet.flatten(style) || {};
  const dimension = typeof width === "number" && typeof height === "number"
    ? Math.max(width, height)
    : layoutSize;
  const size = imageSize || (dimension > 0 ? IMAGE_SIZES.find((value) => value >= dimension) || 1000 : 0);
  const imageUri = sizedImageUrl(uri, size);
  const onLayout = ({ nativeEvent }) => {
    setLayoutSize(Math.max(nativeEvent.layout.width, nativeEvent.layout.height));
  };

  React.useEffect(() => {
    setFailed(false);
  }, [imageUri]);

  if (!imageUri || failed) {
    const fallbackText = !fallback || fallback === "▣" || String(fallback).startsWith("http") ? "🛒" : fallback;
    if (fallbackSource) return <Image source={fallbackSource} style={style} resizeMode="contain" onLayout={onLayout} />;
    return (
      <View style={[style, { alignItems: "center", justifyContent: "center" }]} onLayout={onLayout}>
        <Text style={[{ fontSize: 24 }, fallbackStyle]}>{fallbackText}</Text>
      </View>
    );
  }

  return <Image source={{ uri: imageUri }} style={style} resizeMode={resizeMode} onLayout={onLayout} onError={() => setFailed(true)} />;
}
