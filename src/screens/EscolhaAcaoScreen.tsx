import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

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
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisão e Manejo</Text>
        <Feather name="bell" size={20} color={C.text} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.card} onPress={onEscolherRevisao} activeOpacity={0.8}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={30} color={C.text} />
          <Text style={styles.cardTitle}>Revisão</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={onEscolherManejo} activeOpacity={0.8}>
          <MaterialCommunityIcons name="sprout-outline" size={30} color={C.text} />
          <Text style={styles.cardTitle}>Manejo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.navBg,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.text, ...T.bold },
  headerIcon: { fontSize: 20, color: C.text },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: C.text, fontWeight: "700", fontSize: 26 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 18, gap: 16 },
  card: {
    backgroundColor: C.accent,
    borderRadius: 14,
    minHeight: 112,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 26, fontWeight: "700", color: C.text, ...T.bold },
});
