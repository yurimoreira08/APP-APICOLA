import { getResumoCaixas, updateNomeCaixa } from "../../database/db";
import type { ResumoCaixa } from "../../database/db";

export const resumoService = {
  getCaixas: async (): Promise<ResumoCaixa[]> => {
    return await getResumoCaixas();
  },

  renameCaixa: async (apiarioId: string, caixa: number, nome: string): Promise<void> => {
    await updateNomeCaixa(apiarioId, caixa, nome);
  },
};
