import { useState } from "react";
import { Package, Calendar, User, FileText, AlertCircle, Truck, Hash, DollarSign, Building, CheckCircle, Search } from "lucide-react";

type CategoriaGeneral = 'insumo' | 'alimento';

interface SolicitudAprobada {
    id_solicitud: number;
    tipo: 'insumo' | 'alimento';
    nombre_producto: string;
    cantidad: number;
    unidad_medida: string;
    proveedor_sugerido?: string;
    motivo: string;
}

interface Props {
    tipoSeleccionado: CategoriaGeneral;
    setTipoSeleccionado: (tipo: CategoriaGeneral) => void;
    onGuardar: (datos: any, cerrar: boolean) => void;
    onCancelar: () => void;
    solicitudesAprobadas?: SolicitudAprobada[]; // Lista de solicitudes aprobadas por el dueño
}

export const FormularioCompra = ({ 
    tipoSeleccionado, 
    setTipoSeleccionado, 
    onGuardar, 
    onCancelar,
    solicitudesAprobadas = []
}: Props) => {
    
    const estadoInicial = {
        // Selección de solicitud aprobada
        id_solicitud: "",
        solicitudSeleccionada: null as SolicitudAprobada | null,
        
        // Datos reales de compra (para LoteInv)
        fecha_compra_real: new Date().toISOString().split('T')[0],
        numero_lote: "",
        cantidad_real: "",
        precio_unitario: "",
        precio_total: "",
        factura: "",
        fecha_vencimiento: "",
        proveedor_real: "",
        observaciones: "",
        
        // Datos del producto (se autocompletan al seleccionar solicitud)
        categoria_general: tipoSeleccionado,
        nombre_producto: "",
        unidad_medida: "",
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [errores, setErrores] = useState<Record<string, string>>({});

    // ============================================================
    // MANEJADORES
    // ============================================================
    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
        
        // Calcular precio total automáticamente
        if (name === 'cantidad_real' || name === 'precio_unitario') {
            const cantidad = name === 'cantidad_real' ? parseFloat(value) : parseFloat(formData.cantidad_real);
            const precioUnit = name === 'precio_unitario' ? parseFloat(value) : parseFloat(formData.precio_unitario);
            if (!isNaN(cantidad) && !isNaN(precioUnit)) {
                const total = cantidad * precioUnit;
                setFormData(prev => ({ ...prev, precio_total: total.toFixed(2) }));
            }
        }
    };

    const manejarCambioNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (value && parseFloat(value) > 0) {
                setErrores(prev => ({ ...prev, [name]: '' }));
            }
            
            // Recalcular precio total
            if (name === 'cantidad_real' || name === 'precio_unitario') {
                const cantidad = name === 'cantidad_real' ? parseFloat(value) : parseFloat(formData.cantidad_real);
                const precioUnit = name === 'precio_unitario' ? parseFloat(value) : parseFloat(formData.precio_unitario);
                if (!isNaN(cantidad) && !isNaN(precioUnit)) {
                    const total = cantidad * precioUnit;
                    setFormData(prev => ({ ...prev, precio_total: total.toFixed(2) }));
                }
            }
        }
    };

    // Seleccionar solicitud aprobada
    const seleccionarSolicitud = (id_solicitud: string) => {
        const solicitud = solicitudesAprobadas.find(s => s.id_solicitud.toString() === id_solicitud);
        if (solicitud) {
            setFormData(prev => ({
                ...prev,
                id_solicitud,
                solicitudSeleccionada: solicitud,
                nombre_producto: solicitud.nombre_producto,
                unidad_medida: solicitud.unidad_medida,
                cantidad_real: solicitud.cantidad.toString(),
                proveedor_real: solicitud.proveedor_sugerido || "",
            }));
        }
    };

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!formData.id_solicitud) nuevosErrores.id_solicitud = 'Debes seleccionar una solicitud aprobada';
        if (!formData.fecha_compra_real) nuevosErrores.fecha_compra_real = 'La fecha de compra es obligatoria';
        if (!formData.numero_lote.trim()) nuevosErrores.numero_lote = 'El número de lote es obligatorio';
        if (!formData.cantidad_real || parseFloat(formData.cantidad_real) <= 0) {
            nuevosErrores.cantidad_real = 'La cantidad real debe ser mayor a 0';
        }
        if (!formData.precio_unitario || parseFloat(formData.precio_unitario) <= 0) {
            nuevosErrores.precio_unitario = 'El precio unitario es obligatorio';
        }
        if (!formData.proveedor_real.trim()) nuevosErrores.proveedor_real = 'El proveedor es obligatorio';
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // ============================================================
    // ENVIAR
    // ============================================================
    const ejecutarEnvio = (cerrar: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            id_solicitud: parseInt(formData.id_solicitud),
            fecha_compra_real: formData.fecha_compra_real,
            numero_lote: formData.numero_lote,
            cantidad_real: parseFloat(formData.cantidad_real),
            precio_unitario: parseFloat(formData.precio_unitario),
            precio_total: parseFloat(formData.precio_total || '0'),
            factura: formData.factura,
            fecha_vencimiento: formData.fecha_vencimiento || null,
            proveedor_real: formData.proveedor_real,
            observaciones: formData.observaciones,
            tipo: tipoSeleccionado,
            nombre_producto: formData.nombre_producto,
            unidad_medida: formData.unidad_medida,
        };

        console.log('📦 Datos a enviar (Registro de Compra Real):', datosParaBackend);
        onGuardar(datosParaBackend, cerrar);
        
        if (!cerrar) {
            setFormData(estadoInicial);
            setErrores({});
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <form className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500 p-2">
            {/* ============================================================ */}
            {/* SELECTOR DE TIPO (INSUMO / ALIMENTO) */}
            {/* ============================================================ */}
            <div className="flex justify-center gap-6 p-3 bg-orange-50 rounded-full border border-orange-200">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="tipo"
                        checked={tipoSeleccionado === 'insumo'}
                        onChange={() => setTipoSeleccionado('insumo')}
                        className="w-4 h-4 accent-orange-600"
                    />
                    <span className={`text-[12px] font-bold uppercase tracking-wider transition-all ${
                        tipoSeleccionado === 'insumo' ? 'text-orange-700' : 'text-gray-500'
                    }`}>
                        🛒 INSUMO
                    </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="tipo"
                        checked={tipoSeleccionado === 'alimento'}
                        onChange={() => setTipoSeleccionado('alimento')}
                        className="w-4 h-4 accent-orange-600"
                    />
                    <span className={`text-[12px] font-bold uppercase tracking-wider transition-all ${
                        tipoSeleccionado === 'alimento' ? 'text-orange-700' : 'text-gray-500'
                    }`}>
                        🌾 ALIMENTO
                    </span>
                </label>
            </div>

            {/* ============================================================ */}
            {/* SELECCIONAR SOLICITUD APROBADA */}
            {/* ============================================================ */}
            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-200">
                <p className="text-[10px] uppercase font-black text-orange-600 tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle size={12} />
                    SOLICITUD APROBADA A EJECUTAR
                </p>
                
                <select
                    name="id_solicitud"
                    value={formData.id_solicitud}
                    onChange={(e) => seleccionarSolicitud(e.target.value)}
                    className={`w-full border-1 rounded-full px-6 py-3 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                        errores.id_solicitud ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                    }`}
                >
                    <option value="">-- Seleccionar solicitud aprobada --</option>
                    {solicitudesAprobadas.map((solicitud) => (
                        <option key={solicitud.id_solicitud} value={solicitud.id_solicitud}>
                            #{solicitud.id_solicitud} - {solicitud.nombre_producto} ({solicitud.cantidad} {solicitud.unidad_medida})
                        </option>
                    ))}
                </select>
                {errores.id_solicitud && (
                    <p className="text-[9px] text-red-500 ml-4 mt-1">{errores.id_solicitud}</p>
                )}
                
                {formData.solicitudSeleccionada && (
                    <div className="mt-3 p-3 bg-white rounded-full text-[10px] text-gray-600 flex items-center justify-between">
                        <span>📋 Motivo: {formData.solicitudSeleccionada.motivo}</span>
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* DATOS REALES DE COMPRA */}
            {/* ============================================================ */}
            <div className="bg-orange-50/30 p-4 rounded-2xl border border-orange-100">
                <p className="text-[10px] uppercase font-black text-orange-600 tracking-wider mb-3 flex items-center gap-2">
                    <Truck size={12} />
                    DATOS REALES DE LA COMPRA
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                    {/* Fecha Compra Real */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase ml-4 text-orange-500 font-black tracking-tighter">
                            <Calendar size={10} className="inline mr-1" />
                            Fecha de Compra <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="fecha_compra_real"
                            value={formData.fecha_compra_real}
                            onChange={manejarCambio}
                            type="date"
                            className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                                errores.fecha_compra_real ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                            }`}
                        />
                        {errores.fecha_compra_real && (
                            <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fecha_compra_real}</p>
                        )}
                    </div>

                    {/* Número de Lote */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase ml-4 text-orange-500 font-black tracking-tighter">
                            <Hash size={10} className="inline mr-1" />
                            Número de Lote <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="numero_lote"
                            value={formData.numero_lote}
                            onChange={manejarCambio}
                            type="text"
                            placeholder="Ej: LOT-2024-001"
                            className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 transition-all ${
                                errores.numero_lote ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                            }`}
                        />
                        {errores.numero_lote && (
                            <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.numero_lote}</p>
                        )}
                    </div>

                    {/* Cantidad Real */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase ml-4 text-orange-500 font-black tracking-tighter">
                            <Package size={10} className="inline mr-1" />
                            Cantidad Real <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="cantidad_real"
                            value={formData.cantidad_real}
                            onChange={manejarCambioNumerico}
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                                errores.cantidad_real ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                            }`}
                        />
                        {errores.cantidad_real && (
                            <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.cantidad_real}</p>
                        )}
                        {formData.unidad_medida && (
                            <span className="text-[8px] text-gray-400 ml-4">Unidad: {formData.unidad_medida}</span>
                        )}
                    </div>

                    {/* Precio Unitario */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase ml-4 text-orange-500 font-black tracking-tighter">
                            <DollarSign size={10} className="inline mr-1" />
                            Precio Unitario <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="precio_unitario"
                            value={formData.precio_unitario}
                            onChange={manejarCambioNumerico}
                            type="text"
                            inputMode="decimal"
                            placeholder="$0.00"
                            className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                                errores.precio_unitario ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                            }`}
                        />
                        {errores.precio_unitario && (
                            <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.precio_unitario}</p>
                        )}
                    </div>

                    {/* Precio Total (automático) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase ml-4 text-orange-500 font-black tracking-tighter">
                            <DollarSign size={10} className="inline mr-1" />
                            Precio Total
                        </label>
                        <input
                            name="precio_total"
                            value={formData.precio_total}
                            readOnly
                            type="text"
                            placeholder="$0.00"
                            className="border-1 border-orange-200 rounded-full px-6 py-2 text-[11px] bg-orange-50 text-right font-bold text-orange-700"
                        />
                    </div>

                    {/* Número de Factura */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase ml-4 text-orange-500 font-black tracking-tighter">
                            <FileText size={10} className="inline mr-1" />
                            Número de Factura
                        </label>
                        <input
                            name="factura"
                            value={formData.factura}
                            onChange={manejarCambio}
                            type="text"
                            placeholder="Ej: FAC-001"
                            className="border-1 border-orange-200 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                    </div>
                </div>
            </div>

            {/* ============================================================ */}
            {/* FECHA VENCIMIENTO Y PROVEEDOR */}
            {/* ============================================================ */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-orange-500 font-black tracking-tighter">
                        <AlertCircle size={10} className="inline mr-1" />
                        Fecha de Vencimiento
                    </label>
                    <input
                        name="fecha_vencimiento"
                        value={formData.fecha_vencimiento}
                        onChange={manejarCambio}
                        type="date"
                        className="border-1 border-orange-200 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-500"
                    />
                    <span className="text-[8px] text-gray-400 ml-4">Opcional - solo si aplica</span>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-orange-500 font-black tracking-tighter">
                        <Building size={10} className="inline mr-1" />
                        Proveedor Real <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="proveedor_real"
                        value={formData.proveedor_real}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="Nombre del proveedor"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 transition-all ${
                            errores.proveedor_real ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                        }`}
                    />
                    {errores.proveedor_real && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.proveedor_real}</p>
                    )}
                </div>
            </div>

            {/* Observaciones */}
            <div>
                <label className="text-[9px] uppercase ml-4 text-orange-500 font-black tracking-tighter">
                    <FileText size={10} className="inline mr-1" />
                    Observaciones de la Compra
                </label>
                <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={manejarCambio}
                    placeholder="Información adicional sobre la compra, condiciones, garantía, etc."
                    rows={2}
                    className="w-full border-1 border-orange-200 rounded-2xl px-6 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
            </div>

            {/* ============================================================ */}
            {/* BOTONES */}
            {/* ============================================================ */}
            <div className="flex justify-between gap-4 mt-4">
                <button
                    type="button"
                    onClick={() => ejecutarEnvio(false)}
                    className="flex-1 bg-white border-1 border-orange-400 text-orange-500 px-6 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-orange-50 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button
                    type="button"
                    onClick={() => ejecutarEnvio(true)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    Registrar Compra
                </button>
            </div>

            {/* Botón Cancelar */}
            <div className="flex justify-center">
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