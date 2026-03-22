import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { C } from "../theme/colors";
import { T } from "../theme/typography";

type Props = {
  onBack: () => void;
  onDone: () => void;
};

export const IscagemFormScreen = ({ onBack, onDone }: Props) => {
  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Iscagem</Text>
        <Feather name="bell" size={20} color={C.text} />
      </View>

      <View style={styles.content}>
        <View style={styles.photoCard}>
          <Feather name="camera" size={76} color={C.textSub} />
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={() => Alert.alert("Foto", Platform.OS === "web" ? "Mock: upload de foto" : "Captura de foto ainda não implementada")}
          >
            <Text style={styles.photoBtnText}>Relacione uma foto</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Insira o local da Iscagem:" placeholderTextColor={C.textSub} />
        <TextInput style={styles.input} placeholder="Insira a data da Iscagem:" placeholderTextColor={C.textSub} />
        <TextInput style={styles.input} placeholder="Insira o número da caixa:" placeholderTextColor={C.textSub} keyboardType="numeric" />

        <TouchableOpacity style={styles.finishBtn} onPress={onDone} activeOpacity={0.85}>
          <Text style={styles.finishBtnText}>Finalizar registro{"\n"}de iscagem</Text>
        </TouchableOpacity>
      </View>
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
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  photoCard: {
    minHeight: 228,
    borderRadius: 14,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  cameraIcon: { fontSize: 96, color: C.textSub, lineHeight: 100 },
  photoBtn: {
    minHeight: 40,
    minWidth: 170,
    borderRadius: 12,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  photoBtnText: { color: C.text, fontSize: 16, fontWeight: "600", ...T.medium },
  input: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: C.inputBg,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 12,
    color: C.text,
    fontSize: 16,
    ...T.medium,
  },
  finishBtn: {
    alignSelf: "center",
    marginTop: 12,
    minWidth: 182,
    minHeight: 66,
    borderRadius: 12,
    backgroundColor: C.accent,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  finishBtnText: { color: C.text, fontSize: 16, fontWeight: "700", textAlign: "center", ...T.medium },
});
