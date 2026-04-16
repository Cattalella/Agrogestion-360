import { useState, useEffect } from "react";
import { User, Phone, MapPin, Calendar, FileText, Briefcase, CreditCard } from "lucide-react";

interface Trabajador {
    id: number;
    id_trabajador: string;
    nombre_completo: string;
    tipo_documento: string;
    numero_documento: string;
    tipo_trabajo: string;
    telefono: string;
    telefono_familiar: string;
    direccion: string;
    estado: string;
    fecha_ingreso: string;
    observaciones: string;
    eliminado?: boolean;
}

type EstadoTrabajador = 'activo' | 'inactivo';

interface Props {
    trabajadorAEditar: Trabajador | null;
    onGuardar: (datos: any, cerrar: boolean) => void;
    onCancelar: () => void;
}

export const FormularioNuevoTrabajador = ({ 
    trabajadorAEditar, 
    onGuardar, 
    onCancelar 
}: Props) => {
    
    const estadoInicial = {
        id_trabajador: "",
        nombre_completo: "",
        tipo_documento: "",
        numero_documento: "",
        tipo_trabajo: "",
        telefono: "",
        telefono_familiar: "",
        direccion: "",
        estado: "activo" as EstadoTrabajador,
        fecha_ingreso: new Date().toISOString().split('T')[0],
        observaciones: "",
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [errores, setErrores] = useState<Record<string, string>>({});

    // ============================================================
    // CARGAR DATOS SI ES EDICIÓN
    // ============================================================
    useEffect(() => {
        if (trabajadorAEditar) {
            setFormData({
                id_trabajador: trabajadorAEditar.id_trabajador || "",
                nombre_completo: trabajadorAEditar.nombre_completo || "",
                tipo_documento: trabajadorAEditar.tipo_documento || "",
                numero_documento: trabajadorAEditar.numero_documento || "",
                tipo_trabajo: trabajadorAEditar.tipo_trabajo || "",
                telefono: trabajadorAEditar.telefono || "",
                telefono_familiar: trabajadorAEditar.telefono_familiar || "",
                direccion: trabajadorAEditar.direccion || "",
                estado: (trabajadorAEditar.estado as EstadoTrabajador) || "activo",
                fecha_ingreso: trabajadorAEditar.fecha_ingreso || "",
                observaciones: trabajadorAEditar.observaciones || "",
            });
        }
    }, [trabajadorAEditar]);

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

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!formData.id_trabajador.trim()) nuevosErrores.id_trabajador = 'ID del trabajador es obligatorio';
        if (!formData.nombre_completo.trim()) nuevosErrores.nombre_completo = 'Nombre completo es obligatorio';
        if (!formData.tipo_documento) nuevosErrores.tipo_documento = 'Selecciona un tipo de documento';
        if (!formData.numero_documento.trim()) nuevosErrores.numero_documento = 'Número de documento es obligatorio';
        if (!formData.tipo_trabajo.trim()) nuevosErrores.tipo_trabajo = 'Tipo de trabajo es obligatorio';
        if (!formData.telefono.trim()) nuevosErrores.telefono = 'Teléfono es obligatorio';
        if (!formData.fecha_ingreso) nuevosErrores.fecha_ingreso = 'Fecha de ingreso es obligatoria';
        
        // Validar formato de teléfono (solo números, mínimo 7 dígitos)
        if (formData.telefono && !/^[0-9]{7,15}$/.test(formData.telefono.replace(/\D/g, ''))) {
            nuevosErrores.telefono = 'Teléfono inválido (7-15 dígitos)';
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
        };

        console.log('📤 Datos a enviar (Trabajador):', datosParaBackend);
        onGuardar(datosParaBackend, cerrar);
        
        if (!cerrar && !trabajadorAEditar) {
            setFormData(estadoInicial);
            setErrores({});
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
                {/* ID Trabajador */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Briefcase size={10} className="inline mr-1" />
                        ID Trabajador <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="id_trabajador"
                        value={formData.id_trabajador}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="Ej: TR-01"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.id_trabajador ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    />
                    {errores.id_trabajador && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.id_trabajador}</p>
                    )}
                </div>

                {/* Nombre Completo */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <User size={10} className="inline mr-1" />
                        Nombre Completo <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="nombre_completo"
                        value={formData.nombre_completo}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="Nombres y Apellidos"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.nombre_completo ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    />
                    {errores.nombre_completo && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.nombre_completo}</p>
                    )}
                </div>

                {/* Tipo Documento */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <CreditCard size={10} className="inline mr-1" />
                        Tipo Documento <span className="text-red-400">*</span>
                    </label>
                    <select
                        name="tipo_documento"
                        value={formData.tipo_documento}
                        onChange={manejarCambio}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.tipo_documento ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    >
                        <option value="">Seleccionar...</option>
                        <option value="CC">🆔 Cédula de Ciudadanía</option>
                        <option value="CE">🌎 Cédula de Extranjería</option>
                        <option value="PPT">📄 PPT</option>
                        <option value="PASAPORTE">🛂 Pasaporte</option>
                    </select>
                    {errores.tipo_documento && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipo_documento}</p>
                    )}
                </div>

                {/* Número Documento */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        Número Documento <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="numero_documento"
                        value={formData.numero_documento}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="Número de identificación"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.numero_documento ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    />
                    {errores.numero_documento && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.numero_documento}</p>
                    )}
                </div>

                {/* Tipo de Trabajo */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        Tipo de Trabajo <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="tipo_trabajo"
                        value={formData.tipo_trabajo}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="Ej: Jornalero, Veterinario..."
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.tipo_trabajo ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    />
                    {errores.tipo_trabajo && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipo_trabajo}</p>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">
                {/* Teléfono */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Phone size={10} className="inline mr-1" />
                        Teléfono Personal <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="telefono"
                        value={formData.telefono}
                        onChange={manejarCambio}
                        type="tel"
                        placeholder="Ej: 3001234567"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.telefono ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-300'
                        }`}
                    />
                    {errores.telefono && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.telefono}</p>
                    )}
                </div>

                {/* Teléfono Familiar */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Phone size={10} className="inline mr-1" />
                        Teléfono Familiar
                    </label>
                    <input
                        name="telefono_familiar"
                        value={formData.telefono_familiar}
                        onChange={manejarCambio}
                        type="tel"
                        placeholder="Contacto de emergencia"
                        className="w-full border-1 border-amber-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                </div>

                {/* Fecha Ingreso */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <Calendar size={10} className="inline mr-1" />
                        Fecha Ingreso <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fecha_ingreso"
                        value={formData.fecha_ingreso}
                        onChange={manejarCambio}
                        type="date"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.fecha_ingreso ? 'border-red-400 focus:ring-red-300' : 'border-amber-100 focus:ring-amber-300'
                        }`}
                    />
                    {errores.fecha_ingreso && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fecha_ingreso}</p>
                    )}
                </div>

                {/* Estado */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        Estado Laboral
                    </label>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={manejarCambio}
                        className="w-full border-1 border-amber-200 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer"
                    >
                        <option value="activo">✅ ACTIVO</option>
                        <option value="inactivo">❌ INACTIVO</option>
                    </select>
                </div>

                {/* Dirección */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                        <MapPin size={10} className="inline mr-1" />
                        Dirección
                    </label>
                    <input
                        name="direccion"
                        value={formData.direccion}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="Dirección de residencia"
                        className="w-full border-1 border-amber-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                </div>
            </div>

            {/* ============================================================ */}
            {/* OBSERVACIONES */}
            {/* ============================================================ */}
            <div className="col-span-2">
                <label className="text-[9px] uppercase ml-4 text-amber-600 font-black tracking-tighter">
                    <FileText size={10} className="inline mr-1" />
                    Observaciones
                </label>
                <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={manejarCambio}
                    placeholder="Notas adicionales..."
                    rows={2}
                    className="w-full border-1 border-amber-200 rounded-2xl px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                />
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
                    {trabajadorAEditar ? 'Guardar Cambios' : 'Vincular Trabajador'}
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