// src/hooks/useBossData.ts
import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

export const useBossData = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (filtro?: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const params = filtro && filtro !== "RESETEAR" ? { filtro } : {};
            const response = await apiClient.get("/reportes/dashboard", { params });
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