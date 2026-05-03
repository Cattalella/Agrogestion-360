import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface TrabajadorActivo {
  nombre_completo: string;
}

export function useTrabajadores() {
  const [totalActivos, setTotalActivos] = useState<number>(0);
  const [listaNombres, setListaNombres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [trabajadores, setTrabajadores] = useState<any[]>([]); // Estado para objetos completos

  useEffect(() => {
    Promise.all([
      apiClient.get<number>('/trabajadores/activos/count'),
      apiClient.get<TrabajadorActivo[]>('/trabajadores/activos/lista'),
      apiClient.get('/trabajadores') // Mantenemos la carga completa para el select de pagos
    ])
      .then(([countRes, listaRes, completosRes]) => {
        setTotalActivos(countRes.data);
        setListaNombres(listaRes.data.map((t) => t.nombre_completo));
        setTrabajadores(completosRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { totalActivos, listaNombres, trabajadores, loading };
}