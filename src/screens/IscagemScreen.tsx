import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { C } from "../theme/colors";
import { T } from "../theme/typography";

type Props = {
  onBack: () => void;
  onNovaIscagem: () => void;
};

type IscagemItem = {
  caixa: string;
  local: string;
  sugestoes: string[];
};

export const IscagemScreen = ({ onBack, onNovaIscagem }: Props) => {
  const items: IscagemItem[] = Platform.OS === "web"
    ? [
        { caixa: "Caixa 02", local: "Sítio Lagoa", sugestoes: ["Área com florada", "Boa incidência solar"] },
        { caixa: "Caixa 03", local: "Fazenda Norte", sugestoes: ["Proximidade de água", "Acesso fácil"] },
        { caixa: "Caixa 04", local: "Apiário Central", sugestoes: ["Baixa interferência"] },
      ]
    : [];

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Iscagem</Text>
        <Feather name="bell" size={20} color={C.text} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={styles.primaryAction} onPress={onNovaIscagem} activeOpacity={0.85}>
          <View style={styles.actionRow}>
            <Feather name="plus-circle" size={20} color={C.text} />
            <Text style={styles.primaryActionText}>Iscar uma nova caixa</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.85}>
          <Text style={styles.secondaryActionText}>Relatórios de Iscas</Text>
        </TouchableOpacity>

        {items.map((item) => (
          <View key={item.caixa} style={styles.card}>
            <Text style={styles.cardTitle}>{item.caixa}</Text>
            <Text style={styles.cardLine}>Local: {item.local}</Text>
            <Text style={styles.cardLine}>Sugestões:</Text>
            {item.sugestoes.map((sugestao) => (
              <Text key={sugestao} style={styles.cardSuggestion}>• {sugestao}</Text>
            ))}

            <View style={styles.cardBtnWrap}>
              <TouchableOpacity style={styles.transferBtn} activeOpacity={0.85}>
                <MaterialCommunityIcons name="swap-horizontal" size={18} color={C.text} />
                <Text style={styles.transferBtnText}>Transferir{"\n"}Caixa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  backBtnText: { fontSize: 26, fontWeight: "700", color: C.text },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.text, ...T.bold },
  headerIcon: { fontSize: 20, color: C.text },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  contentContainer: { gap: 12, paddingBottom: 40 },
  primaryAction: {
    minHeight: 68,
    borderRadius: 14,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  primaryActionText: { color: C.text, fontSize: 20, fontWeight: "700", ...T.bold },
  secondaryAction: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: { color: C.text, fontSize: 18, fontWeight: "600", ...T.medium },
  card: {
    marginTop: 8,
    minHeight: 164,
    borderRadius: 14,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 18,
  },
  cardTitle: { fontSize: 24, color: C.text, fontWeight: "800", ...T.bold },
  cardLine: { fontSize: 16, color: C.text, fontWeight: "600", marginTop: 2, ...T.medium },
  cardSuggestion: { fontSize: 14, color: C.textSub, marginTop: 2 },
  cardBtnWrap: { alignItems: "flex-end", marginTop: 8 },
  transferBtn: {
    minWidth: 124,
    minHeight: 66,
    borderRadius: 12,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  transferBtnText: { color: C.text, fontSize: 14, fontWeight: "700", textAlign: "center", ...T.medium },
});
