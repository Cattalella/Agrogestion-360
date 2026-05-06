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

  const cargarResumen = () => {
    setLoading(true);
    apiClient
      .get<ResumenPagos>('/trabajadores/pagos/resumen')
      .then((res) => setResumen(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Carga inicial
  useEffect(() => {
    cargarResumen();
  }, []);

  // 🔧 CORREGIDO: Escuchar el evento recargar-pagos para que las
  // cards del boss se actualicen cuando el like cambia el estado
  useEffect(() => {
    const handleRecargar = () => {
      console.log('🔄 [usePagos] Evento recargar-pagos recibido — recargando resumen');
      cargarResumen();
    };
    window.addEventListener('recargar-pagos', handleRecargar);
    return () => window.removeEventListener('recargar-pagos', handleRecargar);
  }, []);

  return { ...resumen, loading };
}