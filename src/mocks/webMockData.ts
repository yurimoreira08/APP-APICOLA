import type { ResumoCaixa, SafePoint } from "../../database/db";
import type { Apiario } from "../types/Apiario";
import type { Revisao } from "../types/Revisao";

const nowIso = () => new Date().toISOString();

let apiarioIdSeq = 3;
let revisaoIdSeq = 5;
let safePointIdSeq = 3;

let apiariosMock: Apiario[] = [
  {
    id: 1,
    nome: "Apiario Serra Azul",
    local: "Santo Antonio do Leite",
    quantidadeCaixas: 12,
    descricao: "Area de florada principal",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 2,
    nome: "Apiario Vale Verde",
    local: "Ouro Preto",
    quantidadeCaixas: 8,
    descricao: "Regiao de sombra parcial",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

let revisoesMock: Revisao[] = [
  {
    id: 1,
    apiarioId: "1",
    caixa: 1,
    local: "Serra Azul",
    dataIso: "2026-03-20",
    observacao: "Boa postura da rainha e entrada de polen",
    tipo: "caixa",
    rainha: true,
    polen: true,
    mel: true,
    criaNova3Dias: true,
    criaAberta: true,
    criaFechada: true,
    ovos: true,
    comEspaco: true,
    semEspaco: false,
    forca: "boa",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    syncStatus: "pending",
  },
  {
    id: 2,
    apiarioId: "1",
    caixa: 2,
    local: "Serra Azul",
    dataIso: "2026-03-18",
    observacao: "Reduzir espaco e observar 7 dias",
    tipo: "caixa",
    rainha: true,
    polen: true,
    mel: false,
    criaNova3Dias: true,
    criaAberta: true,
    criaFechada: false,
    ovos: true,
    comEspaco: false,
    semEspaco: true,
    forca: "media",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    syncStatus: "pending",
  },
  {
    id: 3,
    apiarioId: "2",
    caixa: 1,
    local: "Vale Verde",
    dataIso: "2026-03-16",
    observacao: "Sem rainha, preparar introducao",
    tipo: "caixa",
    rainha: false,
    polen: false,
    mel: false,
    criaNova3Dias: false,
    criaAberta: false,
    criaFechada: false,
    ovos: false,
    comEspaco: true,
    semEspaco: false,
    forca: "fraca",
    situacaoObservar: "Sem rainha",
    indicacaoRegistrada: "Inserir quadro com postura",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    syncStatus: "pending",
  },
  {
    id: 4,
    apiarioId: "2",
    caixa: 3,
    local: "Vale Verde",
    dataIso: "2026-03-14",
    observacao: "Evolucao positiva",
    tipo: "caixa",
    rainha: true,
    polen: true,
    mel: true,
    criaNova3Dias: true,
    criaAberta: true,
    criaFechada: true,
    ovos: true,
    comEspaco: true,
    semEspaco: false,
    forca: "boa",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    syncStatus: "pending",
  },
];

const caixaNomeOverrides = new Map<string, string>();

let safePointsMock: SafePoint[] = [
  {
    id: 1,
    nome: "Casa",
    latitude: -20.385,
    longitude: -43.503,
    isDefault: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 2,
    nome: "Sede do Apiario",
    latitude: -20.387,
    longitude: -43.499,
    isDefault: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

const nomePadraoCaixa = (numero: number) => `Caixa ${String(numero).padStart(2, "0")}`;

export const webMockApiarios = {
  list: async (): Promise<Apiario[]> => [...apiariosMock],

  create: async (apiario: Apiario): Promise<number> => {
    const id = apiarioIdSeq++;
    const now = nowIso();
    apiariosMock = [
      {
        ...apiario,
        id,
        createdAt: now,
        updatedAt: now,
      },
      ...apiariosMock,
    ];
    return id;
  },

  update: async (apiario: Apiario): Promise<void> => {
    if (!apiario.id) throw new Error("ID do apiario e obrigatorio.");
    const now = nowIso();
    apiariosMock = apiariosMock.map((item) =>
      item.id === apiario.id
        ? {
            ...item,
            ...apiario,
            updatedAt: now,
          }
        : item,
    );
  },

  remove: async (id: number): Promise<void> => {
    apiariosMock = apiariosMock.filter((item) => item.id !== id);
    revisoesMock = revisoesMock.filter((item) => String(item.apiarioId || "") !== String(id));
  },
};

export const webMockRevisoes = {
  list: async (apiarioId?: string, caixaFiltro?: number): Promise<Revisao[]> => {
    let data = [...revisoesMock];
    if (apiarioId) {
      data = data.filter((item) => String(item.apiarioId || "") === String(apiarioId));
    }
    if (caixaFiltro !== undefined) {
      data = data.filter((item) => item.caixa === caixaFiltro);
    }
    data.sort((a, b) => (a.dataIso || "") < (b.dataIso || "") ? 1 : -1);
    return data;
  },

  create: async (revisao: Revisao): Promise<number> => {
    const id = revisaoIdSeq++;
    const now = nowIso();
    revisoesMock = [
      {
        ...revisao,
        id,
        createdAt: now,
        updatedAt: now,
        syncStatus: "pending",
      },
      ...revisoesMock,
    ];
    return id;
  },

  update: async (revisao: Revisao): Promise<void> => {
    if (!revisao.id) throw new Error("ID da revisao e obrigatorio.");
    const now = nowIso();
    revisoesMock = revisoesMock.map((item) =>
      item.id === revisao.id
        ? {
            ...item,
            ...revisao,
            updatedAt: now,
          }
        : item,
    );
  },

  remove: async (id: number): Promise<void> => {
    revisoesMock = revisoesMock.filter((item) => item.id !== id);
  },
};

export const webMockResumo = {
  listCaixas: async (): Promise<ResumoCaixa[]> => {
    const rows: ResumoCaixa[] = [];

    for (const apiario of apiariosMock) {
      const total = apiario.quantidadeCaixas || 0;
      for (let caixa = 1; caixa <= total; caixa++) {
        const key = `${apiario.id}-${caixa}`;
        rows.push({
          apiarioId: String(apiario.id),
          apiarioNome: apiario.nome,
          caixa,
          tipo: "Caixa",
          nome: caixaNomeOverrides.get(key) || nomePadraoCaixa(caixa),
        });
      }
    }

    return rows;
  },

  renameCaixa: async (apiarioId: string, caixa: number, nome: string): Promise<void> => {
    caixaNomeOverrides.set(`${apiarioId}-${caixa}`, nome);
  },
};

export const webMockSafePoints = {
  list: async (): Promise<SafePoint[]> => [...safePointsMock],

  create: async (nome: string, latitude: number, longitude: number, makeDefault = false): Promise<number> => {
    if (makeDefault) {
      safePointsMock = safePointsMock.map((item) => ({ ...item, isDefault: false }));
    }

    const id = safePointIdSeq++;
    const now = nowIso();
    safePointsMock = [
      {
        id,
        nome,
        latitude,
        longitude,
        isDefault: makeDefault,
        createdAt: now,
        updatedAt: now,
      },
      ...safePointsMock,
    ];

    return id;
  },

  setDefault: async (id: number): Promise<void> => {
    safePointsMock = safePointsMock.map((item) => ({
      ...item,
      isDefault: item.id === id,
      updatedAt: nowIso(),
    }));
  },

  remove: async (id: number): Promise<void> => {
    safePointsMock = safePointsMock.filter((item) => item.id !== id);
  },

  getDefault: async (): Promise<SafePoint | null> => {
    return safePointsMock.find((item) => item.isDefault) || null;
  },
};
