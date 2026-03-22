import { useState, useCallback } from "react";
import type { ResumoCaixa } from "../../database/db";
import { resumoService } from "../services/resumoService";

export const useResumoCaixas = () => {
  const [caixas, setCaixas] = useState<ResumoCaixa[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await resumoService.getCaixas();
      setCaixas(data);
    } catch (error) {
      console.error("Erro ao puxar resumo de caixas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renameCaixa = useCallback(async (apiarioId: string, caixa: number, nome: string) => {
    await resumoService.renameCaixa(apiarioId, caixa, nome);
    await load();
  }, [load]);

  return { caixas, isLoading, load, renameCaixa };
};
