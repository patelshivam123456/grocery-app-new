import React from "react";
import { AccessibilityInfo } from "react-native";

export default function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = React.useState(null);
  React.useEffect(() => {
    let active = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      changed = true;
      if (active) setReducedMotion(enabled);
    });
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active && !changed) setReducedMotion(enabled);
    }).catch(() => {
      if (active && !changed) setReducedMotion(true);
    });
    return () => { active = false; subscription.remove(); };
  }, []);
  return reducedMotion;
}
