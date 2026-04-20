import { ModalGenerico } from "../components/ModalGenerico";
import { useState } from "react";

// Formularios pecuarios
import { FormularioGanado } from "../components/FormularioGanado";
import { FormularioCerdo } from "../components/FormularioCerdo";
import { FormularioVacuna } from "../components/FormularioVacuna";
import { FormularioVenta } from "../components/FormularioVenta";

// Formularios de personal
import { FormularioPagos } from "../components/FormularioPagos";
import { FormularioTrabajoRealizado } from "../components/FormularioTrabajoRealizado";
import { FormularioNuevoTrabajador } from "../components/FormularioNuevoTrabajador";
import { FormularioCompra } from "../components/FormularioCompra";

import { ModalConfirmacion } from "./ModalConfirmacion";

// PDF
import { FormularioGenerarPagoPDF } from "../components/FormularioGenerarPagoPDF";

// Solicitudes
import { FormularioSolicitudCompra } from "../components/FormularioSolicitudCompra";

// Consumo de Insumos
import { FormularioConsumoInsumos } from "../components/FormularioConsumoInsumos";

// ============================================================
// 📌 INTERFACES
// ============================================================
interface GanadoHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaGanado: any[];
    sugerenciaId: string;
    categoriaSeleccionada: string;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarAnimal: (animal: any, cerrar: boolean) => void;
    setCategoriaSeleccionada: (cat: string) => void;
    abrirEdicion: (animal: any) => void;
    animalAEditar: any | null;
    cancelarEdicion: () => void;
    modalConfirmacion: { isOpen: boolean; id: number | null; nombre: string };
    eliminando: boolean;
    abrirModalEliminar: (id: number, nombre: string) => void;
    cerrarModalConfirmacion: () => void;
    confirmarEliminar: () => Promise<void>;
}

interface CerdosHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaCerdos: any[];
    sugerenciaId: string;
    categoriaSeleccionada: string;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarCerdo: (datos: any, cerrar: boolean) => void;
    setCategoriaSeleccionada: (cat: string) => void;
    cerdoAEditar: any | null;
    abrirEdicion: (cerdo: any) => void;
    cancelarEdicion: () => void;
    modalConfirmacion: { isOpen: boolean; id: number | null; nombre: string };
    eliminando: boolean;
    abrirModalEliminar: (id: number, nombre: string) => void;
    cerrarModalConfirmacion: () => void;
    confirmarEliminar: () => Promise<void>;
}

interface VacunasHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaVacunas: any[];
    animalesDisponibles: any[];
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarVacuna: (datos: any, cerrar: boolean) => void;
    vacunaAEditar: any | null;
    abrirEdicion: (vacuna: any) => void;
    cancelarEdicion: () => void;
    modalConfirmacion: { isOpen: boolean; id: number | null; nombre: string };
    eliminando: boolean;
    abrirModalEliminar: (id: number, nombre: string) => void;
    cerrarModalConfirmacion: () => void;
    confirmarEliminar: () => Promise<void>;
}

interface VentasHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaVentas: any[];
    animalesDisponibles: any[];
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarVenta: (datos: any, cerrar: boolean) => void;
    ventaAEditar: any | null;
    abrirEdicion: (venta: any) => void;
    cancelarEdicion: () => void;
    modalConfirmacion: { isOpen: boolean; id: number | null; nombre: string };
    eliminando: boolean;
    abrirModalEliminar: (id: number, nombre: string) => void;
    cerrarModalConfirmacion: () => void;
    confirmarEliminar: () => Promise<void>;
}

interface PagosHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaPagos: any[];
    trabajadores: any[];
    pagoAEditar: any | null;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarPago: (datos: any, cerrar: boolean) => void;
}

interface TrabajoHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    trabajos: any[];
    trabajoAEditar: any | null;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    registrarTrabajo: (datos: any, cerrar: boolean) => void;
}

interface TrabajadoresHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    trabajadores: any[];
    trabajadoresActivos: any[];
    trabajadorAEditar: any | null;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarTrabajador: (datos: any, cerrar: boolean) => void;
}

interface ComprasHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    solicitudesVisibles: any[];
    alertasVencimiento: any[];
    tipoSeleccionado: 'insumo' | 'alimento';
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    crearSolicitud: (datos: any, cerrar: boolean) => void;
    setTipoSeleccionado: (tipo: 'insumo' | 'alimento') => void;
}

interface GenerarPDFHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario' | 'vistaPrevia';
    formatosPago: any[];
    generandoPDF: boolean;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario' | 'vistaPrevia') => void;
    generarFormatoPago: (pago: any, trabajador: any, trabajos: any[], periodo: string) => Promise<any>;
}

interface SolicitudCompraHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    solicitudes: any[];
    solicitudesPendientes: any[];
    solicitudesAprobadas: any[];
    solicitudesRechazadas: any[];
    tipoSeleccionado: 'insumo' | 'alimento';
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    crearSolicitud: (datos: any, cerrar: boolean) => void;
    setTipoSeleccionado: (tipo: 'insumo' | 'alimento') => void;
    solicitudAEditar: any | null;
    setSolicitudAEditar: (solicitud: any) => void;
    bannerVisible: boolean;
    cerrarBanner: () => void;
    eliminarSolicitud: (id: number, motivo: string) => void;
    modalConfirmacion: { isOpen: boolean; id: number | null; nombre: string };
    eliminando: boolean;
    abrirModalEliminar: (id: number, nombre: string) => void;
    cerrarModalConfirmacion: () => void;
    confirmarEliminar: () => Promise<void>;
}

