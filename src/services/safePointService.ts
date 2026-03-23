import {
  deleteSafePoint,
  getDefaultSafePoint,
  getSafePoints,
  insertSafePoint,
  setDefaultSafePoint,
} from "../../database/db";
import { Platform } from "react-native";
import { webMockSafePoints } from "../mocks/webMockData";
import { isWebPreviewModeActive } from "../runtime/webPreviewMode";
import type { SafePoint } from "../../database/db";

const useWebMock = () => Platform.OS === "web" && isWebPreviewModeActive();

export const safePointService = {
  create: async (nome: string, latitude: number, longitude: number, makeDefault = false): Promise<number> => {
    if (useWebMock()) {
      return await webMockSafePoints.create(nome, latitude, longitude, makeDefault);
    }
    return await insertSafePoint(nome, latitude, longitude, makeDefault);
  },

  list: async (): Promise<SafePoint[]> => {
    if (useWebMock()) {
      return await webMockSafePoints.list();
    }
    return await getSafePoints();
  },

  setDefault: async (id: number): Promise<void> => {
    if (useWebMock()) {
      await webMockSafePoints.setDefault(id);
      return;
    }
    await setDefaultSafePoint(id);
  },

  remove: async (id: number): Promise<void> => {
    if (useWebMock()) {
      await webMockSafePoints.remove(id);
      return;
    }
    await deleteSafePoint(id);
  },

  getDefault: async (): Promise<SafePoint | null> => {
    if (useWebMock()) {
      return await webMockSafePoints.getDefault();
    }
    return await getDefaultSafePoint();
  },
};
