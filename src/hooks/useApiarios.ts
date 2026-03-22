import { useState, useCallback } from "react";
import type { Apiario } from "../types/Apiario";
import { apiarioService } from "../services/apiarioService";
import { Alert } from "react-native";

export const useApiarios = () => {
  const [apiarios, setApiarios] = useState<Apiario[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiarioService.getAll();
      setApiarios(data);
    } catch (error) {
      console.error("Erro ao puxar apiários:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = async (id: number) => {
    try {
      await apiarioService.remove(id);
      await load();
    } catch (error) {
      console.error("Erro ao deletar apiário:", error);
      Alert.alert("Erro", "Não foi possível excluir o apiário.");
    }
  };

  const save = async (apiario: Apiario) => {
    try {
      if (apiario.id) {
        await apiarioService.update(apiario);
      } else {
        await apiarioService.create(apiario);
      }
      await load();
    } catch (error) {
      console.error("Erro ao salvar apiário:", error);
      Alert.alert("Erro", "Não foi possível salvar o apiário.");
      throw error;
    }
  };

  return { apiarios, isLoading, load, remove, save };
};
