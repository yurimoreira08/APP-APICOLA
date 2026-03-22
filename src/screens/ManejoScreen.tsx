import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import type { Apiario } from "../types/Apiario";

import { C } from "../theme/colors";

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
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Sugestões de Manejo</Text>
          <Text style={styles.headerSub}>{apiario?.nome || "Apiário Desconhecido"}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40, gap: 16 }}>
        <View style={styles.card}>
            <View style={[styles.badge, { backgroundColor: C.warning + '20' }]}>
                <Text style={[styles.badgeText, { color: C.warning }]}>Atenção</Text>
            </View>
            <Text style={styles.cardTitle}>Alimentação de Manutenção</Text>
            <Text style={styles.cardSub}>
                Baseado na última revisão, algumas caixas apresentam baixo estoque de mel. Considere entrar com alimentação proteica/energética.
            </Text>
        </View>

        <View style={styles.card}>
            <View style={[styles.badge, { backgroundColor: C.success + '20' }]}>
                <Text style={[styles.badgeText, { color: C.success }]}>Bom Estado</Text>
            </View>
            <Text style={styles.cardTitle}>Espaço na Melgueira</Text>
            <Text style={styles.cardSub}>
                A maioria das caixas possui espaço suficiente. Nenhuma adição de melgueira é necessária por enquanto.
            </Text>
        </View>

        <View style={styles.card}>
            <View style={[styles.badge, { backgroundColor: C.accent + '20' }]}>
                <Text style={[styles.badgeText, { color: C.accent }]}>Indicação</Text>
            </View>
            <Text style={styles.cardTitle}>Troca de Rainha</Text>
            <Text style={styles.cardSub}>
                As caixas C02 e C05 apresentam postura irregular ou falhas na cria. Programe a substituição das rainhas.
            </Text>
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: C.text, marginLeft: 20 },
  headerSub: { fontSize: 14, color: C.textSub, marginLeft: 20 },
  backBtn: { padding: 8, backgroundColor: C.card, borderRadius: 8 },
  backBtnText: { color: C.accent, fontWeight: "bold" },
  content: { flex: 1, padding: 20 },
  card: { backgroundColor: C.card, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: C.cardBorder, gap: 8 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: "bold", marginTop: 4 },
  cardSub: { color: C.textSub, fontSize: 14, lineHeight: 20 }
});
