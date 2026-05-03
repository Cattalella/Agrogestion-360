import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";

const normalizarFiltro = (filtro: string): string => {
  const mapa: Record<string, string> = {
    "ESTE_MES": "este_mes",
    "MES_PASADO": "mes_pasado",
    "SEIS_MESES": "seis_meses",
    "UN_ANO_ATRAS": "un_ano_atras",
  };
  return mapa[filtro] ?? "este_mes";
};

export const useBossData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (filtro?: string, fechaInicio?: Date, fechaFin?: Date) => {
    setLoading(true);
    setError(null);

    let params: any = {};

    if (filtro === "RANGO_PERSONALIZADO" && fechaInicio && fechaFin) {
      params.fecha_inicio = fechaInicio.toISOString();
      params.fecha_fin = fechaFin.toISOString();
      params.es_rango = "true";
    } else if (filtro) {
      // Normalizar el filtro rápido a minúsculas con guión bajo
      params.filtro = normalizarFiltro(filtro);
    } else {
      params.filtro = "este_mes";
    }

    console.log("📡 Parámetros enviados:", params);

    try {
      const response = await apiClient.get("/analiticas/dashboard", { params });
      console.log("✅ Datos recibidos:", response.data);
      setData(response.data);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};