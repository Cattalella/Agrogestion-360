import { useState, useEffect, useRef, useMemo } from "react";
import { Camera, Clock, User, Briefcase, FileText } from "lucide-react";
import { useFotosStorage } from "../utils/useFotosStorage";

// 📌 Definición de tipos para mayor seguridad
interface Trabajador {
    id_trabajador: number;
    nombre_completo: string;
    tipo_trabajo: string;
    estado: string;
}

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
    listaTrabajadores: Trabajador[];
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
    
    // 📸 Hook para el carrusel
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

    // ⏱️ Cálculo de duración (RN.8.1.2)
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
                setPreview(base64);
                setFormData(prev => ({ ...prev, evidencia_url: base64 }));
                setErrores(prev => ({ ...prev, evidencia_url: '' }));
                
                // 📸 Sincronización con el Carrusel: Enviamos la foto al storage global
                agregarFotoDesdeBase64(base64, 'trabajo');
            };
            reader.readAsDataURL(file);
        }
    };

    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        if (!formData.id_trabajador) nuevosErrores.id_trabajador = 'Selecciona un trabajador';
        if (!formData.categoria_trabajo) nuevosErrores.categoria_trabajo = 'Categoría requerida';
        if (!formData.tipo_actividad) nuevosErrores.tipo_actividad = 'Tipo de actividad requerido';
        if (!formData.fecha_inicio) nuevosErrores.fecha_inicio = 'Fecha de inicio requerida';
        if (!formData.fecha_fin) nuevosErrores.fecha_fin = 'Fecha de fin requerida';
        if (!formData.evidencia_url) nuevosErrores.evidencia_url = 'Evidencia fotográfica obligatoria';

        if (formData.fecha_inicio && formData.fecha_fin) {
            if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
                nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior al inicio';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const ejecutarEnvio = (cerrar: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            ...formData,
            id_trabajador: parseInt(formData.id_trabajador),
            duracion_horas: duracionCalculada?.total ?? 0,
            observaciones: formData.observaciones || null,
        };

        onGuardar(datosParaBackend, cerrar);

        if (!cerrar && !trabajoAEditar) {
            setFormData(estadoInicial);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 p-2">
            {/* COLUMNA IZQUIERDA */}
            <div className="flex flex-col gap-3">
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <User size={10} className="inline mr-1" /> Trabajador *
                    </label>
                    <select
                        name="id_trabajador"
                        value={formData.id_trabajador}
                        onChange={manejarCambio}
                        disabled={!!trabajoAEditar}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 transition-all ${
                            errores.id_trabajador ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300 text-amber-700 font-bold'
                        } ${trabajoAEditar ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <option value="">SELECCIONAR TRABAJADOR *</option>
                        {listaTrabajadores.filter(t => t.estado?.toLowerCase() === 'activo').map(t => (
                            <option key={t.id_trabajador} value={t.id_trabajador}>
                                {t.nombre_completo} - {t.tipo_trabajo}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Briefcase size={10} className="inline mr-1" /> Categoría *
                    </label>
                    <select
                        name="categoria_trabajo"
                        value={formData.categoria_trabajo}
                        onChange={manejarCambio}
                        className="w-full border-1 border-amber-200 rounded-full px-6 py-2 text-[12px] focus:ring-2 focus:ring-amber-300 outline-none"
                    >
                        <option value="">SELECCIONAR CATEGORÍA *</option>
                        <option value="Mantenimiento">🔧 MANTENIMIENTO</option>
                        <option value="Alimentación">🌾 ALIMENTACIÓN</option>
                        <option value="Vacunación">💉 VACUNACIÓN</option>
                        <option value="Limpieza">🧹 LIMPIEZA</option>
                        <option value="Construcción">🏗️ CONSTRUCCIÓN</option>
                    </select>
                </div>

                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <FileText size={10} className="inline mr-1" /> Actividad *
                    </label>
                    <input
                        name="tipo_actividad"
                        value={formData.tipo_actividad}
                        onChange={manejarCambio}
                        placeholder="Ej: Reparación de cerca..."
                        className="w-full border-1 border-amber-200 rounded-full px-6 py-2 text-[12px] focus:ring-2 focus:ring-amber-300 outline-none"
                    />
                </div>

                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        Observaciones
                    </label>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={manejarCambio}
                        rows={3}
                        className="w-full border-1 border-amber-200 rounded-2xl px-6 py-2 text-[12px] focus:ring-2 focus:ring-amber-300 outline-none resize-none"
                    />
                </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Clock size={10} className="inline mr-1" /> Inicio *
                    </label>
                    <input
                        name="fecha_inicio"
                        type="datetime-local"
                        value={formData.fecha_inicio}
                        onChange={manejarCambio}
                        className="border-1 border-amber-100 rounded-full px-6 py-2 text-[11px] outline-none focus:ring-2 focus:ring-amber-300"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Clock size={10} className="inline mr-1" /> Fin *
                    </label>
                    <input
                        name="fecha_fin"
                        type="datetime-local"
                        value={formData.fecha_fin}
                        onChange={manejarCambio}
                        className="border-1 border-amber-100 rounded-full px-6 py-2 text-[11px] outline-none focus:ring-2 focus:ring-amber-300"
                    />
                </div>

                <div className={`rounded-full px-6 py-2 text-[11px] font-bold flex items-center gap-2 transition-all ${
                    duracionCalculada ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-gray-50 text-gray-300'
                }`}>
                    <Clock size={11} />
                    {duracionCalculada ? `${duracionCalculada.horas}h ${duracionCalculada.minutos}m calculados` : 'Cálculo automático'}
                </div>

                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Camera size={10} className="inline mr-1" /> Evidencia *
                    </label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group border-1 border-dashed border-amber-200 rounded-[1.5rem] p-3 flex flex-col items-center justify-center min-h-[110px] cursor-pointer relative overflow-hidden hover:bg-amber-50 transition-all"
                    >
                        {preview ? (
                            <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        ) : (
                            <Camera size={20} className="text-amber-300" />
                        )}
                        <input type="file" ref={fileInputRef} onChange={manejarArchivo} accept="image/*" className="hidden" />
                    </div>
                </div>
            </div>

            {/* BOTONES */}
            <div className="col-span-2 flex flex-col gap-2 mt-4">
                <div className="flex gap-2">
                    <button type="button" onClick={() => ejecutarEnvio(false)} className="flex-1 border-1 border-amber-400 text-amber-500 py-3 rounded-l-full font-black text-[11px] uppercase italic">
                        Guardar y Continuar
                    </button>
                    <button type="button" onClick={() => ejecutarEnvio(true)} className="flex-1 bg-amber-600 text-white py-3 rounded-r-full font-black text-[11px] uppercase">
                        {trabajoAEditar ? 'Actualizar' : 'Finalizar Registro'}
                    </button>
                </div>
                <button type="button" onClick={onCancelar} className="text-[10px] text-gray-400 font-bold uppercase hover:text-gray-600">
                    Cancelar
                </button>
            </div>
        </form>
    );
};