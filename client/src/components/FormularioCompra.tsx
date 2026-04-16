import { useState } from "react";
import { Package, Calendar, User, FileText, AlertCircle, Truck } from "lucide-react";

type CategoriaGeneral = 'insumo' | 'alimento';

interface Props {
    tipoSeleccionado: CategoriaGeneral;
    setTipoSeleccionado: (tipo: CategoriaGeneral) => void;
    onGuardar: (datos: any, cerrar: boolean) => void;
    onCancelar: () => void;
}

export const FormularioCompra = ({ 
    tipoSeleccionado, 
    setTipoSeleccionado, 
    onGuardar, 
    onCancelar 
}: Props) => {
    
    const estadoInicial = {
        categoria_general: tipoSeleccionado,
        fecha_propuesta: new Date().toISOString().split('T')[0],
        cantidad: "",
        motivo: "",
        usuario: "",
        fecha_vencimiento: "",
        // Insumo
        categoria_insumo: "" as any,
        tipo_insumo: "",
        // Alimento
        especie_destino: "" as any,
        tipo_alimento: "",
        unidad_medida: "",
        proveedor: "",
        categoria_alimento: "",
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
        
        if (!formData.fecha_propuesta) nuevosErrores.fecha_propuesta = 'La fecha es obligatoria';
        if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
            nuevosErrores.cantidad = 'La cantidad debe ser mayor a 0';
        }
        if (!formData.usuario.trim()) nuevosErrores.usuario = 'El solicitante es obligatorio';
        if (!formData.motivo.trim()) nuevosErrores.motivo = 'El motivo es obligatorio';
        
        if (tipoSeleccionado === 'insumo') {
            if (!formData.categoria_insumo) nuevosErrores.categoria_insumo = 'Selecciona una categoría';
            if (!formData.tipo_insumo.trim()) nuevosErrores.tipo_insumo = 'El tipo de insumo es obligatorio';
        } else {
            if (!formData.especie_destino) nuevosErrores.especie_destino = 'Selecciona una especie';
            if (!formData.unidad_medida.trim()) nuevosErrores.unidad_medida = 'La unidad de medida es obligatoria';
        }
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // ============================================================
    // ENVIAR
    // ============================================================
    const ejecutarEnvio = (cerrar: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            ...formData,
            categoria_general: tipoSeleccionado,
            cantidad: parseFloat(formData.cantidad),
        };

        console.log('📤 Datos a enviar (Compra):', datosParaBackend);
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
            <div className="flex justify-center gap-6 p-3 bg-gray-50 rounded-full">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="tipo"
                        checked={tipoSeleccionado === 'insumo'}
                        onChange={() => setTipoSeleccionado('insumo')}
                        className="w-4 h-4 accent-teal-600"
                    />
                    <span className={`text-[12px] font-bold uppercase tracking-wider transition-all ${
                        tipoSeleccionado === 'insumo' ? 'text-teal-700' : 'text-gray-500'
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
                        className="w-4 h-4 accent-blue-600"
                    />
                    <span className={`text-[12px] font-bold uppercase tracking-wider transition-all ${
                        tipoSeleccionado === 'alimento' ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                        🌾 ALIMENTO
                    </span>
                </label>
            </div>

            {/* ============================================================ */}
            {/* CAMPOS COMUNES */}
            {/* ============================================================ */}
            <div className="grid grid-cols-2 gap-3">
                {/* Fecha Propuesta */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-teal-500 font-black tracking-tighter">
                        <Calendar size={10} className="inline mr-1" />
                        Fecha Propuesta <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fecha_propuesta"
                        value={formData.fecha_propuesta}
                        onChange={manejarCambio}
                        type="date"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.fecha_propuesta ? 'border-red-400 focus:ring-red-300' : 'border-teal-100 focus:ring-teal-300'
                        }`}
                    />
                    {errores.fecha_propuesta && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fecha_propuesta}</p>
                    )}
                </div>

                {/* Cantidad */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-teal-500 font-black tracking-tighter">
                        <Package size={10} className="inline mr-1" />
                        Cantidad <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="cantidad"
                        value={formData.cantidad}
                        onChange={manejarCambioNumerico}
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                            errores.cantidad ? 'border-red-400 focus:ring-red-300' : 'border-teal-200 focus:ring-teal-300'
                        }`}
                    />
                    {errores.cantidad && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.cantidad}</p>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* CAMPOS ESPECÍFICOS SEGÚN TIPO */}
            {/* ============================================================ */}
            {tipoSeleccionado === 'insumo' ? (
                <div className="bg-teal-50/50 p-4 rounded-2xl space-y-3 border border-teal-200">
                    <p className="text-[10px] uppercase font-black text-teal-600 tracking-wider">
                        🛒 DETALLES DEL INSUMO
                    </p>
                    
                    <select
                        name="categoria_insumo"
                        value={formData.categoria_insumo}
                        onChange={manejarCambio}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.categoria_insumo ? 'border-red-400 focus:ring-red-300' : 'border-teal-200 focus:ring-teal-300'
                        }`}
                    >
                        <option value="">CATEGORÍA DE INSUMO *</option>
                        <option value="fertilizante">🌱 FERTILIZANTE</option>
                        <option value="herramienta">🔧 HERRAMIENTA</option>
                        <option value="empaque">📦 EMPAQUE</option>
                    </select>
                    {errores.categoria_insumo && (
                        <p className="text-[9px] text-red-500 ml-4">{errores.categoria_insumo}</p>
                    )}

                    <input
                        name="tipo_insumo"
                        value={formData.tipo_insumo}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="TIPO DE INSUMO (Ej: Urea) *"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.tipo_insumo ? 'border-red-400 focus:ring-red-300' : 'border-teal-200 focus:ring-teal-300'
                        }`}
                    />
                    {errores.tipo_insumo && (
                        <p className="text-[9px] text-red-500 ml-4">{errores.tipo_insumo}</p>
                    )}
                </div>
            ) : (
                <div className="bg-blue-50/50 p-4 rounded-2xl space-y-3 border border-blue-200">
                    <p className="text-[10px] uppercase font-black text-blue-600 tracking-wider">
                        🌾 DETALLES DEL ALIMENTO
                    </p>
                    
                    <select
                        name="especie_destino"
                        value={formData.especie_destino}
                        onChange={manejarCambio}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.especie_destino ? 'border-red-400 focus:ring-red-300' : 'border-blue-200 focus:ring-blue-300'
                        }`}
                    >
                        <option value="">ESPECIE DESTINO *</option>
                        <option value="cerdos">🐖 CERDOS</option>
                        <option value="peces">🐟 PECES</option>
                        <option value="ganado">🐄 GANADO</option>
                        <option value="gallinas">🐔 GALLINAS</option>
                    </select>
                    {errores.especie_destino && (
                        <p className="text-[9px] text-red-500 ml-4">{errores.especie_destino}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <input
                            name="tipo_alimento"
                            value={formData.tipo_alimento}
                            onChange={manejarCambio}
                            type="text"
                            placeholder="TIPO ALIMENTO"
                            className="border-1 border-blue-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <input
                            name="unidad_medida"
                            value={formData.unidad_medida}
                            onChange={manejarCambio}
                            type="text"
                            placeholder="UNIDAD (Ej: Bulto 40kg) *"
                            className={`border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                                errores.unidad_medida ? 'border-red-400 focus:ring-red-300' : 'border-blue-200 focus:ring-blue-300'
                            }`}
                        />
                    </div>
                    {errores.unidad_medida && (
                        <p className="text-[9px] text-red-500 ml-4">{errores.unidad_medida}</p>
                    )}

                    <input
                        name="proveedor"
                        value={formData.proveedor}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="PROVEEDOR SUGERIDO"
                        className="w-full border-1 border-blue-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
            )}

            {/* ============================================================ */}
            {/* CAMPOS ADICIONALES */}
            {/* ============================================================ */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-teal-500 font-black tracking-tighter">
                        <AlertCircle size={10} className="inline mr-1" />
                        Fecha Vencimiento
                    </label>
                    <input
                        name="fecha_vencimiento"
                        value={formData.fecha_vencimiento}
                        onChange={manejarCambio}
                        type="date"
                        className="border-1 border-teal-100 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-500"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-teal-500 font-black tracking-tighter">
                        <User size={10} className="inline mr-1" />
                        Solicitante <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="usuario"
                        value={formData.usuario}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="Nombre del solicitante"
                        className={`border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.usuario ? 'border-red-400 focus:ring-red-300' : 'border-teal-200 focus:ring-teal-300'
                        }`}
                    />
                    {errores.usuario && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.usuario}</p>
                    )}
                </div>
            </div>

            {/* Motivo */}
            <div>
                <label className="text-[9px] uppercase ml-4 text-teal-500 font-black tracking-tighter">
                    <FileText size={10} className="inline mr-1" />
                    Motivo de la Solicitud <span className="text-red-400">*</span>
                </label>
                <textarea
                    name="motivo"
                    value={formData.motivo}
                    onChange={manejarCambio}
                    placeholder="Describa el motivo de la compra..."
                    rows={2}
                    className={`w-full border-1 rounded-2xl px-6 py-2 text-[12px] focus:outline-none focus:ring-2 resize-none transition-all ${
                        errores.motivo ? 'border-red-400 focus:ring-red-300' : 'border-teal-200 focus:ring-teal-300'
                    }`}
                />
                {errores.motivo && (
                    <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.motivo}</p>
                )}
            </div>

            {/* ============================================================ */}
            {/* BOTONES */}
            {/* ============================================================ */}
            <div className="flex justify-between gap-4 mt-4">
                <button
                    type="button"
                    onClick={() => ejecutarEnvio(false)}
                    className="flex-1 bg-white border-1 border-teal-400 text-teal-500 px-6 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-teal-50 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button
                    type="button"
                    onClick={() => ejecutarEnvio(true)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    Registrar Solicitud
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