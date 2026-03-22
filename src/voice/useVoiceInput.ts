import { useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from "expo-speech-recognition";
import { speechNative } from "./nativeSpeech";

type VoiceState = {
  listening: boolean;
  partial?: string;
  final?: string;
  error?: string;
};

const ensureAudioPermission = async () => {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "Permissão de microfone",
        message: "Preciso do microfone pra preencher os dados por voz.",
        buttonPositive: "OK",
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const { status } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  return status === "granted";
};

export const useVoiceInput = () => {
  const api = useMemo(() => speechNative(), []);
  const [state, setState] = useState<VoiceState>({ listening: false });

  useSpeechRecognitionEvent("result", (event) => {
    const e = event as any;
    const result = e.results?.[e.resultIndex ?? 0];
    const text = result?.transcript ?? "";
    const isFinal = e.isFinal || result?.isFinal;

    if (isFinal) {
      setState((s) => ({ ...s, final: text, partial: undefined }));
    } else {
      setState((s) => ({ ...s, partial: text }));
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setState((s) => ({
      ...s,
      error: event.message ?? event.error ?? "Erro desconhecido",
      listening: false,
    }));
  });

  useSpeechRecognitionEvent("start", () => {
    setState((s) => ({ ...s, listening: true, error: undefined }));
  });
  useSpeechRecognitionEvent("end", () => {
    setState((s) => ({ ...s, listening: false }));
  });

  const start = async () => {
    const ok = await ensureAudioPermission();
    if (!ok) {
      setState((s) => ({ ...s, error: "Permissão de microfone negada." }));
      return;
    }
    setState((s) => ({ ...s, error: undefined }));
    await api.start();
  };

  const stop = async () => {
    await api.stop();
  };

  const cancel = async () => {
    await api.cancel();
  };

  return { state, start, stop, cancel };
};
