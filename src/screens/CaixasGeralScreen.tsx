import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useResumoCaixas } from "../hooks/useResumoCaixas";
import type { ResumoCaixa } from "../../database/db";

import { C } from "../theme/colors";

type Props = {
  onFazerRevisao: (apiarioId: string, caixa: number) => void;
  onBack: () => void;
};

/**
 * Tela de Listagem Geral de Caixas
 * 
 * @description
 * Analisa e agrupa todas as caixas únicas já cadastradas ao longo das revisões do SQLite.
 * Exibe as caixas soltas e os nomes dos apiários aos quais elas pertencem.
 */
export const CaixasGeralScreen = ({ onFazerRevisao, onBack }: Props) => {
  const { caixas, load } = useResumoCaixas();

  useEffect(() => {
    void load();
  }, [load]);

  const renderItem = ({ item }: { item: ResumoCaixa }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {item.tipo ? `${item.tipo} ${item.caixa}` : `Caixa ${item.caixa}`}
          </Text>
          <Text style={styles.cardDate}>
            📍 Apiário: {item.apiarioNome}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => onFazerRevisao(item.apiarioId, item.caixa)}
          style={styles.actionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>🍯 Revisar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={onBack} style={{ marginRight: 15 }}>
            <Text style={{ fontSize: 24, color: C.text, fontWeight: "bold" }}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Caixas Cadastradas</Text>
        </View>
      </View>

      <FlatList
        data={caixas}
        keyExtractor={(item) => `${item.apiarioId}-${item.caixa}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma caixa encontrada nas revisões.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: C.text },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  cardTitle: { color: C.text, fontSize: 18, fontWeight: "700", textTransform: 'capitalize' },
  cardDate: { color: C.textSub, fontSize: 14, marginTop: 4 },
  actionBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: { color: "#000", fontWeight: "bold", fontSize: 13 },
  emptyText: { color: C.textSub, textAlign: "center", marginTop: 60, fontSize: 15 },
});
