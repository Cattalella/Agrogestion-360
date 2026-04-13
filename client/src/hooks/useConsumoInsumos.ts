import { useState } from "react";

// ─────────────────────────────────────────
// TIPOS SEGÚN RI 7.1.3
// ─────────────────────────────────────────

export type ActividadConsumo = 'siembra' | 'mantenimiento' | 'alimentación' | 'vacunación';
export type EstadoConsumo = 'Pendiente' | 'Aprobada' | 'Rechazada';
export type UnidadMedidaConsumo = 'kg' | 'litros' | 'sacos' | 'unidades' | 'toneladas';

export interface RegistroConsumo {
    id: number;
    actividadSeleccionada: ActividadConsumo;
    fechaPropuesta: string;
    tipoInsumoId: string;
    nombreInsumo: string;
    cantidadSolicitada: number;
    unidadMedida: UnidadMedidaConsumo;
    responsable: string; // ID o nombre del trabajador activo
    motivo: string;
    estado: EstadoConsumo;
}

export interface InsumoInventario {
    id: string;
    nombre: string;
    stock: number;
    unidad: UnidadMedidaConsumo;
}

export type VistaConsumo = 'lista' | 'formulario';

// ─────────────────────────────────────────
// INVENTARIO MOCK (Para RN 7.1.4)
// ─────────────────────────────────────────
const MOCK_INVENTARIO: InsumoInventario[] = [
    { id: "INS-001", nombre: "Fertilizante Urea", stock: 150, unidad: "kg" },
    { id: "INS-002", nombre: "Semilla de Maíz", stock: 50, unidad: "sacos" },
    { id: "INS-003", nombre: "Vacuna Aftosa", stock: 200, unidad: "unidades" },
    { id: "INS-004", nombre: "Concentrado Cerdos Engorde", stock: 80, unidad: "sacos" },
    { id: "INS-005", nombre: "Herbicida Glifosato", stock: 30, unidad: "litros" },
];

export const useConsumoInsumos = (inicial: RegistroConsumo[] = []) => {

    const [consumos, setConsumos] = useState<RegistroConsumo[]>(inicial);
    const [inventario] = useState<InsumoInventario[]>(MOCK_INVENTARIO); // Mock inventario disponible

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<VistaConsumo>('lista');
    const [consumoAEditar, setConsumoAEditar] = useState<RegistroConsumo | null>(null);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setConsumoAEditar(null);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: VistaConsumo) => {
        setVista(nuevaVista);
    };

    const registrarConsumo = (datos: Omit<RegistroConsumo, 'id' | 'estado' | 'nombreInsumo' | 'unidadMedida'>) => {
        // Encontrar el insumo para rellenar nombre y unidad
        const insumoInfo = inventario.find(i => i.id === datos.tipoInsumoId);
        
        if (!insumoInfo) {
            alert("El insumo seleccionado no existe en el inventario.");
            return false;
        }

        // RN 7.1.4: Validar que la cantidad no exceda el stock
        if (datos.cantidadSolicitada > insumoInfo.stock) {
            alert(`Cantidad inválida. El stock actual de ${insumoInfo.nombre} es de ${insumoInfo.stock} ${insumoInfo.unidad}.`);
            return false;
        }

        const nuevoConsumo: RegistroConsumo = {
            ...datos,
            id: Date.now(),
            estado: 'Pendiente', // El requerimiento dicta los estados Pendiente, Aprobada, Rechazada
            nombreInsumo: insumoInfo.nombre,
            unidadMedida: insumoInfo.unidad
        };
        
        setConsumos(prev => [nuevoConsumo, ...prev]);
        setVista('lista');
        return true;
    };

    const cambiarEstado = (id: number, nuevoEstado: EstadoConsumo) => {
        // Al pasar a aprobada podrías, opcionalmente, descontar del stock final. 
        // Por ahora mantenemos la gestión del estado visual según RF.7.1.4
        setConsumos(prev =>
            prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c)
        );
    };

    const consumosActivos = consumos;

    return {
        consumos: consumosActivos,
        inventarioDisponible: inventario,
        isModalOpen,
        vista,
        consumoAEditar,
        setVista,
        setConsumoAEditar,
        abrirModal,
        cerrarModal,
        cambiarVista,
        registrarConsumo,
        cambiarEstado,
    };
};
