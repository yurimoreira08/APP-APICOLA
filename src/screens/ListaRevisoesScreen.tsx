import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRevisoes } from "../hooks/useRevisoes";
import type { Revisao } from "../types/Revisao";
import type { Apiario } from "../types/Apiario";
import { useVoiceInput } from "../voice/useVoiceInput";

import { C } from "../theme/colors";

type Props = {
  apiario?: Apiario;
  caixaFiltro?: number;
  onNewRevisao: () => void;
  onEditRevisao: (revisao: Revisao) => void;
  onBack: () => void;
};

/**
 * Tela de Listagem de Revisões
 * 
 * @description
 * Exibe todas as revisões completadas de um apiário ou caixa específica.
 * Inclui botões para criar novas revisões (ativando o comando de voz) 
 * ou editar/remover registros existentes do SQLite.
 * 
 * @param {Props} props Filtros de Apiário/Caixa e callbacks de roteamento.
 */
export const ListaRevisoesScreen = ({ apiario, caixaFiltro, onNewRevisao, onEditRevisao, onBack }: Props) => {
  const { revisoes, load, remove } = useRevisoes(apiario?.id?.toString(), caixaFiltro);
  const { state: voice, start, stop } = useVoiceInput();

  useEffect(() => {
    void load();
    void start(); // Start mic automatically
    return () => {
      void stop();
    };
  }, [load]);

  useEffect(() => {
    if (voice.final) {
      const text = voice.final.toLowerCase();
      if (text.includes("nova revisao") || text.includes("nova revisão")) {
        onNewRevisao();
      }
    }
  }, [voice.final]);

  const handleDelete = (id: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta revisão?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: () => remove(id) 
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Revisao }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, {textTransform: "capitalize", color: C.text, fontSize: 16, fontWeight: "700"}]}>
            {item.tipo ? (item.caixa ? `${item.tipo} ${item.caixa}` : item.tipo) : "Revisão"}
          </Text>
          <Text style={styles.cardDate}>{item.dataIso}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            onPress={() => onEditRevisao(item)}
            style={[styles.actionBtn, styles.actionBtnEdit]}
          >
            <Text style={styles.actionBtnText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => item.id && handleDelete(item.id)}
            style={[styles.actionBtn, styles.actionBtnDelete]}
          >
            <Text style={styles.actionBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.badgeRow}>
        {item.rainha && <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeText}>👑 Rainha</Text></View>}
        {item.mel && <View style={[styles.badge, styles.badgeAccent]}><Text style={styles.badgeText}>🍯 Mel</Text></View>}
        {item.forca && <View style={[styles.badge]}><Text style={styles.badgeText}>💪 {item.forca}</Text></View>}
      </View>

      {item.observacao && (
        <Text style={styles.cardObs} numberOfLines={1}>
          📝 {item.observacao}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={onBack} style={{ marginRight: 15 }}>
            <Text style={{ fontSize: 24, color: C.text, fontWeight: "bold" }}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Revisões {apiario ? `(${apiario.nome})` : ""} {caixaFiltro !== undefined ? `- Caixa ${caixaFiltro}` : ""}
          </Text>
        </View>
        <TouchableOpacity onPress={onNewRevisao} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Nova Revisão</Text>
        </TouchableOpacity>
      </View>

      {voice.listening && (
        <View style={styles.micStatusRow}>
          <Text style={styles.micStatusText}>🟢 Ouvindo comandos ("nova revisão")...</Text>
        </View>
      )}

      <FlatList
        data={revisoes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma revisão encontrada</Text>
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
  addBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "#000", fontWeight: "800", fontSize: 13 },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: "700" },
  cardDate: { color: C.textSub, fontSize: 13, marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff08",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  actionBtnEdit: { borderColor: C.accent + "44" },
  actionBtnDelete: { borderColor: C.red + "44" },
  actionBtnText: { fontSize: 16 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    backgroundColor: "#ffffff10",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGreen: { backgroundColor: "#34c77b22", borderWidth: 1, borderColor: C.green },
  badgeAccent: { backgroundColor: "#f5a62322", borderWidth: 1, borderColor: C.accent },
  badgeText: { color: C.text, fontSize: 11, fontWeight: "700" },
  cardObs: { color: C.textSub, fontSize: 13, fontStyle: "italic" },
  emptyText: { color: C.textSub, textAlign: "center", marginTop: 60, fontSize: 15 },
  micStatusRow: {
    backgroundColor: C.card,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    alignItems: "center",
  },
  micStatusText: { color: C.green, fontSize: 13, fontWeight: "600" },
});
