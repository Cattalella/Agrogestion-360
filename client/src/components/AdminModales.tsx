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

// Tipos
import type { Pago } from "../hooks/useRegistrarPagos";
import type { TrabajoRealizado } from "../hooks/useTrabajoRealizado";
import type { Trabajador } from "../hooks/useNuevoTrabajador";
import type { SolicitudCompra as SolicitudCompraAntigua, CategoriaGeneral } from "../hooks/useRegistrarCompra";

// PDF
import { FormularioGenerarPagoPDF } from "../components/FormularioGenerarPagoPDF";
import type { FormatoPago } from "../hooks/useGenerarPagoPDF";

// Solicitudes
import { FormularioSolicitudCompra } from "../components/FormularioSolicitudCompra";
import type { SolicitudCompra, TipoSolicitud } from "../hooks/useSolicitudCompra";

// Consumo de Insumos
import { FormularioConsumoInsumos } from "../components/FormularioConsumoInsumos";
import type { RegistroConsumo, VistaConsumo, EstadoConsumo, InsumoInventario } from "../hooks/useConsumoInsumos";

// Interfaces
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
}

interface CerdosHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaCerdos: any[];
    sugerenciaId: string;
    categoriaCerdo: string;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarCerdo: (datos: any, cerrar: boolean) => void;
    setCategoriaCerdo: (cat: string) => void;
}

interface VacunasHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaVacunas: any[];
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarVacuna: (datos: any) => void;
}

interface VentasHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaVentas: any[];
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarVenta: (datos: any) => void;
}

interface PagosHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaPagos: Pago[];
    pagoAEditar: Pago | null;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarPago: (datos: Omit<Pago, 'id' | 'contabilizado' | 'anulado'>, cerrar: boolean) => void;
}

interface TrabajoHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    listaTrabajos: TrabajoRealizado[];
    trabajosActivos: TrabajoRealizado[];
    trabajoAEditar: TrabajoRealizado | null;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarTrabajo: (datos: Omit<TrabajoRealizado, 'id' | 'duracion_trabajo' | 'eliminado'>, cerrar: boolean) => void;
}

interface TrabajadoresHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    trabajadores: Trabajador[];
    trabajadoresVisibles: Trabajador[];
    trabajadoresActivos: Trabajador[];
    trabajadorAEditar: Trabajador | null;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    guardarTrabajador: (datos: Omit<Trabajador, 'id' | 'eliminado'>, cerrar: boolean) => void;
}

interface ComprasHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario';
    solicitudesVisibles: SolicitudCompraAntigua[];
    alertasVencimiento: SolicitudCompraAntigua[];
    tipoSeleccionado: CategoriaGeneral;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario') => void;
    crearSolicitud: (datos: Omit<SolicitudCompraAntigua, 'id' | 'estado' | 'ejecutada' | 'eliminada' | 'fecha_creacion' | 'hora_creacion'>) => void;
    setTipoSeleccionado: (tipo: CategoriaGeneral) => void;
}

interface GenerarPDFHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario' | 'vistaPrevia';
    formatosPago: FormatoPago[];
    historialPagosFirmados: FormatoPago[];
    formatoSeleccionado: FormatoPago | null;
    generandoPDF: boolean;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario' | 'vistaPrevia') => void;
    setFormatoSeleccionado: (formato: FormatoPago | null) => void;
    generarFormatoPago: (pago: Pago, trabajador: Trabajador, trabajos: TrabajoRealizado[], periodo: string) => Promise<FormatoPago>;
    registrarFirma: (idFormato: string, tipo: 'digital' | 'escaneo', firmaData: string) => void;
    confirmarPagoConFirma: (idFormato: string, pagoId: number, onConfirmarPago?: () => void) => boolean;
}

interface SolicitudCompraHook {
    isModalOpen: boolean;
    vista: 'lista' | 'formulario' | 'detalle';
    solicitudes: SolicitudCompra[];
    solicitudesPendientes: SolicitudCompra[];
    solicitudesAprobadas: SolicitudCompra[];
    tipoSeleccionado: TipoSolicitud;
    setTipoSeleccionado: (tipo: TipoSolicitud) => void;
    cerrarModal: () => void;
    cambiarVista: (vista: 'lista' | 'formulario' | 'detalle') => void;
    crearSolicitud: (datos: any, usuario: string) => void;
}

