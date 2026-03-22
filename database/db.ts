import * as SQLite from "expo-sqlite";
import type { Revisao } from "../src/types/Revisao";
import type { Apiario } from "../src/types/Apiario";

const DB_NAME = "app_apicola.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | undefined;

const getDb = () => {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  return dbPromise;
};

export const initDb = async () => {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS revisoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      apiario_id TEXT,
      local TEXT,
      data_iso TEXT,
      observacao TEXT,

      tipo TEXT,
      rainha INTEGER,
      polen INTEGER,
      mel INTEGER,
      cria_nova_3_dias INTEGER,
      cria_aberta INTEGER,
      cria_fechada INTEGER,
      ovos INTEGER,
      com_espaco INTEGER,
      sem_espaco INTEGER,
      forca TEXT,
      situacao_observar TEXT,
      indicacao_registrada TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      caixa INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_revisoes_data ON revisoes (data_iso);
    CREATE INDEX IF NOT EXISTS idx_revisoes_apiario ON revisoes (apiario_id);

    CREATE TABLE IF NOT EXISTS apiarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      local TEXT,
      quantidade_caixas INTEGER,
      descricao TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS caixas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apiario_id INTEGER NOT NULL,
      numero INTEGER NOT NULL,
      nome TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(apiario_id, numero)
    );

    CREATE INDEX IF NOT EXISTS idx_caixas_apiario ON caixas (apiario_id);
  `);
  
  try {
    await db.execAsync(`ALTER TABLE revisoes ADD COLUMN caixa INTEGER;`);
  } catch (e) {
  }
};

const nomePadraoCaixa = (numero: number) => `Caixa ${String(numero).padStart(2, "0")}`;

const syncCaixasApiario = async (apiarioId: number, quantidadeCaixas?: number) => {
  const db = await getDb();
  const now = new Date().toISOString();
  const quantidade = quantidadeCaixas && quantidadeCaixas > 0 ? quantidadeCaixas : 0;

  if (quantidade === 0) {
    await db.runAsync("DELETE FROM caixas WHERE apiario_id = ?", [apiarioId]);
    return;
  }

  const existentes = await db.getAllAsync<any>(
    "SELECT numero FROM caixas WHERE apiario_id = ? ORDER BY numero",
    [apiarioId],
  );
  const numerosExistentes = new Set<number>(existentes.map((row) => row.numero));

  for (let n = 1; n <= quantidade; n++) {
    if (!numerosExistentes.has(n)) {
      await db.runAsync(
        `
        INSERT INTO caixas (apiario_id, numero, nome, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        `,
        [apiarioId, n, nomePadraoCaixa(n), now, now],
      );
    }
  }

  await db.runAsync("DELETE FROM caixas WHERE apiario_id = ? AND numero > ?", [apiarioId, quantidade]);
};

const b = (v?: boolean) => (v === undefined ? null : v ? 1 : 0);
export const insertRevisao = async (r: Revisao) => {
  const db = await getDb();
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `
    INSERT INTO revisoes (
      apiario_id, caixa, local, data_iso, observacao,
      tipo, rainha, polen, mel,
      cria_nova_3_dias, cria_aberta, cria_fechada, ovos,
      com_espaco, sem_espaco, forca,
      situacao_observar, indicacao_registrada,
      created_at, updated_at, sync_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      r.apiarioId ?? null,
      r.caixa ?? null,
      r.local ?? null,
      r.dataIso ?? null,
      r.observacao ?? null,

      r.tipo ?? null,
      b(r.rainha),
      b(r.polen),
      b(r.mel),

      b(r.criaNova3Dias),
      b(r.criaAberta),
      b(r.criaFechada),
      b(r.ovos),

      b(r.comEspaco),
      b(r.semEspaco),
      r.forca ?? null,

      r.situacaoObservar ?? null,
      r.indicacaoRegistrada ?? null,

      now,
      now,
      "pending",
    ],
  );

  return result.lastInsertRowId;
};

