import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

type Props = {
  onBack: () => void;
  onLogout: () => void;
};

/**
 * Tela de Configurações
 * 
 * @description
 * Interface base para opções gerais do aplicativo e do usuário.
 */
export const ConfiguracoesScreen = ({ onBack, onLogout }: Props) => {
  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <Feather name="bell" size={20} color={C.text} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Tema Atual</Text>
            <Text style={styles.cardSub}>Mel Claro Premium</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Perfil</Text>
            <Text style={styles.cardSub}>Nome, Email, Senha</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Tema</Text>
          <Text style={styles.cardSub}>Claro acessível (ativo)</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Geral</Text>
            <Text style={styles.cardSub}>Outras configurações</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
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
  headerTitle: { fontSize: 24, fontWeight: "800", color: C.text, ...T.bold },
  headerIcon: { fontSize: 20, color: C.text },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: C.text, fontWeight: "700", fontSize: 26 },
  content: { flex: 1, padding: 20, gap: 16 },
  card: {
    backgroundColor: C.card,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { color: C.text, fontSize: 17, fontWeight: "700", ...T.bold },
  cardSub: { color: C.textSub, fontSize: 14, marginTop: 4, ...T.medium }
  ,
  logoutBtn: {
    marginTop: 6,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#f7e6cf",
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: C.red,
    fontWeight: "800",
    fontSize: 16,
    ...T.bold,
  },
});
