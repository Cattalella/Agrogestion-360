import { useState, useEffect, useRef, useMemo } from "react";
import { Camera, Clock, User, Briefcase, FileText } from "lucide-react";
import { useFotosStorage } from "../utils/useFotosStorage";  // ← AGREGAR

interface TrabajoRealizado {
    id_trabajo: number;
    id_trabajador: number;
    categoria_trabajo: string;
    tipo_actividad: string;
    fecha_inicio: string;
    fecha_fin: string;
    duracion_horas: number;
    evidencia_url: string;
    observaciones?: string;
    Trabajador?: { nombre_completo: string };
}

interface Props {
    trabajoAEditar: TrabajoRealizado | null;
    listaTrabajadores: any[];
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
    
    // 🔥 Hook para agregar fotos al Carrusel
    const { agregarFotoDesdeBase64 } = useFotosStorage();

    const estadoInicial = {
        id_trabajador: "",
        categoria_trabajo: "",
        tipo_actividad: "",
        fecha_inicio: "",
        fecha_fin: "",
        evidencia_url: "",
        observaciones: "",
    };

    const [formData, setFormData] = useState(estadoInicial);

    // ============================================================
    // DURACIÓN CALCULADA AUTOMÁTICAMENTE — RN.8.1.2
    // ============================================================
    const duracionCalculada = useMemo(() => {
        if (!formData.fecha_inicio || !formData.fecha_fin) return null;
        const inicio = new Date(formData.fecha_inicio);
        const fin = new Date(formData.fecha_fin);
        const diff = fin.getTime() - inicio.getTime();
        if (diff <= 0) return null;
        const horas = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { horas, minutos, total: diff / (1000 * 60 * 60) };
    }, [formData.fecha_inicio, formData.fecha_fin]);

    // ============================================================
    // CARGAR DATOS SI ES EDICIÓN
    // ============================================================
    useEffect(() => {
        if (trabajoAEditar) {
            setFormData({
                id_trabajador: trabajoAEditar.id_trabajador?.toString() || "",
                categoria_trabajo: trabajoAEditar.categoria_trabajo || "",
                tipo_actividad: trabajoAEditar.tipo_actividad || "",
                fecha_inicio: trabajoAEditar.fecha_inicio?.slice(0, 16) || "",
                fecha_fin: trabajoAEditar.fecha_fin?.slice(0, 16) || "",
                evidencia_url: trabajoAEditar.evidencia_url || "",
                observaciones: trabajoAEditar.observaciones || "",
            });
            if (trabajoAEditar.evidencia_url) {
                setPreview(trabajoAEditar.evidencia_url);
            }
        }
    }, [trabajoAEditar]);

