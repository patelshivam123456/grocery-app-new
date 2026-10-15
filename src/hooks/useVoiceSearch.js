import React from "react";
import { Keyboard, Platform } from "react-native";
import { getSpeechRecognition } from "../services/speechRecognition";

const messages = {
  "no-speech": "No speech detected. Tap the microphone and try again.",
  "audio-capture": "The microphone is unavailable. Check that another app isn't using it.",
  "not-allowed": "Allow microphone and speech recognition access in Settings to use voice search.",
  "service-not-allowed": "Speech recognition isn't available. You can still type your search.",
  "network": "Voice search couldn't connect. Check your connection and try again.",
  "language-not-supported": "English voice search isn't supported by this device's speech service."
};

export default function useVoiceSearch(onTranscript) {
  const [status, setStatus] = React.useState("idle");
  const [error, setError] = React.useState(null);
  const callback = React.useRef(onTranscript);
  callback.current = onTranscript;
  const engine = React.useRef(null);
  const subscriptions = React.useRef([]);
  const session = React.useRef(0);
  const busy = React.useRef(false);

  const removeListeners = React.useCallback(() => {
    subscriptions.current.forEach((subscription) => subscription.remove());
    subscriptions.current = [];
  }, []);
  const dispose = React.useCallback(() => {
    session.current += 1;
    busy.current = false;
    removeListeners();
    try { engine.current?.abort(); } catch {}
    engine.current = null;
  }, [removeListeners]);
  const cancel = React.useCallback(() => {
    dispose();
    setStatus("idle");
  }, [dispose]);
  React.useEffect(() => dispose, [dispose]);

  const start = React.useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const token = ++session.current;
    setError(null);
    setStatus("requesting");
    Keyboard.dismiss();
    const finish = () => {
      if (session.current !== token) return;
      busy.current = false;
      setStatus("idle");
      removeListeners();
    };
    try {
      const module = getSpeechRecognition();
      if (!module) throw new Error("new-build-required");
      if (!module.isRecognitionAvailable()) throw new Error("unavailable");
      if (Platform.OS !== "web") {
        const permission = await module.requestPermissionsAsync();
        if (session.current !== token) return;
        if (!permission.granted) throw new Error("not-allowed");
      }
      engine.current = module;
      subscriptions.current = [
        module.addListener("start", () => { if (session.current === token) setStatus("listening"); }),
        module.addListener("result", (event) => {
          if (session.current !== token) return;
          const text = event.results?.[0]?.transcript?.trim().replace(/[.!?]+$/, "");
          if (text) callback.current(text, event.isFinal);
        }),
        module.addListener("error", (event) => {
          if (session.current !== token) return;
          if (event.error !== "aborted") setError(messages[event.error] || "Voice search couldn't start. Please try again or type your search.");
          finish();
        }),
        module.addListener("end", finish)
      ];
      module.start({ lang: "en-IN", interimResults: true, continuous: false, maxAlternatives: 1, addsPunctuation: false, iosTaskHint: "search" });
    } catch (cause) {
      if (session.current !== token) return;
      setError(cause.message === "new-build-required" ? "Install the updated app build to enable voice search. You can still type your search." : cause.message === "unavailable" ? "Voice search isn't available on this device or browser. You can still type your search." : messages[cause.message] || "Voice search couldn't start. Please try again.");
      finish();
    }
  }, [removeListeners]);
  const toggle = React.useCallback(() => {
    if (!busy.current) return start();
    if (status === "listening") {
      try { engine.current?.stop(); } catch { cancel(); }
    } else cancel();
  }, [start, cancel, status]);

  return { status, error, start, toggle, cancel };
}
