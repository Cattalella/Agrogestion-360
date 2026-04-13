// src/utils/storage.ts
import { useState, useEffect } from "react";
import { type FotoEvidencia } from "../components/Carrusel";
import { type SolicitudCompra } from "../hooks/useSolicitudCompra";

export const guardarFotos = (fotos: FotoEvidencia[]) => {
  localStorage.setItem('fotos_evidencia', JSON.stringify(fotos));
  window.dispatchEvent(new Event('fotos_evidencia_actualizadas'));
};

export const obtenerFotos = (): FotoEvidencia[] => {
  const fotos = localStorage.getItem('fotos_evidencia');
  return fotos ? JSON.parse(fotos) : [];
};

export const useFotosStorage = () => {
    const [fotos, setFotos] = useState<FotoEvidencia[]>(obtenerFotos());

    useEffect(() => {
        const syncFotos = () => {
            setFotos(obtenerFotos());
        };

        window.addEventListener("storage", syncFotos);
        window.addEventListener("fotos_evidencia_actualizadas", syncFotos);

        return () => {
            window.removeEventListener("storage", syncFotos);
            window.removeEventListener("fotos_evidencia_actualizadas", syncFotos);
        };
    }, []);

    const actualizarFotos = (nuevasFotos: FotoEvidencia[]) => {
        setFotos(nuevasFotos);
        guardarFotos(nuevasFotos);
    };

    return [fotos, actualizarFotos] as const;
};

// --- SOLICITUDES ---
export const guardarSolicitudes = (solicitudes: SolicitudCompra[]) => {
  localStorage.setItem('solicitudes_compra', JSON.stringify(solicitudes));
  window.dispatchEvent(new Event('solicitudes_compra_actualizadas'));
};

export const obtenerSolicitudes = (): SolicitudCompra[] => {
  const solicitudes = localStorage.getItem('solicitudes_compra');
  return solicitudes ? JSON.parse(solicitudes) : [];
};

export const useSolicitudesStorage = () => {
    const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>(obtenerSolicitudes());

    useEffect(() => {
        const syncSolicitudes = () => {
            setSolicitudes(obtenerSolicitudes());
        };

        window.addEventListener("storage", syncSolicitudes);
        window.addEventListener("solicitudes_compra_actualizadas", syncSolicitudes);

        return () => {
            window.removeEventListener("storage", syncSolicitudes);
            window.removeEventListener("solicitudes_compra_actualizadas", syncSolicitudes);
        };
    }, []);

    const actualizarSolicitudes = (nuevasSolicitudes: SolicitudCompra[]) => {
        setSolicitudes(nuevasSolicitudes);
        guardarSolicitudes(nuevasSolicitudes);
    };

    return [solicitudes, actualizarSolicitudes] as const;
};