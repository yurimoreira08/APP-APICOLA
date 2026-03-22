import { insertRevisao, getRevisoes, updateRevisao, deleteRevisao } from "../../database/db";
import type { Revisao } from "../types/Revisao";

export const revisaoService = {
  getAll: async (apiarioId?: string, caixaFiltro?: number): Promise<Revisao[]> => {
    return await getRevisoes(apiarioId, caixaFiltro);
  },
  
  create: async (revisao: Revisao): Promise<number> => {
    return await insertRevisao(revisao);
  },
  
  update: async (revisao: Revisao): Promise<void> => {
    await updateRevisao(revisao);
  },
  
  remove: async (id: number): Promise<void> => {
    await deleteRevisao(id);
  }
};
