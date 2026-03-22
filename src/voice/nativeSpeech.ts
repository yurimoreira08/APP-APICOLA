import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

export type SpeechNativeApi = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  cancel: () => Promise<void>;
};

export const speechNative = (): SpeechNativeApi => {
  const start = async () => {
    let locale = "pt-BR";
    try {
      const { locales } = await ExpoSpeechRecognitionModule.getSupportedLocales({});
      if (!locales.includes("pt-BR")) {
        locale = locales.find((l) => l.startsWith("pt")) ?? "en-US";
      }
    } catch {
    }

    ExpoSpeechRecognitionModule.start({
      lang: locale,
      interimResults: true,
      continuous: true,
      requiresOnDeviceRecognition: false,
    });
  };

  const stop = async () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const cancel = async () => {
    ExpoSpeechRecognitionModule.abort();
  };

  return { start, stop, cancel };
};
