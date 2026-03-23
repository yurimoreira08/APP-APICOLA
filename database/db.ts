import * as SQLite from "expo-sqlite";
import type { Revisao } from "../src/types/Revisao";
import type { Apiario } from "../src/types/Apiario";

export type SessionMode = "local" | "cloud";

export type AppSession = {
  isLoggedIn: boolean;
  authMode: SessionMode;
  userId?: number;
};

export type UserAccount = {
  id: number;
  nome: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type SafePoint = {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

const DB_NAME = "app_apicola.db";

type DbRuntime = {
  dbPromise?: Promise<SQLite.SQLiteDatabase>;
  initPromise?: Promise<void>;
};

const runtime = globalThis as typeof globalThis & {
  __APP_APICOLA_DB_RUNTIME__?: DbRuntime;
};

if (!runtime.__APP_APICOLA_DB_RUNTIME__) {
  runtime.__APP_APICOLA_DB_RUNTIME__ = {};
}

const dbRuntime = runtime.__APP_APICOLA_DB_RUNTIME__;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isWebFileLockError = (error: unknown): boolean => {
  const message = String((error as any)?.message || error || "");
  return message.includes("createSyncAccessHandle") || message.includes("Access Handles cannot be created");
};

const openDbWithRetry = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    return await SQLite.openDatabaseAsync(DB_NAME);
  } catch (error) {
    if (!isWebFileLockError(error)) {
      throw error;
    }

    // On Web/OPFS, a previous hot-reload instance can temporarily hold the file lock.
    await wait(200);
    return await SQLite.openDatabaseAsync(DB_NAME);
  }
};

const getDb = () => {
  if (!dbRuntime.dbPromise) {
    dbRuntime.dbPromise = openDbWithRetry();
  }
  return dbRuntime.dbPromise;
};

export const initDb = async () => {
  if (dbRuntime.initPromise) {
    return dbRuntime.initPromise;
  }

  dbRuntime.initPromise = (async () => {
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

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      is_logged_in INTEGER NOT NULL DEFAULT 0,
      auth_mode TEXT NOT NULL DEFAULT 'local',
      user_id INTEGER,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS safe_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_safe_points_default ON safe_points (is_default);
  `);

    await db.runAsync(
    `
    INSERT OR IGNORE INTO app_session (id, is_logged_in, auth_mode, user_id, updated_at)
    VALUES (1, 0, 'local', NULL, ?)
    `,
    [new Date().toISOString()],
    );
  
    try {
      await db.execAsync(`ALTER TABLE revisoes ADD COLUMN caixa INTEGER;`);
    } catch (e) {
    }
  })().catch((error) => {
    dbRuntime.dbPromise = undefined;
    dbRuntime.initPromise = undefined;
    if (isWebFileLockError(error)) {
      throw new Error(
        "SQLite Web está bloqueado por outra aba/sessão ativa. Feche outras abas do app e recarregue a página.",
      );
    }
    throw error;
  });

  return dbRuntime.initPromise;
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

const mapUserRow = (row: any): UserAccount => ({
  id: row.id,
  nome: row.nome,
  email: row.email,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const createUserAccount = async (nome: string, email: string, senha: string): Promise<UserAccount> => {
  const db = await getDb();
  const now = new Date().toISOString();
  const normalizedEmail = normalizeEmail(email);

  const existing = await db.getFirstAsync<any>(
    "SELECT id FROM usuarios WHERE email = ?",
    [normalizedEmail],
  );
  if (existing?.id) {
    throw new Error("Já existe uma conta com este e-mail.");
  }

  const result = await db.runAsync(
    `
    INSERT INTO usuarios (nome, email, senha, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    `,
    [nome.trim(), normalizedEmail, senha, now, now],
  );

  return {
    id: Number(result.lastInsertRowId),
    nome: nome.trim(),
    email: normalizedEmail,
    createdAt: now,
    updatedAt: now,
  };
};

export const authenticateUser = async (email: string, senha: string): Promise<UserAccount | null> => {
  const db = await getDb();
  const normalizedEmail = normalizeEmail(email);
  const row = await db.getFirstAsync<any>(
    "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
    [normalizedEmail, senha],
  );
  if (!row) return null;
  return mapUserRow(row);
};

export const getUserById = async (id: number): Promise<UserAccount | null> => {
  const db = await getDb();
  const row = await db.getFirstAsync<any>("SELECT * FROM usuarios WHERE id = ?", [id]);
  if (!row) return null;
  return mapUserRow(row);
};

export const getAppSession = async (): Promise<AppSession> => {
  const db = await getDb();
  const row = await db.getFirstAsync<any>("SELECT * FROM app_session WHERE id = 1");
  if (!row) {
    return { isLoggedIn: false, authMode: "local" };
  }
  return {
    isLoggedIn: row.is_logged_in === 1,
    authMode: row.auth_mode === "cloud" ? "cloud" : "local",
    userId: row.user_id ?? undefined,
  };
};

export const setAppSession = async (session: AppSession) => {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `
    UPDATE app_session
    SET is_logged_in = ?, auth_mode = ?, user_id = ?, updated_at = ?
    WHERE id = 1
    `,
    [session.isLoggedIn ? 1 : 0, session.authMode, session.userId ?? null, now],
  );
};

export const clearAppSession = async () => {
  await setAppSession({ isLoggedIn: false, authMode: "local" });
};

export const insertSafePoint = async (nome: string, latitude: number, longitude: number, makeDefault = false): Promise<number> => {
  const db = await getDb();
  const now = new Date().toISOString();

  if (makeDefault) {
    await db.runAsync("UPDATE safe_points SET is_default = 0");
  }

  const result = await db.runAsync(
    `
    INSERT INTO safe_points (nome, latitude, longitude, is_default, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [nome.trim(), latitude, longitude, makeDefault ? 1 : 0, now, now],
  );

  return Number(result.lastInsertRowId);
};

export const getSafePoints = async (): Promise<SafePoint[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    "SELECT * FROM safe_points ORDER BY is_default DESC, updated_at DESC",
  );

  return rows.map((row) => ({
    id: row.id,
    nome: row.nome,
    latitude: row.latitude,
    longitude: row.longitude,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const setDefaultSafePoint = async (id: number): Promise<void> => {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync("UPDATE safe_points SET is_default = 0");
  await db.runAsync(
    "UPDATE safe_points SET is_default = 1, updated_at = ? WHERE id = ?",
    [now, id],
  );
};

export const deleteSafePoint = async (id: number): Promise<void> => {
  const db = await getDb();
  await db.runAsync("DELETE FROM safe_points WHERE id = ?", [id]);
};

export const getDefaultSafePoint = async (): Promise<SafePoint | null> => {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    "SELECT * FROM safe_points WHERE is_default = 1 LIMIT 1",
  );
  if (!row) return null;

  return {
    id: row.id,
    nome: row.nome,
    latitude: row.latitude,
    longitude: row.longitude,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
