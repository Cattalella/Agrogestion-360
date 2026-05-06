import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

// ============================================================
// 📌 TIPOS
// ============================================================
export interface FotoEvidencia {
    id: number;
    url: string;
    fecha: string;
    like?: boolean;
    origen?: 'consumo' | 'trabajo' | 'general' | 'pago_firma';
    id_referencia?: number;
    id_admin?: number;
    admin?: {
        id_persona: number;
        nombre_completo: string;
        nombre_usuario: string;
    };
    created_at?: string;
}

interface ModalConfig {
    abierto: boolean;
    mensaje: string;
    accion: () => void;
}

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useEvidencias = () => {
    const [listasFotos, setListasFotos] = useState<FotoEvidencia[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [modalConfig, setModalConfig] = useState<ModalConfig>({
        abierto: false,
        mensaje: "",
        accion: () => {}
    });

    // ============================================================
    // 📌 CARGAR FOTOS DESDE EL BACKEND
    // ============================================================
    const cargarFotos = useCallback(async () => {
        console.log('🔄 [cargarFotos] Iniciando carga de fotos...');
        setCargando(true);
        setError(null);
        try {
            const response = await apiClient.get('/evidencias');
            console.log('📡 [cargarFotos] Respuesta del backend:', response.data);

            const fotosFormateadas = response.data.map((f: any) => ({
                ...f,
                fecha: new Date(f.fecha).toLocaleDateString()
            }));

            console.log(`📸 [cargarFotos] ${fotosFormateadas.length} fotos cargadas`);
            setListasFotos(fotosFormateadas);
        } catch (err: any) {
            console.error('❌ [cargarFotos] Error:', err);
            setError(err.response?.data?.message || 'Error al cargar las fotos');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarFotos();
    }, [cargarFotos]);

    // ============================================================
    // 📌 SUBIR NUEVA FOTO
    // 🔧 CORREGIDO: lee id_referencia (no idReferencia) del objeto FotoEvidencia
    // ============================================================
    const manejarSubida = async (nuevaFoto: FotoEvidencia) => {
        console.log('📤 [manejarSubida] Subiendo foto:', {
            url: nuevaFoto.url,
            origen: nuevaFoto.origen,
            id_referencia: nuevaFoto.id_referencia  // ← nombre correcto
        });

        try {
            const response = await apiClient.post('/evidencias', {
                url: nuevaFoto.url,
                origen: nuevaFoto.origen || 'general',
                idReferencia: nuevaFoto.id_referencia  // ← backend espera idReferencia en el body
            });

            console.log('✅ [manejarSubida] Respuesta del backend:', response.data);

            await cargarFotos();
            console.log('✅ [manejarSubida] Fotos actualizadas');
        } catch (err: any) {
            console.error('❌ [manejarSubida] Error subiendo foto:', err);
            setError(err.response?.data?.message || 'Error al subir la foto');
            alert('Error al subir la foto. Intenta de nuevo.');
        }
    };

    // ============================================================
    // 📌 ELIMINAR UNA FOTO
    // ============================================================
    const eliminarFoto = async (id: number) => {
        console.log(`🗑️ [eliminarFoto] Eliminando foto ID: ${id}`);
        try {
            await apiClient.delete(`/evidencias/${id}`);
            setListasFotos(prev => prev.filter(f => f.id !== id));
            console.log(`✅ [eliminarFoto] Foto ID ${id} eliminada`);
        } catch (err: any) {
            console.error(`❌ [eliminarFoto] Error:`, err);
            setError(err.response?.data?.message || 'Error al eliminar la foto');
            alert('Error al eliminar la foto.');
        }
    };

    // ============================================================
    // 📌 ELIMINAR TODAS LAS FOTOS
    // ============================================================
    const eliminarTodasFotos = async () => {
        console.log('🗑️📸 [eliminarTodasFotos] Eliminando todas las fotos...');
        try {
            await apiClient.delete('/evidencias');
            setListasFotos([]);
            console.log('✅ [eliminarTodasFotos] Todas eliminadas');
        } catch (err: any) {
            console.error('❌ [eliminarTodasFotos] Error:', err);
            setError(err.response?.data?.message || 'Error al eliminar las fotos');
            alert('Error al eliminar todas las fotos.');
        }
    };

    // ============================================================
    // 📌 DAR/QUITAR LIKE (boss) + ACTUALIZAR PAGO ASOCIADO
    // 🔧 CORREGIDO: usa foto.id_referencia correctamente
    // ============================================================
    const toggleLike = async (id: number) => {
        console.log(`❤️ [toggleLike] Cambiando like para foto ID: ${id}`);

        const foto = listasFotos.find(f => f.id === id);
        const nuevoLike = !foto?.like;

        // Optimistic update
        setListasFotos(prev => prev.map(f =>
            f.id === id ? { ...f, like: nuevoLike } : f
        ));

        try {
            // 1. Actualizar like en backend
            const response = await apiClient.patch(`/evidencias/${id}/like`);
            console.log('✅ [toggleLike] Like actualizado:', response.data);

            // 2. Si es pago_firma y tiene id_referencia → actualizar estado del pago
            if (foto?.origen === 'pago_firma' && foto.id_referencia) {
                const nuevoEstadoPago = nuevoLike ? 'Pagado con firma' : 'Pendiente de firma';
                console.log(`📝 [toggleLike] Actualizando pago #${foto.id_referencia} → "${nuevoEstadoPago}"`);

                try {
                    await apiClient.put(`/trabajadores/pagos/${foto.id_referencia}`, {
                        estado_pago: nuevoEstadoPago
                    });
                    console.log(`✅ [toggleLike] Pago #${foto.id_referencia} → "${nuevoEstadoPago}"`);
                } catch (err) {
                    console.error(`❌ Error al actualizar pago ${foto.id_referencia}:`, err);
                }
            } else if (foto?.origen === 'pago_firma' && !foto.id_referencia) {
                // 🔧 Log de diagnóstico si falta id_referencia
                console.warn(`⚠️ [toggleLike] Foto ${id} es pago_firma pero no tiene id_referencia. No se puede actualizar el pago.`);
            }

            // 3. Sincronizar con respuesta del backend
            const fotoActualizada = {
                ...response.data,
                fecha: new Date(response.data.fecha).toLocaleDateString()
            };
            setListasFotos(prev => prev.map(f =>
                f.id === id ? fotoActualizada : f
            ));

            // 4. Disparar eventos para recargar cards (misma pestaña)
            if (foto?.origen === 'pago_firma') {
                console.log('🔄 [toggleLike] Disparando eventos recargar-pagos y recargar-trabajos...');
                window.dispatchEvent(new CustomEvent('recargar-pagos'));
                window.dispatchEvent(new CustomEvent('recargar-trabajos'));
            }

        } catch (err: any) {
            console.error('❌ [toggleLike] Error:', err);
            // Revertir optimistic update
            setListasFotos(prev => prev.map(f =>
                f.id === id ? { ...f, like: !nuevoLike } : f
            ));
            setError(err.response?.data?.message || 'Error al actualizar el like');
            alert('Error al dar like. Intenta de nuevo.');
        }
    };

    // ============================================================
    // 📌 MODALES
    // ============================================================
    const abrirModalBorrarTodo = () => {
        setModalConfig({
            abierto: true,
            mensaje: "Vas a eliminar todas las fotos de evidencia. Esta acción no se puede deshacer.",
            accion: async () => {
                await eliminarTodasFotos();
                cerrarModal();
            }
        });
    };

    const abrirModalBorrarUna = (id: number) => {
        setModalConfig({
            abierto: true,
            mensaje: "¿Eliminar esta foto de evidencia permanentemente?",
            accion: async () => {
                await eliminarFoto(id);
                cerrarModal();
            }
        });
    };

    const cerrarModal = () => {
        setModalConfig(prev => ({ ...prev, abierto: false }));
    };

    // ============================================================
    // 📌 RECARGAR
    // ============================================================
    const recargar = async () => {
        await cargarFotos();
    };

    return {
        listasFotos,
        cargando,
        error,
        modalConfig,
        manejarSubida,
        abrirModalBorrarTodo,
        abrirModalBorrarUna,
        cerrarModal,
        toggleLike,
        recargar
    };
};