// src/hooks/useBossData.ts
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const useBossData = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (filtro?: string) => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem("token");
            
            let url = `${API_URL}/boss/dashboard`;
            if (filtro && filtro !== "RESETEAR") {
                url += `?filtro=${encodeURIComponent(filtro)}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }
            
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar datos");
            console.error("Error fetching boss data:", err);
            // No lanzamos el error, solo lo guardamos
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
};