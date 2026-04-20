import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface TrabajadorActivo {
  nombre_completo: string;
}

export function useTrabajadores() {
  const [totalActivos, setTotalActivos] = useState<number>(0);
  const [listaNombres, setListaNombres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<number>('/trabajadores/activos/count'),
      apiClient.get<TrabajadorActivo[]>('/trabajadores/activos/lista'),
    ])
      .then(([countRes, listaRes]) => {
        setTotalActivos(countRes.data);
        setListaNombres(listaRes.data.map((t) => t.nombre_completo));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { totalActivos, listaNombres, loading };
}