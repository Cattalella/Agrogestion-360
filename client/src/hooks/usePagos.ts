import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface ResumenPagos {
  totalPagado: number;
  totalPagos: number;
}

export function usePagos() {
  const [resumen, setResumen] = useState<ResumenPagos>({
    totalPagado: 0,
    totalPagos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<ResumenPagos>('/trabajadores/pagos/resumen')
      .then((res) => setResumen(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { ...resumen, loading };
}