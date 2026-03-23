import { insertApiario, getApiarios, updateApiario, deleteApiario } from "../../database/db";
import { Platform } from "react-native";
import { webMockApiarios } from "../mocks/webMockData";
import { isWebPreviewModeActive } from "../runtime/webPreviewMode";
import type { Apiario } from "../types/Apiario";

const useWebMock = () => Platform.OS === "web" && isWebPreviewModeActive();

export const apiarioService = {
  getAll: async (): Promise<Apiario[]> => {
    if (useWebMock()) {
      return await webMockApiarios.list();
    }
    return await getApiarios();
  },
  
  create: async (apiario: Apiario): Promise<number> => {
    if (useWebMock()) {
      return await webMockApiarios.create(apiario);
    }
    return await insertApiario(apiario);
  },
  
  update: async (apiario: Apiario): Promise<void> => {
    if (useWebMock()) {
      await webMockApiarios.update(apiario);
      return;
    }
    await updateApiario(apiario);
  },
  
  remove: async (id: number): Promise<void> => {
    if (useWebMock()) {
      await webMockApiarios.remove(id);
      return;
    }
    await deleteApiario(id);
  }
};
