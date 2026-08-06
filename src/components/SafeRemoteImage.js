import React from "react";
import { Image, Text } from "react-native";

export default function SafeRemoteImage({ uri, style, resizeMode = "cover", fallback = "▣", fallbackStyle, fallbackSource }) {
  const [failed, setFailed] = React.useState(false);
  const placeholder = fallbackSource || require("../../assets/icon.png");

  React.useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (!uri || failed || !String(uri).startsWith("http")) {
    const fallbackText = String(fallback || "").startsWith("http") ? "▣" : fallback;
    if (placeholder) return <Image source={placeholder} style={style} resizeMode={resizeMode} />;
    return <Text style={fallbackStyle}>{fallbackText}</Text>;
  }

  return <Image source={{ uri }} style={style} resizeMode={resizeMode} onError={() => setFailed(true)} />;
}
