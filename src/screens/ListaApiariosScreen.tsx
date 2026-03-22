import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useApiarios } from "../hooks/useApiarios";
import type { Apiario } from "../types/Apiario";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

type Props = {
  isSelectionMode?: boolean;
  isRevisaoManejoMode?: boolean;
  isRevisaoMode?: boolean;
  isManejoMode?: boolean;
  onNewApiario?: () => void;
  onEditApiario?: (apiario: Apiario) => void;
  onFazerRevisao?: (apiario: Apiario) => void;
  onSelectApiario?: (apiario: Apiario) => void;
  onSelectRevisao?: (apiario: Apiario) => void;
  onSelectManejo?: (apiario: Apiario) => void;
  onSelectCaixas?: (apiario: Apiario) => void;
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
  isRevisaoMode,
  isManejoMode,
  onNewApiario, 
  onEditApiario, 
  onFazerRevisao,
  onSelectApiario,
  onSelectRevisao,
  onSelectManejo,
  onSelectCaixas,
  onBack 
}: Props) => {
  const { apiarios, load, remove } = useApiarios();

  const mockApiariosWeb: Apiario[] = [
    {
      id: 1,
      nome: "Apiário Boiles",
      local: "RN",
      quantidadeCaixas: 20,
      descricao: "Apiário Novo",
    },
    {
      id: 2,
      nome: "Caixas Soltas",
      local: "",
      descricao: "Caixas que não estão dentro de um apiário",
      quantidadeCaixas: 0,
    },
  ];

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
    if (isRevisaoMode) {
      const isCaixasSoltas = item.nome.toLowerCase().includes("caixas soltas");
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardInfo}><Text style={styles.cardInfoLabel}>Nome:</Text> {item.nome}</Text>
              {item.local ? <Text style={styles.cardInfo}><Text style={styles.cardInfoLabel}>Local:</Text> {item.local}</Text> : null}
              {item.quantidadeCaixas ? <Text style={styles.cardInfo}><Text style={styles.cardInfoLabel}>Quantidade de caixas:</Text> {item.quantidadeCaixas}</Text> : null}
              {item.descricao ? <Text style={styles.cardInfo}><Text style={styles.cardInfoLabel}>Descrição:</Text> {item.descricao}</Text> : null}
            </View>
            <View style={styles.cardActionsVertical}>
              <TouchableOpacity
                onPress={() => onEditApiario?.(item)}
                style={styles.smallActionBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.smallActionText}>{isCaixasSoltas ? "Editar\nDescrição" : "Editar\nApiário"}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardBottomActions}>
            <TouchableOpacity onPress={() => onSelectRevisao?.(item)} style={styles.smallActionBtn} activeOpacity={0.8}>
              <Text style={styles.smallActionText}>Fazer\nRevisão</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelectCaixas?.(item)} style={styles.smallActionBtn} activeOpacity={0.8}>
              <Text style={styles.smallActionText}>Ver\nCaixas</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (isManejoMode) {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardInfo}><Text style={styles.cardInfoLabel}>Nome:</Text> {item.nome}</Text>
              {item.local ? <Text style={styles.cardInfo}><Text style={styles.cardInfoLabel}>Local:</Text> {item.local}</Text> : null}
              {item.quantidadeCaixas ? <Text style={styles.cardInfo}><Text style={styles.cardInfoLabel}>Quantidade de caixas:</Text> {item.quantidadeCaixas}</Text> : null}
              {item.descricao ? <Text style={styles.cardInfo}><Text style={styles.cardInfoLabel}>Descrição:</Text> {item.descricao}</Text> : null}
            </View>
          </View>
          <View style={styles.cardBottomActionsSingle}>
            <TouchableOpacity
              onPress={() => onSelectManejo?.(item)}
              style={styles.smallActionBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.smallActionText}>Ver\nindicações</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

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
              style={styles.btnAction}
              activeOpacity={0.8}
            >
              <Text style={styles.btnActionText}>Fazer Revisão</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onSelectManejo?.(item)}
              style={[styles.btnAction, styles.btnActionSecondary]}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnActionText, styles.btnActionSecondaryText]}>Fazer Manejo</Text>
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
            <Text style={styles.cardDate}>{item.local ? `Local: ${item.local}` : "Local não informado"}</Text>
            <Text style={styles.cardText}>Quantidade de caixas: {item.quantidadeCaixas || 0}</Text>
            {item.descricao ? <Text style={styles.cardText}>Descrição: {item.descricao}</Text> : null}
          </View>
          <View style={styles.cardActionsVertical}>
            <TouchableOpacity 
              onPress={() => onFazerRevisao?.(item)}
              style={styles.smallActionBtn}
            >
              <Text style={styles.smallActionText}>Fazer Revisão</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onEditApiario?.(item)}
              style={styles.smallActionBtn}
            >
              <Text style={styles.smallActionText}>Editar Apiário</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => item.id && handleDelete(item.id)}
              style={[styles.smallActionBtn, styles.deleteBtn]}
            >
              <Text style={styles.deleteBtnText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            🐝 {isSelectionMode ? "Selecionar Apiário" : (isRevisaoManejoMode ? "Revisão e Manejo" : isRevisaoMode ? "Revisão" : isManejoMode ? "Manejo" : "Cadastrar Apiário")}
          </Text>
        </View>
        {!isSelectionMode && !isRevisaoManejoMode && !isRevisaoMode && !isManejoMode && onNewApiario && (
          <TouchableOpacity onPress={onNewApiario} style={styles.addBtn}>
            <Text style={styles.addBtnText}>＋ Cadastrar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={Platform.OS === "web" && (isRevisaoMode || isManejoMode) && apiarios.length === 0 ? mockApiariosWeb : apiarios}
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
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: C.navBg,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  backBtn: {
    marginRight: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { fontSize: 26, fontWeight: "700", color: C.text },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.text, ...T.bold },
  addBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  addBtnText: { color: C.text, fontWeight: "700", fontSize: 14, ...T.medium },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 10,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 2,
  },
  cardContent: { gap: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  cardBottomActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardBottomActionsSingle: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  cardInfo: { color: C.text, fontSize: 16, lineHeight: 24, fontWeight: "500", ...T.medium },
  cardInfoLabel: { fontWeight: "800" },
  cardTitle: { color: C.text, fontSize: 19, fontWeight: "700", ...T.bold },
  cardDate: { color: C.text, fontSize: 15, marginTop: 4, fontWeight: "600" },
  cardText: { color: C.text, fontSize: 14, lineHeight: 20, fontWeight: "500" },
  cardActions: { flexDirection: "row", gap: 8 },
  cardActionsVertical: {
    gap: 8,
    width: 128,
  },
  smallActionBtn: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 8,
  },
  smallActionText: { fontSize: 13, color: C.text, fontWeight: "700", textAlign: "center", ...T.medium },
  deleteBtn: { backgroundColor: "#f7e6cf" },
  deleteBtnText: { color: C.red, fontSize: 16, fontWeight: "700" },
  emptyText: { color: C.textSub, textAlign: "center", marginTop: 60, fontSize: 15 },
  btnAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  btnActionSecondary: {
    backgroundColor: "#f8e8cb",
  },
  btnActionText: { color: C.text, fontWeight: "700", fontSize: 14 },
  btnActionSecondaryText: {
    color: C.text,
  },
});
