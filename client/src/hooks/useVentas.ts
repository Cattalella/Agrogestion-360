import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

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
    Animal?: {
        codigo_local: string;
        Especie: { nombre: string };
    };
}

export interface VentasStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
}

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useVentas = () => {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');
    const [cargando, setCargando] = useState(false);
    
    // 🆕 Lista de animales disponibles para vender
    const [animalesDisponibles, setAnimalesDisponibles] = useState<any[]>([]);

    // ============================================================
    // CARGAR VENTAS
    // ============================================================
    const cargarVentas = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/ventas');
            setVentas(respuesta.data);
            console.log('✅ Ventas cargadas:', respuesta.data.length);
        } catch (error) {
            console.error("❌ Error al cargar ventas:", error);
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // 🆕 CARGAR ANIMALES DISPONIBLES PARA VENDER
    // ============================================================
    const cargarAnimalesDisponibles = async () => {
        try {
            // Obtener animales bovinos activos
            const bovinos = await apiClient.get('/ganaderia');
            // Obtener animales porcinos activos
            const porcinos = await apiClient.get('/porcicultura/cerdos');
            
            const todos = [
                ...(bovinos.data || []).map((a: any) => ({ ...a, tipo: 'BOVINO' })),
                ...(porcinos.data || []).map((a: any) => ({ ...a, tipo: 'PORCINO' }))
            ].filter(a => a.estado === 'Activo' || a.EstadoAni?.nombre === 'Activo');
            
            setAnimalesDisponibles(todos);
            console.log('✅ Animales disponibles para vender:', todos.length);
        } catch (error) {
            console.error("❌ Error al cargar animales disponibles:", error);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        cargarVentas();
        cargarAnimalesDisponibles();
    }, []);

    // Refrescar al abrir modal
    useEffect(() => {
        if (isModalOpen) {
            cargarVentas();
            cargarAnimalesDisponibles();
        }
    }, [isModalOpen]);

    // ============================================================
    // 🆕 CALCULAR STATS PARA LA CARD
    // ============================================================
    const calcularStats = (): VentasStats => {
        const ganadosVendidos = ventas.filter(v => 
            v.Animal?.Especie?.nombre === 'Bovino'
        ).length;
        
        const cerdosVendidos = ventas.filter(v => 
            v.Animal?.Especie?.nombre === 'Porcino'
        ).length;

        // 🆕 Calcular total vendido en pesos
        const totalVendido = ventas.reduce((sum, v) => sum + (v.precio_total || 0), 0);
        const totalFormateado = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(totalVendido);

        return {
            tipo1: "GANADOS VENDIDOS",
            cantidad1: ganadosVendidos,
            tipo2: "CERDOS VENDIDOS",
            cantidad2: cerdosVendidos
        };
    };

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nueva: 'lista' | 'formulario') => setVista(nueva);

    // ============================================================
    // REGISTRAR VENTA
    // ============================================================
    const registrarVenta = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_animal: parseInt(datos.id_animal),
                fecha_venta: datos.fecha_venta,
                peso_venta: parseFloat(datos.peso_venta || datos.peso_animal),
                precio_total: parseFloat(datos.precio_total),
                comprador: datos.comprador,
                num_factura: datos.num_factura || null,
                metodo_pago: datos.metodo_pago || 'Efectivo',
                observaciones: datos.observaciones || null
            };

            console.log('📤 Enviando a backend (Venta):', datosParaBackend);
            
            await apiClient.post('/ventas', datosParaBackend);
            
            await cargarVentas();
            await cargarAnimalesDisponibles(); // Refrescar disponibles
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al registrar venta:", error);
            alert(error.response?.data?.mensaje || "Error al registrar venta");
            return false;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // 🆕 ACTUALIZAR VENTA
    // ============================================================
    const actualizarVenta = async (id: number, datos: Partial<Venta>) => {
        try {
            const respuesta = await apiClient.put(`/ventas/${id}`, datos);
            setVentas(prev => prev.map(v => 
                v.id_venta === id ? { ...v, ...datos } : v
            ));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar venta:', error);
        }
    };

    // ============================================================
    // 🆕 ANULAR VENTA (ELIMINAR)
    // ============================================================
    const anularVenta = async (id: number) => {
        try {
            const respuesta = await apiClient.delete(`/ventas/${id}`);
            setVentas(prev => prev.filter(v => v.id_venta !== id));
            await cargarAnimalesDisponibles();
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al anular venta:', error);
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        ventas,
        listaVentas: ventas,
        animalesDisponibles,  // 🆕 Para el selector del formulario
        isModalOpen,
        vista,
        cargando,
        
        // 🆕 Stats para la card
        stats: calcularStats(),
        
        abrirModal,
        cerrarModal,
        cambiarVista,
        registrarVenta,
        guardarVenta: registrarVenta,
        actualizarVenta,
        anularVenta,
        recargarLista: cargarVentas,
    };
};