    // ============================================================
    // MANEJADORES
    // ============================================================
    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) setErrores(prev => ({ ...prev, [name]: '' }));
    };

    const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                console.log('🟡 [Trabajo] Base64 generado, longitud:', base64.length);
                setPreview(base64);
                setFormData(prev => ({ ...prev, evidencia_url: base64 }));
                setErrores(prev => ({ ...prev, evidencia_url: '' }));
                
                // 🔥 AGREGAR LA FOTO AL CARRUSEL
                agregarFotoDesdeBase64(base64, 'trabajo');
                console.log('🟡 [Trabajo] agregarFotoDesdeBase64 llamado');
            };
            reader.readAsDataURL(file);
        }
    };

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};

        if (!formData.id_trabajador) nuevosErrores.id_trabajador = 'Selecciona un trabajador';
        if (!formData.categoria_trabajo) nuevosErrores.categoria_trabajo = 'Categoría requerida';
        if (!formData.tipo_actividad) nuevosErrores.tipo_actividad = 'Tipo de actividad requerido';
        if (!formData.fecha_inicio) nuevosErrores.fecha_inicio = 'Fecha de inicio requerida';
        if (!formData.fecha_fin) nuevosErrores.fecha_fin = 'Fecha de fin requerida';
        if (!formData.evidencia_url) nuevosErrores.evidencia_url = 'Evidencia fotográfica obligatoria';

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
            id_trabajador: parseInt(formData.id_trabajador),
            categoria_trabajo: formData.categoria_trabajo,
            tipo_actividad: formData.tipo_actividad,
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            duracion_horas: duracionCalculada?.total ?? 0,
            evidencia_url: formData.evidencia_url,
            observaciones: formData.observaciones || null,
        };

        console.log('📤 Datos a enviar (Trabajo Realizado):', datosParaBackend);
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

                {/* Trabajador */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <User size={10} className="inline mr-1" />
                        Trabajador <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="id_trabajador"
                        value={formData.id_trabajador}
                        onChange={manejarCambio}
                        disabled={!!trabajoAEditar}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.id_trabajador
                                ? 'border-red-400 focus:ring-red-300'
                                : 'border-amber-200 focus:ring-amber-300 text-amber-700 font-bold'
                        } ${trabajoAEditar ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <option value="">SELECCIONAR TRABAJADOR *</option>
                        {listaTrabajadores.filter(t => t.estado?.toLowerCase() === 'activo').map(t => (
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
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Briefcase size={10} className="inline mr-1" />
                        Categoría <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="categoria_trabajo"
                        value={formData.categoria_trabajo}
                        onChange={manejarCambio}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.categoria_trabajo ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    >
                        <option value="">SELECCIONAR CATEGORÍA *</option>
                        <option value="Mantenimiento">🔧 MANTENIMIENTO</option>
                        <option value="Alimentación">🌾 ALIMENTACIÓN</option>
                        <option value="Vacunación">💉 VACUNACIÓN</option>
                        <option value="Limpieza">🧹 LIMPIEZA</option>
                        <option value="Construcción">🏗️ CONSTRUCCIÓN</option>
                        <option value="Otro">📌 OTRO</option>
                    </select>
                    {errores.categoria_trabajo && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.categoria_trabajo}</p>
                    )}
                </div>

                {/* Tipo de Actividad */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <FileText size={10} className="inline mr-1" />
                        Tipo de Actividad <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="tipo_actividad"
                        value={formData.tipo_actividad}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="Ej: Reparación de cerca, Suministro de alimento..."
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.tipo_actividad ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    />
                    {errores.tipo_actividad && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipo_actividad}</p>
                    )}
                </div>

                {/* Observaciones */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <FileText size={10} className="inline mr-1" />
                        Observaciones
                    </label>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={manejarCambio}
                        placeholder="Notas adicionales sobre el trabajo..."
                        rows={3}
                        className="w-full border-1 border-amber-200 rounded-2xl px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                    />
                </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">

                {/* Fecha Inicio */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Clock size={10} className="inline mr-1" />
                        Fecha y Hora Inicio <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={manejarCambio}
                        type="datetime-local"
                        className={`border-1 uppercase rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.fecha_inicio ? 'border-red-400 focus:ring-red-300' : 'border-amber-100 focus:ring-amber-300'
                        }`}
                    />
                    {errores.fecha_inicio && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fecha_inicio}</p>
                    )}
                </div>

                {/* Fecha Fin */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Clock size={10} className="inline mr-1" />
                        Fecha y Hora Fin <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fecha_fin"
                        value={formData.fecha_fin}
                        onChange={manejarCambio}
                        type="datetime-local"
                        className={`border-1 uppercase rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.fecha_fin ? 'border-red-400 focus:ring-red-300' : 'border-amber-100 focus:ring-amber-300'
                        }`}
                    />
                    {errores.fecha_fin && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fecha_fin}</p>
                    )}
                </div>

                {/* Duración calculada automáticamente — RN.8.1.2 */}
                <div className={`rounded-full px-6 py-2 text-[11px] font-bold flex items-center gap-2 transition-all ${
                    duracionCalculada
                        ? 'bg-amber-50 border border-amber-200 text-amber-700'
                        : 'bg-gray-50 border border-gray-100 text-gray-300'
                }`}>
                    <Clock size={11} />
                    {duracionCalculada
                        ? `${duracionCalculada.horas}h ${duracionCalculada.minutos}m de duración`
                        : 'Duración se calcula automáticamente'}
                </div>

                {/* Evidencia Fotográfica — RN.8.1.2 obligatoria */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Camera size={10} className="inline mr-1" />
                        Evidencia Fotográfica <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={manejarArchivo}
                        accept="image/*"
                        className="hidden"
                    />

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`group border-1 border-dashed rounded-[1.5rem] p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all min-h-[110px] relative overflow-hidden ${
                            errores.evidencia_url
                                ? 'border-red-400 bg-red-50'
                                : 'border-amber-200 hover:bg-amber-50 hover:border-amber-400'
                        }`}
                    >
                        {preview ? (
                            <>
                                <img
                                    src={preview}
                                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                                    alt="Evidencia"
                                />
                                <div className="absolute inset-0 bg-amber-900/20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                    <Camera size={18} className="text-white drop-shadow-md" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest mt-1">Cambiar</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-[9px] uppercase font-black tracking-widest text-amber-600">
                                    {errores.evidencia_url ? 'EVIDENCIA OBLIGATORIA *' : 'Haz clic para subir foto'}
                                </p>
                                <div className="w-8 h-8 border-1 border-amber-200 rounded-full flex items-center justify-center bg-white shadow-sm group-hover:rotate-90 transition-transform">
                                    <Camera size={14} className="text-amber-400" />
                                </div>
                            </>
                        )}
                    </div>
                    {errores.evidencia_url && (
                        <p className="text-[9px] text-red-500 ml-4 mt-1">{errores.evidencia_url}</p>
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
                    className="flex-1 bg-white border-1 border-amber-400 text-amber-500 px-6 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-amber-50 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button
                    type="button"
                    onClick={() => ejecutarEnvio(true)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    {trabajoAEditar ? 'Actualizar Trabajo' : 'Guardar y Salir'}
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