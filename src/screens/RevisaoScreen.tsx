import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Revisao } from "../types/Revisao";
import type { Apiario } from "../types/Apiario";
import { initDb } from "../../database/db";
import { useRevisoes } from "../hooks/useRevisoes";
import { parseRevisaoCommand } from "../voice/parseRevisao";
import { useVoiceInput } from "../voice/useVoiceInput";

const empty: Revisao = {};

/* ─── Cores ─────────────────────────────────────────────── */
import { C } from "../theme/colors";

/* ─── Componente: Campo Booleano ──────────────────────────── */
type BoolFieldProps = {
  label: string;
  emoji: string;
  value: boolean | undefined;
  onChange: (val: boolean | undefined) => void;
};

const BoolField = ({ label, emoji, value, onChange }: BoolFieldProps) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value !== undefined ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [value]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const getStyle = () => {
    if (value === true) return { backgroundColor: "rgba(52, 199, 123, 0.15)", borderColor: C.green };
    if (value === false) return { backgroundColor: "rgba(224, 82, 82, 0.15)", borderColor: C.red };
    return { backgroundColor: C.card, borderColor: C.cardBorder };
  };

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      C.cardBorder,
      value === true ? C.green : value === false ? C.red : C.cardBorder,
    ],
  });

  const handlePress = () => {
    if (value === undefined) onChange(true);
    else if (value === true) onChange(false);
    else onChange(undefined);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={{ width: "31%" }}
    >
      <Animated.View
        style={[styles.boolCard, getStyle(), { transform: [{ scale }] }, { width: "100%" }]}
      >
      <Text style={styles.boolEmoji}>{emoji}</Text>
      <Text style={styles.boolLabel}>{label}</Text>
      <Text
        style={[
          styles.boolStatus,
          {
            color:
              value === true
                ? C.green
                : value === false
                  ? C.red
                  : C.muted,
          },
        ]}
      >
        {value === true ? "✓ Sim" : value === false ? "✗ Não" : "—"}
      </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

/* ─── Componente: Campo de Texto ──────────────────────────── */
type TextFieldProps = {
  label: string;
  emoji: string;
  value: string | undefined;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric";
};

const TextField = ({ label, emoji, value, onChangeText, keyboardType = "default" }: TextFieldProps) => {
  const hasValue = value !== undefined && value !== "";
  const bgStyle = hasValue 
    ? { backgroundColor: "rgba(245, 166, 35, 0.1)", borderColor: C.accent } 
    : { backgroundColor: C.card, borderColor: C.cardBorder };

  return (
    <View
      style={[styles.textCard, bgStyle]}
    >
      <View style={styles.textCardHeader}>
        <Text style={styles.boolEmoji}>{emoji}</Text>
        <Text style={styles.textCardLabel}>{label}</Text>
      </View>
      <TextInput
        style={[styles.textCardValue, !hasValue && { color: C.muted }]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Digite (ou use comando de voz)..."
        placeholderTextColor={C.muted}
        keyboardType={keyboardType}
      />
    </View>
  );
};

/* ─── Componente: Chip de Seleção ─────────────────────────── */
type ChipGroupProps = {
  label: string;
  emoji: string;
  options: { value: string; display: string }[];
  current: string | undefined;
  onChange: (val: string) => void;
};

const ChipGroup = ({ label, emoji, options, current, onChange }: ChipGroupProps) => (
  <View style={styles.chipCard}>
    <View style={styles.textCardHeader}>
      <Text style={styles.boolEmoji}>{emoji}</Text>
      <Text style={styles.textCardLabel}>{label}</Text>
    </View>
    <View style={styles.chipRow}>
      {options.map((o) => {
        const active = current === o.value;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            activeOpacity={0.8}
            style={[
              styles.chip,
              active && { backgroundColor: C.accentGlow, borderColor: C.accent },
            ]}
          >
            <Text
              style={[styles.chipText, active && { color: C.accent }]}
            >
              {o.display}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

/* ─── Indicador de Escuta (mic animado) ───────────────────── */
const MicPulse = ({ listening }: { listening: boolean }) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (listening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulse.setValue(1);
    }
  }, [listening]);

  return (
    <Animated.View
      style={[
        styles.micOuter,
        listening && { backgroundColor: "#34c77b22" },
        { transform: [{ scale: pulse }] },
      ]}
    >
      <Text style={styles.micIcon}>{listening ? "🎙️" : "🎤"}</Text>
    </Animated.View>
  );
};

/* ─── Tela Principal ──────────────────────────────────────── */
type Props = {
  apiario?: Apiario;
  defaultCaixa?: number;
  editingRevisao?: Revisao;
  onBack: () => void;
  onNavigateToList: () => void;
};

/**
 * Formulário de Revisão (Speech to Form)
 * 
 * @description
 * O coração do sistema Apícola. Tela inteligente escuta a voz do operador local e 
 * interativamente preenche as `checkboxes`, chips, tipo da caixa e observações. 
 * Conta também com validações em background bloqueando caixas inexistentes.
 * 
 * @param {Props} props Roteamento context-aware (apiário predefinido e/ou número da caixa filtrada).
 */
export const RevisaoScreen = ({ apiario, defaultCaixa, editingRevisao, onBack, onNavigateToList }: Props) => {
  const { save } = useRevisoes();
  const { state: voice, start, stop } = useVoiceInput();
  const [revisao, setRevisao] = useState<Revisao>(editingRevisao || { ...empty, apiarioId: apiario?.id?.toString(), caixa: defaultCaixa });
  const [lastHeard, setLastHeard] = useState("");
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    void initDb();
    void start(); // Iniciar escuta de voz automaticamente assim que renderizar
    return () => {
      void stop();
    };
  }, []);

  useEffect(() => {
    if (!voice.final) return;
    const text = voice.final;
    setLastHeard(text);
    const { patch } = parseRevisaoCommand(text, apiario?.quantidadeCaixas);
    
    setRevisao((prev) => {
      const next = { ...prev, ...patch };

      // Mutualidade exclusiva: Com espaço vs Sem espaço
      if (patch.comEspaco === true) next.semEspaco = false;
      if (patch.semEspaco === true) next.comEspaco = false;

      return next;
    });

    const norm = text.toLowerCase();
    if (norm.includes("salvar revisao") || norm.includes("salvar revisão")) {
      setRevisao((current) => {
        void onSave(current);
        return current;
      });
    }
  }, [voice.final]);

  const filledCount = useMemo(() => {
    return (Object.keys(revisao) as (keyof Revisao)[]).filter(
      (k) => revisao[k] !== undefined && revisao[k] !== "" && k !== "id" && k !== "createdAt" && k !== "updatedAt" && k !== "syncStatus",
    ).length;
  }, [revisao]);

  const totalFields = 13; 
  const progress = Math.min(filledCount / totalFields, 1);

  const onSave = async (r: Revisao) => {
    try {
      const finalRevisao = { ...r };
      
      if (finalRevisao.tipo && finalRevisao.caixa === undefined) {
        const m = finalRevisao.tipo.match(/\b(caixa|nucleo)\s+(\d+)\b/i);
        if (m) {
          finalRevisao.tipo = m[1].toLowerCase();
          finalRevisao.caixa = parseInt(m[2], 10);
        } else {
          finalRevisao.tipo = finalRevisao.tipo.toLowerCase();
        }
      }

      if (finalRevisao.caixa !== undefined && apiario?.quantidadeCaixas && finalRevisao.caixa > apiario.quantidadeCaixas) {
        Alert.alert("Aviso", `O apiário só possui ${apiario.quantidadeCaixas} caixas. Você tentou salvar a caixa ${finalRevisao.caixa}. Corrija para continuar.`);
        return;
      }

      console.log("Salvando revisão...", finalRevisao);
      await save(finalRevisao);
      
      setSavedOk(true);
      
      // Navegação automática após sucesso
      setTimeout(() => {
        setSavedOk(false);
        onNavigateToList();
      }, 1500);
    } catch (error) {
      console.error("Erro ao salvar revisão:", error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Cabeçalho ──────────────────────────────────── */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Cancelar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>{revisao.id ? "Editar Revisão" : "Nova Revisão"}</Text>
          <Text style={styles.headerSub}>Preencha usando comandos de voz</Text>
        </View>


      {savedOk && (
        <View style={styles.savedBanner}>
          <Text style={styles.savedText}>✅ Revisão salva com sucesso!</Text>
        </View>
      )}

      {/* ── Seção: Identificação ───────────────────────── */}
      <Text style={styles.section}>📋 Identificação</Text>

      <TextField 
        emoji="📅" 
        label="Data" 
        value={revisao.dataIso} 
        onChangeText={(val) => setRevisao({ ...revisao, dataIso: val })} 
      />

      <TextField 
        emoji="📦" 
        label="Tipo (Ex: Caixa 1, Núcleo 2)" 
        value={revisao.caixa !== undefined ? `${revisao.tipo || ""} ${revisao.caixa}`.trim() : revisao.tipo} 
        onChangeText={(val) => {
          // Simply set the text without formatting dynamically to avoid cursor jumps
          setRevisao({ ...revisao, tipo: val, caixa: undefined });
        }}
      />

      <ChipGroup
        emoji="💪"
        label="Força da colmeia"
        options={[
          { value: "fraca", display: "Fraca" },
          { value: "media", display: "Média" },
          { value: "boa", display: "Boa" },
        ]}
        current={revisao.forca}
        onChange={(val) => setRevisao({ ...revisao, forca: val as "fraca" | "media" | "boa" })}
      />

      <View style={styles.boolGrid}>
        <BoolField emoji="👑" label="Rainha" value={revisao.rainha} onChange={(v) => setRevisao({...revisao, rainha: v})} />
        <BoolField emoji="🌸" label="Pólen" value={revisao.polen} onChange={(v) => setRevisao({...revisao, polen: v})} />
        <BoolField emoji="🍯" label="Mel" value={revisao.mel} onChange={(v) => setRevisao({...revisao, mel: v})} />
        <BoolField emoji="🥚" label="Ovos" value={revisao.ovos} onChange={(v) => setRevisao({...revisao, ovos: v})} />
        <BoolField emoji="🐣" label="Cria Nova\n(3 dias)" value={revisao.criaNova3Dias} onChange={(v) => setRevisao({...revisao, criaNova3Dias: v})} />
        <BoolField emoji="🔓" label="Cria Aberta" value={revisao.criaAberta} onChange={(v) => setRevisao({...revisao, criaAberta: v})} />
        <BoolField emoji="🔒" label="Cria Fechada" value={revisao.criaFechada} onChange={(v) => setRevisao({...revisao, criaFechada: v})} />
        <BoolField emoji="📐" label="Com Espaço" value={revisao.comEspaco} onChange={(v) => setRevisao({...revisao, comEspaco: v, semEspaco: v === true ? false : revisao.semEspaco})} />
        <BoolField emoji="🚧" label="Sem Espaço" value={revisao.semEspaco} onChange={(v) => setRevisao({...revisao, semEspaco: v, comEspaco: v === true ? false : revisao.comEspaco})} />
      </View>

      <Text style={styles.section}>📝 Observações</Text>

      <TextField emoji="📝" label="Observação geral" value={revisao.observacao} onChangeText={(val) => setRevisao({ ...revisao, observacao: val })} />
      <TextField emoji="👁️" label="Situação a Observar" value={revisao.situacaoObservar} onChangeText={(val) => setRevisao({ ...revisao, situacaoObservar: val })} />
      <TextField emoji="📌" label="Indicação Registrada" value={revisao.indicacaoRegistrada} onChangeText={(val) => setRevisao({ ...revisao, indicacaoRegistrada: val })} />

      {/* ── Botão Salvar ───────────────────────────────── */}
      <TouchableOpacity
        style={styles.btnSave}
        onPress={() => void onSave(revisao)}
        activeOpacity={0.8}
      >
        <Text style={styles.btnSaveText}>💾  Salvar Revisão</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnClear}
        onPress={() => { setRevisao(empty); setLastHeard(""); }}
        activeOpacity={0.8}
      >
        <Text style={styles.btnClearText}>🗑️  Limpar campos</Text>
      </TouchableOpacity>

      </ScrollView>

      {/* -- Floating Mic -- */}
      <View style={styles.floatingMicBox}>
        <View style={styles.micRow}>
          <MicPulse listening={voice.listening} />
          <View style={{ flex: 1 }}>
            <Text style={styles.micStatus}>
              {voice.listening ? "🟢 Escutando..." : "⚫ Microfone"}</Text>
            {voice.error ? (
              <Text style={styles.errorText}>⚠️ {voice.error}</Text>
            ) : (
              <Text style={styles.lastHeard} numberOfLines={1}>
                {lastHeard || "Nenhum comando..."}
              </Text>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

/* ─── Estilos ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 10, paddingBottom: 120 },

  // Cabeçalho
  topHeader: { paddingTop: 20 },
  backLink: { paddingVertical: 8 },
  backLinkText: { color: C.accent, fontWeight: "700", fontSize: 14 },
  header: { alignItems: "center", paddingVertical: 10 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: C.text, letterSpacing: 0.5 },
  headerSub: { fontSize: 13, color: C.textSub, marginTop: 4 },

  // Mic
  floatingMicBox: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 99,
  },
  micRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  micOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff10",
    alignItems: "center",
    justifyContent: "center",
  },
  micIcon: { fontSize: 24 },
  micStatus: { fontSize: 13, fontWeight: "700", color: C.text },
  lastHeard: { fontSize: 11, color: C.textSub, marginTop: 1, fontStyle: "italic" },
  errorText: { fontSize: 11, color: C.red, marginTop: 1 },

  // Botões principais
  btnRow: { flexDirection: "row", gap: 8 },
  btn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnRed: { backgroundColor: C.red },
  btnDisabled: { opacity: 0.35 },
  btnText: { color: "#000", fontWeight: "800", fontSize: 16 },

  // Progresso
  progressBox: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { color: C.textSub, fontSize: 13 },
  progressCount: { color: C.accent, fontWeight: "700", fontSize: 13 },
  progressBar: { height: 8, backgroundColor: "#ffffff15", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: C.accent, borderRadius: 4 },

  // Salvo
  savedBanner: {
    backgroundColor: "#34c77b22",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.green,
  },
  savedText: { color: C.green, fontWeight: "700", fontSize: 15 },

  // Seção
  section: { fontSize: 14, fontWeight: "700", color: C.accent, marginTop: 4, marginBottom: 0 },

  // Bool grid
  boolGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  boolCard: {
    borderRadius: 12,
    padding: 8,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 2,
  },
  boolEmoji: { fontSize: 18 },
  boolLabel: { fontSize: 11, color: C.textSub, textAlign: "center" },
  boolStatus: { fontSize: 12, fontWeight: "700" },

  // Text card
  textCard: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    gap: 4,
  },
  textCardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  textCardLabel: { fontSize: 12, fontWeight: "700", color: C.textSub },
  textCardValue: { fontSize: 14, color: C.text, fontWeight: "500" },

  // Chips
  chipCard: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: C.cardBorder,
    gap: 8,
  },
  chipRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ffffff08",
    borderWidth: 1.5,
    borderColor: C.cardBorder,
  },
  chipText: { color: C.textSub, fontWeight: "600", fontSize: 12 },

  // Help
  helpBox: {
    backgroundColor: "#1d2d44",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a3f60",
    gap: 4,
    marginTop: 4,
  },
  helpTitle: { color: C.accent, fontWeight: "700", fontSize: 14, marginBottom: 4 },
  helpItem: { color: C.textSub, fontSize: 12 },

  // Salvar
  btnSave: {
    backgroundColor: C.green,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnSaveText: { color: "#000", fontWeight: "800", fontSize: 16 },

  btnClear: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.muted,
  },
  btnClearText: { color: C.muted, fontWeight: "600", fontSize: 14 },
});
