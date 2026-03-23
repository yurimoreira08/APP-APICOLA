import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { C } from "../theme/colors";
import { T } from "../theme/typography";
import { relatorioService } from "../services/relatorioService";
import { geminiService } from "../services/geminiService";

type Props = {
  onBack: () => void;
};

type Filtro = "apiarios" | "caixas";
type GrowthPoint = { label: string; value: number };
type GrowthDataset = { title: string; series: GrowthPoint[] };

const headerBeeLogo = require("../../assets/splash-icon.png");

export const RelatoriosScreen = ({ onBack }: Props) => {
  const [filtro, setFiltro] = useState<Filtro>("apiarios");
  const [loading, setLoading] = useState(true);
  const [iaLoading, setIaLoading] = useState(false);
  const [resumo, setResumo] = useState<any>(null);
  const [insightIA, setInsightIA] = useState("");

  const loadResumo = useCallback(async () => {
    try {
      setLoading(true);
      const data = await relatorioService.getResumoGeral();
      setResumo(data);
    } catch (e: any) {
      Alert.alert("Falha ao carregar relatórios", e?.message || "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResumo();
  }, [loadResumo]);

  const promptIA = useMemo(() => {
    if (!resumo) return "";

    const contextoProduto = {
      app: "APICOLA",
      objetivo: "Gerenciamento de apiários, caixas e atividades de campo com foco em produtividade e segurança.",
      publicoAlvo: ["Apicultores iniciantes", "Apicultores experientes", "Trabalhadores rurais"],
      modulos: [
        "Cadastro de apiário",
        "Revisão e manejo",
        "Relatórios",
        "Iscagem",
        "Caixas",
        "Voltar pra casa / segurança",
      ],
      regrasOperacionais: [
        "Priorizar recomendações práticas de campo",
        "Indicar riscos críticos primeiro",
        "Separar ações imediatas (24-72h) e ações de rotina (7-30 dias)",
        "Não inventar dados ausentes; sinalizar lacunas de informação",
      ],
    };

    const contextoDados = {
      filtroSelecionado: filtro,
      resumo,
      geradoEm: new Date().toISOString(),
    };

    return [
      "Você é um consultor técnico sênior em apicultura operacional e manejo de risco em campo.",
      "Sua tarefa é gerar um relatório profissional para apoiar decisão diária do apicultor.",
      "Responda em português do Brasil.",
      "",
      "REGRAS DE QUALIDADE:",
      "1) Use SOMENTE os dados fornecidos.",
      "2) Se faltar dado essencial, explicite a lacuna e o impacto.",
      "3) Priorize riscos biológicos e operacionais de maior severidade.",
      "4) Seja direto, sem texto genérico.",
      "5) Sempre indicar ação objetiva e verificável.",
      "",
      "FORMATO DE SAÍDA (obrigatório):",
      "### Diagnóstico Executivo",
      "- 5 a 8 bullets de leitura rápida",
      "",
      "### Alertas Críticos (P1)",
      "- Liste itens críticos por prioridade",
      "",
      "### Tendências e Padrões",
      "- Pontos positivos e degradações",
      "",
      "### Plano de Ação 7 Dias",
      "- Ação | Motivo | Impacto esperado",
      "",
      "### Plano de Ação 30 Dias",
      "- Ação estrutural | Risco mitigado",
      "",
      "### Lacunas de Dados e Próximas Coletas",
      "- O que está faltando e como coletar no app",
      "",
      "### Recomendações por Módulo do App",
      "- Cadastro de Apiário",
      "- Revisão e Manejo",
      "- Iscagem",
      "- Caixas",
      "- Voltar pra Casa/Segurança",
      "",
      "DADOS DE CONTEXTO DO PRODUTO:",
      JSON.stringify(contextoProduto),
      "",
      "DADOS REAIS PARA ANÁLISE:",
      JSON.stringify(contextoDados),
    ].join("\n");
  }, [resumo, filtro]);

  const handleGerarInsightIA = async () => {
    if (!resumo) return;
    if (!geminiService.isConfigured()) {
      Alert.alert("Gemini não configurado", "Defina EXPO_PUBLIC_GEMINI_API_KEY para gerar insights de IA.");
      return;
    }

    try {
      setIaLoading(true);
      const result = await geminiService.generateReportInsights(promptIA);
      setInsightIA(result.text);
    } catch (e: any) {
      Alert.alert("Falha na IA", e?.message || "Não foi possível gerar o insight agora.");
    } finally {
      setIaLoading(false);
    }
  };

  const growthData = useMemo<GrowthDataset>(() => {
    if (!resumo) {
      return {
        title: filtro === "apiarios" ? "Crescimento Apiários" : "Crescimento Caixas",
        series: [],
      };
    }

    if (filtro === "apiarios") {
      const series = (resumo.apiariosComMaisRevisoes || []).slice(0, 4).map((item: any, idx: number) => ({
        label: (item.nome || `A${idx + 1}`).slice(0, 8),
        value: Number(item.total || 0),
      }));

      return { title: "Crescimento Apiários", series };
    }

    const series = (resumo.distribuicaoPorApiario || []).slice(0, 4).map((item: any, idx: number) => ({
      label: (item.nome || `C${idx + 1}`).slice(0, 8),
      value: Number(item.totalCaixas || 0),
    }));

    return { title: "Crescimento Caixas", series };
  }, [resumo, filtro]);

  const maxGrowthValue = useMemo(
    () => Math.max(1, ...growthData.series.map((item) => item.value)),
    [growthData.series],
  );

  const iaPreview = useMemo(() => {
    if (!insightIA) return "Toque em Gerar análise IA para receber recomendações com base nos dados atuais.";
    return insightIA;
  }, [insightIA]);

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.logoWrap}>
            <Image source={headerBeeLogo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.headerTitle}>Relatórios</Text>
        </View>

        <Feather name="bell" size={20} color={C.text} />
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filtro === "apiarios" ? styles.filterBtnActive : null]}
          onPress={() => setFiltro("apiarios")}
        >
          <Text style={styles.filterText}>Apiários</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filtro === "caixas" ? styles.filterBtnActive : null]}
          onPress={() => setFiltro("caixas")}
        >
          <Text style={styles.filterText}>Caixas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={C.text} />
          <Text style={styles.centerStateText}>Carregando resumo...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.cardSection}>
            <Text style={styles.cardTitle}>Resumo Geral:</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Apiários</Text>
                <Text style={styles.metricValue}>{resumo?.totalApiarios ?? 0}</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Caixas</Text>
                <Text style={styles.metricValue}>{resumo?.totalCaixas ?? 0}</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>Revisões</Text>
                <Text style={styles.metricValue}>{resumo?.totalRevisoes ?? 0}</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricLabel}>30 dias</Text>
                <Text style={styles.metricValue}>{resumo?.revisoesUltimos30Dias ?? 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.cardTitle}>{growthData.title}:</Text>
            <View style={styles.chartWrap}>
              <View style={styles.chartGrid}>
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
              </View>

              <View style={styles.chartBarsRow}>
                {growthData.series.length ? (
                  growthData.series.map((item, idx) => {
                    const barHeight = Math.max(8, Math.round((item.value / maxGrowthValue) * 100));
                    return (
                      <View key={`${item.label}-${idx}`} style={styles.barColumn}>
                        <View style={[styles.bar, { height: `${barHeight}%` }]} />
                        <Text style={styles.barLabel}>{item.label}</Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.chartEmpty}>Sem dados suficientes para o gráfico.</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.cardSection}>
            <Text style={styles.cardTitle}>Análise IA:</Text>
            <Text style={styles.modelInfo}>Modelo: {geminiService.getModelName()}</Text>

            <TouchableOpacity style={styles.iaBtn} onPress={handleGerarInsightIA} disabled={iaLoading}>
              {iaLoading ? (
                <ActivityIndicator color={C.text} />
              ) : (
                <Text style={styles.iaBtnText}>Gerar análise com IA</Text>
              )}
            </TouchableOpacity>

            <View style={styles.iaPreviewBox}>
              <Text style={styles.iaPreviewText}>{iaPreview}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
    paddingTop: Platform.OS === "ios" ? 54 : 22,
    paddingBottom: 10,
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
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.surfaceSoft,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: { width: 24, height: 24 },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: C.text,
    ...T.bold,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  filterBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: C.accent,
  },
  filterText: {
    color: C.text,
    fontSize: 20,
    fontWeight: "800",
    ...T.bold,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  centerStateText: {
    color: C.textSub,
    ...T.medium,
  },
  content: {
    padding: 14,
    gap: 12,
    paddingBottom: 40,
  },
  cardSection: {
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    color: C.text,
    fontSize: 28,
    fontWeight: "800",
    ...T.bold,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricChip: {
    width: "48%",
    minHeight: 68,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.surfaceSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: "center",
  },
  metricLabel: {
    color: C.textSub,
    fontSize: 12,
    ...T.medium,
  },
  metricValue: {
    color: C.text,
    fontSize: 26,
    fontWeight: "800",
    ...T.bold,
  },
  chartWrap: {
    height: 220,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.surfaceSoft,
    padding: 10,
    overflow: "hidden",
  },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-evenly",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  gridLine: {
    height: 1,
    backgroundColor: C.outline,
  },
  chartBarsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 8,
    paddingBottom: 2,
  },
  barColumn: {
    flex: 1,
    maxWidth: 64,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
    gap: 6,
  },
  bar: {
    width: "70%",
    borderRadius: 6,
    backgroundColor: C.accent,
    minHeight: 8,
  },
  barLabel: {
    color: C.textSub,
    fontSize: 11,
    ...T.medium,
  },
  chartEmpty: {
    color: C.textSub,
    ...T.medium,
  },
  iaBtn: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  iaBtnText: {
    color: C.text,
    fontSize: 16,
    fontWeight: "800",
    ...T.bold,
  },
  modelInfo: {
    color: C.textSub,
    fontSize: 11,
    textAlign: "right",
    ...T.medium,
  },
  iaPreviewBox: {
    minHeight: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.surfaceSoft,
    padding: 10,
  },
  iaPreviewText: {
    color: C.text,
    fontSize: 13,
    lineHeight: 19,
    ...T.medium,
  },
});
