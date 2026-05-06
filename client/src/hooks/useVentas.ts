import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';

interface Venta {
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
        id_animal: number;
        codigo_local: string;
        raza: string;
        peso_actual: number;
        estado?: string;
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

export const useVentas = () => {
    const [listaVentas, setListaVentas] = useState<Venta[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');
    const [cargando, setCargando] = useState(false);
    const [animalesDisponibles, setAnimalesDisponibles] = useState<any[]>([]);
    
    const [ventaAEditar, setVentaAEditar] = useState<any | null>(null);
    const [modalConfirmacion, setModalConfirmacion] = useState<ModalConfirmacionState>({
        isOpen: false,
        id: null,
        nombre: ''
    });
    const [eliminando, setEliminando] = useState(false);

    const cargarVentas = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/ventas');
            const ventasConAnimal = respuesta.data.map((v: any) => ({
                ...v,
                animal: v.Animal || v.animal
            }));
            setListaVentas(ventasConAnimal);
            console.log('✅ Ventas cargadas:', ventasConAnimal.length);
        } catch (error) {
            console.error('❌ Error al cargar ventas:', error);
        } finally {
            setCargando(false);
        }
    };

    // ✅ Solo animales SANOS pueden ser vendidos
    const cargarAnimalesDisponibles = async () => {
        try {
            const ganado = await apiClient.get('/ganaderia');
            const cerdos = await apiClient.get('/porcicultura/cerdos');
            
            console.log('🐄 Ganado recibido:', ganado.data.length);
            console.log('🐖 Cerdos recibidos:', cerdos.data.length);
            
            const todosAnimales = [
                ...(ganado.data || []).map((a: any) => ({ ...a, tipo: 'GANADO' })),
                ...(cerdos.data || []).map((a: any) => ({ ...a, tipo: 'CERDO' }))
            ];
            
            // ✅ Solo animales SANOS pueden ser vendidos
            const disponibles = todosAnimales.filter((a: any) => {
                const estado = a.estado?.toLowerCase() || '';
                const esSano = estado === 'sano';
                const noVendido = estado !== 'vendido' && estado !== 'muerto';
                const tienePeso = (a.peso_actual || 0) > 0;
                return esSano && noVendido && tienePeso;
            });
            
            console.log('✅ Animales disponibles para vender (sanos):', disponibles.length);
            disponibles.forEach(a => {
                console.log(`   - ${a.codigo_local} (${a.tipo}) - estado: ${a.estado}`);
            });
            setAnimalesDisponibles(disponibles);
        } catch (error) {
            console.error('❌ Error al cargar animales disponibles:', error);
        }
    };

    const esGanadoPorCodigo = (codigoLocal: string): boolean => {
        if (!codigoLocal) return false;
        const upperCode = codigoLocal.toUpperCase();
        return upperCode.startsWith('VA') || 
               upperCode.startsWith('TO') || 
               upperCode.startsWith('NO') || 
               upperCode.startsWith('TE');
    };

    const esCerdoPorCodigo = (codigoLocal: string): boolean => {
        if (!codigoLocal) return false;
        const upperCode = codigoLocal.toUpperCase();
        if (esGanadoPorCodigo(codigoLocal)) return false;
        return upperCode.startsWith('C-') || 
               upperCode.startsWith('C') ||
               upperCode.startsWith('V-') ||
               upperCode.startsWith('V') ||
               upperCode.startsWith('L-') ||
               upperCode.startsWith('L') ||
               upperCode.startsWith('E-') ||
               upperCode.startsWith('E');
    };

    const stats = useMemo((): VentasStats => {
        let ganadosVendidos = 0;
        let cerdosVendidos = 0;

        listaVentas.forEach(venta => {
            const codigoLocal = venta.animal?.codigo_local || '';
            
            if (esGanadoPorCodigo(codigoLocal)) {
                ganadosVendidos++;
            } else if (esCerdoPorCodigo(codigoLocal)) {
                cerdosVendidos++;
            }
        });

        console.log('📊 Ventas stats:', { ganadosVendidos, cerdosVendidos, totalVentas: listaVentas.length });

        return {
            tipo1: "GANADOS VENDIDOS",
            cantidad1: ganadosVendidos,
            tipo2: "CERDOS VENDIDOS",
            cantidad2: cerdosVendidos
        };
    }, [listaVentas]);

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

    const abrirEdicion = (venta: any) => {
        console.log('✏️ Abriendo edición para venta:', venta);
        setVentaAEditar(venta);
        setVista('formulario');
    };

    const cancelarEdicion = () => {
        setVentaAEditar(null);
        setVista('lista');
    };

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
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
            alert('Error al eliminar la venta');
        } finally {
            setEliminando(false);
        }
    };

    const guardarVenta = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_animal: datos.id_animal,
                fecha_venta: datos.fecha_venta,
                peso_venta: datos.peso_venta,
                precio_total: datos.precio_total,
                comprador: datos.comprador,
                num_factura: datos.num_factura || null,
                metodo_pago: datos.metodo_pago,
                observaciones: datos.observaciones || null
            };

            if (ventaAEditar) {
                await apiClient.put(`/ventas/${ventaAEditar.id_venta}`, datosParaBackend);
                console.log('✅ Venta actualizada');
            } else {
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