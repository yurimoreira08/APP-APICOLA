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
  onSignupCloud: (nome: string, email: string, senha: string) => Promise<void>;
  onBackToLogin: () => void;
};

export const SignupScreen = ({ onSignupCloud, onBackToLogin }: Props) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha nome, e-mail e senha.");
      return;
    }

    if (senha.trim().length < 4) {
      Alert.alert("Senha curta", "Use ao menos 4 caracteres.");
      return;
    }

    try {
      setLoading(true);
      await onSignupCloud(nome.trim(), email.trim(), senha);
    } catch (e: any) {
      Alert.alert("Cadastro não concluído", e?.message || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Cadastre-se</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do apicultor"
        placeholderTextColor={C.textSub}
        value={nome}
        onChangeText={setNome}
      />

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

      <TouchableOpacity style={styles.btnPrimary} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color={C.text} /> : <Text style={styles.btnPrimaryText}>Criar conta</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBtn} onPress={onBackToLogin} disabled={loading}>
        <Text style={styles.linkText}>Já tenho conta</Text>
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
    marginBottom: 8,
    ...T.bold,
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
