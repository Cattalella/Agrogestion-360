import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 TIPOS
// ============================================================
export type CategoriaGeneral = 'insumo' | 'alimento';
export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface SolicitudCompra {
    id: number;
    categoria_general: CategoriaGeneral;
    fecha_propuesta: string;
    cantidad: number;
    motivo: string;
    fecha_vencimiento?: string;
    estado_sol: EstadoSolicitud;
    ejecutada: boolean;
    fecha_creacion: string;
    hora_creacion: string;
    usuario: string;
    tipo_insumo?: string;
    categoria_insumo?: 'fertilizante' | 'herramienta' | 'empaque' | '';
    tipo_alimento?: string;
    especie_destino?: 'cerdos' | 'peces' | 'ganado' | 'gallinas' | '';
    unidad_medida?: string;
    proveedor?: string;
    categoria_alimento?: string;
    eliminada: boolean;
    motivo_eliminacion?: string;
}

export interface ComprasStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
}

type Vista = 'lista' | 'formulario';

// ============================================================
// 📌 UTILIDADES
// ============================================================
const diasParaVencer = (fechaVencimiento: string): number => {
    const hoy = new Date();
    const vence = new Date(fechaVencimiento);
    const diffMs = vence.getTime() - hoy.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const verificarAlertas = (solicitudes: SolicitudCompra[]): SolicitudCompra[] => {
    return solicitudes.filter(s => {
        if (!s.fecha_vencimiento || s.eliminada) return false;
        const dias = diasParaVencer(s.fecha_vencimiento);
        return dias <= 30 && dias >= 0;
    });
};

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useRegistrarCompra = () => {

    const [listaSolicitudes, setListaSolicitudes] = useState<SolicitudCompra[]>([]);
    const [cargando, setCargando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [tipoSeleccionado, setTipoSeleccionado] = useState<CategoriaGeneral>('insumo');
    const [solicitudAEditar, setSolicitudAEditar] = useState<SolicitudCompra | null>(null);
    const [alertasVencimiento, setAlertasVencimiento] = useState<SolicitudCompra[]>([]);

    // ============================================================
    // CARGAR SOLICITUDES DEL BACKEND
    // ============================================================
    const cargarSolicitudes = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/inventario/solicitudes');
            setListaSolicitudes(respuesta.data);
            console.log('✅ Solicitudes cargadas:', respuesta.data.length);
        } catch (error) {
            console.error("❌ Error al cargar solicitudes:", error);
        } finally {
            setCargando(false);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        cargarSolicitudes();
    }, []);

    // Actualizar alertas cuando cambia la lista
    useEffect(() => {
        setAlertasVencimiento(verificarAlertas(listaSolicitudes));
    }, [listaSolicitudes]);

    // ============================================================
    // 🆕 CALCULAR STATS PARA LA CARD (CORREGIDO)
    // ============================================================
    const calcularStats = (): ComprasStats => {
        const solicitudesVisibles = listaSolicitudes.filter(s => !s.eliminada);
        
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        
        const comprasMes = solicitudesVisibles.filter(s => {
            const fecha = new Date(s.fecha_creacion);
            return fecha >= inicioMes && s.estado_sol === 'Aprobada';
        }).length;

        const pendientes = solicitudesVisibles.filter(s => 
            s.estado_sol === 'Pendiente'
        ).length;

        return {
            tipo1: "INSUMOS MES",
            cantidad1: comprasMes,
            tipo2: "PENDIENTES",
            cantidad2: pendientes
        };
    };

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
    const abrirModal = () => {
        setVista('lista');
        setSolicitudAEditar(null);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setSolicitudAEditar(null);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: Vista) => {
        setVista(nuevaVista);
    };

    // ============================================================
    // CREAR SOLICITUD (BACKEND) - SOLO PARA PEDIR
    // ============================================================
    const crearSolicitud = async (
        datos: any,
        cerrar: boolean = true
    ) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                categoria_general: datos.categoria_general,
                fecha_compra: datos.fechaPropuesta || datos.fecha_propuesta,
                cantidad: datos.cantidad,
                motivo: datos.motivo,
                fecha_vencimiento: datos.fechaVencimiento || datos.fecha_vencimiento || null,
                proveedor: datos.proveedor || null,
                tipo_insumo: datos.tipoInsumo || datos.tipo_insumo || null,
                categoria_insumo: datos.categoriaInsumo || datos.categoria_insumo || null,
                tipo_alimento: datos.tipoAlimento || datos.tipo_alimento || null,
                especie_destino: datos.especieDestino || datos.especie_destino || null,
                unidad_medida: datos.unidadMedida || datos.unidad_medida || null,
                usuario: datos.usuario || "Admin",
            };

            console.log('📤 Enviando a backend (Solicitud Compra):', datosParaBackend);
            
            await apiClient.post('/inventario/solicitudes', datosParaBackend);
            
            await cargarSolicitudes();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al crear solicitud:", error);
            alert(error.response?.data?.mensaje || "Error al crear solicitud");
            return false;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // 🆕 EJECUTAR COMPRA REAL (con todos los datos del formulario)
    // ============================================================
    const ejecutarCompraReal = async (datosCompra: any) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_solicitud: datosCompra.id_solicitud,
                fecha_compra_real: datosCompra.fecha_compra_real,
                numero_lote: datosCompra.numero_lote,
                cantidad_real: datosCompra.cantidad_real,
                precio_unitario: datosCompra.precio_unitario,
                precio_total: datosCompra.precio_total,
                factura: datosCompra.factura,
                fecha_vencimiento: datosCompra.fecha_vencimiento,
                proveedor_real: datosCompra.proveedor_real,
                observaciones: datosCompra.observaciones,
                tipo: datosCompra.tipo,
                nombre_producto: datosCompra.nombre_producto,
                unidad_medida: datosCompra.unidad_medida,
            };

            console.log('📦 Ejecutando compra real:', datosParaBackend);
            
            const response = await apiClient.post('/inventario/compras/ejecutar', datosParaBackend);
            
            await cargarSolicitudes();
            
            return response.data;
        } catch (error: any) {
            console.error("❌ Error al ejecutar compra real:", error);
            alert(error.response?.data?.mensaje || "Error al registrar la compra");
            throw error;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // EJECUTAR COMPRA (SOLO ID - versión simple)
    // ============================================================
    const ejecutarCompra = async (id: number) => {
        const solicitud = listaSolicitudes.find(s => s.id === id);
        if (!solicitud) return false;
        
        if (solicitud.estado_sol !== 'Aprobada') {
            alert("Solo puedes ejecutar una compra si la solicitud fue aprobada por el dueño.");
            return false;
        }
        
        try {
            await apiClient.patch(`/inventario/solicitudes/${id}/ejecutar`);
            await cargarSolicitudes();
            return true;
        } catch (error) {
            console.error("❌ Error al ejecutar compra:", error);
            return false;
        }
    };

    // ============================================================
    // ELIMINAR SOLICITUD
    // ============================================================
    const eliminarSolicitud = async (id: number, motivo: string) => {
        if (!motivo.trim()) {
            alert("Debes ingresar un motivo para eliminar la solicitud.");
            return false;
        }
        
        try {
            await apiClient.delete(`/inventario/solicitudes/${id}`, {
                data: { motivo_eliminacion: motivo }
            });
            await cargarSolicitudes();
            return true;
        } catch (error) {
            console.error("❌ Error al eliminar solicitud:", error);
            return false;
        }
    };

    // ============================================================
    // CAMBIAR ESTADO (APROBAR/RECHAZAR) - SOLO DUEÑO
    // ============================================================
    const cambiarEstado = async (id: number, nuevoEstado: EstadoSolicitud) => {
        try {
            await apiClient.patch(`/inventario/solicitudes/${id}/estado`, {
                estado: nuevoEstado
            });
            
            setListaSolicitudes(prev =>
                prev.map(s => s.id === id ? { ...s, estado_sol: nuevoEstado } : s)
            );
            return true;
        } catch (error) {
            console.error("❌ Error al cambiar estado:", error);
            return false;
        }
    };

    // ============================================================
    // FILTROS
    // ============================================================
    const solicitudesVisibles = listaSolicitudes.filter(s => !s.eliminada);
    const solicitudesPendientes = solicitudesVisibles.filter(s => s.estado_sol === 'Pendiente');
    const solicitudesAprobadas = solicitudesVisibles.filter(s => s.estado_sol === 'Aprobada');

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        listaSolicitudes,
        solicitudesVisibles,
        solicitudesPendientes,
        solicitudesAprobadas,
        alertasVencimiento,
        cargando,
        loading: cargando,
        isModalOpen,
        vista,
        tipoSeleccionado,
        solicitudAEditar,
        setSolicitudAEditar,
        setVista,
        cambiarVista,
        setTipoSeleccionado,
        
        stats: calcularStats(),
        
        abrirModal,
        cerrarModal,
        crearSolicitud,
        guardarCompra: crearSolicitud,
        ejecutarCompra,
        ejecutarCompraReal,
        eliminarSolicitud,
        cambiarEstado,
        recargarLista: cargarSolicitudes,
    };
};