interface ConsumoInsumosHook {
    isModalOpen: boolean;
    vista: VistaConsumo;
    consumos: RegistroConsumo[];
    inventarioDisponible: InsumoInventario[];
    consumoAEditar: RegistroConsumo | null;
    cerrarModal: () => void;
    cambiarVista: (vista: VistaConsumo) => void;
    registrarConsumo: (datos: any) => boolean;
    cambiarEstado: (id: number, estado: EstadoConsumo) => void;
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
}

export const AdminModales = ({ 
    ganado, cerdos, vacunas, ventas, 
    pagos, trabajo, trabajadores, compras, generarPDF, solicitudCompra, consumoInsumos
}: Props) => {

    const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);

    return (
        <>
            {/* GANADO */}
            <ModalGenerico isOpen={ganado?.isModalOpen ?? false} onClose={ganado?.cerrarModal ?? (() => {})} titulo={ganado?.vista === 'lista' ? "CONTROL DE INVENTARIO" : "REGISTRO DE GANADO"} width="max-w-2xl">
                {ganado?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase tracking-wider">
                                <thead className="bg-gray-50 text-gray-400">
                                    <tr>
                                        <th className="p-3">ID LOCAL</th>
                                        <th className="p-3">OFICIAL</th>
                                        <th className="p-3">SEXO</th>
                                        <th className="p-3">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {ganado?.listaGanado?.length > 0 ? ganado.listaGanado.map((animal: any) => (
                                        <tr key={animal.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 font-bold">{animal.local}</td>
                                            <td className="p-3">{animal.oficial}</td>
                                            <td className="p-3">{animal.sexo}</td>
                                            <td className="p-3"><span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full text-[9px]">{animal.estado}</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin registros aún —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => ganado?.cambiarVista?.('formulario')} className="bg-emerald-600 text-white py-3 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">+ Añadir Nuevo Animal</button>
                    </div>
                ) : (
                    <FormularioGanado listaGanado={ganado?.listaGanado ?? []} sugerenciaId={ganado?.sugerenciaId ?? ""} categoriaSeleccionada={ganado?.categoriaSeleccionada ?? ""} setCategoria={ganado?.setCategoriaSeleccionada ?? (() => {})} onGuardar={(animal: any) => ganado?.guardarAnimal?.(animal, true)} />
                )}
            </ModalGenerico>

            {/* CERDOS */}
            <ModalGenerico isOpen={cerdos?.isModalOpen ?? false} onClose={cerdos?.cerrarModal ?? (() => {})} titulo={cerdos?.vista === 'lista' ? "INVENTARIO PORCINO" : "REGISTRAR CERDOS"} width="max-w-2xl">
                {cerdos?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-emerald-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-emerald-50 text-emerald-700">
                                    <tr>
                                        <th className="p-3">ID LOCAL</th>
                                        <th className="p-3">SEXO</th>
                                        <th className="p-3">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cerdos?.listaCerdos?.length > 0 ? cerdos.listaCerdos.map((cerdo: any) => (
                                        <tr key={cerdo.id} className="border-t border-emerald-50">
                                            <td className="p-3 font-bold">{cerdo.local}</td>
                                            <td className="p-3">{cerdo.sexo}</td>
                                            <td className="p-3"><span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">{cerdo.estado}</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin registros aún —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => cerdos?.cambiarVista?.('formulario')} className="bg-emerald-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:shadow-emerald-200 transition-all">+ Registrar Nuevo Cerdo</button>
                    </div>
                ) : (
                    <FormularioCerdo sugerenciaId={cerdos?.sugerenciaId ?? ""} categoriaSeleccionada={cerdos?.categoriaCerdo ?? ""} setCategoria={cerdos?.setCategoriaCerdo ?? (() => {})} onGuardar={(datos: any, cerrar: boolean) => cerdos?.guardarCerdo?.(datos, cerrar)} />
                )}
            </ModalGenerico>

            {/* VACUNAS */}
            <ModalGenerico isOpen={vacunas?.isModalOpen ?? false} onClose={vacunas?.cerrarModal ?? (() => {})} titulo={vacunas?.vista === 'lista' ? "HISTORIAL DE VACUNACIÓN" : "REGISTRAR VACUNAS"} width="max-w-2xl">
                {vacunas?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-cyan-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-cyan-50 text-cyan-700">
                                    <tr>
                                        <th className="p-3">ANIMAL</th>
                                        <th className="p-3">VACUNA</th>
                                        <th className="p-3">FECHA</th>
                                        <th className="p-3">REFUERZO</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {vacunas?.listaVacunas?.length > 0 ? vacunas.listaVacunas.map((v: any) => (
                                        <tr key={v.id} className="border-t border-cyan-50">
                                            <td className="p-3 font-bold">{v.animal}</td>
                                            <td className="p-3">{v.vacuna}</td>
                                            <td className="p-3">{v.fecha}</td>
                                            <td className="p-3 font-semibold text-orange-500">{v.refuerzo}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin registros aún —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => vacunas?.cambiarVista?.('formulario')} className="bg-cyan-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:shadow-cyan-200 transition-all">+ Registrar Nueva Aplicación</button>
                    </div>
                ) : (
                    <FormularioVacuna onGuardar={vacunas?.guardarVacuna ?? (() => {})} />
                )}
            </ModalGenerico>

            {/* VENTAS */}
            <ModalGenerico isOpen={ventas?.isModalOpen ?? false} onClose={ventas?.cerrarModal ?? (() => {})} titulo={ventas?.vista === 'lista' ? "HISTORIAL DE VENTAS" : "REGISTRAR VENTAS"} width="max-w-2xl">
                {ventas?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-orange-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-orange-50 text-orange-700">
                                    <tr>
                                        <th className="p-3">ID ANIMAL</th>
                                        <th className="p-3">CLIENTE/VEND.</th>
                                        <th className="p-3">FECHA</th>
                                        <th className="p-3">MONTO TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {ventas?.listaVentas?.length > 0 ? ventas.listaVentas.map((v: any) => (
                                        <tr key={v.id} className="border-t border-orange-50 hover:bg-orange-50/30 transition-colors">
                                            <td className="p-3 font-bold">{v.animal}</td>
                                            <td className="p-3">{v.cliente}</td>
                                            <td className="p-3">{v.fecha}</td>
                                            <td className="p-3 font-bold text-emerald-600">{v.monto}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin registros aún —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => ventas?.cambiarVista?.('formulario')} className="bg-orange-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-orange-700 transition-all">+ Generar Nueva Venta</button>
                    </div>
                ) : (
                    <FormularioVenta onGuardar={ventas?.guardarVenta ?? (() => {})} />
                )}
            </ModalGenerico>

            {/* PAGOS */}
            <ModalGenerico isOpen={pagos?.isModalOpen ?? false} onClose={pagos?.cerrarModal ?? (() => {})} titulo={pagos?.vista === 'lista' ? "REGISTRO DE PAGOS" : "REGISTRAR NUEVO PAGO"} width="max-w-2xl">
                {pagos?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-purple-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-purple-50 text-purple-700">
                                    <tr>
                                        <th className="p-3">ID TRABAJADOR</th>
                                        <th className="p-3">MONTO</th>
                                        <th className="p-3">FECHA</th>
                                        <th className="p-3">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagos?.listaPagos?.length > 0 ? pagos.listaPagos.map((p) => (
                                        <tr key={p.id} className="border-t border-purple-50">
                                            <td className="p-3 font-bold">{p.id_trabajador}</td>
                                            <td className="p-3">${p.monto_total.toLocaleString()}</td>
                                            <td className="p-3">{p.fecha_pago}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded-full text-[9px] ${p.estado === 'Pagado con firma' ? 'bg-green-100 text-green-600' : p.estado === 'Pendiente de firma' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{p.estado}</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin pagos registrados —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => pagos?.cambiarVista?.('formulario')} className="bg-purple-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-purple-700 transition-all">+ Registrar Nuevo Pago</button>
                    </div>
                ) : (
                    <FormularioPagos pagoAEditar={pagos?.pagoAEditar ?? null} onGuardar={(datos, cerrar) => pagos?.guardarPago?.(datos, cerrar)} onCancelar={() => pagos?.cambiarVista?.('lista')} />
                )}
            </ModalGenerico>

            {/* TRABAJO REALIZADO */}
            <ModalGenerico isOpen={trabajo?.isModalOpen ?? false} onClose={trabajo?.cerrarModal ?? (() => {})} titulo={trabajo?.vista === 'lista' ? "HORAS Y TAREAS" : "REGISTRAR TRABAJO REALIZADO"} width="max-w-2xl">
                {trabajo?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-blue-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-blue-50 text-blue-700">
                                    <tr>
                                        <th className="p-3">ID TRABAJADOR</th>
                                        <th className="p-3">ACTIVIDAD</th>
                                        <th className="p-3">DURACIÓN</th>
                                        <th className="p-3">FECHA INICIO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trabajo?.trabajosActivos?.length > 0 ? trabajo.trabajosActivos.map((t) => (
                                        <tr key={t.id} className="border-t border-blue-50">
                                            <td className="p-3 font-bold">{t.id_trabajador}</td>
                                            <td className="p-3">{t.tipo_actividad}</td>
                                            <td className="p-3">{t.duracion_trabajo}</td>
                                            <td className="p-3">{t.fecha_inicio}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin registros de trabajo —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => trabajo?.cambiarVista?.('formulario')} className="bg-blue-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-blue-700 transition-all">+ Registrar Trabajo Realizado</button>
                    </div>
                ) : (
                    <FormularioTrabajoRealizado trabajoAEditar={trabajo?.trabajoAEditar ?? null} onGuardar={(datos, cerrar) => trabajo?.guardarTrabajo?.(datos, cerrar)} onCancelar={() => trabajo?.cambiarVista?.('lista')} />
                )}
            </ModalGenerico>

            {/* NUEVO TRABAJADOR */}
            <ModalGenerico isOpen={trabajadores?.isModalOpen ?? false} onClose={trabajadores?.cerrarModal ?? (() => {})} titulo={trabajadores?.vista === 'lista' ? "LISTA DE TRABAJADORES" : "CONTRATAR NUEVO TRABAJADOR"} width="max-w-2xl">
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
                                    {trabajadores?.trabajadoresVisibles?.length > 0 ? trabajadores.trabajadoresVisibles.map((t) => (
                                        <tr key={t.id} className="border-t border-indigo-50">
                                            <td className="p-3 font-bold">{t.id_trabajador}</td>
                                            <td className="p-3">{t.nombre_completo}</td>
                                            <td className="p-3">{t.tipo_trabajo}</td>
                                            <td className="p-3">{t.telefono}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded-full text-[9px] ${t.estado === 'activo' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{t.estado.toUpperCase()}</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin trabajadores registrados —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => trabajadores?.cambiarVista?.('formulario')} className="bg-indigo-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-indigo-700 transition-all">+ Contratar Nuevo Trabajador</button>
                    </div>
                ) : (
                    <FormularioNuevoTrabajador trabajadorAEditar={trabajadores?.trabajadorAEditar ?? null} onGuardar={(datos, cerrar) => trabajadores?.guardarTrabajador?.(datos, cerrar)} onCancelar={() => trabajadores?.cambiarVista?.('lista')} />
                )}
            </ModalGenerico>

            {/* COMPRAS */}
            <ModalGenerico isOpen={compras?.isModalOpen ?? false} onClose={compras?.cerrarModal ?? (() => {})} titulo={compras?.vista === 'lista' ? "SOLICITUDES DE COMPRA" : "NUEVA SOLICITUD"} width="max-w-2xl">
                {compras?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        {compras?.alertasVencimiento?.length > 0 && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-red-600 text-[10px] uppercase font-bold">⚠️ {compras.alertasVencimiento.length} solicitud(es) por vencer</p></div>}
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
                                    {compras?.solicitudesVisibles?.length > 0 ? compras.solicitudesVisibles.map((s) => (
                                        <tr key={s.id} className="border-t border-amber-50">
                                            <td className="p-3 font-bold">{s.categoria_general}</td>
                                            <td className="p-3">{s.tipo_insumo || s.tipo_alimento || '—'}</td>
                                            <td className="p-3">{s.cantidad}</td>
                                            <td className="p-3">{s.fecha_propuesta}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded-full text-[9px] ${s.estado === 'Aprobada' ? 'bg-green-100 text-green-600' : s.estado === 'Rechazada' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>{s.estado}</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin solicitudes registradas —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => compras?.cambiarVista?.('formulario')} className="bg-amber-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-amber-700 transition-all">+ Nueva Solicitud de Compra</button>
                    </div>
                ) : (
                    <FormularioCompra tipoSeleccionado={compras?.tipoSeleccionado ?? 'insumo'} setTipoSeleccionado={compras?.setTipoSeleccionado ?? (() => {})} onGuardar={compras?.crearSolicitud ?? (() => {})} onCancelar={() => compras?.cambiarVista?.('lista')} />
                )}
            </ModalGenerico>

            {/* PDF */}
            <ModalGenerico isOpen={generarPDF?.isModalOpen ?? false} onClose={generarPDF?.cerrarModal ?? (() => {})} titulo="FORMATO DE PAGO - FIRMA DEL TRABAJADOR" width="max-w-3xl">
                {generarPDF?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-teal-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-teal-50 text-teal-700">
                                    <tr>
                                        <th className="p-3">ID FORMATO</th>
                                        <th className="p-3">TRABAJADOR</th>
                                        <th className="p-3">MONTO</th>
                                        <th className="p-3">ESTADO FIRMA</th>
                                        <th className="p-3">FECHA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generarPDF?.formatosPago?.length > 0 ? generarPDF.formatosPago.map((f) => (
                                        <tr key={f.id} className="border-t border-teal-50 hover:bg-teal-50/30 transition-colors">
                                            <td className="p-3 font-bold">{f.id}</td>
                                            <td className="p-3">{f.detalles.nombreTrabajador}</td>
                                            <td className="p-3 font-bold text-green-600">${f.detalles.montoTotal.toLocaleString()}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded-full text-[9px] ${f.estadoFirma === 'firmado' ? 'bg-green-100 text-green-600' : f.estadoFirma === 'escaneado' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>{f.estadoFirma === 'firmado' ? 'FIRMADO' : f.estadoFirma === 'escaneado' ? 'ES-CANEADO' : 'PENDIENTE'}</span></td>
                                            <td className="p-3">{new Date(f.fechaGeneracion).toLocaleDateString()}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin formatos de pago generados —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label className="text-xs font-bold text-gray-600 uppercase">Seleccionar Pago</label>
                            {pagos?.listaPagos?.length === 0 ? (
                                <div className="text-center text-red-500 text-sm py-2 bg-red-50 rounded">⚠️ No hay pagos registrados. Ve a "REGISTRAR PAGOS" primero.</div>
                            ) : (
                                <>
                                    <select className="border rounded-lg p-2 text-sm bg-white" value={pagoSeleccionado?.id || ''} onChange={(e) => { const pago = pagos?.listaPagos?.find(p => p.id === Number(e.target.value)); setPagoSeleccionado(pago || null); }}>
                                        <option value="">-- Selecciona un pago --</option>
                                        {pagos?.listaPagos?.map(p => <option key={p.id} value={p.id}>#{p.id} - {p.id_trabajador} - ${p.monto_total.toLocaleString()} - {p.fecha_pago}</option>)}
                                    </select>
                                    <button onClick={() => { if (pagoSeleccionado) { generarPDF?.cambiarVista?.('formulario'); } else { alert("Por favor selecciona un pago primero"); } }} disabled={!pagoSeleccionado} className="bg-teal-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-teal-700 transition-all">+ Generar Nuevo Formato de Pago</button>
                                </>
                            )}
                        </div>
                    </div>
                ) : generarPDF?.vista === 'formulario' && pagoSeleccionado ? (
                    <FormularioGenerarPagoPDF pagoSeleccionado={pagoSeleccionado} trabajadores={trabajadores?.trabajadoresActivos ?? []} trabajosRealizados={trabajo?.listaTrabajos ?? []} onGenerarPDF={generarPDF?.generarFormatoPago ?? (() => Promise.reject())} onCancelar={() => { generarPDF?.cambiarVista?.('lista'); setPagoSeleccionado(null); }} />
                ) : (
                    <div className="p-4 text-center"><p className="text-gray-500">Vista previa del PDF - Próximamente</p><button onClick={() => generarPDF?.cambiarVista?.('lista')} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Volver</button></div>
                )}
            </ModalGenerico>

            {/* SOLICITUDES DE COMPRA */}
            <ModalGenerico isOpen={solicitudCompra?.isModalOpen ?? false} onClose={solicitudCompra?.cerrarModal ?? (() => {})} titulo="SOLICITUDES DE COMPRA" width="max-w-3xl">
                {solicitudCompra?.vista === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-amber-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-amber-50 text-amber-700">
                                    <tr>
                                        <th className="p-3">TIPO</th>
                                        <th className="p-3">PRODUCTO</th>
                                        <th className="p-3">CANTIDAD</th>
                                        <th className="p-3">FECHA</th>
                                        <th className="p-3">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudCompra?.solicitudesPendientes?.length > 0 ? solicitudCompra.solicitudesPendientes.map((s) => (
                                        <tr key={s.id} className="border-t border-amber-50">
                                            <td className="p-3 font-bold">{s.tipo}</td>
                                            <td className="p-3">{s.tipoInsumo || s.tipoAlimento || '—'}</td>
                                            <td className="p-3">{s.cantidad} {s.unidadMedida}</td>
                                            <td className="p-3">{s.fechaPropuesta}</td>
                                            <td className="p-3"><span className="px-2 py-1 rounded-full text-[9px] bg-yellow-100 text-yellow-600">{s.estado}</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin solicitudes pendientes —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => solicitudCompra?.cambiarVista?.('formulario')} className="flex-1 bg-amber-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-amber-700 transition-all">+ Nueva Solicitud</button>
                            <button onClick={() => { if(window.confirm('¿Deseas eliminar TODAS las solicitudes para limpiar tus reportes de pruebas/datos pasados?')) { localStorage.removeItem('solicitudes_compra'); window.dispatchEvent(new Event('solicitudes_compra_actualizadas')); } }} className="bg-red-600 text-white py-3 px-6 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-red-700 transition-all">Limpiar Reportes</button>
                        </div>
                    </div>
                ) : (
                    <FormularioSolicitudCompra
                        solicitudAEditar={null}
                        tipoSeleccionado={solicitudCompra?.tipoSeleccionado ?? 'insumo'}
                        setTipoSeleccionado={solicitudCompra?.setTipoSeleccionado ?? (() => {})}
                        trabajadoresActivos={trabajadores?.trabajadoresActivos ?? []}
                        onGuardar={solicitudCompra?.crearSolicitud ?? (() => {})}
                        onCancelar={() => solicitudCompra?.cambiarVista?.('lista')}
                        usuarioActual="Admin"
                    />
                )}
            </ModalGenerico>

            {/* CONSUMO DE INSUMOS */}
            <ModalGenerico isOpen={consumoInsumos?.isModalOpen ?? false} onClose={consumoInsumos?.cerrarModal ?? (() => {})} titulo={consumoInsumos?.vista === 'lista' ? "CONSUMO DE INSUMOS" : "REGISTRAR CONSUMO"} width="max-w-3xl">
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
                                        <th className="p-3">ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consumoInsumos?.consumos?.length > 0 ? consumoInsumos.consumos.map((c) => (
                                        <tr key={c.id} className="border-t border-emerald-50">
                                            <td className="p-3 font-bold">{c.actividadSeleccionada}</td>
                                            <td className="p-3">{c.nombreInsumo}</td>
                                            <td className="p-3">{c.cantidadSolicitada} {c.unidadMedida}</td>
                                            <td className="p-3">{c.fechaPropuesta}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded-full text-[9px] ${c.estado === 'Aprobada' ? 'bg-green-100 text-green-600' : c.estado === 'Rechazada' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>{c.estado}</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-gray-300 text-[11px] uppercase font-bold italic">— Sin consumos registrados —</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => consumoInsumos?.cambiarVista?.('formulario')} className="bg-emerald-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-emerald-700 transition-all">+ Registrar Nuevo Consumo</button>
                    </div>
                ) : (
                    <FormularioConsumoInsumos
                        inventario={consumoInsumos?.inventarioDisponible ?? []}
                        trabajadoresActivos={trabajadores?.trabajadoresActivos ?? []}
                        onGuardar={consumoInsumos?.registrarConsumo ?? (() => false)}
                        onCancelar={() => consumoInsumos?.cambiarVista?.('lista')}
                    />
                )}
            </ModalGenerico>
        </>
    );
};