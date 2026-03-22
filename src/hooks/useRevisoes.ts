import { useState, useCallback } from "react";
import type { Revisao } from "../types/Revisao";
import { revisaoService } from "../services/revisaoService";
import { Alert } from "react-native";

export const useRevisoes = (apiarioId?: string, caixaFiltro?: number) => {
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await revisaoService.getAll(apiarioId, caixaFiltro);
      setRevisoes(data);
    } catch (error) {
      console.error("Erro ao puxar revisoes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [apiarioId, caixaFiltro]);

  const remove = async (id: number) => {
    try {
      await revisaoService.remove(id);
      await load();
    } catch (error) {
      console.error("Erro ao deletar revisao:", error);
      Alert.alert("Erro", "Não foi possível excluir a revisão.");
    }
  };

  const save = async (revisao: Revisao) => {
    try {
      if (revisao.id) {
        await revisaoService.update(revisao);
      } else {
        await revisaoService.create(revisao);
      }
      await load();
    } catch (error) {
      console.error("Erro ao salvar revisao:", error);
      Alert.alert("Erro", "Não foi possível salvar a revisão.");
      throw error;
    }
  };

  return { revisoes, isLoading, load, remove, save };
};
