import { useState, useEffect } from "react";
import type { 
    SolicitudCompra, 
    TipoSolicitud, 
    CategoriaInsumo, 
    EspecieDestino, 
    UnidadMedida 
} from "../hooks/useSolicitudCompra";
import type { Trabajador } from "../hooks/useNuevoTrabajador";
import { AlertCircle, DollarSign } from "lucide-react";

interface Props {
    solicitudAEditar: SolicitudCompra | null;
    tipoSeleccionado: TipoSolicitud;
    setTipoSeleccionado: (tipo: TipoSolicitud) => void;
    trabajadoresActivos: Trabajador[];
    onGuardar: (datos: any, cerrar: boolean) => void;
    onCancelar: () => void;
    usuarioActual: string;
}

export const FormularioSolicitudCompra = ({
    solicitudAEditar,
    tipoSeleccionado,
    setTipoSeleccionado,
    trabajadoresActivos,
    onGuardar,
    onCancelar,
    usuarioActual
}: Props) => {

    // ============================================================
    // FUNCIONES DE FORMATEO DE MONTOS
    // ============================================================
    const formatearMontoCOP = (valor: string): string => {
        const numeros = valor.replace(/\D/g, '');
        if (!numeros) return '';
        return new Intl.NumberFormat('es-CO').format(parseInt(numeros));
    };

    const limpiarFormateoMonto = (valor: string): number => {
        return parseInt(valor.replace(/\D/g, '')) || 0;
    };

    const [form, setForm] = useState({
        tipo: tipoSeleccionado,
        fechaPropuesta: "",
        cantidad: "",
        unidadMedida: "kg" as UnidadMedida,
        motivo: "",
        tipoInsumo: "",
        categoriaInsumo: "" as CategoriaInsumo | "",
        fechaVencimiento: "",
        tipoAlimento: "",
        especieDestino: "" as EspecieDestino | "",
        proveedor: "",
        categoriaAlimento: "",
        usuario: usuarioActual,
        precio_unitario: "",      // 🆕 AGREGADO
        precio_total: "",         // 🆕 AGREGADO
    });

    const [errores, setErrores] = useState<Record<string, string>>({});
    const [enviando, setEnviando] = useState(false);

    // ============================================================
    // RECALCULAR PRECIO TOTAL
    // ============================================================
    const recalcularTotal = (cantidad: string, precioUnitario: string) => {
        const cant = parseFloat(cantidad) || 0;
        const precio = limpiarFormateoMonto(precioUnitario);
        const total = cant * precio;
        setForm(prev => ({ 
            ...prev, 
            precio_total: total > 0 ? total.toFixed(2) : "" 
        }));
    };

    // ============================================================
    // 🔄 SINCRONIZAR form.tipo con tipoSeleccionado
    // ============================================================
    useEffect(() => {
        setForm(prev => ({ ...prev, tipo: tipoSeleccionado }));
    }, [tipoSeleccionado]);

    // ============================================================
    // 📝 CARGAR DATOS SI ES EDICIÓN
    // ============================================================
    useEffect(() => {
        if (solicitudAEditar) {
            setForm({
                tipo: solicitudAEditar.tipo,
                fechaPropuesta: solicitudAEditar.fecha_compra || "",
                cantidad: solicitudAEditar.cantidad?.toString() || "",
                unidadMedida: solicitudAEditar.unidad_medida,
                motivo: solicitudAEditar.motivo,
                tipoInsumo: solicitudAEditar.tipoInsumo || "",
                categoriaInsumo: solicitudAEditar.categoriaInsumo || "",
                fechaVencimiento: solicitudAEditar.fechaVencimiento || "",
                tipoAlimento: solicitudAEditar.tipoAlimento || "",
                especieDestino: solicitudAEditar.especieDestino || "",
                proveedor: solicitudAEditar.proveedor || "",
                categoriaAlimento: solicitudAEditar.categoriaAlimento || "",
                usuario: usuarioActual,
                precio_unitario: "",
                precio_total: "",
            });
        }
    }, [solicitudAEditar, usuarioActual]);

    // ============================================================
    // ✅ RESETEAR FORM CUANDO SE ABRE NUEVA SOLICITUD
    // ============================================================
    useEffect(() => {
        if (!solicitudAEditar) {
            setForm({
                tipo: tipoSeleccionado,
                fechaPropuesta: "",
                cantidad: "",
                unidadMedida: "kg",
                motivo: "",
                tipoInsumo: "",
                categoriaInsumo: "",
                fechaVencimiento: "",
                tipoAlimento: "",
                especieDestino: "",
                proveedor: "",
                categoriaAlimento: "",
                usuario: usuarioActual,
                precio_unitario: "",
                precio_total: "",
            });
            setErrores({});
        }
    }, [solicitudAEditar, tipoSeleccionado, usuarioActual]);

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!form.fechaPropuesta) {
            nuevosErrores.fechaPropuesta = 'La fecha propuesta es obligatoria';
        } else {
            const fechaSeleccionada = new Date(form.fechaPropuesta);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaSeleccionada < hoy) {
                nuevosErrores.fechaPropuesta = 'La fecha no puede ser anterior a hoy';
            }
        }
        
        const cantidadNum = parseFloat(form.cantidad);
        if (!form.cantidad || isNaN(cantidadNum) || cantidadNum <= 0) {
            nuevosErrores.cantidad = 'La cantidad debe ser mayor a 0';
        }
        
        if (!form.motivo.trim()) {
            nuevosErrores.motivo = 'El motivo es obligatorio';
        }
        
        if (form.tipo === 'insumo' && !form.tipoInsumo.trim()) {
            nuevosErrores.tipoInsumo = 'Debes especificar el tipo de insumo';
        }
        
        if (form.tipo === 'alimento') {
            if (!form.tipoAlimento.trim()) {
                nuevosErrores.tipoAlimento = 'Debes especificar el tipo de alimento';
            }
            if (!form.especieDestino) {
                nuevosErrores.especieDestino = 'Debes seleccionar la especie destino';
            }
        }
        
        // 🆕 Validar precio unitario
        const precioUnitarioNum = limpiarFormateoMonto(form.precio_unitario);
        if (!form.precio_unitario || precioUnitarioNum <= 0) {
            nuevosErrores.precio_unitario = 'El precio unitario es obligatorio';
        }
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // ============================================================
    // 📤 ENVIAR FORMULARIO
    // ============================================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validarFormulario()) return;
        
        setEnviando(true);
        
        try {
            const datosEnvio = {
                ...form,
                cantidad: parseFloat(form.cantidad),
                precio_unitario: limpiarFormateoMonto(form.precio_unitario),
                precio_total: parseFloat(form.precio_total || '0'),
            };
            await onGuardar(datosEnvio, true);
        } catch (error) {
            console.error("Error al enviar solicitud:", error);
            setErrores(prev => ({ ...prev, general: 'Error al enviar la solicitud' }));
        } finally {
            setEnviando(false);
        }
    };

    // ============================================================
    // MANEJADOR DE CAMBIOS CON RECÁLCULO
    // ============================================================
    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'cantidad') {
            setForm(prev => ({ ...prev, cantidad: value }));
            recalcularTotal(value, form.precio_unitario);
        } else if (name === 'precio_unitario') {
            const valorLimpio = formatearMontoCOP(value);
            setForm(prev => ({ ...prev, precio_unitario: valorLimpio }));
            recalcularTotal(form.cantidad, valorLimpio);
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
        
        if (value) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    const precioUnitarioFormateado = form.precio_unitario 
        ? formatearMontoCOP(form.precio_unitario.toString()) 
        : '';

    const tipoActual = tipoSeleccionado;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
            {/* ============================================================ */}
            {/* TÍTULO */}
            {/* ============================================================ */}
            <div className="text-center border-b pb-3">
                <h2 className="text-lg font-bold text-emerald-700">
                    {solicitudAEditar ? "EDITAR SOLICITUD" : "NUEVA SOLICITUD"}
                </h2>
                <p className="text-xs text-gray-400">
                    {tipoActual === 'insumo' ? 'RF.7.1.1 - Insumos Agrícolas' : 
                    tipoActual === 'alimento' ? 'RF.7.1.2 - Alimentos para Animales' : 
                    'RF.7.1.4 - Consumo de Insumos'}
                </p>
            </div>

            {/* ============================================================ */}
            {/* ERROR GENERAL */}
            {/* ============================================================ */}
            {errores.general && (
                <div className="bg-red-50 rounded-2xl p-3 border border-red-200 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <p className="text-xs text-red-600">{errores.general}</p>
                    <button
                        type="button"
                        onClick={() => setErrores(prev => ({ ...prev, general: '' }))}
                        className="ml-auto text-red-400 hover:text-red-600"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ============================================================ */}
            {/* SELECTOR DE TIPO */}
            {/* ============================================================ */}
            <div className="flex gap-4 border-b pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="tipo" 
                        checked={tipoActual === 'insumo'} 
                        onChange={() => setTipoSeleccionado('insumo')} 
                        disabled={!!solicitudAEditar} 
                        className="accent-emerald-500"
                    />
                    <span className={tipoActual === 'insumo' ? "font-bold text-emerald-600" : "text-gray-600"}>
                        📦 Insumo
                    </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="radio" 
                        name="tipo" 
                        checked={tipoActual === 'alimento'} 
                        onChange={() => setTipoSeleccionado('alimento')} 
                        disabled={!!solicitudAEditar} 
                        className="accent-blue-500"
                    />
                    <span className={tipoActual === 'alimento' ? "font-bold text-blue-600" : "text-gray-600"}>
                        🍖 Alimento
                    </span>
                </label>
            </div>

            {/* ============================================================ */}
            {/* CAMPOS COMUNES */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha Propuesta */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-600 font-black tracking-tighter">
                        📅 Fecha en que se necesita *
                    </label>
                    <input 
                        type="date" 
                        className={`border rounded-full p-2 text-sm px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all ${
                            errores.fechaPropuesta ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'
                        }`}
                        value={form.fechaPropuesta} 
                        onChange={manejarCambio}
                        name="fechaPropuesta"
                    />
                    {errores.fechaPropuesta && (
                        <p className="text-[9px] text-red-500 ml-4 mt-1">{errores.fechaPropuesta}</p>
                    )}
                    <span className="text-[8px] text-gray-400 ml-4">¿Cuándo necesitas recibir el producto?</span>
                </div>

                {/* Cantidad */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-600 font-black tracking-tighter">
                        🔢 Cantidad *
                    </label>
                    <input 
                        type="number" 
                        step="0.01" 
                        className={`border rounded-full p-2 text-sm px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all ${
                            errores.cantidad ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'
                        }`}
                        value={form.cantidad}
                        onChange={manejarCambio}
                        name="cantidad"
                        placeholder="0"
                    />
                    {errores.cantidad && (
                        <p className="text-[9px] text-red-500 ml-4 mt-1">{errores.cantidad}</p>
                    )}
                </div>

                {/* Unidad de Medida */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-600 font-black tracking-tighter">
                        📏 Unidad de Medida *
                    </label>
                    <select 
                        className="border border-gray-200 rounded-full p-2 text-sm bg-white px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        value={form.unidadMedida} 
                        onChange={manejarCambio}
                        name="unidadMedida"
                    >
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="litros">Litros (L)</option>
                        <option value="sacos">Sacos</option>
                        <option value="unidades">Unidades</option>
                        <option value="toneladas">Toneladas</option>
                    </select>
                </div>

                {/* 🆕 Precio Unitario */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-600 font-black tracking-tighter">
                        <DollarSign size={10} className="inline mr-1" />
                        Precio Unitario *
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className={`border rounded-full p-2 text-sm px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-right ${
                                errores.precio_unitario ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'
                            }`}
                            value={precioUnitarioFormateado}
                            onChange={manejarCambio}
                            name="precio_unitario"
                            placeholder="$0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-500">$</span>
                    </div>
                    {errores.precio_unitario && (
                        <p className="text-[9px] text-red-500 ml-4 mt-1">{errores.precio_unitario}</p>
                    )}
                </div>

                {/* 🆕 Precio Total (automático) */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-600 font-black tracking-tighter">
                        <DollarSign size={10} className="inline mr-1" />
                        Precio Total
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="border border-emerald-200 bg-emerald-50 rounded-full p-2 text-sm px-4 pr-8 text-right font-bold text-emerald-700"
                            value={form.precio_total ? new Intl.NumberFormat('es-CO').format(parseFloat(form.precio_total)) : ''}
                            readOnly
                            placeholder="$0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-500">$</span>
                    </div>
                    <span className="text-[8px] text-gray-400 ml-4">Calculado automáticamente</span>
                </div>
            </div>

            {/* ============================================================ */}
            {/* DATOS DEL INSUMO */}
            {/* ============================================================ */}
            {tipoActual === 'insumo' && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-4">
                    <p className="text-[10px] font-black text-emerald-600 uppercase">📦 Datos del Insumo</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-semibold text-gray-700">Nombre del insumo *</label>
                            <input 
                                type="text" 
                                placeholder="Ej: Fertilizante NPK, Herbicida, etc." 
                                className={`border rounded-full p-2 text-sm px-4 focus:outline-none bg-white focus:ring-2 focus:ring-emerald-300 ${
                                    errores.tipoInsumo ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'
                                }`}
                                value={form.tipoInsumo} 
                                onChange={manejarCambio}
                                name="tipoInsumo"
                            />
                            {errores.tipoInsumo && (
                                <p className="text-[9px] text-red-500 ml-4 mt-1">{errores.tipoInsumo}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-semibold text-gray-700">Categoría</label>
                            <select 
                                className="border border-gray-200 rounded-full p-2 text-sm bg-white px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                value={form.categoriaInsumo} 
                                onChange={manejarCambio}
                                name="categoriaInsumo"
                            >
                                <option value="">Seleccionar categoría</option>
                                <option value="fertilizante">🌱 Fertilizante</option>
                                <option value="herramienta">🔧 Herramienta</option>
                                <option value="empaque">📦 Empaque</option>
                                <option value="otro">📌 Otro</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-semibold text-gray-700">⏰ Fecha de vencimiento (opcional)</label>
                            <input 
                                type="date" 
                                className="border border-gray-200 bg-white rounded-full p-2 text-sm px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                value={form.fechaVencimiento} 
                                onChange={manejarCambio}
                                name="fechaVencimiento"
                            />
                            <span className="text-[8px] text-gray-400">¿Hasta cuándo es válido este insumo?</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* DATOS DEL ALIMENTO */}
            {/* ============================================================ */}
            {tipoActual === 'alimento' && (
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 space-y-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase">🌾 Datos del Alimento</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-semibold text-gray-700">Nombre del alimento *</label>
                            <input 
                                type="text" 
                                placeholder="Ej: Concentrado, Maíz, Sorgo, etc." 
                                className={`border bg-white rounded-full p-2 text-sm px-4 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                                    errores.tipoAlimento ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'
                                }`}
                                value={form.tipoAlimento} 
                                onChange={manejarCambio}
                                name="tipoAlimento"
                            />
                            {errores.tipoAlimento && (
                                <p className="text-[9px] text-red-500 ml-4 mt-1">{errores.tipoAlimento}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-semibold text-gray-700">🐖 Especie destino *</label>
                            <select 
                                className={`border rounded-full p-2 text-sm bg-white px-4 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                                    errores.especieDestino ? 'border-red-400' : 'border-gray-200'
                                }`}
                                value={form.especieDestino} 
                                onChange={manejarCambio}
                                name="especieDestino"
                            >
                                <option value="">Seleccionar especie</option>
                                <option value="cerdos">🐷 Cerdos</option>
                                <option value="ganado">🐮 Ganado</option>
                            </select>
                            {errores.especieDestino && (
                                <p className="text-[9px] text-red-500 ml-4 mt-1">{errores.especieDestino}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-semibold text-gray-700">🏭 Proveedor</label>
                            <input 
                                type="text" 
                                placeholder="Nombre de la empresa o proveedor" 
                                className="border border-gray-200 bg-white rounded-full p-2 text-sm px-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.proveedor} 
                                onChange={manejarCambio}
                                name="proveedor"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-semibold text-gray-700">📂 Categoría</label>
                            <input 
                                type="text" 
                                placeholder="Ej: Balanceado, Suplemento, Grano" 
                                className="border border-gray-200 bg-white rounded-full p-2 text-sm px-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.categoriaAlimento} 
                                onChange={manejarCambio}
                                name="categoriaAlimento"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-semibold text-gray-700">⏰ Fecha de vencimiento (opcional)</label>
                            <input 
                                type="date" 
                                className="border border-gray-200 bg-white rounded-full p-2 text-sm px-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={form.fechaVencimiento} 
                                onChange={manejarCambio}
                                name="fechaVencimiento"
                            />
                            <span className="text-[8px] text-gray-400">¿Hasta cuándo es válido este alimento?</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MOTIVO */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase ml-4 text-emerald-600 font-black tracking-tighter">
                    💬 Motivo de la solicitud *
                </label>
                <textarea 
                    className={`border rounded-2xl p-3 text-sm resize-none px-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all ${
                        errores.motivo ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'
                    }`}
                    rows={3} 
                    placeholder="Ej: Se requiere para alimentación de cerdos, stock bajo, reposición de inventario, etc." 
                    value={form.motivo} 
                    onChange={manejarCambio}
                    name="motivo"
                />
                {errores.motivo && (
                    <p className="text-[9px] text-red-500 ml-4 mt-1">{errores.motivo}</p>
                )}
            </div>

            {/* ============================================================ */}
            {/* NOTA INFORMATIVA */}
            {/* ============================================================ */}
            <div className="text-[10px] text-gray-400 bg-gray-50 rounded-full p-2 text-center">
                📋 La solicitud se registrará con fecha, hora y usuario: <strong>{usuarioActual}</strong>
                <br />
                Estado inicial: <strong className="text-yellow-600">Pendiente</strong> - Solo el dueño puede aprobar/rechazar.
            </div>

            {/* ============================================================ */}
            {/* BOTONES */}
            {/* ============================================================ */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button 
                    type="button" 
                    onClick={onCancelar} 
                    disabled={enviando}
                    className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={enviando}
                    className="px-5 py-2 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {enviando ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        solicitudAEditar ? "✏️ Actualizar Solicitud" : "📤 Enviar Solicitud"
                    )}
                </button>
            </div>
        </form>
    );
};