import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApiarios } from "../hooks/useApiarios";
import type { Apiario } from "../types/Apiario";

import { C } from "../theme/colors";

/**
 * Propriedades do Formulário de Apiário
 * @param {Apiario} editingApiario Opcional: Entidade pré-carregada para edição.
 */
export type Props = {
  editingApiario?: Apiario;
  onBack: () => void;
  onNavigateToList: () => void;
};

/**
 * Formulário de Criação/Edição de Apiário
 * 
 * @description
 * Interface para gerenciar metadados do apiário (Nome, Localização, Total de Caixas).
 * Se alimentado com `editingApiario`, atua como modal de edição.
 */
export const ApiarioScreen = ({
  editingApiario,
  onBack,
  onNavigateToList,
}: Props) => {
  const { save } = useApiarios();
  const [nome, setNome] = useState(editingApiario?.nome ?? "");
  const [local, setLocal] = useState(editingApiario?.local ?? "");
  const [quantidadeCaixas, setQuantidadeCaixas] = useState(
    editingApiario?.quantidadeCaixas?.toString() ?? ""
  );
  const [descricao, setDescricao] = useState(editingApiario?.descricao ?? "");

  const handleSave = async () => {
    try {
      if (!nome) {
        Alert.alert("Erro", "Nome do apiário é obrigatório");
        return;
      }

      const parsedCaixas = parseInt(quantidadeCaixas, 10);

      const novo: Apiario = {
        id: editingApiario?.id,
        nome,
        local,
        quantidadeCaixas: isNaN(parsedCaixas) ? undefined : parsedCaixas,
        descricao,
      };

      await save(novo);
      onNavigateToList();
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>{"< Voltar"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {editingApiario ? "Editar Apiário" : "Novo Apiário"}
        </Text>
        <Text style={styles.headerSub}>Preencha os dados abaixo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>📋 Informações Básicas</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do apiário"
          placeholderTextColor={C.textSub}
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Local do apiário"
          placeholderTextColor={C.textSub}
          value={local}
          onChangeText={setLocal}
        />

        <TextInput
          style={styles.input}
          placeholder="Quantidade de caixas"
          placeholderTextColor={C.textSub}
          keyboardType="numeric"
          value={quantidadeCaixas}
          onChangeText={setQuantidadeCaixas}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição"
          placeholderTextColor={C.textSub}
          multiline
          numberOfLines={4}
          value={descricao}
          onChangeText={setDescricao}
        />

        <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
          <Text style={styles.btnSaveText}>💾  Salvar Apiário</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topHeader: { paddingTop: 40, paddingHorizontal: 20 },
  backLink: { paddingVertical: 8 },
  backLinkText: { color: C.accent, fontWeight: "700", fontSize: 16 },
  header: { alignItems: "center", paddingVertical: 10 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: C.text, letterSpacing: 0.5 },
  headerSub: { fontSize: 13, color: C.textSub, marginTop: 4 },
  scroll: { padding: 20, gap: 12 },
  section: { fontSize: 15, fontWeight: "700", color: C.accent, marginTop: 6, marginBottom: 6 },
  input: {
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.text,
    borderWidth: 1.5,
    borderColor: C.cardBorder,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  btnSave: {
    backgroundColor: C.green,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  btnSaveText: { color: "#000", fontWeight: "800", fontSize: 16 },
});
