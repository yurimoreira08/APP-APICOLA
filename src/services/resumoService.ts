import { getResumoCaixas, updateNomeCaixa } from "../../database/db";
import { Platform } from "react-native";
import { webMockResumo } from "../mocks/webMockData";
import { isWebPreviewModeActive } from "../runtime/webPreviewMode";
import type { ResumoCaixa } from "../../database/db";

const useWebMock = () => Platform.OS === "web" && isWebPreviewModeActive();

export const resumoService = {
  getCaixas: async (): Promise<ResumoCaixa[]> => {
    if (useWebMock()) {
      return await webMockResumo.listCaixas();
    }
    return await getResumoCaixas();
  },

  renameCaixa: async (apiarioId: string, caixa: number, nome: string): Promise<void> => {
    if (useWebMock()) {
      await webMockResumo.renameCaixa(apiarioId, caixa, nome);
      return;
    }
    await updateNomeCaixa(apiarioId, caixa, nome);
  },
};
