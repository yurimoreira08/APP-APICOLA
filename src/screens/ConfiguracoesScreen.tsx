import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { C } from "../theme/colors";

type Props = {
  onBack: () => void;
};

/**
 * Tela de Configurações
 * 
 * @description
 * Interface base para opções gerais do aplicativo e do usuário.
 */
export const ConfiguracoesScreen = ({ onBack }: Props) => {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Perfil</Text>
            <Text style={styles.cardSub}>Nome, Email, Senha</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Tema</Text>
            <Text style={styles.cardSub}>Modo Escuro (Ativo)</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Geral</Text>
            <Text style={styles.cardSub}>Outras configurações</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: C.text, marginLeft: 20 },
  backBtn: { padding: 8, backgroundColor: C.card, borderRadius: 8 },
  backBtnText: { color: C.accent, fontWeight: "bold" },
  content: { flex: 1, padding: 20, gap: 16 },
  card: { backgroundColor: C.card, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: C.cardBorder },
  cardTitle: { color: C.text, fontSize: 18, fontWeight: "bold" },
  cardSub: { color: C.textSub, fontSize: 14, marginTop: 4 }
});
