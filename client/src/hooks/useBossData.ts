import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

const normalizarFiltro = (filtro: string): string => {
  const mapa: Record<string, string> = {
    "ESTE MES":     "este_mes",
    "SEIS MESES":   "seis_meses",
    "UN AÑO ATRAS": "un_ano_atras",
    "FECHA ACTUAL": "fecha_actual",
  };
  return mapa[filtro] ?? "este_mes";
};

export const useBossData = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (filtro?: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const params = filtro && filtro !== "RESETEAR" 
                ? { filtro: normalizarFiltro(filtro) } 
                : { filtro: "este_mes" };
            const response = await apiClient.get("/analiticas/dashboard", { params });
            setData(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar datos");
            console.error("Error fetching boss data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
};