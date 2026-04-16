import { useState, useEffect, useRef } from "react";
import { Camera, Clock, Wrench } from "lucide-react";

interface TrabajoRealizado {
    id_mantenimiento: string;
    id_trabajador: string;
    categoria_trabajo: string;
    tipo_actividad: string;
    fecha_inicio: string;
    fecha_fin: string;
    evidencia_fotografica: string;
    observaciones: string;
}

interface Props {
    trabajoAEditar: TrabajoRealizado | null;
    listaTrabajadores: any[];  // 🆕 Lista de trabajadores activos
    onGuardar: (datos: any, cerrar: boolean) => void;
    onCancelar: () => void;
}

export const FormularioTrabajoRealizado = ({ 
    trabajoAEditar, 
    listaTrabajadores,
    onGuardar, 
    onCancelar 
}: Props) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [errores, setErrores] = useState<Record<string, string>>({});

    const estadoInicial = {
        id_mantenimiento: "",
        id_trabajador: "",
        categoria_trabajo: "",
        tipo_actividad: "",
        fecha_inicio: "",
        fecha_fin: "",
        evidencia_fotografica: "",
        observaciones: "",
    };

    const [formData, setFormData] = useState(estadoInicial);

    // ============================================================
    // CARGAR DATOS SI ES EDICIÓN
    // ============================================================
    useEffect(() => {
        if (trabajoAEditar) {
            setFormData({
                id_mantenimiento: trabajoAEditar.id_mantenimiento || "",
                id_trabajador: trabajoAEditar.id_trabajador || "",
                categoria_trabajo: trabajoAEditar.categoria_trabajo || "",
                tipo_actividad: trabajoAEditar.tipo_actividad || "",
                fecha_inicio: trabajoAEditar.fecha_inicio || "",
                fecha_fin: trabajoAEditar.fecha_fin || "",
                evidencia_fotografica: trabajoAEditar.evidencia_fotografica || "",
                observaciones: trabajoAEditar.observaciones || "",
            });
            if (trabajoAEditar.evidencia_fotografica) {
                setPreview(trabajoAEditar.evidencia_fotografica);
            }
        }
    }, [trabajoAEditar]);

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

    const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreview(base64);
                setFormData(prev => ({ ...prev, evidencia_fotografica: base64 }));
            };
            reader.readAsDataURL(file);
        }
    };

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!formData.id_mantenimiento) nuevosErrores.id_mantenimiento = 'ID de mantenimiento requerido';
        if (!formData.id_trabajador) nuevosErrores.id_trabajador = 'Selecciona un trabajador';
        if (!formData.categoria_trabajo) nuevosErrores.categoria_trabajo = 'Categoría requerida';
        if (!formData.tipo_actividad) nuevosErrores.tipo_actividad = 'Tipo de actividad requerido';
        if (!formData.fecha_inicio) nuevosErrores.fecha_inicio = 'Fecha de inicio requerida';
        if (!formData.fecha_fin) nuevosErrores.fecha_fin = 'Fecha de fin requerida';
        if (!formData.evidencia_fotografica) nuevosErrores.evidencia_fotografica = 'Evidencia fotográfica obligatoria';
        
        // Validar que fecha fin sea posterior a fecha inicio
        if (formData.fecha_inicio && formData.fecha_fin) {
            const inicio = new Date(formData.fecha_inicio);
            const fin = new Date(formData.fecha_fin);
            if (fin <= inicio) {
                nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior al inicio';
            }
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
            id_trabajador: parseInt(formData.id_trabajador),
        };

        console.log('📤 Datos a enviar (Trabajo):', datosParaBackend);
        onGuardar(datosParaBackend, cerrar);
        
        if (!cerrar && !trabajoAEditar) {
            setFormData(estadoInicial);
            setPreview(null);
            setErrores({});
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
                {/* ID Mantenimiento */}
                <div>
                    <input
                        name="id_mantenimiento"
                        value={formData.id_mantenimiento}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="ID MANTENIMIENTO *"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.id_mantenimiento ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    />
                    {errores.id_mantenimiento && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.id_mantenimiento}</p>
                    )}
                </div>

                {/* ID Trabajador - Select */}
                <div>
                    <select
                        name="id_trabajador"
                        value={formData.id_trabajador}
                        onChange={manejarCambio}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.id_trabajador ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300 text-amber-700 font-bold'
                        }`}
                    >
                        <option value="">SELECCIONAR TRABAJADOR *</option>
                        {listaTrabajadores.filter(t => t.estado === 'Activo').map(t => (
                            <option key={t.id_trabajador} value={t.id_trabajador}>
                                {t.nombre_completo} - {t.tipo_trabajo}
                            </option>
                        ))}
                    </select>
                    {errores.id_trabajador && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.id_trabajador}</p>
                    )}
                </div>

                {/* Categoría del Trabajo */}
                <div>
                    <input
                        name="categoria_trabajo"
                        value={formData.categoria_trabajo}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="CATEGORÍA DEL TRABAJO *"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.categoria_trabajo ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    />
                    {errores.categoria_trabajo && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.categoria_trabajo}</p>
                    )}
                </div>

                {/* Tipo de Actividad */}
                <div>
                    <input
                        name="tipo_actividad"
                        value={formData.tipo_actividad}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="TIPO DE ACTIVIDAD *"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.tipo_actividad ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    />
                    {errores.tipo_actividad && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipo_actividad}</p>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">
                {/* Fecha Inicio */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-amber-400 font-black tracking-tighter">
                        <Clock size={10} className="inline mr-1" />
                        Fecha Inicio <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={manejarCambio}
                        type="datetime-local"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.fecha_inicio ? 'border-red-400 focus:ring-red-300' : 'border-amber-100 focus:ring-amber-300'
                        }`}
                    />
                    {errores.fecha_inicio && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fecha_inicio}</p>
                    )}
                </div>

                {/* Fecha Fin */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-amber-400 font-black tracking-tighter">
                        <Clock size={10} className="inline mr-1" />
                        Fecha Fin <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fecha_fin"
                        value={formData.fecha_fin}
                        onChange={manejarCambio}
                        type="datetime-local"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.fecha_fin ? 'border-red-400 focus:ring-red-300' : 'border-amber-100 focus:ring-amber-300'
                        }`}
                    />
                    {errores.fecha_fin && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fecha_fin}</p>
                    )}
                </div>

                {/* Observaciones */}
                <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={manejarCambio}
                    placeholder="OBSERVACIONES"
                    rows={2}
                    className="border-1 border-amber-200 rounded-2xl px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                />

                {/* Evidencia Fotográfica */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={manejarArchivo}
                    accept="image/*"
                    className="hidden"
                />
                
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`group border-1 border-dashed rounded-[1.5rem] p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all min-h-[100px] relative overflow-hidden ${
                        errores.evidencia_fotografica ? 'border-red-400 bg-red-50' : 'border-amber-200 hover:bg-amber-50 hover:border-amber-400'
                    }`}
                >
                    {preview ? (
                        <>
                            <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" alt="Evidencia" />
                            <div className="absolute inset-0 bg-amber-900/20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Camera size={18} className="text-white drop-shadow-md" />
                                <span className="text-[8px] font-black text-white uppercase tracking-widest mt-1">Cambiar</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-[9px] uppercase font-black tracking-widest text-amber-600">
                                {errores.evidencia_fotografica ? 'EVIDENCIA OBLIGATORIA *' : 'EVIDENCIA FOTOGRÁFICA *'}
                            </p>
                            <div className="w-8 h-8 border-1 border-amber-200 rounded-full flex items-center justify-center bg-white shadow-sm group-hover:rotate-90 transition-transform">
                                <Camera size={14} className="text-amber-400" />
                            </div>
                        </>
                    )}
                </div>
                {errores.evidencia_fotografica && (
                    <p className="text-[9px] text-red-500 -mt-2 ml-4">{errores.evidencia_fotografica}</p>
                )}
            </div>

            {/* ============================================================ */}
            {/* BOTONES */}
            {/* ============================================================ */}
            <div className="col-span-2 flex justify-between gap-4 mt-4">
                <button
                    type="button"
                    onClick={() => ejecutarEnvio(false)}
                    className="flex-1 bg-white border-1 border-amber-400 text-amber-500 px-6 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-amber-50 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button
                    type="button"
                    onClick={() => ejecutarEnvio(true)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    {trabajoAEditar ? 'Actualizar' : 'Guardar y Salir'}
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