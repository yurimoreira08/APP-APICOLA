import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { C } from "../theme/colors";

type Props = {
  onBack: () => void;
  onEscolherRevisao: () => void;
  onEscolherManejo: () => void;
};

/**
 * Modal de Escolha de Ação (Delegada)
 * 
 * @description
 * Tela intermediária muito simples onde o usuário opta se deseja iniciar uma 
 * vistoria (Revisão) ou visualizar os painéis inteligentes (Manejo).
 * 
 * @param {Props} props Callbacks roteadores.
 */
export const EscolhaAcaoScreen = ({ onBack, onEscolherRevisao, onEscolherManejo }: Props) => {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisão / Manejo</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>O que você deseja fazer agora?</Text>
        
        <TouchableOpacity style={styles.card} onPress={onEscolherRevisao} activeOpacity={0.8}>
          <Text style={styles.icon}>🍯</Text>
          <Text style={styles.cardTitle}>Fazer Revisão</Text>
          <Text style={styles.cardDesc}>Registrar as condições das caixas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={onEscolherManejo} activeOpacity={0.8}>
          <Text style={styles.icon}>🛠️</Text>
          <Text style={styles.cardTitle}>Sugestões de Manejo</Text>
          <Text style={styles.cardDesc}>Ver indicações para o seu apiário</Text>
        </TouchableOpacity>
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
  content: { flex: 1, padding: 20, gap: 20 },
  instruction: { color: C.textSub, fontSize: 16, textAlign: "center", marginBottom: 10 },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    gap: 12,
  },
  icon: { fontSize: 48 },
  cardTitle: { fontSize: 22, fontWeight: "bold", color: C.text },
  cardDesc: { fontSize: 14, color: C.textSub, textAlign: "center" },
});
