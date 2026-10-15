import { requireOptionalNativeModule } from "expo";

export function getSpeechRecognition() {
  // Older installed builds can still open the app before this native module is rebuilt.
  if (!requireOptionalNativeModule("ExpoSpeechRecognition")) return null;
  return require("expo-speech-recognition").ExpoSpeechRecognitionModule;
}
