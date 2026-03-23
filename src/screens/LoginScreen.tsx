import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

type Props = {
  onLoginCloud: (email: string, senha: string) => Promise<void>;
  onContinueLocal: () => Promise<void>;
  onGoToSignup: () => void;
};

export const LoginScreen = ({ onLoginCloud, onContinueLocal, onGoToSignup }: Props) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCloudLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Campos obrigatórios", "Informe e-mail e senha para entrar.");
      return;
    }

    try {
      setLoading(true);
      await onLoginCloud(email.trim(), senha);
    } catch (e: any) {
      Alert.alert("Não foi possível entrar", e?.message || "Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalMode = async () => {
    try {
      setLoading(true);
      await onContinueLocal();
    } catch (e: any) {
      Alert.alert("Falha", e?.message || "Não foi possível entrar no modo local.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Use sua conta para sincronizar na nuvem ou continue localmente.</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={C.textSub}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        placeholderTextColor={C.textSub}
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.btnPrimary} onPress={handleCloudLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={C.text} /> : <Text style={styles.btnPrimaryText}>Entrar na nuvem</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={handleLocalMode} disabled={loading}>
        <Text style={styles.btnSecondaryText}>Entrar sem conta (modo local)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBtn} onPress={onGoToSignup} disabled={loading}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 22,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontSize: 34,
    color: C.text,
    fontWeight: "800",
    ...T.bold,
  },
  subtitle: {
    color: C.textSub,
    fontSize: 14,
    marginBottom: 8,
    ...T.medium,
  },
  input: {
    minHeight: 50,
    backgroundColor: C.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 14,
    color: C.text,
    ...T.medium,
  },
  btnPrimary: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnPrimaryText: {
    color: C.text,
    fontWeight: "800",
    fontSize: 16,
    ...T.bold,
  },
  btnSecondary: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: C.text,
    fontWeight: "700",
    ...T.medium,
  },
  linkBtn: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    color: C.text,
    textDecorationLine: "underline",
    ...T.medium,
  },
});
