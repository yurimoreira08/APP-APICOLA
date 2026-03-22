import React from "react";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Apiario } from "../types/Apiario";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

type Props = {
  apiario?: Apiario;
  onBack: () => void;
};

/**
 * Tela de Manejo do Apiário
 * 
 * @description
 * Interface responsável por exibir os insights de Inteligência e sugestões 
 * automáticas recomendadas baseadas nos laudos e avaliações registradas.
 * 
 * @param {Props} props Contexto do apiário atual para exibir o título e fechar modal.
 */
export const ManejoScreen = ({ apiario, onBack }: Props) => {
  const cards = Platform.OS === "web"
    ? [
        {
          caixa: "02",
          indicacoes: ["Colocar melgueira", "Fazer uma possível divisão"],
        },
        {
          caixa: "03",
          indicacoes: ["Colocar melgueira", "Fazer uma possível divisão"],
        },
      ]
    : [
        {
          caixa: "02",
          indicacoes: ["Monitorar espaço", "Reforçar alimentação"],
        },
      ];

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manejo</Text>
        <Feather name="bell" size={20} color={C.text} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40, gap: 16 }}>
        <TextInput
          placeholder="Pesquisar caixa...."
          placeholderTextColor={C.textSub}
          style={styles.searchInput}
        />

        <View style={styles.topActionsCard}>
          <TouchableOpacity style={styles.mainBtn} activeOpacity={0.8}>
            <Text style={styles.mainBtnText}>Selecionar Caixas a Manejar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mainBtn} activeOpacity={0.8}>
            <Text style={styles.mainBtnText}>Manejo Feito</Text>
          </TouchableOpacity>
        </View>

        {cards.map((card) => (
          <View key={card.caixa} style={styles.card}>
            <Text style={styles.cardTitle}>Caixa: {card.caixa}</Text>
            <Text style={styles.cardTitle}>Indicações:</Text>
            {card.indicacoes.map((item) => (
              <Text key={item} style={styles.cardSub}>• {item}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
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
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.text, ...T.bold },
  headerIcon: { fontSize: 20, color: C.text },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  backBtnText: { color: C.text, fontWeight: "700", fontSize: 26 },
  content: { flex: 1, padding: 20 },
  searchInput: {
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 20,
    minHeight: 50,
    paddingHorizontal: 14,
    color: C.text,
    fontSize: 14,
  },
  topActionsCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 10,
    gap: 10,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 2,
  },
  mainBtn: {
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnText: { color: C.text, fontSize: 16, fontWeight: "700", ...T.medium },
  card: {
    backgroundColor: C.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 8,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 2,
  },
  cardTitle: { color: C.text, fontSize: 18, fontWeight: "700", marginTop: 2, ...T.bold },
  cardSub: { color: C.text, fontSize: 16, lineHeight: 24, paddingLeft: 6, ...T.medium }
});
