import { apiarioService } from "./apiarioService";
import { revisaoService } from "./revisaoService";
import { resumoService } from "./resumoService";

export type RelatorioData = {
  totalApiarios: number;
  totalCaixas: number;
  totalRevisoes: number;
  revisoesUltimos30Dias: number;
  revisoesComRainha: number;
  revisoesComMel: number;
  revisoesComPolen: number;
  revisoesSemRainha: number;
  revisoesSemMel: number;
  revisoesSemPolen: number;
  forcaFraca: number;
  forcaMedia: number;
  forcaBoa: number;
  apiariosSemRevisao: number;
  apiariosComMaisRevisoes: Array<{ nome: string; total: number }>;
  distribuicaoPorApiario: Array<{
    apiarioId: string;
    nome: string;
    totalRevisoes: number;
    totalCaixas: number;
    semRainha: number;
    semMel: number;
    semPolen: number;
    forcaFraca: number;
  }>;
  caixasCriticas: Array<{
    apiarioNome: string;
    caixa: number;
    totalRevisoes: number;
    alertas: string[];
  }>;
  revisoesRecentes: Array<{
    apiarioNome: string;
    caixa?: number;
    dataIso?: string;
    rainha?: boolean;
    mel?: boolean;
    polen?: boolean;
    forca?: string;
    situacaoObservar?: string;
    indicacaoRegistrada?: string;
  }>;
};

const daysAgoIso = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const compareIsoDesc = (a?: string, b?: string) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a > b ? -1 : a < b ? 1 : 0;
};

export const relatorioService = {
  getResumoGeral: async (): Promise<RelatorioData> => {
    const [apiarios, revisoes, caixas] = await Promise.all([
      apiarioService.getAll(),
      revisaoService.getAll(),
      resumoService.getCaixas(),
    ]);

    const revisoesComRainha = revisoes.filter((r) => r.rainha).length;
    const revisoesComMel = revisoes.filter((r) => r.mel).length;
    const revisoesComPolen = revisoes.filter((r) => r.polen).length;
    const revisoesSemRainha = revisoes.filter((r) => r.rainha === false).length;
    const revisoesSemMel = revisoes.filter((r) => r.mel === false).length;
    const revisoesSemPolen = revisoes.filter((r) => r.polen === false).length;

    const ref30d = daysAgoIso(30);
    const revisoesUltimos30Dias = revisoes.filter((r) => (r.dataIso || "") >= ref30d).length;

    const forcaFraca = revisoes.filter((r) => r.forca === "fraca").length;
    const forcaMedia = revisoes.filter((r) => r.forca === "media").length;
    const forcaBoa = revisoes.filter((r) => r.forca === "boa").length;

    const mapaApiarios = new Map<string, number>();
    revisoes.forEach((r) => {
      if (!r.apiarioId) return;
      mapaApiarios.set(r.apiarioId, (mapaApiarios.get(r.apiarioId) || 0) + 1);
    });

    const apiariosComMaisRevisoes = Array.from(mapaApiarios.entries())
      .map(([apiarioId, total]) => ({
        nome: apiarios.find((a) => String(a.id) === String(apiarioId))?.nome || `Apiário ${apiarioId}`,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const caixasPorApiario = new Map<string, number>();
    caixas.forEach((c) => {
      caixasPorApiario.set(c.apiarioId, (caixasPorApiario.get(c.apiarioId) || 0) + 1);
    });

    const distribuicaoPorApiario = apiarios.map((a) => {
      const apiarioId = String(a.id);
      const revisoesApiario = revisoes.filter((r) => String(r.apiarioId || "") === apiarioId);
      return {
        apiarioId,
        nome: a.nome,
        totalRevisoes: revisoesApiario.length,
        totalCaixas: caixasPorApiario.get(apiarioId) || 0,
        semRainha: revisoesApiario.filter((r) => r.rainha === false).length,
        semMel: revisoesApiario.filter((r) => r.mel === false).length,
        semPolen: revisoesApiario.filter((r) => r.polen === false).length,
        forcaFraca: revisoesApiario.filter((r) => r.forca === "fraca").length,
      };
    });

    const apiariosSemRevisao = distribuicaoPorApiario.filter((i) => i.totalRevisoes === 0).length;

    const mapaCaixas = new Map<string, { apiarioNome: string; caixa: number; totalRevisoes: number; semRainha: number; semMel: number; semPolen: number; forcaFraca: number }>();
    revisoes.forEach((r) => {
      const caixa = r.caixa;
      if (caixa === undefined || caixa === null || !r.apiarioId) return;
      const apiarioNome = apiarios.find((a) => String(a.id) === String(r.apiarioId))?.nome || `Apiário ${r.apiarioId}`;
      const key = `${r.apiarioId}-${caixa}`;
      const current = mapaCaixas.get(key) || {
        apiarioNome,
        caixa,
        totalRevisoes: 0,
        semRainha: 0,
        semMel: 0,
        semPolen: 0,
        forcaFraca: 0,
      };
      current.totalRevisoes += 1;
      if (r.rainha === false) current.semRainha += 1;
      if (r.mel === false) current.semMel += 1;
      if (r.polen === false) current.semPolen += 1;
      if (r.forca === "fraca") current.forcaFraca += 1;
      mapaCaixas.set(key, current);
    });

    const caixasCriticas = Array.from(mapaCaixas.values())
      .map((cx) => {
        const alertas: string[] = [];
        if (cx.semRainha > 0) alertas.push("Sem rainha em uma ou mais revisões");
        if (cx.semMel > 0) alertas.push("Ausência de mel em parte das revisões");
        if (cx.semPolen > 0) alertas.push("Ausência de pólen em parte das revisões");
        if (cx.forcaFraca > 0) alertas.push("Força fraca identificada");
        return {
          apiarioNome: cx.apiarioNome,
          caixa: cx.caixa,
          totalRevisoes: cx.totalRevisoes,
          alertas,
        };
      })
      .filter((cx) => cx.alertas.length > 0)
      .sort((a, b) => b.alertas.length - a.alertas.length || b.totalRevisoes - a.totalRevisoes)
      .slice(0, 8);

    const revisoesRecentes = [...revisoes]
      .sort((a, b) => compareIsoDesc(a.dataIso, b.dataIso))
      .slice(0, 12)
      .map((r) => ({
        apiarioNome:
          apiarios.find((a) => String(a.id) === String(r.apiarioId || ""))?.nome ||
          (r.apiarioId ? `Apiário ${r.apiarioId}` : "Sem apiário"),
        caixa: r.caixa,
        dataIso: r.dataIso,
        rainha: r.rainha,
        mel: r.mel,
        polen: r.polen,
        forca: r.forca,
        situacaoObservar: r.situacaoObservar,
        indicacaoRegistrada: r.indicacaoRegistrada,
      }));

    return {
      totalApiarios: apiarios.length,
      totalCaixas: caixas.length,
      totalRevisoes: revisoes.length,
      revisoesUltimos30Dias,
      revisoesComRainha,
      revisoesComMel,
      revisoesComPolen,
      revisoesSemRainha,
      revisoesSemMel,
      revisoesSemPolen,
      forcaFraca,
      forcaMedia,
      forcaBoa,
      apiariosSemRevisao,
      apiariosComMaisRevisoes,
      distribuicaoPorApiario,
      caixasCriticas,
      revisoesRecentes,
    };
  },
};