export const getRevisoes = async (apiarioId?: string, caixa?: number): Promise<Revisao[]> => {
  const db = await getDb();
  let query = "SELECT * FROM revisoes";
  const params: any[] = [];

  const conditions = [];
  if (apiarioId) {
    conditions.push("apiario_id = ?");
    params.push(apiarioId);
  }
  if (caixa !== undefined) {
    conditions.push("caixa = ?");
    params.push(caixa);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY data_iso DESC, created_at DESC";

  const rows = await db.getAllAsync<any>(query, params);

  return rows.map((r) => ({
    id: r.id,
    apiarioId: r.apiario_id,
    caixa: r.caixa,
    local: r.local,
    dataIso: r.data_iso,
    observacao: r.observacao,
    tipo: r.tipo,
    rainha: r.rainha === 1,
    polen: r.polen === 1,
    mel: r.mel === 1,
    criaNova3Dias: r.cria_nova_3_dias === 1,
    criaAberta: r.cria_aberta === 1,
    criaFechada: r.cria_fechada === 1,
    ovos: r.ovos === 1,
    comEspaco: r.com_espaco === 1,
    semEspaco: r.sem_espaco === 1,
    forca: r.forca,
    situacaoObservar: r.situacao_observar,
    indicacaoRegistrada: r.indicacao_registrada,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    syncStatus: r.sync_status,
  }));
};

export const updateRevisao = async (r: Revisao) => {
  if (r.id === undefined) throw new Error("ID é obrigatório para atualização");
  const db = await getDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `
    UPDATE revisoes SET
      apiario_id = ?, caixa = ?, local = ?, data_iso = ?, observacao = ?,
      tipo = ?, rainha = ?, polen = ?, mel = ?,
      cria_nova_3_dias = ?, cria_aberta = ?, cria_fechada = ?, ovos = ?,
      com_espaco = ?, sem_espaco = ?, forca = ?,
      situacao_observar = ?, indicacao_registrada = ?,
      updated_at = ?
    WHERE id = ?
    `,
    [
      r.apiarioId ?? null,
      r.caixa ?? null,
      r.local ?? null,
      r.dataIso ?? null,
      r.observacao ?? null,

      r.tipo ?? null,
      b(r.rainha),
      b(r.polen),
      b(r.mel),

      b(r.criaNova3Dias),
      b(r.criaAberta),
      b(r.criaFechada),
      b(r.ovos),

      b(r.comEspaco),
      b(r.semEspaco),
      r.forca ?? null,

      r.situacaoObservar ?? null,
      r.indicacaoRegistrada ?? null,

      now,
      r.id,
    ]
  );
};

export const deleteRevisao = async (id: number) => {
  const db = await getDb();
  await db.runAsync("DELETE FROM revisoes WHERE id = ?", [id]);
};

export const clearAllRevisoes = async () => {
  const db = await getDb();
  await db.execAsync("DELETE FROM revisoes");
};

export const insertApiario = async (a: Apiario) => {
  const db = await getDb();
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `
    INSERT INTO apiarios (
      nome, local, quantidade_caixas, descricao,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      a.nome,
      a.local ?? null,
      a.quantidadeCaixas ?? null,
      a.descricao ?? null,
      now,
      now,
    ]
  );

  const apiarioId = Number(result.lastInsertRowId);
  await syncCaixasApiario(apiarioId, a.quantidadeCaixas);
  return result.lastInsertRowId;
};

export const getApiarios = async (): Promise<Apiario[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM apiarios ORDER BY created_at DESC"
  );

  return rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    local: r.local,
    quantidadeCaixas: r.quantidade_caixas,
    descricao: r.descricao,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
};

export const updateApiario = async (a: Apiario) => {
  if (a.id === undefined) throw new Error("ID é obrigatório para atualização");
  const db = await getDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `
    UPDATE apiarios SET
      nome = ?, local = ?, quantidade_caixas = ?, descricao = ?,
      updated_at = ?
    WHERE id = ?
    `,
    [
      a.nome,
      a.local ?? null,
      a.quantidadeCaixas ?? null,
      a.descricao ?? null,
      now,
      a.id,
    ]
  );

  await syncCaixasApiario(a.id, a.quantidadeCaixas);
};

export const deleteApiario = async (id: number) => {
  const db = await getDb();
  await db.runAsync("DELETE FROM caixas WHERE apiario_id = ?", [id]);
  await db.runAsync("DELETE FROM apiarios WHERE id = ?", [id]);
};

export type ResumoCaixa = {
  apiarioId: string;
  apiarioNome: string;
  caixa: number;
  tipo: string;
  nome?: string;
};
export const getResumoCaixas = async (): Promise<ResumoCaixa[]> => {
  const db = await getDb();
  const query = `
    SELECT
      c.apiario_id,
      a.nome as apiario_nome,
      c.numero as caixa,
      c.nome as nome_caixa
    FROM caixas c
    JOIN apiarios a ON a.id = c.apiario_id
    ORDER BY a.nome, c.numero
  `;
  const rows = await db.getAllAsync<any>(query);

  return rows.map((r) => ({
    apiarioId: r.apiario_id,
    apiarioNome: r.apiario_nome,
    caixa: r.caixa,
    tipo: "Caixa",
    nome: r.nome_caixa || nomePadraoCaixa(r.caixa),
  }));
};

export const updateNomeCaixa = async (apiarioId: string, caixa: number, nome: string) => {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    "UPDATE caixas SET nome = ?, updated_at = ? WHERE apiario_id = ? AND numero = ?",
    [nome, now, Number(apiarioId), caixa],
  );
};
