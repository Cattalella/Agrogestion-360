import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';

// ============================================================
// 📌 INTERFACES
// ============================================================
export interface Venta {
    id_venta: number;
    id_animal: number;
    fecha_venta: string;
    peso_venta: number;
    precio_total: number;
    comprador: string;
    num_factura?: string;
    metodo_pago: string;
    observaciones?: string;
    animal?: {
        codigo_local: string;
        especie?: { nombre: string };
    };
}

export interface VentasStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
}

interface ModalConfirmacionState {
    isOpen: boolean;
    id: number | null;
    nombre: string;
}

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useVentas = () => {
    const [listaVentas, setListaVentas] = useState<Venta[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');
    const [cargando, setCargando] = useState(false);
    const [animalesDisponibles, setAnimalesDisponibles] = useState<any[]>([]);
    
    // Estado para edición
    const [ventaAEditar, setVentaAEditar] = useState<any | null>(null);
    
    // Estado para modal de confirmación
    const [modalConfirmacion, setModalConfirmacion] = useState<ModalConfirmacionState>({
        isOpen: false,
        id: null,
        nombre: ''
    });
    const [eliminando, setEliminando] = useState(false);

    // ============================================================
    // CARGAR VENTAS
    // ============================================================
    const cargarVentas = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/ventas');
            // Transformar datos para tener un formato consistente
            const ventasTransformadas = respuesta.data.map((v: any) => ({
                id_venta: v.id_venta,
                id_animal: v.id_animal,
                fecha_venta: v.fecha_venta,
                peso_venta: v.peso_venta,
                precio_total: v.precio_total,
                comprador: v.comprador,
                num_factura: v.num_factura,
                metodo_pago: v.metodo_pago,
                observaciones: v.observaciones,
                animal: v.Animal || v.animal,
            }));
            setListaVentas(ventasTransformadas);
            console.log('✅ Ventas cargadas:', ventasTransformadas.length);
        } catch (error) {
            console.error('❌ Error al cargar ventas:', error);
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // CARGAR ANIMALES DISPONIBLES PARA VENDER (SOLO ACTIVOS)
    // ============================================================
    const cargarAnimalesDisponibles = async () => {
        try {
            const ganado = await apiClient.get('/ganaderia');
            const cerdos = await apiClient.get('/porcicultura/cerdos');
            
            // Filtrar solo animales ACTIVOS
            const ganadoActivo = (ganado.data || []).filter((a: any) => 
                a.estado === 'Activo' || a.estado?.nombre === 'Activo' || a.EstadoAni?.nombre === 'Activo'
            );
            const cerdosActivos = (cerdos.data || []).filter((a: any) => 
                a.estado === 'Activo' || a.estado?.nombre === 'Activo' || a.EstadoAni?.nombre === 'Activo'
            );
            
            const todos = [
                ...ganadoActivo.map((a: any) => ({ 
                    ...a, 
                    tipo: 'GANADO',
                    id: a.id_animal || a.id 
                })),
                ...cerdosActivos.map((a: any) => ({ 
                    ...a, 
                    tipo: 'CERDO',
                    id: a.id_animal || a.id 
                }))
            ];
            
            setAnimalesDisponibles(todos);
            console.log('✅ Animales disponibles para vender:', todos.length);
        } catch (error) {
            console.error('❌ Error al cargar animales disponibles:', error);
        }
    };

    useEffect(() => {
        cargarVentas();
        cargarAnimalesDisponibles();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            cargarVentas();
            cargarAnimalesDisponibles();
        }
    }, [isModalOpen]);

    // ============================================================
    // CALCULAR STATS PARA LA CARD
    // ============================================================
    const stats = useMemo((): VentasStats => {
        // Contar ventas por tipo de animal usando el código local
        const ganadosVendidos = listaVentas.filter(v => {
            const codigoLocal = v.animal?.codigo_local || '';
            return codigoLocal.startsWith('VA') || 
                   codigoLocal.startsWith('TO') || 
                   codigoLocal.startsWith('NO') || 
                   codigoLocal.startsWith('TE');
        }).length;
        
        const cerdosVendidos = listaVentas.filter(v => {
            const codigoLocal = v.animal?.codigo_local || '';
            return codigoLocal.startsWith('C') || 
                   codigoLocal.startsWith('V') || 
                   codigoLocal.startsWith('L') || 
                   codigoLocal.startsWith('E');
        }).length;

        console.log('📊 Stats ventas:', { ganadosVendidos, cerdosVendidos });

        return {
            tipo1: "GANADOS VENDIDOS",
            cantidad1: ganadosVendidos,
            tipo2: "CERDOS VENDIDOS",
            cantidad2: cerdosVendidos
        };
    }, [listaVentas]);

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
    const abrirModal = () => {
        setVentaAEditar(null);
        setVista('lista');
        setIsModalOpen(true);
    };
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
        setVentaAEditar(null);
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => {
        setVista(nuevaVista);
        if (nuevaVista === 'lista') {
            setVentaAEditar(null);
        }
    };

    // ============================================================
    // EDICIÓN
    // ============================================================
    const abrirEdicion = (venta: any) => {
        console.log('✏️ Abriendo edición para venta:', venta);
        // Determinar el tipo de animal por el código local
        const codigoLocal = venta.animal?.codigo_local || '';
        const tipoAnimal = codigoLocal.startsWith('C') || codigoLocal.startsWith('V') || codigoLocal.startsWith('L') || codigoLocal.startsWith('E') 
            ? 'CERDO' 
            : 'GANADO';
        
        setVentaAEditar({
            ...venta,
            tipo_animal: tipoAnimal
        });
        setVista('formulario');
    };

    const cancelarEdicion = () => {
        setVentaAEditar(null);
        setVista('lista');
    };

    // ============================================================
    // MODAL DE CONFIRMACIÓN PARA ELIMINAR
    // ============================================================
    const abrirModalEliminar = (id: number, nombre: string) => {
        setModalConfirmacion({ isOpen: true, id, nombre });
    };

    const cerrarModalConfirmacion = () => {
        setModalConfirmacion({ isOpen: false, id: null, nombre: '' });
        setEliminando(false);
    };

    const confirmarEliminar = async () => {
        if (!modalConfirmacion.id) return;
        setEliminando(true);
        try {
            await apiClient.delete(`/ventas/${modalConfirmacion.id}`);
            await cargarVentas();
            await cargarAnimalesDisponibles();
            cerrarModalConfirmacion();
            console.log('✅ Venta eliminada');
        } catch (error) {
            console.error('❌ Error al eliminar venta:', error);
            alert('Error al eliminar la venta');
        } finally {
            setEliminando(false);
        }
    };

    // ============================================================
    // GUARDAR VENTA (CREAR O EDITAR)
    // ============================================================
    const guardarVenta = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_animal: datos.id_animal,
                fecha_venta: datos.fecha_venta,
                peso_venta: parseFloat(datos.peso_venta),
                precio_total: parseFloat(datos.precio_total),
                comprador: datos.comprador,
                num_factura: datos.num_factura || null,
                metodo_pago: datos.metodo_pago,
                observaciones: datos.observaciones || null
            };

            console.log('📤 Datos a enviar (Venta):', datosParaBackend);

            if (ventaAEditar) {
                console.log('✏️ Editando venta:', ventaAEditar.id_venta, datosParaBackend);
                await apiClient.put(`/ventas/${ventaAEditar.id_venta}`, datosParaBackend);
                console.log('✅ Venta actualizada');
            } else {
                console.log('📤 Creando nueva venta:', datosParaBackend);
                await apiClient.post('/ventas', datosParaBackend);
                console.log('✅ Venta creada');
            }
            
            await cargarVentas();
            await cargarAnimalesDisponibles();
            setVentaAEditar(null);
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error('❌ Error al guardar venta:', error);
            alert(error.response?.data?.mensaje || 'Error al guardar la venta');
            return false;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // ACTUALIZAR VENTA (COMPATIBILIDAD)
    // ============================================================
    const actualizarVenta = async (id: number, datos: Partial<Venta>) => {
        try {
            const respuesta = await apiClient.put(`/ventas/${id}`, datos);
            await cargarVentas();
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar:', error);
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        listaVentas,
        animalesDisponibles,
        isModalOpen,
        vista,
        cargando,
        stats,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarVenta,
        actualizarVenta,
        recargarLista: cargarVentas,
        ventaAEditar,
        abrirEdicion,
        cancelarEdicion,
        modalConfirmacion,
        eliminando,
        abrirModalEliminar,
        cerrarModalConfirmacion,
        confirmarEliminar,
    };
};