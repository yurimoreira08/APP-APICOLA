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
import { Feather } from "@expo/vector-icons";
import { useApiarios } from "../hooks/useApiarios";
import type { Apiario } from "../types/Apiario";

import { C } from "../theme/colors";
import { T } from "../theme/typography";

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
      if (!editingApiario && !isNaN(parsedCaixas) && parsedCaixas > 0) {
        Alert.alert("Cadastro concluído", `${parsedCaixas} caixas foram criadas automaticamente. Você pode editar os nomes depois em Ver Caixas.`);
      }
      onNavigateToList();
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>🐝 Cadastrar Apiário</Text>
        <Feather name="bell" size={20} color={C.text} />
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {editingApiario ? "Editar Apiário" : "Cadastrar Apiário"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do seu apiário..."
          placeholderTextColor={C.textSub}
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite o local do seu apiário..."
          placeholderTextColor={C.textSub}
          value={local}
          onChangeText={setLocal}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite a quantidade de caixas do seu apiário..."
          placeholderTextColor={C.textSub}
          keyboardType="numeric"
          value={quantidadeCaixas}
          onChangeText={setQuantidadeCaixas}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Digite a descrição do seu apiário..."
          placeholderTextColor={C.textSub}
          multiline
          numberOfLines={4}
          value={descricao}
          onChangeText={setDescricao}
        />

        <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
          <Text style={styles.btnSaveText}>{editingApiario ? "Salvar alterações" : "Finalizar cadastro"}</Text>
        </TouchableOpacity>
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
    backgroundColor: C.navBg,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { color: C.text, fontWeight: "700", fontSize: 26 },
  topBarTitle: { fontSize: 20, fontWeight: "800", color: C.text, flex: 1, ...T.bold },
  topBarIcon: { fontSize: 20, color: C.text },
  header: { alignItems: "center", paddingTop: 14, paddingBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: C.text, ...T.bold },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 14, paddingBottom: 40 },
  input: {
    minHeight: 50,
    backgroundColor: C.inputBg,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
    ...T.medium,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  textArea: {
    height: 64,
    textAlignVertical: "top",
  },
  btnSave: {
    alignSelf: "center",
    backgroundColor: C.accent,
    borderRadius: 10,
    minHeight: 44,
    minWidth: 164,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  btnSaveText: { color: C.text, fontWeight: "700", fontSize: 16, ...T.medium },
});