interface ConsumoInsumosHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    consumos: any[];
    inventario: any[];
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    registrarConsumo: (datos: any, cerrar: boolean) => void;
}

interface RegistrarCompraHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    solicitudesAprobadas: any[];
    tipoSeleccionado: 'insumo' | 'alimento';
    setTipoSeleccionado: (tipo: 'insumo' | 'alimento') => void;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    setSolicitudAEditar: (solicitud: any) => void;
    ejecutarCompra: (id: number) => Promise<void>;
    ejecutarCompraReal: (datos: any) => Promise<void>;
}

interface Props {
    ganado: GanadoHook;
    cerdos: CerdosHook;
    vacunas: VacunasHook;
    ventas: VentasHook;
    pagos: PagosHook;
    trabajo: TrabajoHook;
    trabajadores: TrabajadoresHook;
    compras: ComprasHook;
    generarPDF: GenerarPDFHook;
    solicitudCompra: SolicitudCompraHook;
    consumoInsumos: ConsumoInsumosHook;
    registrarCompra: RegistrarCompraHook;
}

// ============================================================
// 📌 COMPONENTE PRINCIPAL
// ============================================================
export const AdminModales = ({ 
    ganado, cerdos, vacunas, ventas, 
    pagos, trabajo, trabajadores, compras, 
    generarPDF, solicitudCompra, consumoInsumos,
    registrarCompra
}: Props) => {

    const [pagoSeleccionado, setPagoSeleccionado] = useState<any | null>(null);

    return (
        <>
            {/* ============================================================ */}
            {/* GANADO */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={ganado?.isModalOpen ?? false} 
                onClose={ganado?.cerrarModal ?? (() => {})} 
                titulo={ganado?.vista === 'lista' ? "CONTROL DE INVENTARIO" : "REGISTRO DE GANADO"} 
                width="max-w-3xl"
            >
                {ganado?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase tracking-wider">
                                <thead className="bg-gray-50 text-gray-400">
                                    <tr>
                                        <th className="p-3">ID LOCAL</th>
                                        <th className="p-3">OFICIAL</th>
                                        <th className="p-3">SEXO</th>
                                        <th className="p-3">ESTADO</th>
                                        <th className="p-3 text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {ganado?.listaGanado?.length > 0 ? ganado.listaGanado.map((animal: any) => (
                                        <tr 
                                            key={animal.id} 
                                            className="group border-t border-gray-50 hover:bg-gray-50 transition-all duration-200"
                                        >
                                            <td className="p-3 font-bold">{animal.local}</td>
                                            <td className="p-3">{animal.oficial || '—'}</td>
                                            <td className="p-3">{animal.sexo}</td>
                                            <td className="p-3">
                                                <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full text-[9px]">
                                                    {animal.estado?.nombre || animal.estado || 'Activo'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-center">
                                                    <button
                                                        onClick={() => ganado?.abrirEdicion?.(animal)}
                                                        className="text-blue-500 hover:text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-blue-50 transition-all"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        onClick={() => ganado?.abrirModalEliminar?.(animal.id, animal.local)}
                                                        className="text-red-500 hover:text-red-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-red-50 transition-all"
                                                    >
                                                        🗑️ Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                — Sin registros aún —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => ganado?.cambiarVista?.('formulario')} 
                            className="bg-emerald-600 text-white py-3 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
                        >
                            + Añadir Nuevo Animal
                        </button>
                    </div>
                ) : (
                    <FormularioGanado 
                        listaGanado={ganado?.listaGanado ?? []} 
                        sugerenciaId={ganado?.sugerenciaId ?? ""} 
                        categoriaSeleccionada={ganado?.categoriaSeleccionada ?? ""} 
                        setCategoria={ganado?.setCategoriaSeleccionada ?? (() => {})} 
                        onGuardar={(datos: any, cerrar: boolean) => ganado?.guardarAnimal?.(datos, cerrar)} 
                        animalAEditar={ganado?.animalAEditar ?? null}
                        onCancelarEdicion={() => ganado?.cancelarEdicion?.()}
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* CERDOS */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={cerdos?.isModalOpen ?? false} 
                onClose={cerdos?.cerrarModal ?? (() => {})} 
                titulo={cerdos?.vista === 'lista' ? "INVENTARIO PORCINO" : "REGISTRAR CERDO"} 
                width="max-w-3xl"
            >
                {cerdos?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-x-auto rounded-xl border border-emerald-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-emerald-50 text-emerald-700">
                                    <tr>
                                        <th className="p-3">ID LOCAL</th>
                                        <th className="p-3">OFICIAL</th>
                                        <th className="p-3">SEXO</th>
                                        <th className="p-3">ESTADO</th>
                                        <th className="p-3 text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cerdos?.listaCerdos?.length > 0 ? 
                                        [...cerdos.listaCerdos]
                                            .sort((a: any, b: any) => (a.local || a.codigo_local || '').localeCompare(b.local || b.codigo_local || ''))
                                            .map((cerdo: any) => (
                                                <tr key={cerdo.id} className="group border-t border-emerald-50 hover:bg-emerald-50/30 transition-all duration-200">
                                                    <td className="p-3 font-bold">{cerdo.local || '—'}</td>
                                                    <td className="p-3">{cerdo.oficial || '—'}</td>
                                                    <td className="p-3">{cerdo.sexo || '—'}</td>
                                                    <td className="p-3">
                                                        <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full text-[9px]">
                                                            {cerdo.estado || 'Activo'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-center">
                                                            <button
                                                                onClick={() => cerdos?.abrirEdicion?.(cerdo)}
                                                                className="text-blue-500 hover:text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-blue-50 transition-all"
                                                            >
                                                                ✏️ Editar
                                                            </button>
                                                            <button
                                                                onClick={() => cerdos?.abrirModalEliminar?.(cerdo.id, cerdo.local)}
                                                                className="text-red-500 hover:text-red-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-red-50 transition-all"
                                                            >
                                                                🗑️ Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        : (
                                            <tr>
                                                <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                    — Sin registros aún —
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => cerdos?.cambiarVista?.('formulario')} 
                            className="bg-emerald-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:shadow-emerald-200 transition-all"
                        >
                            + Registrar Nuevo Cerdo
                        </button>
                    </div>
                ) : (
                    <FormularioCerdo 
                        listaCerdos={cerdos?.listaCerdos ?? []}
                        sugerenciaId={cerdos?.sugerenciaId ?? ""} 
                        categoriaSeleccionada={cerdos?.categoriaSeleccionada ?? "C"} 
                        setCategoria={cerdos?.setCategoriaSeleccionada ?? (() => {})} 
                        onGuardar={(datos: any, cerrar: boolean) => cerdos?.guardarCerdo?.(datos, cerrar)} 
                        cerdoAEditar={cerdos?.cerdoAEditar ?? null}
                        onCancelarEdicion={() => cerdos?.cancelarEdicion?.()}
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* VACUNAS */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={vacunas?.isModalOpen ?? false} 
                onClose={vacunas?.cerrarModal ?? (() => {})} 
                titulo={vacunas?.vista === 'lista' ? "HISTORIAL DE VACUNACIÓN" : "REGISTRAR VACUNA"} 
                width="max-w-4xl"
            >
                {vacunas?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-x-auto rounded-xl border border-cyan-100 shadow-sm">
                            <table className="w-full text-left text-[10px] uppercase">
                                <thead className="bg-cyan-50 text-cyan-700">
                                    <tr>
                                        <th className="p-2">ANIMAL</th>
                                        <th className="p-2">VACUNA</th>
                                        <th className="p-2">DOSIS</th>
                                        <th className="p-2">FECHA APP</th>
                                        <th className="p-2">REFUERZO</th>
                                        <th className="p-2">VETERINARIO</th>
                                        <th className="p-2">ADMIN</th>
                                        <th className="p-2 text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {vacunas?.listaVacunas?.length > 0 ? vacunas.listaVacunas.map((v: any) => (
                                        <tr key={v.id_reg_vac} className="group border-t border-cyan-50 hover:bg-cyan-50/30 transition-all duration-200">
                                            <td className="p-2 font-bold">
                                                {v.animal?.codigo_local || v.Animal?.codigo_local || '—'}
                                            </td>
                                            <td className="p-2">
                                                {v.tipo_vacuna || '—'}
                                            </td>
                                            <td className="p-2">
                                                {v.dosis ? `${v.dosis} ml` : '—'}
                                            </td>
                                            <td className="p-2">
                                                {v.fecha_aplicacion?.split('T')[0] || '—'}
                                            </td>
                                            <td className="p-2 text-orange-600 font-semibold">
                                                {v.proximo_refuerzo?.split('T')[0] || '—'}
                                            </td>
                                            <td className="p-2">
                                                {v.veterinario || '—'}
                                            </td>
                                            <td className="p-2">
                                                {v.admin_nombre || '—'}
                                            </td>
                                            <td className="p-2">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-center">
                                                    <button
                                                        onClick={() => vacunas?.abrirEdicion?.(v)}
                                                        className="text-blue-500 hover:text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-blue-50 transition-all"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        onClick={() => vacunas?.abrirModalEliminar?.(v.id_reg_vac, v.tipo_vacuna)}
                                                        className="text-red-500 hover:text-red-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-red-50 transition-all"
                                                    >
                                                        🗑️ Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                — Sin registros de vacunación —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => vacunas?.cambiarVista?.('formulario')} 
                            className="bg-cyan-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:shadow-cyan-200 transition-all"
                        >
                            + Registrar Nueva Vacuna
                        </button>
                    </div>
                ) : (
                    <FormularioVacuna
                        listaAnimales={vacunas?.animalesDisponibles ?? []} 
                        onGuardar={(datos: any, cerrar: boolean) => vacunas?.guardarVacuna?.(datos, cerrar)} 
                        vacunaAEditar={vacunas?.vacunaAEditar ?? null}
                        onCancelarEdicion={() => vacunas?.cancelarEdicion?.()}
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* VENTAS */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={ventas?.isModalOpen ?? false} 
                onClose={ventas?.cerrarModal ?? (() => {})} 
                titulo={ventas?.vista === 'lista' ? "HISTORIAL DE VENTAS" : "REGISTRAR VENTA"} 
                width="max-w-4xl"
            >
                {ventas?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-x-auto rounded-xl border border-orange-100 shadow-sm">
                            <table className="w-full text-left text-[10px] uppercase">
                                <thead className="bg-orange-50 text-orange-700">
                                    <tr>
                                        <th className="p-2">ANIMAL</th>
                                        <th className="p-2">COMPRADOR</th>
                                        <th className="p-2">PESO (kg)</th>
                                        <th className="p-2">PRECIO/KG</th>
                                        <th className="p-2">TOTAL</th>
                                        <th className="p-2">FECHA</th>
                                        <th className="p-2">MÉTODO</th>
                                        <th className="p-2">FACTURA</th>
                                        <th className="p-2 text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {ventas?.listaVentas?.length > 0 ? ventas.listaVentas.map((v: any) => {
                                        const precioKilo = v.peso_venta > 0 ? v.precio_total / v.peso_venta : 0;
                                        return (
                                            <tr key={v.id_venta} className="group border-t border-orange-50 hover:bg-orange-50/30 transition-all duration-200">
                                                <td className="p-2 font-bold">
                                                    {v.animal?.codigo_local || v.Animal?.codigo_local || '—'}
                                                </td>
                                                <td className="p-2">
                                                    {v.comprador || '—'}
                                                </td>
                                                <td className="p-2 text-right">
                                                    {v.peso_venta ? `${v.peso_venta.toLocaleString()} kg` : '—'}
                                                </td>
                                                <td className="p-2 text-right">
                                                    {precioKilo > 0 ? `$${precioKilo.toLocaleString('es-CO')}` : '—'}
                                                </td>
                                                <td className="p-2 text-right font-bold text-emerald-600">
                                                    ${v.precio_total?.toLocaleString('es-CO') || '0'}
                                                </td>
                                                <td className="p-2">
                                                    {v.fecha_venta?.split('T')[0] || '—'}
                                                </td>
                                                <td className="p-2">
                                                    {v.metodo_pago || '—'}
                                                </td>
                                                <td className="p-2">
                                                    {v.num_factura || '—'}
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-center">
                                                        <button
                                                            onClick={() => ventas?.abrirEdicion?.(v)}
                                                            className="text-blue-500 hover:text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-blue-50 transition-all"
                                                        >
                                                            ✏️ Editar
                                                        </button>
                                                        <button
                                                            onClick={() => ventas?.abrirModalEliminar?.(v.id_venta, v.comprador)}
                                                            className="text-red-500 hover:text-red-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-red-50 transition-all"
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={9} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                — Sin registros de ventas —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => ventas?.cambiarVista?.('formulario')} 
                            className="bg-orange-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-orange-700 transition-all"
                        >
                            + Generar Nueva Venta
                        </button>
                    </div>
                ) : (
                    <FormularioVenta 
                        listaAnimales={ventas?.animalesDisponibles ?? []} 
                        onGuardar={(datos: any, cerrar: boolean) => ventas?.guardarVenta?.(datos, cerrar)} 
                        ventaAEditar={ventas?.ventaAEditar ?? null}
                        onCancelarEdicion={() => ventas?.cancelarEdicion?.()}
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* PAGOS */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={pagos?.isModalOpen ?? false} 
                onClose={pagos?.cerrarModal ?? (() => {})} 
                titulo={pagos?.vista === 'lista' ? "REGISTRO DE PAGOS" : "REGISTRAR NUEVO PAGO"} 
                width="max-w-2xl"
            >
                {pagos?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-purple-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-purple-50 text-purple-700">
                                    <tr>
                                        <th className="p-3">TRABAJADOR</th>
                                        <th className="p-3">MONTO</th>
                                        <th className="p-3">FECHA</th>
                                        <th className="p-3">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagos?.listaPagos?.length > 0 ? pagos.listaPagos.map((p: any) => (
                                        <tr key={p.id_pago || p.id} className="border-t border-purple-50">
                                            <td className="p-3 font-bold">{p.Trabajador?.nombre_completo || p.id_trabajador || '—'}</td>
                                            <td className="p-3">${p.monto_total?.toLocaleString() || '0'}</td>
                                            <td className="p-3">{p.fecha_pago?.split('T')[0] || '—'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-[9px] ${
                                                    p.estado_pago === 'Pagado con firma' ? 'bg-green-100 text-green-600' : 
                                                    p.estado_pago === 'Pendiente de firma' ? 'bg-yellow-100 text-yellow-600' : 
                                                    'bg-red-100 text-red-600'
                                                }`}>
                                                    {p.estado_pago || p.estado || 'No pagado'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                — Sin pagos registrados —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => pagos?.cambiarVista?.('formulario')} 
                            className="bg-purple-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-purple-700 transition-all"
                        >
                            + Registrar Nuevo Pago
                        </button>
                    </div>
                ) : (
                    <FormularioPagos 
                        pagoAEditar={pagos?.pagoAEditar ?? null} 
                        listaTrabajadores={pagos?.trabajadores ?? []}
                        onGuardar={(datos: any, cerrar: boolean) => pagos?.guardarPago?.(datos, cerrar)} 
                        onCancelar={() => pagos?.cambiarVista?.('lista')} 
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* TRABAJO REALIZADO */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={trabajo?.isModalOpen ?? false} 
                onClose={trabajo?.cerrarModal ?? (() => {})} 
                titulo={trabajo?.vista === 'lista' ? "HORAS Y TAREAS" : "REGISTRAR TRABAJO REALIZADO"} 
                width="max-w-2xl"
            >
                {trabajo?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-blue-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-blue-50 text-blue-700">
                                    <tr>
                                        <th className="p-3">TRABAJADOR</th>
                                        <th className="p-3">ACTIVIDAD</th>
                                        <th className="p-3">FECHA INICIO</th>
                                        <th className="p-3">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trabajo?.trabajos?.length > 0 ? trabajo.trabajos.map((t: any) => (
                                        <tr key={t.id_trabajo || t.id} className="border-t border-blue-50">
                                            <td className="p-3 font-bold">{t.Trabajador?.nombre_completo || t.id_trabajador || '—'}</td>
                                            <td className="p-3">{t.tipo_actividad || t.descripcion || '—'}</td>
                                            <td className="p-3">{t.fecha_inicio?.split('T')[0] || '—'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-[9px] ${
                                                    t.estado_trabajo === 'Completado' ? 'bg-green-100 text-green-600' : 
                                                    'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {t.estado_trabajo || 'Pendiente'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                — Sin registros de trabajo —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => trabajo?.cambiarVista?.('formulario')} 
                            className="bg-blue-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-blue-700 transition-all"
                        >
                            + Registrar Trabajo Realizado
                        </button>
                    </div>
                ) : (
                    <FormularioTrabajoRealizado 
                        trabajoAEditar={trabajo?.trabajoAEditar ?? null} 
                        listaTrabajadores={trabajadores?.trabajadoresActivos ?? []}
                        onGuardar={(datos: any, cerrar: boolean) => trabajo?.registrarTrabajo?.(datos, cerrar)} 
                        onCancelar={() => trabajo?.cambiarVista?.('lista')} 
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* NUEVO TRABAJADOR */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={trabajadores?.isModalOpen ?? false} 
                onClose={trabajadores?.cerrarModal ?? (() => {})} 
                titulo={trabajadores?.vista === 'lista' ? "LISTA DE TRABAJADORES" : "CONTRATAR NUEVO TRABAJADOR"} 
                width="max-w-2xl"
            >
                {trabajadores?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-indigo-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-indigo-50 text-indigo-700">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">NOMBRE</th>
                                        <th className="p-3">CARGO</th>
                                        <th className="p-3">TELÉFONO</th>
                                        <th className="p-3">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trabajadores?.trabajadores?.length > 0 ? trabajadores.trabajadores.map((t: any) => (
                                        <tr key={t.id_trabajador || t.id} className="border-t border-indigo-50">
                                            <td className="p-3 font-bold">{t.id_trabajador || '—'}</td>
                                            <td className="p-3">{t.nombre_completo || '—'}</td>
                                            <td className="p-3">{t.tipo_trabajo || '—'}</td>
                                            <td className="p-3">{t.telefono || '—'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-[9px] ${
                                                    t.estado === 'Activo' || t.estado === 'activo' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {t.estado?.toUpperCase() || 'ACTIVO'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                — Sin trabajadores registrados —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => trabajadores?.cambiarVista?.('formulario')} 
                            className="bg-indigo-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-indigo-700 transition-all"
                        >
                            + Contratar Nuevo Trabajador
                        </button>
                    </div>
                ) : (
                    <FormularioNuevoTrabajador 
                        trabajadorAEditar={trabajadores?.trabajadorAEditar ?? null} 
                        onGuardar={(datos: any, cerrar: boolean) => trabajadores?.guardarTrabajador?.(datos, cerrar)} 
                        onCancelar={() => trabajadores?.cambiarVista?.('lista')} 
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* COMPRAS (SOLICITUDES) */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={compras?.isModalOpen ?? false} 
                onClose={compras?.cerrarModal ?? (() => {})} 
                titulo={compras?.vista === 'lista' ? "SOLICITUDES DE COMPRA" : "NUEVA SOLICITUD"} 
                width="max-w-2xl"
            >
                {compras?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        {compras?.alertasVencimiento?.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <p className="text-red-600 text-[10px] uppercase font-bold">
                                    ⚠️ {compras.alertasVencimiento.length} solicitud(es) por vencer
                                </p>
                            </div>
                        )}
                        <div className="overflow-hidden rounded-xl border border-amber-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-amber-50 text-amber-700">
                                    <tr>
                                        <th className="p-3">CATEGORÍA</th>
                                        <th className="p-3">PRODUCTO</th>
                                        <th className="p-3">CANTIDAD</th>
                                        <th className="p-3">FECHA</th>
                                        <th className="p-3">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compras?.solicitudesVisibles?.length > 0 ? compras.solicitudesVisibles.map((s: any) => (
                                        <tr key={s.id} className="border-t border-amber-50">
                                            <td className="p-3 font-bold">{s.categoria_general || '—'}</td>
                                            <td className="p-3">{s.tipo_insumo || s.tipo_alimento || '—'}</td>
                                            <td className="p-3">{s.cantidad || 0}</td>
                                            <td className="p-3">{s.fecha_propuesta || s.fecha_compra || '—'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-[9px] ${
                                                    s.estado === 'Aprobada' ? 'bg-green-100 text-green-600' : 
                                                    s.estado === 'Rechazada' ? 'bg-red-100 text-red-600' : 
                                                    'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {s.estado || 'Pendiente'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                — Sin solicitudes registradas —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => compras?.cambiarVista?.('formulario')} 
                            className="bg-amber-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-amber-700 transition-all"
                        >
                            + Nueva Solicitud de Compra
                        </button>
                    </div>
                ) : (
                    <FormularioCompra 
                        tipoSeleccionado={compras?.tipoSeleccionado ?? 'insumo'} 
                        setTipoSeleccionado={compras?.setTipoSeleccionado ?? (() => {})} 
                        onGuardar={(datos: any, cerrar: boolean) => compras?.crearSolicitud?.(datos, cerrar)} 
                        onCancelar={() => compras?.cambiarVista?.('lista')} 
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* PDF */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={generarPDF?.isModalOpen ?? false} 
                onClose={generarPDF?.cerrarModal ?? (() => {})} 
                titulo="FORMATO DE PAGO - FIRMA DEL TRABAJADOR" 
                width="max-w-3xl"
            >
                {generarPDF?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-teal-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-teal-50 text-teal-700">
                                    <tr>
                                        <th className="p-3">ID FORMATO</th>
                                        <th className="p-3">TRABAJADOR</th>
                                        <th className="p-3">MONTO</th>
                                        <th className="p-3">FECHA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generarPDF?.formatosPago?.length > 0 ? generarPDF.formatosPago.map((f: any) => (
                                        <tr key={f.id} className="border-t border-teal-50 hover:bg-teal-50/30 transition-colors">
                                            <td className="p-3 font-bold">{f.id || '—'}</td>
                                            <td className="p-3">{f.detalles?.nombreTrabajador || '—'}</td>
                                            <td className="p-3 font-bold text-green-600">
                                                ${f.detalles?.montoTotal?.toLocaleString() || '0'}
                                            </td>
                                            <td className="p-3">{f.fechaGeneracion ? new Date(f.fechaGeneracion).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                — Sin formatos de pago generados —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label className="text-xs font-bold text-gray-600 uppercase">Seleccionar Pago</label>
                            {pagos?.listaPagos?.length === 0 ? (
                                <div className="text-center text-red-500 text-sm py-2 bg-red-50 rounded">
                                    ⚠️ No hay pagos registrados.
                                </div>
                            ) : (
                                <>
                                    <select 
                                        className="border rounded-lg p-2 text-sm bg-white" 
                                        value={pagoSeleccionado?.id_pago || pagoSeleccionado?.id || ''} 
                                        onChange={(e) => { 
                                            const pago = pagos?.listaPagos?.find((p: any) => (p.id_pago || p.id) === Number(e.target.value)); 
                                            setPagoSeleccionado(pago || null); 
                                        }}
                                    >
                                        <option value="">-- Selecciona un pago --</option>
                                        {pagos?.listaPagos?.map((p: any) => (
                                            <option key={p.id_pago || p.id} value={p.id_pago || p.id}>
                                                #{p.id_pago || p.id} - {p.Trabajador?.nombre_completo || p.id_trabajador} - ${p.monto_total?.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => { 
                                            if (pagoSeleccionado) { 
                                                generarPDF?.cambiarVista?.('formulario'); 
                                            } else { 
                                                alert("Por favor selecciona un pago primero"); 
                                            } 
                                        }} 
                                        disabled={!pagoSeleccionado} 
                                        className="bg-teal-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-teal-700 transition-all disabled:opacity-50"
                                    >
                                        + Generar Nuevo Formato de Pago
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ) : generarPDF?.vista === 'formulario' && pagoSeleccionado ? (
                    <FormularioGenerarPagoPDF 
                        pagoSeleccionado={pagoSeleccionado} 
                        trabajadores={trabajadores?.trabajadoresActivos ?? []} 
                        trabajosRealizados={trabajo?.trabajos ?? []} 
                        onGenerarPDF={generarPDF?.generarFormatoPago ?? (() => Promise.reject())} 
                        onCancelar={() => { generarPDF?.cambiarVista?.('lista'); setPagoSeleccionado(null); }} 
                    />
                ) : (
                    <div className="p-4 text-center">
                        <p className="text-gray-500">Vista previa del PDF - Próximamente</p>
                        <button 
                            onClick={() => generarPDF?.cambiarVista?.('lista')} 
                            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Volver
                        </button>
                    </div>
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* SOLICITUDES DE COMPRA (PEDIR) */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={solicitudCompra?.isModalOpen ?? false} 
                onClose={solicitudCompra?.cerrarModal ?? (() => {})} 
                titulo="SOLICITUDES DE COMPRA" 
                width="max-w-4xl"
            >
                {solicitudCompra?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        {/* Banner tipo WhatsApp para solicitudes rechazadas */}
                        {solicitudCompra?.bannerVisible && solicitudCompra?.solicitudesRechazadas?.length > 0 && (
                            <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
                                <div className="bg-red-500 text-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden">
                                    <div className="flex items-center justify-between p-3 bg-red-600">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">⚠️</span>
                                            <span className="text-xs font-bold uppercase tracking-wider">Solicitudes Rechazadas</span>
                                        </div>
                                        <button 
                                            onClick={() => solicitudCompra?.cerrarBanner?.()}
                                            className="text-white hover:text-gray-200 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="p-3 bg-red-500">
                                        <p className="text-[11px] font-medium">
                                            Tienes {solicitudCompra.solicitudesRechazadas.length} solicitud(es) que fueron rechazadas:
                                        </p>
                                        <ul className="mt-2 space-y-1">
                                            {solicitudCompra.solicitudesRechazadas.slice(0, 3).map((s: any) => (
                                                <li key={s.id_solicitud} className="text-[10px] opacity-90">
                                                    • {s.tipoInsumo || s.tipoAlimento || 'Producto'} - {s.cantidad} {s.unidad_medida}
                                                </li>
                                            ))}
                                            {solicitudCompra.solicitudesRechazadas.length > 3 && (
                                                <li className="text-[9px] opacity-75 italic">
                                                    y {solicitudCompra.solicitudesRechazadas.length - 3} más...
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto rounded-xl border border-amber-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-amber-50 text-amber-700">
                                    <tr>
                                        <th className="p-2">TIPO</th>
                                        <th className="p-2">PRODUCTO</th>
                                        <th className="p-2">CANTIDAD</th>
                                        <th className="p-2">UNIDAD</th>
                                        <th className="p-2">FECHA</th>
                                        <th className="p-2">ESTADO</th>
                                        <th className="p-2 text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {solicitudCompra?.solicitudes?.length > 0 ? 
                                        [...solicitudCompra.solicitudes]
                                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                            .map((s: any) => {
                                                const esRechazada = s.estado_sol === 'Rechazada';
                                                const esAprobada = s.estado_sol === 'Aprobada';
                                                const esPendiente = s.estado_sol === 'Pendiente';
                                                
                                                return (
                                                    <tr 
                                                        key={s.id_solicitud} 
                                                        className={`group border-t transition-all duration-200 ${
                                                            esRechazada ? 'bg-red-50/30 border-red-200 hover:bg-red-100/50' : 
                                                            esAprobada ? 'bg-green-50/30 border-green-200 hover:bg-green-100/50' : 
                                                            'border-amber-50 hover:bg-amber-50/30'
                                                        }`}
                                                    >
                                                        <td className="p-2 font-bold">
                                                            {s.tipo === 'insumo' ? '🛒 INSUMO' : '🌾 ALIMENTO'}
                                                        </td>
                                                        <td className="p-2">
                                                            {s.tipoInsumo || s.tipoAlimento || '—'}
                                                        </td>
                                                        <td className="p-2">
                                                            {s.cantidad}
                                                        </td>
                                                        <td className="p-2">
                                                            {s.unidad_medida || '—'}
                                                        </td>
                                                        <td className="p-2">
                                                            {s.fecha_compra?.split('T')[0] || '—'}
                                                        </td>
                                                        <td className="p-2">
                                                            {esRechazada ? (
                                                                <span className="px-2 py-1 rounded-full text-[9px] bg-red-100 text-red-600 font-bold">
                                                                    🚫 RECHAZADA
                                                                </span>
                                                            ) : esAprobada ? (
                                                                <span className="px-2 py-1 rounded-full text-[9px] bg-green-100 text-green-600 font-bold">
                                                                    ✅ APROBADA
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-full text-[9px] bg-yellow-100 text-yellow-600 font-bold">
                                                                    ⏳ PENDIENTE
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-center">
                                                                {esAprobada && (
                                                                    <button
                                                                        onClick={() => {
                                                                            // Abrir el modal de registrarCompra con esta solicitud
                                                                            registrarCompra?.setSolicitudAEditar?.(s);
                                                                            registrarCompra?.cambiarVista?.('formulario');
                                                                            // registrarCompra?.abrirModal?.();
                                                                        }}
                                                                        className="text-emerald-600 hover:text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-emerald-50 transition-all"
                                                                    >
                                                                        📦 Registrar Compra
                                                                    </button>
                                                                )}
                                                                {esPendiente && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                solicitudCompra?.setSolicitudAEditar?.(s);
                                                                                solicitudCompra?.cambiarVista?.('formulario');
                                                                            }}
                                                                            className="text-blue-500 hover:text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-blue-50 transition-all"
                                                                        >
                                                                            ✏️ Editar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => solicitudCompra?.abrirModalEliminar?.(s.id_solicitud, s.tipoInsumo || s.tipoAlimento || 'solicitud')}
                                                                            className="text-red-500 hover:text-red-700 text-[10px] font-bold px-2 py-1 rounded-full hover:bg-red-50 transition-all"
                                                                        >
                                                                            🗑️ Eliminar
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {esRechazada && (
                                                                    <span className="text-gray-400 text-[9px] italic">
                                                                        No disponible
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan={7} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                        — Sin solicitudes registradas —
                                                    </td>
                                                </tr>
                                            )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => solicitudCompra?.cambiarVista?.('formulario')} 
                            className="bg-amber-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-amber-700 transition-all"
                        >
                            + Nueva Solicitud
                        </button>

                        {/* Modal de confirmación para eliminar */}
                        <ModalConfirmacion
                            isOpen={solicitudCompra?.modalConfirmacion?.isOpen || false}
                            onClose={() => solicitudCompra?.cerrarModalConfirmacion?.()}
                            onConfirm={() => solicitudCompra?.confirmarEliminar?.()}
                            titulo="CONFIRMAR ELIMINACIÓN"
                            mensaje="¿Estás seguro de que deseas eliminar esta solicitud?"
                            subtitulo={`ID: ${solicitudCompra?.modalConfirmacion?.nombre || ''}`}
                            loading={solicitudCompra?.eliminando || false}
                            tipo="eliminar"
                        />
                    </div>
                ) : (
                    <FormularioSolicitudCompra
                        solicitudAEditar={solicitudCompra?.solicitudAEditar ?? null}
                        tipoSeleccionado={solicitudCompra?.tipoSeleccionado ?? 'insumo'}
                        setTipoSeleccionado={solicitudCompra?.setTipoSeleccionado ?? (() => {})}
                        trabajadoresActivos={trabajadores?.trabajadoresActivos ?? []}
                        onGuardar={(datos: any, cerrar: boolean) => solicitudCompra?.crearSolicitud?.(datos, cerrar)}
                        onCancelar={() => solicitudCompra?.cambiarVista?.('lista')}
                        usuarioActual="Admin"
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* REGISTRAR COMPRA REAL (ejecutar solicitudes aprobadas) */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={registrarCompra?.isModalOpen ?? false} 
                onClose={registrarCompra?.cerrarModal ?? (() => {})} 
                titulo="REGISTRAR COMPRA REAL" 
                width="max-w-3xl"
            >
                {registrarCompra?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        {/* Tabla de solicitudes APROBADAS para ejecutar */}
                        <div className="overflow-x-auto rounded-xl border border-orange-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-orange-50 text-orange-700">
                                    <tr>
                                        <th className="p-2">ID</th>
                                        <th className="p-2">PRODUCTO</th>
                                        <th className="p-2">CANTIDAD</th>
                                        <th className="p-2">UNIDAD</th>
                                        <th className="p-2">PROVEEDOR</th>
                                        <th className="p-2 text-center">ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrarCompra?.solicitudesAprobadas?.length > 0 ? (
                                        registrarCompra.solicitudesAprobadas.map((s: any) => (
                                            <tr key={s.id} className="border-t border-orange-50 hover:bg-orange-50/30">
                                                <td className="p-2 font-bold">#{s.id}</td>
                                                <td className="p-2">{s.tipo_insumo || s.tipo_alimento || '—'}</td>
                                                <td className="p-2">{s.cantidad}</td>
                                                <td className="p-2">{s.unidad_medida || '—'}</td>
                                                <td className="p-2">{s.proveedor || '—'}</td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        onClick={() => {
                                                            registrarCompra?.setSolicitudAEditar?.(s);
                                                            registrarCompra?.cambiarVista?.('formulario');
                                                        }}
                                                        className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full hover:bg-orange-600 transition-all"
                                                    >
                                                        📦 Registrar Compra
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-6 text-center text-gray-300">
                                                — No hay solicitudes aprobadas pendientes de ejecutar —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => {
                                registrarCompra?.setSolicitudAEditar?.(null);
                                registrarCompra?.cambiarVista?.('formulario');
                            }} 
                            className="bg-orange-500 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-orange-600 transition-all"
                        >
                            + Registrar Compra Directa
                        </button>
                    </div>
                ) : (
                    <FormularioCompra 
                        tipoSeleccionado={registrarCompra?.tipoSeleccionado ?? 'insumo'}
                        setTipoSeleccionado={registrarCompra?.setTipoSeleccionado ?? (() => {})}
                        onGuardar={async (datos: any, cerrar: boolean) => {
                            console.log('Ejecutar compra real:', datos);
                            await registrarCompra?.ejecutarCompraReal?.(datos);
                            if (cerrar) registrarCompra?.cerrarModal?.();
                        }}
                        onCancelar={() => registrarCompra?.cambiarVista?.('lista')}
                        solicitudesAprobadas={registrarCompra?.solicitudesAprobadas ?? []}
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* CONSUMO DE INSUMOS */}
            {/* ============================================================ */}
            <ModalGenerico 
                isOpen={consumoInsumos?.isModalOpen ?? false} 
                onClose={consumoInsumos?.cerrarModal ?? (() => {})} 
                titulo={consumoInsumos?.vista === 'lista' ? "CONSUMO DE INSUMOS" : "REGISTRAR CONSUMO"} 
                width="max-w-3xl"
            >
                {consumoInsumos?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-emerald-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-emerald-50 text-emerald-700">
                                    <tr>
                                        <th className="p-3">ACTIVIDAD</th>
                                        <th className="p-3">INSUMO</th>
                                        <th className="p-3">CANTIDAD</th>
                                        <th className="p-3">FECHA</th>
                                        <th className="p-3">RESPONSABLE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consumoInsumos?.consumos?.length > 0 ? consumoInsumos.consumos.map((c: any) => (
                                        <tr key={c.id} className="border-t border-emerald-50">
                                            <td className="p-3 font-bold">{c.actividad || '—'}</td>
                                            <td className="p-3">{c.nombreInsumo || c.id_insumo || '—'}</td>
                                            <td className="p-3">{c.cantidad || 0} {c.unidadMedida || ''}</td>
                                            <td className="p-3">{c.fecha_consumo || c.fecha || '—'}</td>
                                            <td className="p-3">{c.responsable || '—'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">
                                                — Sin consumos registrados —
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            onClick={() => consumoInsumos?.cambiarVista?.('formulario')} 
                            className="bg-emerald-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-emerald-700 transition-all"
                        >
                            + Registrar Nuevo Consumo
                        </button>
                    </div>
                ) : (
                    <FormularioConsumoInsumos
                        inventario={consumoInsumos?.inventario ?? []}
                        trabajadoresActivos={trabajadores?.trabajadoresActivos ?? []}
                        onGuardar={(datos: any, cerrar: boolean) => consumoInsumos?.registrarConsumo?.(datos, cerrar)}
                        onCancelar={() => consumoInsumos?.cambiarVista?.('lista')}
                    />
                )}
            </ModalGenerico>

            {/* ============================================================ */}
            {/* MODAL DE CONFIRMACIÓN REUTILIZABLE */}
            {/* ============================================================ */}
            <ModalConfirmacion
                isOpen={
                    ganado?.modalConfirmacion?.isOpen || 
                    cerdos?.modalConfirmacion?.isOpen || 
                    vacunas?.modalConfirmacion?.isOpen || 
                    ventas?.modalConfirmacion?.isOpen || 
                    false
                }
                onClose={() => {
                    if (ganado?.modalConfirmacion?.isOpen) ganado?.cerrarModalConfirmacion?.();
                    if (cerdos?.modalConfirmacion?.isOpen) cerdos?.cerrarModalConfirmacion?.();
                    if (vacunas?.modalConfirmacion?.isOpen) vacunas?.cerrarModalConfirmacion?.();
                    if (ventas?.modalConfirmacion?.isOpen) ventas?.cerrarModalConfirmacion?.();
                }}
                onConfirm={() => {
                    if (ganado?.modalConfirmacion?.isOpen) ganado?.confirmarEliminar?.();
                    if (cerdos?.modalConfirmacion?.isOpen) cerdos?.confirmarEliminar?.();
                    if (vacunas?.modalConfirmacion?.isOpen) vacunas?.confirmarEliminar?.();
                    if (ventas?.modalConfirmacion?.isOpen) ventas?.confirmarEliminar?.();
                }}
                titulo="CONFIRMAR ELIMINACIÓN"
                mensaje="¿Estás seguro de que deseas eliminar este registro?"
                subtitulo={`ID: ${ganado?.modalConfirmacion?.nombre || cerdos?.modalConfirmacion?.nombre || vacunas?.modalConfirmacion?.nombre || ventas?.modalConfirmacion?.nombre || ''}`}
                loading={
                    ganado?.eliminando || 
                    cerdos?.eliminando || 
                    vacunas?.eliminando || 
                    ventas?.eliminando || 
                    false
                }
                tipo="eliminar"
            />
        </>
    );
};