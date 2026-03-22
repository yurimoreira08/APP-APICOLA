import { insertApiario, getApiarios, updateApiario, deleteApiario } from "../../database/db";
import type { Apiario } from "../types/Apiario";

export const apiarioService = {
  getAll: async (): Promise<Apiario[]> => {
    return await getApiarios();
  },
  
  create: async (apiario: Apiario): Promise<number> => {
    return await insertApiario(apiario);
  },
  
  update: async (apiario: Apiario): Promise<void> => {
    await updateApiario(apiario);
  },
  
  remove: async (id: number): Promise<void> => {
    await deleteApiario(id);
  }
};
