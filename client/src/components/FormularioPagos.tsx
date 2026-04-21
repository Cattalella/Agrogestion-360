import { useState, useEffect } from "react";
import { User, Briefcase, Calendar, DollarSign, FileText, CreditCard, AlertTriangle } from "lucide-react";

interface Trabajador {
    id_trabajador: number;
    nombre_completo: string;
    tipo_trabajo: string;
    estado: string;
}

interface TrabajoRealizado {
    id_trabajo: number;
    id_trabajador?: number;
    tipo_actividad: string;
    fecha_inicio: string;
    fecha_fin: string;
    Trabajador?: {
        id_trabajador: number;
        nombre_completo: string;
    };
}

interface Pago {
    id_pago: number;
    id_trabajador: number;
    id_trabajo?: number;
    fecha_pago: string;
    monto_total: number;
    concepto: string;
    estado_pago: string;
    firma_url?: string;
    justificacion_anulacion?: string;
    Trabajador?: { nombre_completo: string };
}

type EstadoPago = "No pagado" | "Pendiente de firma" | "Pagado con firma";

interface Props {
    pagoAEditar: Pago | null;
    listaTrabajadores: Trabajador[];
    trabajosRealizados?: TrabajoRealizado[];
    onGuardar: (datos: any, cerrar: boolean) => void;
    onCancelar: () => void;
}

