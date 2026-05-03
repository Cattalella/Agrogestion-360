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
// 📌 UTILIDADES DE LOCALSTORAGE (CON FILTRO DE PESO)
// ============================================================

const STORAGE_KEY = 'fotos_evidencias';

export const obtenerFotos = (): FotoEvidencia[] => {
    try {
        const fotos = localStorage.getItem(STORAGE_KEY);
        return fotos ? JSON.parse(fotos) : [];
    } catch (e) {
        return [];
    }
};

export const guardarFotos = (fotos: FotoEvidencia[]) => {
    try {
        // 🚨 SOLUCIÓN AL QUOTA EXCEEDED:
        // Solo guardamos en el disco duro las URLs que ya están en la nube (http).
        // Las fotos en Base64 son demasiado pesadas para el localStorage.
        const fotosLivianas = fotos.filter(f => f.url.startsWith('http'));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fotosLivianas));
    } catch (e) {
        console.error("Error al guardar en localStorage:", e);
    }
};

// ============================================================
// 📌 ESTADO GLOBAL (SINGLETON)
// ============================================================

let fotosGlobal: FotoEvidencia[] = [];
let suscriptores: ((fotos: FotoEvidencia[]) => void)[] = [];

const notificarCambio = () => {
    suscriptores.forEach(callback => callback([...fotosGlobal]));
};

// --- FUNCIÓN DE SINCRONIZACIÓN CON EL BACKEND (CORREGIDA) ---
export const sincronizarFotosDesdeBackend = (fotosBackend: any[]) => {
    if (!fotosBackend || !Array.isArray(fotosBackend)) return;

    const fotosFormateadas: FotoEvidencia[] = fotosBackend
        .filter(f => f.evidencia_url)
        .map(f => ({
            id: f.id_trabajo || Date.now(),
            url: f.evidencia_url,
            fecha: f.fecha_inicio || new Date().toLocaleDateString(),
            origen: 'trabajo' as const,
            like: false
        }));

    // 🔧 CORREGIDO: Agregar sin duplicados, no reemplazar
    const nuevasFotos = fotosFormateadas.filter(f =>
        !fotosGlobal.some(existente => existente.url === f.url)
    );

    if (nuevasFotos.length > 0) {
        fotosGlobal = [...nuevasFotos, ...fotosGlobal];
        guardarFotos(fotosGlobal);
        notificarCambio();
        console.log(`📸 [Sync] ${nuevasFotos.length} nuevas fotos agregadas al carrusel`);
    }
};

// --- AGREGAR FOTO (RAM + DISCO SI ES URL) ---
export const agregarFotoGlobal = (nuevaFoto: FotoEvidencia) => {
    // Evitar duplicados por URL
    if (nuevaFoto.url.startsWith('http') && fotosGlobal.some(f => f.url === nuevaFoto.url)) {
        console.log("📸 [Sync] Foto ya existe, omitiendo duplicado");
        return;
    }

    fotosGlobal = [nuevaFoto, ...fotosGlobal];

    // Si la foto ya es una URL de internet, la guardamos para que no se pierda al recargar
    if (nuevaFoto.url.startsWith('http')) {
        guardarFotos(fotosGlobal);
    }

    notificarCambio();
};

// --- AGREGAR DESDE COMPUTADORA (SOLO RAM) ---
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

// --- ELIMINAR ---
export const eliminarFotoGlobal = (id: number) => {
    fotosGlobal = fotosGlobal.filter(f => f.id !== id);
    guardarFotos(fotosGlobal);
    notificarCambio();
};

export const eliminarTodasFotosGlobal = () => {
    fotosGlobal = [];
    guardarFotos(fotosGlobal);
    notificarCambio();
};

// ============================================================
// 📌 TOGGLE LIKE — Lógica central de aprobación de pagos
// ============================================================

export const toggleLikeGlobal = async (id: number) => {
    const foto = fotosGlobal.find(f => f.id === id);
    if (!foto) return;

    const nuevoLike = !foto.like;

    // 1. Actualizar estado local inmediatamente (optimistic update)
    fotosGlobal = fotosGlobal.map(f =>
        f.id === id ? { ...f, like: nuevoLike } : f
    );
    guardarFotos(fotosGlobal);
    notificarCambio();

    // 2. Si la foto está vinculada a un pago con firma, sincronizar con el backend
    if (foto.origen === 'pago_firma' && foto.idReferencia) {
        try {
            const { default: apiClient } = await import('../api/apiClient');

            if (nuevoLike) {
                // ✅ Boss aprueba → marcar como "Pagado con firma"
                await apiClient.put(`/trabajadores/pagos/${foto.idReferencia}`, {
                    estado_pago: 'Pagado con firma'
                });
                console.log(`✅ Pago #${foto.idReferencia} → "Pagado con firma"`);
            } else {
                // ↩️ Boss quita like → revertir a "Pendiente de firma"
                await apiClient.put(`/trabajadores/pagos/${foto.idReferencia}`, {
                    estado_pago: 'Pendiente de firma'
                });
                console.log(`↩️ Pago #${foto.idReferencia} → "Pendiente de firma"`);
            }

            // 3. Notificar a useRegistrarPagos para que recargue las cards del admin
            window.dispatchEvent(new CustomEvent('recargar-pagos'));

        } catch (error) {
            console.error('❌ Error al actualizar estado del pago:', error);

            // Revertir el like en local si el backend falló
            fotosGlobal = fotosGlobal.map(f =>
                f.id === id ? { ...f, like: foto.like } : f
            );
            guardarFotos(fotosGlobal);
            notificarCambio();
        }
    }
};

// ============================================================
// 📌 HOOK PARA SUSCRIBIRSE AL ESTADO GLOBAL
// ============================================================

export const useFotosStorage = () => {
    const [fotos, setFotos] = useState<FotoEvidencia[]>(fotosGlobal);

    useEffect(() => {
        if (fotosGlobal.length === 0) {
            fotosGlobal = obtenerFotos();
        }
        setFotos(fotosGlobal);
    }, []);

    useEffect(() => {
        const callback = (nuevasFotos: FotoEvidencia[]) => {
            setFotos(nuevasFotos);
        };
        suscriptores.push(callback);
        return () => {
            suscriptores = suscriptores.filter(cb => cb !== callback);
        };
    }, []);

    return {
        fotos,
        cargando: false,
        agregarFoto: agregarFotoGlobal,
        agregarFotoDesdeBase64: agregarFotoDesdeBase64Global,
        eliminarFoto: eliminarFotoGlobal,
        eliminarTodasFotos: eliminarTodasFotosGlobal,
        toggleLike: toggleLikeGlobal,
        sincronizarConServidor: sincronizarFotosDesdeBackend,
        getFotosPorOrigen: (origen: 'consumo' | 'trabajo' | 'general' | 'pago_firma') => {
            return fotos.filter(f => f.origen === origen);
        },
        recargar: () => {
            fotosGlobal = obtenerFotos();
            notificarCambio();
        }
    };
};