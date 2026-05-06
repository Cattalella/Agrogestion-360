import { useState, useRef } from "react";
import { Camera, Package, Calendar, User, FileText, DollarSign } from "lucide-react";

interface InsumoInventario {
    id: string;
    nombre: string;
    stock: number;
    unidad: string;
    categoria?: string;
}

interface Trabajador {
    id_trabajador: number;
    nombre_completo: string;
    tipo_trabajo: string;
    estado: string;
}

type ActividadConsumo = 'siembra' | 'mantenimiento' | 'alimentación' | 'vacunación';

interface Props {
    inventario: InsumoInventario[];
    trabajadoresActivos: Trabajador[];
    onGuardar: (datos: any, cerrar: boolean) => void;
    onCancelar: () => void;
}

export const FormularioConsumoInsumos = ({
    inventario,
    trabajadoresActivos,
    onGuardar,
    onCancelar
}: Props) => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [errores, setErrores] = useState<Record<string, string>>({});

    const estadoInicial = {
        actividadSeleccionada: "siembra" as ActividadConsumo,
        fechaPropuesta: new Date().toISOString().split('T')[0],
        tipoInsumoId: "",
        cantidadSolicitada: "",
        precio_unitario: "",  // ✅ AGREGAR
        responsable: "",
        motivo: "",
        evidencia_fotografica: ""
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [errorStock, setErrorStock] = useState("");

    const insumoSeleccionado = inventario.find(i => i.id === formData.tipoInsumoId);

    // ✅ Formatear precio unitario
    const formatearPrecio = (valor: string): string => {
        const numeros = valor.replace(/\D/g, '');
        if (!numeros) return '';
        return new Intl.NumberFormat('es-CO').format(parseInt(numeros));
    };

    const limpiarFormateo = (valor: string): number => {
        return parseInt(valor.replace(/\D/g, '')) || 0;
    };

    const precioUnitarioFormateado = formData.precio_unitario 
        ? formatearPrecio(formData.precio_unitario.toString()) 
        : '';

    // ============================================================
    // MANEJADORES
    // ============================================================
    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
        
        if (name === 'tipoInsumoId' || name === 'cantidadSolicitada') {
            validarStock(
                name === 'tipoInsumoId' ? value : formData.tipoInsumoId,
                name === 'cantidadSolicitada' ? parseFloat(value) || 0 : parseFloat(formData.cantidadSolicitada) || 0
            );
        }
    };

    const manejarCambioPrecio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const valorLimpio = limpiarFormateo(value);
        setFormData(prev => ({ ...prev, [name]: valorLimpio.toString() }));
    };

    const validarStock = (insumoId: string, cantidad: number) => {
        const insumo = inventario.find(i => i.id === insumoId);
        if (insumo && cantidad > insumo.stock) {
            setErrorStock(`Solo hay ${insumo.stock} ${insumo.unidad} disponibles.`);
        } else {
            setErrorStock("");
        }
    };

    const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreview(base64);
                setFormData(prev => ({ ...prev, evidencia_fotografica: base64 }));
                setErrores(prev => ({ ...prev, evidencia_url: '' }));
            };
            reader.readAsDataURL(file);
        }
    };

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!formData.fechaPropuesta) nuevosErrores.fechaPropuesta = 'La fecha es obligatoria';
        if (!formData.tipoInsumoId) nuevosErrores.tipoInsumo = 'Selecciona un insumo';
        if (!formData.cantidadSolicitada || parseFloat(formData.cantidadSolicitada) <= 0) {
            nuevosErrores.cantidad = 'La cantidad debe ser mayor a 0';
        }
        if (!formData.precio_unitario || limpiarFormateo(formData.precio_unitario) <= 0) {
            nuevosErrores.precio_unitario = 'El precio unitario es obligatorio';
        }
        if (!formData.responsable) nuevosErrores.responsable = 'Selecciona un responsable';
        if (!formData.motivo.trim()) nuevosErrores.motivo = 'El motivo es obligatorio';
        if (errorStock) nuevosErrores.stock = errorStock;
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // ============================================================
    // ENVIAR
    // ============================================================
    const ejecutarEnvio = (cerrar: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            id_insumo: formData.tipoInsumoId,
            cantidad: parseFloat(formData.cantidadSolicitada),
            actividad: formData.actividadSeleccionada,
            fecha_consumo: formData.fechaPropuesta,
            id_responsable: parseInt(formData.responsable),
            observaciones: formData.motivo,
            precio_unitario: limpiarFormateo(formData.precio_unitario),  // ✅ AGREGAR
            evidencia_fotografica: formData.evidencia_fotografica || null
        };

        console.log('📤 Datos a enviar (Consumo):', datosParaBackend);
        onGuardar(datosParaBackend, cerrar);
        
        if (!cerrar) {
            setFormData(estadoInicial);
            setPreview(null);
            setErrores({});
            setErrorStock("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 p-2">
            {/* ============================================================ */}
            {/* COLUMNA IZQUIERDA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">
                {/* Actividad */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-emerald-500 font-black tracking-tighter">
                        Actividad <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="actividadSeleccionada"
                        value={formData.actividadSeleccionada}
                        onChange={manejarCambio}
                        className="w-full border-1 border-emerald-200 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 text-emerald-700 font-bold"
                    >
                        <option value="siembra">🌱 SIEMBRA</option>
                        <option value="mantenimiento">🔧 MANTENIMIENTO</option>
                        <option value="alimentación">🌾 ALIMENTACIÓN</option>
                        <option value="vacunación">💉 VACUNACIÓN</option>
                    </select>
                </div>

                {/* Fecha */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-500 font-black tracking-tighter">
                        <Calendar size={10} className="inline mr-1" />
                        Fecha <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fechaPropuesta"
                        value={formData.fechaPropuesta}
                        onChange={manejarCambio}
                        type="date"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.fechaPropuesta ? 'border-red-400 focus:ring-red-300' : 'border-emerald-100 focus:ring-emerald-300'
                        }`}
                    />
                    {errores.fechaPropuesta && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fechaPropuesta}</p>
                    )}
                </div>

                {/* Seleccionar Insumo */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-emerald-500 font-black tracking-tighter">
                        <Package size={10} className="inline mr-1" />
                        Insumo <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="tipoInsumoId"
                        value={formData.tipoInsumoId}
                        onChange={manejarCambio}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.tipoInsumo ? 'border-red-400 focus:ring-red-300' : 'border-emerald-200 focus:ring-emerald-300'
                        }`}
                    >
                        <option value="">-- BUSCAR EN INVENTARIO --</option>
                        {inventario.map(insumo => (
                            <option key={insumo.id} value={insumo.id}>
                                {insumo.nombre} (Disp: {insumo.stock} {insumo.unidad})
                            </option>
                        ))}
                    </select>
                    {errores.tipoInsumo && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipoInsumo}</p>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">
                {/* Cantidad con unidad */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-emerald-500 font-black tracking-tighter">
                        Cantidad <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="cantidadSolicitada"
                            value={formData.cantidadSolicitada}
                            onChange={manejarCambio}
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className={`w-full border-1 rounded-full pl-4 pr-16 py-2 text-[12px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                                errores.cantidad || errorStock ? 'border-red-400 focus:ring-red-300' : 'border-emerald-200 focus:ring-emerald-300'
                            }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-500 bg-white px-2">
                            {insumoSeleccionado?.unidad || '---'}
                        </span>
                    </div>
                    {(errores.cantidad || errorStock) && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.cantidad || errorStock}</p>
                    )}
                </div>

                {/* Precio Unitario */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-emerald-500 font-black tracking-tighter">
                        <DollarSign size={10} className="inline mr-1" />
                        Precio Unitario <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            name="precio_unitario"
                            value={precioUnitarioFormateado}
                            onChange={manejarCambioPrecio}
                            type="text"
                            inputMode="numeric"
                            placeholder="$0"
                            className={`w-full border-1 rounded-full pl-4 pr-12 py-2 text-[12px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                                errores.precio_unitario ? 'border-red-400 focus:ring-red-300' : 'border-emerald-200 focus:ring-emerald-300'
                            }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-500">$</span>
                    </div>
                    {errores.precio_unitario && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.precio_unitario}</p>
                    )}
                </div>

                {/* Responsable */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-emerald-500 font-black tracking-tighter">
                        <User size={10} className="inline mr-1" />
                        Responsable <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="responsable"
                        value={formData.responsable}
                        onChange={manejarCambio}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.responsable ? 'border-red-400 focus:ring-red-300' : 'border-emerald-200 focus:ring-emerald-300 text-emerald-700 font-bold'
                        }`}
                    >
                        <option value="">-- SELECCIONAR TRABAJADOR --</option>
                        {trabajadoresActivos.map(t => (
                            <option key={t.id_trabajador} value={t.id_trabajador}>
                                {t.nombre_completo} ({t.tipo_trabajo})
                            </option>
                        ))}
                    </select>
                    {errores.responsable && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.responsable}</p>
                    )}
                </div>

                {/* Motivo */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-emerald-500 font-black tracking-tighter">
                        <FileText size={10} className="inline mr-1" />
                        Motivo <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        name="motivo"
                        value={formData.motivo}
                        onChange={manejarCambio}
                        placeholder="Describa el motivo del consumo..."
                        rows={2}
                        className={`border-1 rounded-2xl px-6 py-2 text-[12px] focus:outline-none focus:ring-2 resize-none transition-all ${
                            errores.motivo ? 'border-red-400 focus:ring-red-300' : 'border-emerald-200 focus:ring-emerald-300'
                        }`}
                    />
                    {errores.motivo && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.motivo}</p>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* EVIDENCIA FOTOGRÁFICA */}
            {/* ============================================================ */}
            <div className="col-span-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={manejarArchivo}
                    accept="image/*"
                    className="hidden"
                />
                
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-1 border-dashed rounded-[1.5rem] p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all min-h-[80px] relative overflow-hidden border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400"
                >
                    {preview ? (
                        <>
                            <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" alt="Evidencia" />
                            <div className="absolute inset-0 bg-emerald-900/20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Camera size={18} className="text-white drop-shadow-md" />
                                <span className="text-[8px] font-black text-white uppercase tracking-widest mt-1">Cambiar Evidencia</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-[9px] uppercase font-black tracking-widest text-emerald-600">
                                📸 EVIDENCIA FOTOGRÁFICA (OPCIONAL)
                            </p>
                            <div className="w-8 h-8 border-1 border-emerald-200 rounded-full flex items-center justify-center bg-white shadow-sm group-hover:rotate-90 transition-transform">
                                <Camera size={14} className="text-emerald-400" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* BOTONES */}
            {/* ============================================================ */}
            <div className="col-span-2 flex justify-between gap-4 mt-4">
                <button
                    type="button"
                    onClick={() => ejecutarEnvio(false)}
                    className="flex-1 bg-white border-1 border-emerald-400 text-emerald-500 px-6 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-emerald-50 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button
                    type="button"
                    onClick={() => ejecutarEnvio(true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    Guardar y Salir
                </button>
            </div>

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