export const FormularioPagos = ({
    pagoAEditar,
    listaTrabajadores,
    trabajosRealizados = [],
    onGuardar,
    onCancelar
}: Props) => {

    const estadoInicial = {
        id_trabajador: "",
        id_trabajo: "",
        tipo_trabajo: "",
        fecha_pago: new Date().toISOString().split('T')[0],
        monto_total: "",
        concepto: "",
        estado_pago: "No pagado" as EstadoPago,
        justificacion_anulacion: "",
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [mostrarAnulacion, setMostrarAnulacion] = useState(false);
    const [trabajosFiltrados, setTrabajosFiltrados] = useState<TrabajoRealizado[]>([]);

    // ============================================================
    // GUARDIA: Pago ya anulado — solo lectura
    // ============================================================
    const estaAnulado = Boolean(pagoAEditar?.justificacion_anulacion || pagoAEditar?.estado_pago === 'Anulado');

    // ============================================================
    // CARGAR DATOS SI ES EDICIÓN
    // ============================================================
    useEffect(() => {
        if (pagoAEditar) {
            setFormData({
                id_trabajador: pagoAEditar.id_trabajador?.toString() || "",
                id_trabajo: pagoAEditar.id_trabajo?.toString() || "",
                tipo_trabajo: "",
                fecha_pago: pagoAEditar.fecha_pago?.split('T')[0] || "",
                monto_total: pagoAEditar.monto_total?.toString() || "",
                concepto: pagoAEditar.concepto || "",
                estado_pago: (pagoAEditar.estado_pago as EstadoPago) || "No pagado",
                justificacion_anulacion: pagoAEditar.justificacion_anulacion || "",
            });
        }
    }, [pagoAEditar]);

    // ============================================================
    // OBTENER ID DEL TRABAJADOR DESDE TRABAJO REALIZADO (seguro)
    // ============================================================
    const obtenerIdTrabajadorDeTrabajo = (trabajo: TrabajoRealizado): number | null => {
        if (trabajo.Trabajador?.id_trabajador) {
            return trabajo.Trabajador.id_trabajador;
        }
        if (trabajo.id_trabajador) {
            return trabajo.id_trabajador;
        }
        return null;
    };

    // ============================================================
    // AUTO-COMPLETAR TIPO DE TRABAJO Y FILTRAR TRABAJOS
    // ============================================================
    useEffect(() => {
        if (formData.id_trabajador) {
            const trabajador = listaTrabajadores.find(
                t => t.id_trabajador === parseInt(formData.id_trabajador)
            );
            if (trabajador) {
                setFormData(prev => ({ ...prev, tipo_trabajo: trabajador.tipo_trabajo }));
            }
            // Filtrar trabajos del trabajador seleccionado (maneja ambos formatos)
            const trabajosDelTrabajador = trabajosRealizados.filter(trabajo => {
                const idTrabajador = obtenerIdTrabajadorDeTrabajo(trabajo);
                return idTrabajador === parseInt(formData.id_trabajador);
            });
            setTrabajosFiltrados(trabajosDelTrabajador);
        } else {
            setTrabajosFiltrados([]);
        }
    }, [formData.id_trabajador, listaTrabajadores, trabajosRealizados]);

    // ============================================================
    // MANEJADORES
    // ============================================================
    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) setErrores(prev => ({ ...prev, [name]: '' }));
    };

    const manejarCambioNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (value && parseFloat(value) > 0) {
                setErrores(prev => ({ ...prev, [name]: '' }));
            }
        }
    };

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};

        if (!formData.id_trabajador) nuevosErrores.id_trabajador = 'Selecciona un trabajador';
        if (!formData.fecha_pago) nuevosErrores.fecha_pago = 'La fecha es obligatoria';
        if (!formData.monto_total || parseFloat(formData.monto_total) <= 0) {
            nuevosErrores.monto_total = 'El monto debe ser mayor a 0';
        }
        if (!formData.concepto.trim()) nuevosErrores.concepto = 'El concepto es obligatorio';

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const validarAnulacion = (): boolean => {
        if (!formData.justificacion_anulacion?.trim()) {
            setErrores(prev => ({ ...prev, justificacion_anulacion: 'La justificación es obligatoria para anular' }));
            return false;
        }
        return true;
    };

    // ============================================================
    // ENVIAR
    // ============================================================
    const ejecutarEnvio = (cerrar: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            id_trabajador: parseInt(formData.id_trabajador),
            id_trabajo: formData.id_trabajo ? parseInt(formData.id_trabajo) : null,
            fecha_pago: formData.fecha_pago,
            monto_total: parseFloat(formData.monto_total),
            concepto: formData.concepto,
            estado_pago: formData.estado_pago,
        };

        onGuardar(datosParaBackend, cerrar);

        if (!cerrar && !pagoAEditar) {
            setFormData(estadoInicial);
            setErrores({});
        }
    };

    // ============================================================
    // ANULAR PAGO
    // ============================================================
    const ejecutarAnulacion = () => {
        if (!validarAnulacion()) return;
        onGuardar({
            id_pago: pagoAEditar?.id_pago,
            justificacion_anulacion: formData.justificacion_anulacion,
            accion: 'anular',
        }, true);
    };

    // ============================================================
    // RENDER — Pago anulado (solo lectura)
    // ============================================================
    if (estaAnulado) {
        return (
            <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                    <div>
                        <p className="text-[11px] font-black uppercase text-red-600">Pago Anulado</p>
                        <p className="text-[10px] text-red-400 mt-0.5">Este pago no puede editarse porque fue anulado.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-2xl p-3">
                        <p className="text-[9px] uppercase text-gray-400 font-black">Trabajador</p>
                        <p className="text-[12px] font-bold text-gray-700 mt-1">
                            {pagoAEditar?.Trabajador?.nombre_completo || '—'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3">
                        <p className="text-[9px] uppercase text-gray-400 font-black">Monto</p>
                        <p className="text-[12px] font-bold text-gray-700 mt-1">
                            ${pagoAEditar?.monto_total?.toLocaleString() || '0'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3 col-span-2">
                        <p className="text-[9px] uppercase text-gray-400 font-black">Justificación de Anulación</p>
                        <p className="text-[11px] text-gray-600 mt-1">
                            {pagoAEditar?.justificacion_anulacion || '—'}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onCancelar}
                    className="text-[10px] text-gray-400 uppercase font-bold hover:text-gray-600 transition-colors text-center"
                >
                    Cerrar
                </button>
            </div>
        );
    }

    // ============================================================
    // RENDER — Formulario normal
    // ============================================================
    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 p-2">

            {/* ============================================================ */}
            {/* COLUMNA IZQUIERDA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">

                {/* Trabajador */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-purple-600 font-black tracking-tighter">
                        <User size={10} className="inline mr-1" />
                        Trabajador <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="id_trabajador"
                        value={formData.id_trabajador}
                        onChange={manejarCambio}
                        disabled={!!pagoAEditar}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.id_trabajador
                                ? 'border-red-400 focus:ring-red-300'
                                : 'border-purple-200 focus:ring-purple-300 text-purple-700 font-bold'
                        } ${pagoAEditar ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <option value="">SELECCIONAR TRABAJADOR *</option>
                        {listaTrabajadores.filter(t => t.estado === 'activo').map(t => (
                            <option key={t.id_trabajador} value={t.id_trabajador}>
                                {t.nombre_completo} - {t.tipo_trabajo}
                            </option>
                        ))}
                    </select>
                    {errores.id_trabajador && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.id_trabajador}</p>
                    )}
                </div>

                {/* Trabajo Realizado (opcional) */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-purple-600 font-black tracking-tighter">
                        <Briefcase size={10} className="inline mr-1" />
                        Trabajo Realizado (opcional)
                    </label>
                    <select
                        name="id_trabajo"
                        value={formData.id_trabajo}
                        onChange={manejarCambio}
                        disabled={!formData.id_trabajador}
                        className="w-full border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">-- Sin trabajo asociado --</option>
                        {trabajosFiltrados.map(t => {
                            const fechaInicio = t.fecha_inicio?.split('T')[0] || '';
                            const fechaFin = t.fecha_fin?.split('T')[0] || '';
                            return (
                                <option key={t.id_trabajo} value={t.id_trabajo}>
                                    {t.tipo_actividad} ({fechaInicio} - {fechaFin})
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Tipo de Trabajo (auto-completado) */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-purple-600 font-black tracking-tighter">
                        <Briefcase size={10} className="inline mr-1" />
                        Tipo de Trabajo
                    </label>
                    <input
                        name="tipo_trabajo"
                        value={formData.tipo_trabajo}
                        type="text"
                        placeholder="Se auto-completa"
                        className="w-full border-1 border-purple-100 bg-purple-50/30 rounded-full px-6 py-2 text-[12px] focus:outline-none text-gray-600"
                        readOnly
                    />
                </div>

                {/* Fecha de Pago */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-purple-600 font-black tracking-tighter">
                        <Calendar size={10} className="inline mr-1" />
                        Fecha de Pago <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fecha_pago"
                        value={formData.fecha_pago}
                        onChange={manejarCambio}
                        type="date"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.fecha_pago ? 'border-red-400 focus:ring-red-300' : 'border-purple-100 focus:ring-purple-300'
                        }`}
                    />
                    {errores.fecha_pago && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fecha_pago}</p>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">

                {/* Monto Total */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-purple-600 font-black tracking-tighter">
                        <DollarSign size={10} className="inline mr-1" />
                        Total Pagado <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="monto_total"
                            value={formData.monto_total}
                            onChange={manejarCambioNumerico}
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            className={`w-full border-1 rounded-full pl-4 pr-12 py-2 text-[12px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                                errores.monto_total ? 'border-red-400 focus:ring-red-300' : 'border-purple-200 focus:ring-purple-300'
                            }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-purple-500">$</span>
                    </div>
                    {errores.monto_total && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.monto_total}</p>
                    )}
                </div>

                {/* Estado del Pago */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-purple-600 font-black tracking-tighter">
                        <CreditCard size={10} className="inline mr-1" />
                        Estado
                    </label>
                    <select
                        name="estado_pago"
                        value={formData.estado_pago}
                        onChange={manejarCambio}
                        className="w-full border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
                    >
                        <option value="No pagado">⏳ NO PAGADO</option>
                        <option value="Pendiente de firma">✍️ PENDIENTE DE FIRMA</option>
                        <option value="Pagado con firma">✅ PAGADO CON FIRMA</option>
                    </select>
                </div>

                {/* Concepto */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-purple-600 font-black tracking-tighter">
                        <FileText size={10} className="inline mr-1" />
                        Concepto <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        name="concepto"
                        value={formData.concepto}
                        onChange={manejarCambio}
                        placeholder="Describa el concepto del pago..."
                        rows={2}
                        className={`w-full border-1 rounded-2xl px-6 py-2 text-[12px] focus:outline-none focus:ring-2 resize-none transition-all ${
                            errores.concepto ? 'border-red-400 focus:ring-red-300' : 'border-purple-200 focus:ring-purple-300'
                        }`}
                    />
                    {errores.concepto && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.concepto}</p>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* SECCIÓN ANULACIÓN (solo en edición y pago no anulado) */}
            {/* ============================================================ */}
            {pagoAEditar && (
                <div className="col-span-2">
                    <button
                        type="button"
                        onClick={() => setMostrarAnulacion(prev => !prev)}
                        className="text-[10px] text-red-400 uppercase font-black hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                        <AlertTriangle size={10} />
                        {mostrarAnulacion ? 'Cancelar anulación' : 'Anular este pago'}
                    </button>

                    {mostrarAnulacion && (
                        <div className="mt-2 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <textarea
                                name="justificacion_anulacion"
                                value={formData.justificacion_anulacion}
                                onChange={manejarCambio}
                                placeholder="Ingresa la justificación para anular este pago..."
                                rows={2}
                                className={`w-full border-1 rounded-2xl px-6 py-2 text-[12px] focus:outline-none focus:ring-2 resize-none transition-all ${
                                    errores.justificacion_anulacion ? 'border-red-400 focus:ring-red-300' : 'border-red-200 focus:ring-red-300 bg-red-50/30'
                                }`}
                            />
                            {errores.justificacion_anulacion && (
                                <p className="text-[9px] text-red-500 ml-4">{errores.justificacion_anulacion}</p>
                            )}
                            <button
                                type="button"
                                onClick={ejecutarAnulacion}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-full font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                            >
                                Confirmar Anulación
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* BOTONES GUARDAR */}
            {/* ============================================================ */}
            {!mostrarAnulacion && (
                <div className="col-span-2 flex justify-between gap-4 mt-2">
                    <button
                        type="button"
                        onClick={() => ejecutarEnvio(false)}
                        className="flex-1 bg-white border-1 border-purple-400 text-purple-500 px-6 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-purple-50 transition-all"
                    >
                        Guardar y Seguir
                    </button>
                    <button
                        type="button"
                        onClick={() => ejecutarEnvio(true)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                    >
                        {pagoAEditar ? 'Actualizar Pago' : 'Guardar y Salir'}
                    </button>
                </div>
            )}

            {/* Botón Cancelar */}
            <div className="col-span-2 flex justify-center">
                <button
                    type="button"
                    onClick={onCancelar}
                    className="text-[10px] text-gray-400 uppercase font-bold hover:text-gray-600 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};