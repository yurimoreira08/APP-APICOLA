import { insertRevisao, getRevisoes, updateRevisao, deleteRevisao } from "../../database/db";
import { Platform } from "react-native";
import { webMockRevisoes } from "../mocks/webMockData";
import { isWebPreviewModeActive } from "../runtime/webPreviewMode";
import type { Revisao } from "../types/Revisao";

const useWebMock = () => Platform.OS === "web" && isWebPreviewModeActive();

export const revisaoService = {
  getAll: async (apiarioId?: string, caixaFiltro?: number): Promise<Revisao[]> => {
    if (useWebMock()) {
      return await webMockRevisoes.list(apiarioId, caixaFiltro);
    }
    return await getRevisoes(apiarioId, caixaFiltro);
  },
  
  create: async (revisao: Revisao): Promise<number> => {
    if (useWebMock()) {
      return await webMockRevisoes.create(revisao);
    }
    return await insertRevisao(revisao);
  },
  
  update: async (revisao: Revisao): Promise<void> => {
    if (useWebMock()) {
      await webMockRevisoes.update(revisao);
      return;
    }
    await updateRevisao(revisao);
  },
  
  remove: async (id: number): Promise<void> => {
    if (useWebMock()) {
      await webMockRevisoes.remove(id);
      return;
    }
    await deleteRevisao(id);
  }
};
