export type RevisaoTipo = "caixa" | "nucleo";
export type RevisaoForca = "fraca" | "media" | "boa";
export type SyncStatus = "pending" | "synced" | "error";

export type Revisao = {
  id?: number;

  apiarioId?: string;
  caixa?: number;
  local?: string;
  dataIso?: string;
  observacao?: string;

  tipo?: string;
  rainha?: boolean;
  polen?: boolean;
  mel?: boolean;
  criaNova3Dias?: boolean;
  criaAberta?: boolean;
  criaFechada?: boolean;
  ovos?: boolean;
  comEspaco?: boolean;
  semEspaco?: boolean;
  forca?: RevisaoForca;
  situacaoObservar?: string;
  indicacaoRegistrada?: string;

  createdAt?: string;
  updatedAt?: string;
  syncStatus?: SyncStatus;
};
