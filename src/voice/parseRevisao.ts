import type { Revisao } from "../types/Revisao";

type BooleanFields =
  | "rainha"
  | "polen"
  | "mel"
  | "criaNova3Dias"
  | "criaAberta"
  | "criaFechada"
  | "ovos"
  | "comEspaco"
  | "semEspaco";

export type ParseResult = {
  patch: Partial<Revisao>;
  recognized: string[];
};

const removeAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalize = (raw: string) =>
  removeAccents(raw)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasNearNegation = (text: string, keyword: string) => {
  const t = ` ${text} `;
  const k = ` ${keyword} `;

  const negations = [
    " nao ",
    " não ",
    " sem ",
    " ausente ",
    " falta ",
    " faltando ",
  ];

  const idx = t.indexOf(k);
  if (idx === -1) return false;

  const windowStart = Math.max(0, idx - 25);
  const windowEnd = Math.min(t.length, idx + k.length + 25);
  let around = t.slice(windowStart, windowEnd);

  around = around.replace(k, " ");

  return negations.some((n) => around.includes(n));
};

const setBoolByKeyword = (
  patch: Partial<Revisao>,
  text: string,
  keywords: string[],
  field: BooleanFields,
) => {
  for (const kw of keywords) {
    if (text.includes(kw)) {
      const neg = hasNearNegation(text, kw);
      patch[field] = !neg;
      return;
    }
  }
};

const extractAfter = (text: string, starters: string[]) => {
  for (const s of starters) {
    const idx = text.indexOf(s);
    if (idx !== -1) {
      const value = text.slice(idx + s.length).trim();
      return value || undefined;
    }
  }
  return undefined;
};

const parseTipoECaixa = (text: string, maxCaixas?: number) => {
  const m = text.match(/\b(caixa|nucleo)\s+(\d+)\b/i);
  if (m) {
    const num = parseInt(m[2], 10);
    if (!maxCaixas || num <= maxCaixas) {
      return { tipo: m[1].toLowerCase(), caixa: num };
    } else {
      return { tipo: m[1].toLowerCase() };
    }
  }
  if (text.includes("nucleo")) return { tipo: "nucleo" };
  if (text.includes("caixa")) return { tipo: "caixa" };
  return undefined;
};

const parseForca = (text: string) => {
  if (text.includes("fraca")) return "fraca" as const;
  if (text.includes("media")) return "media" as const;
  if (text.includes("boa")) return "boa" as const;
  return undefined;
};

const parseIsoDate = (text: string) => {
  const brMatch = text.match(/data\s*(\d{1,2})\s*(\d{1,2})\s*(20\d{2})/i);
  if (brMatch) {
    const dd = brMatch[1].padStart(2, "0");
    const mm = brMatch[2].padStart(2, "0");
    const yyyy = brMatch[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const br = text.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);
  if (br) {
    const dd = br[1].padStart(2, "0");
    const mm = br[2].padStart(2, "0");
    const yyyy = br[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  if (text.includes("hoje")) {
    const d = new Date();
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return undefined;
};

export const parseRevisaoCommand = (raw: string, maxCaixas?: number): ParseResult => {
  const text = normalize(raw);

  const patch: Partial<Revisao> = {};
  const recognized: string[] = [];

  const tipoECaixa = parseTipoECaixa(text, maxCaixas);
  if (tipoECaixa) {
    patch.tipo = tipoECaixa.tipo;
    recognized.push(`tipo=${tipoECaixa.tipo}`);
    if (tipoECaixa.caixa) {
      patch.caixa = tipoECaixa.caixa;
      recognized.push(`caixa=${tipoECaixa.caixa}`);
    }
  }

  const forca = parseForca(text);
  if (forca) {
    patch.forca = forca;
    recognized.push(`forca=${forca}`);
  }

  setBoolByKeyword(patch, text, ["rainha"], "rainha");
  setBoolByKeyword(patch, text, ["polen", "polem"], "polen");
  setBoolByKeyword(patch, text, ["mel"], "mel");
  setBoolByKeyword(
    patch,
    text,
    ["cria nova", "cria nova 3 dias", "cria de 3 dias"],
    "criaNova3Dias",
  );
  setBoolByKeyword(patch, text, ["cria aberta"], "criaAberta");
  setBoolByKeyword(patch, text, ["cria fechada"], "criaFechada");
  setBoolByKeyword(patch, text, ["ovos", "ovo"], "ovos");
  setBoolByKeyword(patch, text, ["com espaco", "com espaço"], "comEspaco");
  setBoolByKeyword(patch, text, ["sem espaco", "sem espaço"], "semEspaco");

  (
    [
      "rainha",
      "polen",
      "mel",
      "criaNova3Dias",
      "criaAberta",
      "criaFechada",
      "ovos",
      "comEspaco",
      "semEspaco",
    ] as BooleanFields[]
  ).forEach((field) => {
    if (patch[field] !== undefined) {
      recognized.push(`${field}=${String(patch[field])}`);
    }
  });

  const dataIso = parseIsoDate(text);
  if (dataIso) {
    patch.dataIso = dataIso;
    recognized.push(`dataIso=${dataIso}`);
  }

  const obs = extractAfter(text, ["observacao ", "observação ", "nota "]);
  if (obs) {
    patch.observacao = obs;
    recognized.push("observacao=*");
  }

  const situacao = extractAfter(text, [
    "situacao ",
    "situação ",
    "observar ",
    "a observar ",
  ]);
  if (situacao) {
    patch.situacaoObservar = situacao;
    recognized.push("situacaoObservar=*");
  }

  const indicacao = extractAfter(text, [
    "indicacao ",
    "indicação ",
    "registrar indicacao ",
    "registrar indicação ",
  ]);
  if (indicacao) {
    patch.indicacaoRegistrada = indicacao;
    recognized.push("indicacaoRegistrada=*");
  }

  return { patch, recognized };
};
