import { useState, useEffect } from 'react';

// ============================================================
// 📌 TIPOS
// ============================================================
export type FotoEvidencia = {
    id: number;
    url: string;
    fecha: string;
    like?: boolean;
    origen?: 'consumo' | 'trabajo' | 'general' | 'pago_firma';
    idReferencia?: number;
};

// ============================================================
// 📌 UTILIDADES DE LOCALSTORAGE
// ============================================================

const STORAGE_KEY = 'fotos_evidencias';

export const obtenerFotos = (): FotoEvidencia[] => {
    const fotos = localStorage.getItem(STORAGE_KEY);
    return fotos ? JSON.parse(fotos) : [];
};

export const guardarFotos = (fotos: FotoEvidencia[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fotos));
};

// ============================================================
// 📌 ESTADO GLOBAL (SINGLETON)
// ============================================================

// Variable global para almacenar las fotos fuera del hook
let fotosGlobal: FotoEvidencia[] = [];
let suscriptores: ((fotos: FotoEvidencia[]) => void)[] = [];

const notificarCambio = () => {
    suscriptores.forEach(callback => callback([...fotosGlobal]));
};

// Función para agregar foto globalmente
export const agregarFotoGlobal = (nuevaFoto: FotoEvidencia) => {
    fotosGlobal = [nuevaFoto, ...fotosGlobal];
    guardarFotos(fotosGlobal);
    notificarCambio();
};

// Función para agregar foto desde base64
export const agregarFotoDesdeBase64Global = (
    base64: string,
    origen: 'consumo' | 'trabajo' | 'general' | 'pago_firma' = 'general',
    idReferencia?: number
) => {
    const nuevaFoto: FotoEvidencia = {
        id: Date.now(),
        url: base64,
        fecha: new Date().toLocaleDateString(),
        like: false,
        origen,
        idReferencia
    };
    agregarFotoGlobal(nuevaFoto);
};

// Función para eliminar foto globalmente
export const eliminarFotoGlobal = (id: number) => {
    fotosGlobal = fotosGlobal.filter(f => f.id !== id);
    guardarFotos(fotosGlobal);
    notificarCambio();
};

// Función para eliminar todas las fotos
export const eliminarTodasFotosGlobal = () => {
    fotosGlobal = [];
    guardarFotos(fotosGlobal);
    notificarCambio();
};

// Función para toggle like
export const toggleLikeGlobal = (id: number) => {
    fotosGlobal = fotosGlobal.map(f =>
        f.id === id ? { ...f, like: !f.like } : f
    );
    guardarFotos(fotosGlobal);
    notificarCambio();
};

// ============================================================
// 📌 HOOK PARA SUSCRIBIRSE AL ESTADO GLOBAL
// ============================================================

export const useFotosStorage = () => {
    const [fotos, setFotos] = useState<FotoEvidencia[]>(fotosGlobal);

    // Cargar fotos al iniciar si están vacías
    useEffect(() => {
        if (fotosGlobal.length === 0) {
            fotosGlobal = obtenerFotos();
        }
        setFotos(fotosGlobal);
    }, []);

    // Suscribirse a cambios globales
    useEffect(() => {
        const callback = (nuevasFotos: FotoEvidencia[]) => {
            setFotos(nuevasFotos);
        };
        suscriptores.push(callback);
        return () => {
            suscriptores = suscriptores.filter(cb => cb !== callback);
        };
    }, []);

    // Funciones que usan las globales
    const agregarFoto = (nuevaFoto: FotoEvidencia) => {
        agregarFotoGlobal(nuevaFoto);
    };

    const agregarFotoDesdeBase64 = (
        base64: string,
        origen: 'consumo' | 'trabajo' | 'general' | 'pago_firma' = 'general',
        idReferencia?: number
    ) => {
        agregarFotoDesdeBase64Global(base64, origen, idReferencia);
    };

    const eliminarFoto = (id: number) => {
        eliminarFotoGlobal(id);
    };

    const eliminarTodasFotos = () => {
        eliminarTodasFotosGlobal();
    };

    const toggleLike = (id: number) => {
        toggleLikeGlobal(id);
    };

    return {
        fotos,
        cargando: false,
        agregarFoto,
        agregarFotoDesdeBase64,
        eliminarFoto,
        eliminarTodasFotos,
        toggleLike,
        getFotosPorOrigen: (origen: 'consumo' | 'trabajo' | 'general' | 'pago_firma') => {
            return fotos.filter(f => f.origen === origen);
        },
        recargar: () => {
            fotosGlobal = obtenerFotos();
            notificarCambio();
        }
    };
};