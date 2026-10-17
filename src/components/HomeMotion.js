import React from "react";
import { Animated, Pressable, Text } from "react-native";

// Motion is enabled only inside the home screen provider.
export const HomeMotionContext = React.createContext(true);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MotionPressable({ style, onPressIn, onPressOut, disabled, ...props }) {
  const reducedMotion = React.useContext(HomeMotionContext);
  const scale = React.useRef(new Animated.Value(1)).current;
  const animation = React.useRef(null);
  const animate = (toValue, duration) => {
    animation.current?.stop();
    animation.current = Animated.timing(scale, { toValue, duration, useNativeDriver: true, isInteraction: false });
    animation.current.start();
  };
  React.useEffect(() => {
    if (reducedMotion !== false || disabled) { animation.current?.stop(); scale.setValue(1); }
    return () => animation.current?.stop();
  }, [reducedMotion, disabled, scale]);
  return <AnimatedPressable {...props} disabled={disabled} style={[style, { transform: [{ scale }] }]}
    onPressIn={(event) => { if (reducedMotion === false && !disabled) animate(0.97, 90); onPressIn?.(event); }}
    onPressOut={(event) => { if (reducedMotion === false) animate(1, 140); onPressOut?.(event); }}
  />;
}

export function MotionEntrance({ children, style, delay = 0 }) {
  const reducedMotion = React.useContext(HomeMotionContext);
  const progress = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (reducedMotion === null) return;
    if (reducedMotion) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: 1, duration: 240, delay, useNativeDriver: true, isInteraction: false });
    animation.start();
    return () => animation.stop();
  }, [reducedMotion, delay, progress]);
  return <Animated.View style={[style, reducedMotion !== true && { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }]}>{children}</Animated.View>;
}

export function MotionVisibility({ visible, style, children }) {
  const reducedMotion = React.useContext(HomeMotionContext);
  const progress = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [rendered, setRendered] = React.useState(visible);
  React.useEffect(() => {
    if (reducedMotion !== false) { progress.setValue(visible ? 1 : 0); setRendered(visible); return; }
    if (visible) setRendered(true);
    const animation = Animated.timing(progress, { toValue: visible ? 1 : 0, duration: visible ? 180 : 140, useNativeDriver: true, isInteraction: false });
    animation.start(({ finished }) => { if (finished && !visible) setRendered(false); });
    return () => animation.stop();
  }, [visible, reducedMotion, progress]);
  if (!rendered) return null;
  return <Animated.View pointerEvents={visible ? "auto" : "none"} accessibilityElementsHidden={!visible} importantForAccessibility={visible ? "auto" : "no-hide-descendants"} style={[style, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>{children}</Animated.View>;
}

export function AnimatedCartCount({ count, children, ...props }) {
  const reducedMotion = React.useContext(HomeMotionContext);
  const scale = React.useRef(new Animated.Value(1)).current;
  const previous = React.useRef(0);
  React.useEffect(() => {
    const increased = count > previous.current;
    previous.current = count;
    scale.setValue(1);
    if (reducedMotion !== false || !increased) return;
    const animation = Animated.sequence([
      Animated.timing(scale, { toValue: 1.08, duration: 90, useNativeDriver: true, isInteraction: false }),
      Animated.timing(scale, { toValue: 1, duration: 160, useNativeDriver: true, isInteraction: false })
    ]);
    animation.start();
    return () => animation.stop();
  }, [count, reducedMotion, scale]);
  if (reducedMotion !== false) return <Text {...props}>{children}</Text>;
  return <Animated.Text {...props} style={[props.style, { transform: [{ scale }] }]}>{children}</Animated.Text>;
}
