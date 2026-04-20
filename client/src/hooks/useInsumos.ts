import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface InsumoCritico {
  nombre: string;
  unidad: string;
  stock_minimo: number;
  stock_actual: number;
}

export function useInsumos() {
  const [totalCriticos, setTotalCriticos] = useState<number>(0);
  const [listaCriticos, setListaCriticos] = useState<InsumoCritico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<number>('/trabajadores/insumos/criticos/count'),
      apiClient.get<InsumoCritico[]>('/trabajadores/insumos/criticos/lista'),
    ])
      .then(([countRes, listaRes]) => {
        setTotalCriticos(countRes.data);
        setListaCriticos(listaRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { totalCriticos, listaCriticos, loading };
}