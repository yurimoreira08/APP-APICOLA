import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Revisao } from "../types/Revisao";
import type { Apiario } from "../types/Apiario";
import { useRevisoes } from "../hooks/useRevisoes";
import { C } from "../theme/colors";
import { T } from "../theme/typography";

type Props = {
  apiario?: Apiario;
  defaultCaixa?: number;
  editingRevisao?: Revisao;
  onBack: () => void;
  onNavigateToList: () => void;
};

const mockToggleLabels = [
  "Núcleo",
  "Caixa",
  "Rainha",
  "Pólen",
  "Mel",
  "Cria Nova\n3 dias",
  "Cria Aberta",
  "Cria Fechada",
  "Ovos",
  "Com espaço",
  "Sem espaço",
];

export const RevisaoFormScreen = ({ apiario, defaultCaixa, editingRevisao, onBack, onNavigateToList }: Props) => {
  const { save } = useRevisoes();
  const [active, setActive] = useState<string[]>(Platform.OS === "web" ? ["Caixa", "Rainha", "Mel"] : []);
  const [forca, setForca] = useState<"fraca" | "media" | "boa" | undefined>(Platform.OS === "web" ? "boa" : undefined);
  const [situacaoObservar, setSituacaoObservar] = useState(Platform.OS === "web" ? "" : (editingRevisao?.situacaoObservar || ""));
  const [indicacaoRegistrada, setIndicacaoRegistrada] = useState(Platform.OS === "web" ? "" : (editingRevisao?.indicacaoRegistrada || ""));

  const toggleOption = (label: string) => {
    setActive((prev) => (prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label]));
  };

  const mapLabelToPatch = (label: string): Partial<Revisao> => {
    switch (label) {
      case "Núcleo":
        return { tipo: "nucleo" };
      case "Caixa":
        return { tipo: "caixa" };
      case "Rainha":
        return { rainha: true };
      case "Pólen":
        return { polen: true };
      case "Mel":
        return { mel: true };
      case "Cria Nova\n3 dias":
        return { criaNova3Dias: true };
      case "Cria Aberta":
        return { criaAberta: true };
      case "Cria Fechada":
        return { criaFechada: true };
      case "Ovos":
        return { ovos: true };
      case "Com espaço":
        return { comEspaco: true, semEspaco: false };
      case "Sem espaço":
        return { semEspaco: true, comEspaco: false };
      default:
        return {};
    }
  };

  const handleEncerrar = async () => {
    try {
      const patch = active.reduce<Partial<Revisao>>((acc, label) => ({ ...acc, ...mapLabelToPatch(label) }), {});

      const payload: Revisao = {
        ...editingRevisao,
        apiarioId: apiario?.id?.toString(),
        caixa: defaultCaixa,
        dataIso: new Date().toISOString().slice(0, 10),
        forca,
        situacaoObservar,
        indicacaoRegistrada,
        ...patch,
      };

      await save(payload);
      onNavigateToList();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a revisão.");
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisão</Text>
        <Feather name="mic" size={20} color={C.text} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={styles.voiceButton} activeOpacity={0.8}>
          <View style={styles.voiceIconBox}>
            <Feather name="mic" size={26} color={C.text} />
          </View>
          <Text style={styles.voiceText}>Ativar Voz</Text>
        </TouchableOpacity>

        <View style={styles.grid}>
          {mockToggleLabels.map((label) => {
            const selected = active.includes(label);
            return (
              <TouchableOpacity
                key={label}
                style={[styles.gridCard, selected ? styles.gridCardActive : null]}
                activeOpacity={0.85}
                onPress={() => toggleOption(label)}
              >
                <Text style={styles.gridCardText}>{label}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.gridCard}>
            <TouchableOpacity onPress={() => setForca("fraca")} activeOpacity={0.8}>
              <Text style={[styles.gridCardText, forca === "fraca" ? styles.forceActive : null]}>Fraca</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setForca("media")} activeOpacity={0.8}>
              <Text style={[styles.gridCardText, forca === "media" ? styles.forceActive : null]}>Média</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setForca("boa")} activeOpacity={0.8}>
              <Text style={[styles.gridCardText, forca === "boa" ? styles.forceActive : null]}>Boa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          value={situacaoObservar}
          onChangeText={setSituacaoObservar}
          placeholder="Situação à observar"
          placeholderTextColor={C.text}
          style={styles.largeInput}
        />

        <TextInput
          value={indicacaoRegistrada}
          onChangeText={setIndicacaoRegistrada}
          placeholder="Indicação Registrada"
          placeholderTextColor={C.text}
          style={styles.largeInput}
        />

        <TouchableOpacity style={styles.primaryAction} onPress={() => void handleEncerrar()} activeOpacity={0.85}>
          <Text style={styles.primaryActionText}>Encerrar Revisão</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => Alert.alert("Relatório", "Mock de relatório gerado para visualização da tela.")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryActionText}>Gerar Relatório</Text>
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
  backBtnText: { fontSize: 26, fontWeight: "700", color: C.text },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.text, ...T.bold },
  headerIcon: { fontSize: 20, color: C.text },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },
  contentContainer: { paddingBottom: 48, gap: 14 },
  voiceButton: {
    minHeight: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 12,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 2,
  },
  voiceIconBox: {
    width: 84,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceIcon: { fontSize: 24, color: C.text },
  voiceText: { fontSize: 18, fontWeight: "700", color: C.text, ...T.bold },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  gridCard: {
    width: "48.5%",
    minHeight: 98,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 10,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  gridCardActive: {
    backgroundColor: C.accent,
  },
  gridCardText: {
    fontSize: 16,
    color: C.text,
    fontWeight: "600",
    textAlign: "center",
    ...T.medium,
  },
  forceActive: {
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  largeInput: {
    minHeight: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.card,
    color: C.text,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 12,
    ...T.medium,
  },
  primaryAction: {
    alignSelf: "center",
    minWidth: 220,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    ...T.bold,
  },
});
