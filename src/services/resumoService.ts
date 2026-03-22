import { getResumoCaixas } from "../../database/db";
import type { ResumoCaixa } from "../../database/db";

export const resumoService = {
  getCaixas: async (): Promise<ResumoCaixa[]> => {
    return await getResumoCaixas();
  }
};
