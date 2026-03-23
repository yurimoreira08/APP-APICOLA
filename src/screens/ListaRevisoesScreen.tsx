import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRevisoes } from "../hooks/useRevisoes";
import type { Revisao } from "../types/Revisao";
import type { Apiario } from "../types/Apiario";
import { useVoiceInput } from "../voice/useVoiceInput";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

const headerBeeLogo = require("../../assets/splash-icon.png");

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
  const [search, setSearch] = useState("");

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
            <Text style={styles.actionBtnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => item.id && handleDelete(item.id)}
            style={[styles.actionBtn, styles.actionBtnDelete]}
          >
            <Text style={styles.actionBtnText}>Excluir</Text>
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
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={C.text} />
          </TouchableOpacity>
          <Image source={headerBeeLogo} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerTitle}>
            Revisão
          </Text>
        </View>
        <TouchableOpacity onPress={onNewRevisao} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Fazer Revisão</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={caixaFiltro !== undefined ? `Pesquisar caixa ${caixaFiltro}...` : "Pesquisar caixa..."}
          placeholderTextColor={C.textSub}
          style={styles.searchInput}
        />
        {(apiario || caixaFiltro !== undefined) && (
          <Text style={styles.contextText}>
            {apiario ? `Apiário: ${apiario.nome}` : ""}{apiario && caixaFiltro !== undefined ? " • " : ""}{caixaFiltro !== undefined ? `Caixa ${caixaFiltro}` : ""}
          </Text>
        )}
      </View>

      {voice.listening && (
        <View style={styles.micStatusRow}>
          <Text style={styles.micStatusText}>🟢 Ouvindo comandos ("nova revisão")...</Text>
        </View>
      )}

      <FlatList
        data={revisoes.filter((item) => {
          if (!search.trim()) return true;
          const normalized = search.toLowerCase();
          const tipo = (item.tipo || "").toLowerCase();
          const caixa = item.caixa !== undefined ? String(item.caixa) : "";
          const obs = (item.observacao || "").toLowerCase();
          return tipo.includes(normalized) || caixa.includes(normalized) || obs.includes(normalized);
        })}
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
  backBtnText: { fontSize: 26, color: C.text, fontWeight: "700" },
  headerLogo: { width: 84, height: 84, marginRight: 8 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.text, ...T.bold },
  addBtn: {
    backgroundColor: C.accent,
    minHeight: 44,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  addBtnText: { color: C.text, fontWeight: "700", fontSize: 14, ...T.medium },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 6 },
  searchInput: {
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 16,
    minHeight: 44,
    paddingHorizontal: 12,
    color: C.text,
    fontSize: 14,
  },
  contextText: { color: C.textSub, fontSize: 12 },
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
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardTitle: { color: C.text, fontSize: 20, fontWeight: "700", ...T.bold },
  cardDate: { color: C.textSub, fontSize: 12, marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    minHeight: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 10,
  },
  actionBtnEdit: { backgroundColor: C.accent },
  actionBtnDelete: { backgroundColor: "#f7e6cf" },
  actionBtnText: { fontSize: 12, color: C.text, fontWeight: "700" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    backgroundColor: "#edd6ad",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGreen: { backgroundColor: "#dcebd9", borderWidth: 1, borderColor: C.green },
  badgeAccent: { backgroundColor: "#f6dfb9", borderWidth: 1, borderColor: C.cardBorder },
  badgeText: { color: C.text, fontSize: 11, fontWeight: "700" },
  cardObs: { color: C.textSub, fontSize: 13, fontStyle: "italic" },
  emptyText: { color: C.textSub, textAlign: "center", marginTop: 60, fontSize: 15 },
  micStatusRow: {
    backgroundColor: C.navBg,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    alignItems: "center",
  },
  micStatusText: { color: C.green, fontSize: 13, fontWeight: "600" },
});
