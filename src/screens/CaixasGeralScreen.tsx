import React, { useEffect, useState } from "react";
import { FlatList, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useResumoCaixas } from "../hooks/useResumoCaixas";
import type { ResumoCaixa } from "../../database/db";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

const headerBeeLogo = require("../../assets/splash-icon.png");

type Props = {
  onFazerRevisao: (apiarioId: string, caixa: number, apiarioNome?: string) => void;
  onBack: () => void;
  apiarioIdFiltro?: string;
};

/**
 * Tela de Listagem Geral de Caixas
 * 
 * @description
 * Analisa e agrupa todas as caixas únicas já cadastradas ao longo das revisões do SQLite.
 * Exibe as caixas soltas e os nomes dos apiários aos quais elas pertencem.
 */
export const CaixasGeralScreen = ({ onFazerRevisao, onBack, apiarioIdFiltro }: Props) => {
  const { caixas, load, renameCaixa } = useResumoCaixas();
  const [search, setSearch] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const caixasMockWeb: ResumoCaixa[] = [
    { apiarioId: "1", apiarioNome: "Apiário Boiles", caixa: 2, tipo: "Caixa" },
    { apiarioId: "1", apiarioNome: "Apiário Boiles", caixa: 3, tipo: "Caixa" },
    { apiarioId: "1", apiarioNome: "Apiário Boiles", caixa: 7, tipo: "Caixa" },
    { apiarioId: "1", apiarioNome: "Apiário Boiles", caixa: 9, tipo: "Caixa" },
    { apiarioId: "1", apiarioNome: "Apiário Boiles", caixa: 10, tipo: "Caixa" },
    { apiarioId: "1", apiarioNome: "Apiário Boiles", caixa: 11, tipo: "Caixa" },
  ];

  useEffect(() => {
    void load();
  }, [load]);

  const renderItem = ({ item }: { item: ResumoCaixa }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.nome || `${item.tipo} ${item.caixa}`}</Text>
          <Text style={styles.cardDate}>
            📍 Apiário: {item.apiarioNome}
          </Text>
          {editingKey === `${item.apiarioId}-${item.caixa}` ? (
            <View style={styles.editNameRow}>
              <TextInput
                value={editingName}
                onChangeText={setEditingName}
                style={styles.editNameInput}
                placeholder="Nome da caixa"
                placeholderTextColor={C.textSub}
              />
              <TouchableOpacity
                style={styles.smallEditBtn}
                onPress={() => {
                  void renameCaixa(item.apiarioId, item.caixa, editingName.trim() || `Caixa ${String(item.caixa).padStart(2, "0")}`);
                  setEditingKey(null);
                }}
              >
                <Text style={styles.smallEditBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.smallEditBtn}
              onPress={() => {
                setEditingKey(`${item.apiarioId}-${item.caixa}`);
                setEditingName(item.nome || `Caixa ${String(item.caixa).padStart(2, "0")}`);
              }}
            >
              <Text style={styles.smallEditBtnText}>Editar Nome</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => onFazerRevisao(item.apiarioId, item.caixa, item.apiarioNome)}
          style={styles.actionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>Fazer Revisão</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={C.text} />
          </TouchableOpacity>
          <Image source={headerBeeLogo} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>Revisão</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Pesquisar caixa..."
          placeholderTextColor={C.textSub}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={(Platform.OS === "web" && caixas.length === 0 ? caixasMockWeb : caixas).filter((item) => {
          if (apiarioIdFiltro && String(item.apiarioId) !== String(apiarioIdFiltro)) return false;
          if (!search.trim()) return true;
          const normalized = search.toLowerCase();
          const tipo = (item.tipo || "").toLowerCase();
          const nomeCaixa = (item.nome || "").toLowerCase();
          const caixa = String(item.caixa);
          const nome = (item.apiarioNome || "").toLowerCase();
          return tipo.includes(normalized) || nomeCaixa.includes(normalized) || caixa.includes(normalized) || nome.includes(normalized);
        })}
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
  headerLogo: { width: 84, height: 84, marginRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.text, ...T.bold },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchInput: {
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 16,
    minHeight: 44,
    paddingHorizontal: 12,
    color: C.text,
  },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: "800", textTransform: 'capitalize', ...T.bold },
  cardDate: { color: C.textSub, fontSize: 12, marginTop: 2 },
  editNameRow: {
    marginTop: 6,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  editNameInput: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.inputBg,
    paddingHorizontal: 10,
    color: C.text,
  },
  smallEditBtn: {
    marginTop: 6,
    alignSelf: "flex-start",
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  smallEditBtnText: { color: C.text, fontSize: 12, fontWeight: "700" },
  actionBtn: {
    backgroundColor: C.accent,
    minHeight: 64,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  actionBtnText: { color: C.text, fontWeight: "700", fontSize: 14, lineHeight: 18, textAlign: "center" },
  emptyText: { color: C.textSub, textAlign: "center", marginTop: 60, fontSize: 15 },
});
