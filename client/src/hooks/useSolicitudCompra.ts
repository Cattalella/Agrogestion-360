import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

export type TipoSolicitud = 'insumo' | 'alimento';
export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Completada';
export type CategoriaInsumo = 'fertilizante' | 'herramienta' | 'empaque' | 'otro';
export type EspecieDestino = 'cerdos' | 'peces' | 'ganado' | 'gallinas';
export type UnidadMedida = 'kg' | 'litros' | 'sacos' | 'unidades' | 'toneladas';

export interface SolicitudCompra {
    id_solicitud: number;
    tipo: TipoSolicitud;
    fecha_compra: string;
    cantidad: number;
    unidad_medida: UnidadMedida;
    motivo: string;
    estado_sol: EstadoSolicitud;
    createdAt: string;
    usuario?: string;
    tipoInsumo?: string;
    categoriaInsumo?: CategoriaInsumo;
    fechaVencimiento?: string;
    tipoAlimento?: string;
    especieDestino?: EspecieDestino;
    proveedor?: string;
    categoriaAlimento?: string;
}

type Vista = 'lista' | 'formulario' | 'detalle';

export const useSolicitudCompra = () => {
    const [solicitudes, setSolicitudes] = useState<SolicitudCompra[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoSolicitud>('insumo');
    const [solicitudAEditar, setSolicitudAEditar] = useState<SolicitudCompra | null>(null);
    const [cargando, setCargando] = useState(false);

    const cargarSolicitudes = async () => {
        setCargando(true);
        try {
            // Nota: El controlador actual no tiene un GET específico para solicitudes solas, 
            // pero podemos obtenerlas a través de un endpoint que crearemos o adaptaremos.
            // Por ahora, asumimos que obtendremos las solicitudes pendientes/activas.
            const respuesta = await apiClient.get('/inventario/solicitudes');
            setSolicitudes(respuesta.data);
        } catch (error) {
            console.error("Error al cargar solicitudes:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            // cargarSolicitudes(); // Descomentar cuando el endpoint esté listo
        }
    }, [isModalOpen]);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setSolicitudAEditar(null);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: Vista) => setVista(nuevaVista);

    const crearSolicitud = async (datos: any) => {
        setCargando(true);
        try {
            // Mapeo de campos del frontend a lo que espera el backend
            const payload = {
                nombre_insumo: datos.tipo === 'insumo' ? datos.tipoInsumo : datos.tipoAlimento,
                unidad_medida: datos.unidadMedida,
                categoria: datos.tipo === 'insumo' ? datos.categoriaInsumo : 'alimento',
                especie_destino: datos.especieDestino,
                cantidad: datos.cantidad,
                fecha_compra_propuesta: datos.fechaPropuesta,
                motivo: datos.motivo,
                proveedor: datos.proveedor
            };

            await apiClient.post('/inventario/solicitudes', payload);
            await cargarSolicitudes();
            setVista('lista');
            return true;
        } catch (error) {
            console.error("Error al crear solicitud:", error);
            return false;
        } finally {
            setCargando(false);
        }
    };

    const procesarSolicitud = async (id: number, estado: EstadoSolicitud, observaciones?: string) => {
        try {
            await apiClient.patch(`/inventario/solicitudes/${id}/procesar`, { estado, observaciones });
            await cargarSolicitudes();
        } catch (error) {
            console.error("Error al procesar solicitud:", error);
        }
    };

    const solicitudesPendientes = solicitudes.filter(s => s.estado_sol === 'Pendiente');
    const solicitudesAprobadas = solicitudes.filter(s => s.estado_sol === 'Aprobada');

    return {
        solicitudes,
        solicitudesPendientes,
        solicitudesAprobadas,
        isModalOpen,
        vista,
        tipoSeleccionado,
        solicitudAEditar,
        cargando,
        setVista,
        setTipoSeleccionado,
        setSolicitudAEditar,
        abrirModal,
        cerrarModal,
        cambiarVista,
        crearSolicitud,
        procesarSolicitud,
        cambiarEstadoSolicitud: procesarSolicitud,
    };
};