import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApiarios } from "../hooks/useApiarios";
import type { Apiario } from "../types/Apiario";

import { C } from "../theme/colors";

type Props = {
  isSelectionMode?: boolean;
  isRevisaoManejoMode?: boolean;
  onNewApiario?: () => void;
  onEditApiario?: (apiario: Apiario) => void;
  onFazerRevisao?: (apiario: Apiario) => void;
  onSelectApiario?: (apiario: Apiario) => void;
  onSelectRevisao?: (apiario: Apiario) => void;
  onSelectManejo?: (apiario: Apiario) => void;
  onBack: () => void;
};

/**
 * Tela de Listagem e Seleção de Apiários
 * 
 * @description
 * Tela versátil que acopla lógicas de Listagem Geral (CRUD de Apiários), 
 * Modo de Seleção Simples (para outras áreas) e o Modo Combinado (Botões duplos de 
 * Revisão e Manejo) dependendo das `props` injetadas.
 * 
 * @param {Props} props Callbacks e flags lógicas para alterar o comportamento de renderização.
 */
export const ListaApiariosScreen = ({ 
  isSelectionMode, 
  isRevisaoManejoMode,
  onNewApiario, 
  onEditApiario, 
  onFazerRevisao,
  onSelectApiario,
  onSelectRevisao,
  onSelectManejo,
  onBack 
}: Props) => {
  const { apiarios, load, remove } = useApiarios();

  useEffect(() => {
    void load();
  },[load]);

  const handleDelete = (id: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este apiário?",
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

  const renderItem = ({ item }: { item: Apiario }) => {
    if (isRevisaoManejoMode) {
      return (
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            {item.local ? <Text style={styles.cardText}>📍 {item.local}</Text> : null}
            <Text style={styles.cardText}>📦 {item.quantidadeCaixas || 0} caixas</Text>
          </View>
          <View style={[styles.cardActions, { marginTop: 12, width: '100%', justifyContent: 'space-between' }]}>
            <TouchableOpacity 
              onPress={() => onSelectRevisao?.(item)}
              style={[styles.btnAction, { backgroundColor: C.accent }]}
              activeOpacity={0.8}
            >
              <Text style={styles.btnActionText}>🍯 Fazer Revisão</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onSelectManejo?.(item)}
              style={[styles.btnAction, { backgroundColor: C.bg, borderColor: C.accent, borderWidth: 1 }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnActionText, { color: C.accent }]}>🔄 Fazer Manejo</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (isSelectionMode) {
      return (
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => onSelectApiario?.(item)}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            {item.local ? <Text style={styles.cardText}>📍 {item.local}</Text> : null}
            <Text style={styles.cardText}>📦 {item.quantidadeCaixas || 0} caixas</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardDate}>
              {item.quantidadeCaixas || 0} caixas {item.local ? `• ${item.local}` : ""}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity 
              onPress={() => onFazerRevisao?.(item)}
              style={{ backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6 }}
            >
              <Text style={{ color: "#000", fontWeight: "bold", fontSize: 13 }}>Revisão</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onEditApiario?.(item)}
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

        {item.descricao ? (
          <Text style={styles.cardObs} numberOfLines={2}>
            📝 {item.descricao}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={onBack} style={{ marginRight: 15 }}>
            <Text style={{ fontSize: 24, color: C.text, fontWeight: "bold" }}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isSelectionMode ? "Selecionar Apiário" : (isRevisaoManejoMode ? "Revisão e Manejo" : "Apiários")}
          </Text>
        </View>
        {!isSelectionMode && !isRevisaoManejoMode && onNewApiario && (
          <TouchableOpacity onPress={onNewApiario} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Novo</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={apiarios}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum apiário encontrado</Text>
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
  cardContent: { gap: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardTitle: { color: C.text, fontSize: 18, fontWeight: "700" },
  cardDate: { color: C.textSub, fontSize: 13, marginTop: 2 },
  cardText: { color: C.textSub, fontSize: 14 },
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
  cardObs: { color: C.textSub, fontSize: 13, fontStyle: "italic", marginTop: 4 },
  emptyText: { color: C.textSub, textAlign: "center", marginTop: 60, fontSize: 15 },
  btnAction: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  btnActionText: { color: "#000", fontWeight: "bold", fontSize: 14 },
});
