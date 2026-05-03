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
            
            console.log(`📸 [cargarFotos] ${fotosFormateadas.length} fotos cargadas:`, fotosFormateadas);
            setListasFotos(fotosFormateadas);
        } catch (err: any) {
            console.error('❌ [cargarFotos] Error:', err);
            setError(err.response?.data?.message || 'Error al cargar las fotos');
        } finally {
            setCargando(false);
        }
    }, []);

    // Cargar fotos al montar el componente
    useEffect(() => {
        console.log('🔄 [useEffect] Montando hook, cargando fotos iniciales...');
        cargarFotos();
    }, [cargarFotos]);

    // ============================================================
    // 📌 SUBIR NUEVA FOTO (con soporte para origen y referencia)
    // ============================================================
    const manejarSubida = async (nuevaFoto: FotoEvidencia) => {
        console.log('📤 [manejarSubida] Intentando subir foto:', {
            url: nuevaFoto.url,
            origen: nuevaFoto.origen,
            id_referencia: nuevaFoto.id_referencia
        });
        
        try {
            const response = await apiClient.post('/evidencias', {
                url: nuevaFoto.url,
                origen: nuevaFoto.origen || 'general',
                idReferencia: nuevaFoto.id_referencia
            });
            
            console.log('✅ [manejarSubida] Respuesta del backend:', response.data);
            
            const fotoGuardada = {
                ...response.data,
                fecha: new Date(response.data.fecha).toLocaleDateString()
            };
            
            console.log('📸 [manejarSubida] Foto guardada localmente:', fotoGuardada);
            
            // Recargar todas las fotos para asegurar consistencia
            await cargarFotos();
            
            console.log('✅ [manejarSubida] Proceso completado, fotos actualizadas');
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
        console.log(`🗑️ [eliminarFoto] Intentando eliminar foto ID: ${id}`);
        
        try {
            await apiClient.delete(`/evidencias/${id}`);
            console.log(`✅ [eliminarFoto] Foto ID ${id} eliminada del backend`);
            
            // Actualizar estado local
            setListasFotos(prev => {
                const nuevas = prev.filter(f => f.id !== id);
                console.log(`📸 [eliminarFoto] Estado local actualizado. Quedan ${nuevas.length} fotos`);
                return nuevas;
            });
        } catch (err: any) {
            console.error(`❌ [eliminarFoto] Error eliminando foto ${id}:`, err);
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
            console.log('✅ [eliminarTodasFotos] Todas las fotos eliminadas del backend');
            setListasFotos([]);
        } catch (err: any) {
            console.error('❌ [eliminarTodasFotos] Error:', err);
            setError(err.response?.data?.message || 'Error al eliminar las fotos');
            alert('Error al eliminar todas las fotos.');
        }
    };

    // ============================================================
    // 📌 DAR/QUITAR LIKE (solo para el Boss) + ACTUALIZAR PAGO ASOCIADO
    // ============================================================
    const toggleLike = async (id: number) => {
        console.log(`❤️ [toggleLike] Cambiando like para foto ID: ${id}`);
        
        // Buscar la foto antes de actualizar
        const foto = listasFotos.find(f => f.id === id);
        const nuevoLike = !foto?.like;
        
        // 🔥 OPTIMISTIC UPDATE: Cambia el estado inmediatamente en la UI
        setListasFotos(prev => prev.map(f => 
            f.id === id ? { ...f, like: nuevoLike } : f
        ));
        
        try {
            // 1. Actualizar el like en el backend
            const response = await apiClient.patch(`/evidencias/${id}/like`);
            console.log('✅ [toggleLike] Like actualizado:', response.data);
            
            // 2. Si la foto es de tipo pago_firma y tiene id_referencia
            if (foto?.origen === 'pago_firma' && foto.id_referencia) {
                // Determinar el nuevo estado del pago según el like
                const nuevoEstadoPago = nuevoLike ? 'Pagado con firma' : 'Pendiente de firma';
                console.log(`📝 [toggleLike] Actualizando pago ID: ${foto.id_referencia} a "${nuevoEstadoPago}"`);
                
                try {
                    // Actualizar el estado del pago
                    await apiClient.put(`/trabajadores/pagos/${foto.id_referencia}`, {
                        estado_pago: nuevoEstadoPago
                    });
                    console.log(`✅ [toggleLike] Pago ${foto.id_referencia} actualizado a "${nuevoEstadoPago}"`);
                    
                } catch (err) {
                    console.error(`❌ Error al actualizar pago ${foto.id_referencia}:`, err);
                }
            }
            
            // 3. Sincronizar con la respuesta del backend
            const fotoActualizada = {
                ...response.data,
                fecha: new Date(response.data.fecha).toLocaleDateString()
            };
            
            setListasFotos(prev => prev.map(f => 
                f.id === id ? fotoActualizada : f
            ));
            
            // 4. Disparar eventos para recargar pagos y trabajos (siempre que sea pago_firma)
            if (foto?.origen === 'pago_firma') {
                console.log('🔄 [toggleLike] Disparando eventos para recargar pagos y trabajos...');
                window.dispatchEvent(new CustomEvent('recargar-pagos'));
                window.dispatchEvent(new CustomEvent('recargar-trabajos'));
            }
            
        } catch (err: any) {
            console.error('❌ [toggleLike] Error:', err);
            // Revertir el cambio si hay error
            setListasFotos(prev => prev.map(f => 
                f.id === id ? { ...f, like: !nuevoLike } : f
            ));
            setError(err.response?.data?.message || 'Error al actualizar el like');
            alert('Error al dar like. Intenta de nuevo.');
        }
    };

    // ============================================================
    // 📌 MODALES DE CONFIRMACIÓN
    // ============================================================
    const abrirModalBorrarTodo = () => {
        console.log('🔔 [abrirModalBorrarTodo] Abriendo modal de confirmación');
        setModalConfig({
            abierto: true,
            mensaje: "Vas a eliminar todas las fotos de evidencia. Esta acción no se puede deshacer.",
            accion: async () => { 
                console.log('✅ [modal] Confirmada eliminación de todas las fotos');
                await eliminarTodasFotos(); 
                cerrarModal(); 
            }
        });
    };

    const abrirModalBorrarUna = (id: number) => {
        console.log(`🔔 [abrirModalBorrarUna] Abriendo modal para foto ID: ${id}`);
        setModalConfig({
            abierto: true,
            mensaje: "¿Eliminar esta foto de evidencia permanentemente?",
            accion: async () => { 
                console.log(`✅ [modal] Confirmada eliminación de foto ID: ${id}`);
                await eliminarFoto(id); 
                cerrarModal(); 
            }
        });
    };

    const cerrarModal = () => {
        console.log('🔔 [cerrarModal] Cerrando modal');
        setModalConfig(prev => ({ ...prev, abierto: false }));
    };

    // ============================================================
    // 📌 RECARGAR FOTOS (útil después de cambios)
    // ============================================================
    const recargar = async () => {
        console.log('🔄 [recargar] Recargando fotos manualmente...');
        await cargarFotos();
    };

    // ============================================================
    // 📌 RETORNAR TODO LO QUE NECESITA EL COMPONENTE
    // ============================================================
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