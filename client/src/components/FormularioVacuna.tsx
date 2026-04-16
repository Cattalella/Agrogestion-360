import { useState, useEffect } from "react";
import { Syringe } from "lucide-react";

interface FormularioVacunaProps {
    listaAnimales: any[];
    onGuardar: (datos: any, cerrar: boolean) => void;
}

export const FormularioVacuna = ({ listaAnimales, onGuardar }: FormularioVacunaProps) => {
    
    // ============================================================
    // ESTADO INICIAL
    // ============================================================
    const estadoInicial = {
        tipo_animal: "",
        id_animal: "",
        tipo_vacuna: "",
        fecha_aplicacion: new Date().toISOString().split('T')[0],
        dosis: "",
        via_aplicacion: "INTRAMUSCULAR",
        lote_vacuna: "",
        proximo_refuerzo: "",
        responsable: "",
        observaciones: ""
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [animalesFiltrados, setAnimalesFiltrados] = useState<any[]>([]);

    // ============================================================
    // FILTRAR ANIMALES ACTIVOS POR TIPO SELECCIONADO
    // ============================================================
    useEffect(() => {
        if (formData.tipo_animal) {
            const filtrados = listaAnimales.filter(a => {
                const esBovino = a.especie === 'Bovino' || a.especie?.nombre === 'Bovino' || a.tipo_animal === 'BOVINO';
                const esPorcino = a.especie === 'Porcino' || a.especie?.nombre === 'Porcino' || a.tipo_animal === 'PORCINO';
                const estaActivo = a.estado === 'Activo' || a.estado?.nombre === 'Activo' || a.EstadoAni?.nombre === 'Activo';
                
                if (formData.tipo_animal === 'BOVINO') {
                    return esBovino && estaActivo;
                } else {
                    return esPorcino && estaActivo;
                }
            });
            setAnimalesFiltrados(filtrados);
        } else {
            setAnimalesFiltrados([]);
        }
    }, [formData.tipo_animal, listaAnimales]);

    // ============================================================
    // MANEJADORES DE CAMBIOS
    // ============================================================
    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
        if (name === 'tipo_animal') {
            setFormData(prev => ({ ...prev, id_animal: '' }));
        }
    };

    const manejarCambioNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!formData.tipo_animal) nuevosErrores.tipo_animal = 'Selecciona el tipo de animal';
        if (!formData.id_animal) nuevosErrores.id_animal = 'Selecciona un animal';
        if (!formData.tipo_vacuna) nuevosErrores.tipo_vacuna = 'El tipo de vacuna es obligatorio';
        if (!formData.fecha_aplicacion) nuevosErrores.fecha_aplicacion = 'La fecha es obligatoria';
        
        // 🆕 Validar que la fecha de aplicación no sea futura
        if (formData.fecha_aplicacion) {
            const fechaApp = new Date(formData.fecha_aplicacion);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaApp > hoy) {
                nuevosErrores.fecha_aplicacion = 'La fecha de aplicación no puede ser futura';
            }
        }
        
        // 🆕 Validar que el refuerzo sea posterior a la aplicación
        if (formData.fecha_aplicacion && formData.proximo_refuerzo) {
            const fechaApp = new Date(formData.fecha_aplicacion);
            const fechaRef = new Date(formData.proximo_refuerzo);
            if (fechaRef <= fechaApp) {
                nuevosErrores.proximo_refuerzo = 'El refuerzo debe ser posterior a la aplicación';
            }
        }
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // ============================================================
    // ENVIAR FORMULARIO
    // ============================================================
    const ejecutarEnvio = (cerrar: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            tipo_animal: formData.tipo_animal,
            id_animal: parseInt(formData.id_animal),
            tipo_vacuna: formData.tipo_vacuna,
            fecha_aplicacion: formData.fecha_aplicacion,
            dosis: formData.dosis || null,
            via_aplicacion: formData.via_aplicacion,
            lote_vacuna: formData.lote_vacuna || null,
            proximo_refuerzo: formData.proximo_refuerzo || null,
            responsable: formData.responsable || 'Administrador',
            observaciones: formData.observaciones || null
        };

        console.log('📤 Datos a enviar (Vacuna):', datosParaBackend);
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
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 p-2">
            {/* ============================================================ */}
            {/* COLUMNA IZQUIERDA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">
                {/* Tipo de Vacuna */}
                <div>
                    <input
                        name="tipo_vacuna"
                        value={formData.tipo_vacuna}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="TIPO DE VACUNA *"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.tipo_vacuna ? 'border-red-400 focus:ring-red-300' : 'border-cyan-200 focus:ring-cyan-300'
                        }`}
                    />
                    {errores.tipo_vacuna && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipo_vacuna}</p>
                    )}
                </div>

                {/* Dosis con "ml" pegado */}
                <div className="relative">
                    <input
                        name="dosis"
                        value={formData.dosis}
                        onChange={manejarCambioNumerico}
                        type="text"
                        inputMode="decimal"
                        placeholder="DOSIS APLICADA"
                        className="w-full border-1 border-cyan-200 rounded-full pl-4 pr-14 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-cyan-300 text-right font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-cyan-400">
                        ml
                    </span>
                </div>

                {/* Tipo de Animal */}
                <div>
                    <select
                        name="tipo_animal"
                        value={formData.tipo_animal}
                        onChange={manejarCambio}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.tipo_animal ? 'border-red-400 focus:ring-red-300 text-red-500' : 'border-cyan-200 focus:ring-cyan-300 text-gray-600'
                        }`}
                    >
                        <option value="">TIPO DE ANIMAL *</option>
                        <option value="BOVINO">🐄 BOVINO</option>
                        <option value="PORCINO">🐖 PORCINO</option>
                    </select>
                    {errores.tipo_animal && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipo_animal}</p>
                    )}
                </div>

                {/* 🆕 ID del Animal - Selector Enriquecido */}
                <div>
                    <select
                        name="id_animal"
                        value={formData.id_animal}
                        onChange={manejarCambio}
                        disabled={!formData.tipo_animal || animalesFiltrados.length === 0}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.id_animal ? 'border-red-400 focus:ring-red-300' : 'border-cyan-200 focus:ring-cyan-300 text-cyan-700 font-bold'
                        } ${!formData.tipo_animal ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="">SELECCIONAR ANIMAL *</option>
                        {animalesFiltrados.map(animal => {
                            const idLocal = animal.local || animal.codigo_local || '—';
                            const raza = animal.raza || 'Sin raza';
                            const sexo = animal.sexo === 'F' ? 'HEMBRA' : animal.sexo === 'M' ? 'MACHO' : animal.sexo || '—';
                            const peso = animal.peso_actual ? `${animal.peso_actual}kg` : '—';
                            
                            return (
                                <option key={animal.id_animal || animal.id} value={animal.id_animal || animal.id}>
                                    {idLocal} | {raza} | {sexo} | {peso}
                                </option>
                            );
                        })}
                    </select>
                    {errores.id_animal && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.id_animal}</p>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">
                {/* Fecha de Aplicación */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-cyan-400 font-black tracking-tighter">
                        Fecha Aplicación <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fecha_aplicacion"
                        value={formData.fecha_aplicacion}
                        onChange={manejarCambio}
                        type="date"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.fecha_aplicacion ? 'border-red-400 focus:ring-red-300' : 'border-cyan-100 focus:ring-cyan-300'
                        }`}
                    />
                    {errores.fecha_aplicacion && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.fecha_aplicacion}</p>
                    )}
                </div>

                {/* Vía de Aplicación */}
                <select
                    name="via_aplicacion"
                    value={formData.via_aplicacion}
                    onChange={manejarCambio}
                    className="border-1 border-cyan-200 rounded-full px-6 py-2 text-[12px] bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
                >
                    <option value="INTRAMUSCULAR">💉 INTRAMUSCULAR</option>
                    <option value="SUBCUTANEA">💉 SUBCUTÁNEA</option>
                    <option value="ORAL">💊 ORAL</option>
                </select>

                {/* Próximo Refuerzo */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-cyan-400 font-black tracking-tighter">
                        Próximo Refuerzo
                    </label>
                    <input
                        name="proximo_refuerzo"
                        value={formData.proximo_refuerzo}
                        onChange={manejarCambio}
                        type="date"
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.proximo_refuerzo ? 'border-red-400 focus:ring-red-300' : 'border-cyan-100 focus:ring-cyan-300'
                        }`}
                    />
                    {errores.proximo_refuerzo && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.proximo_refuerzo}</p>
                    )}
                </div>

                {/* Lote de Vacuna */}
                <input
                    name="lote_vacuna"
                    value={formData.lote_vacuna}
                    onChange={manejarCambio}
                    type="text"
                    placeholder="LOTE DE VACUNA"
                    className="border-1 border-cyan-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-cyan-300"
                />

                {/* Responsable */}
                <input
                    name="responsable"
                    value={formData.responsable}
                    onChange={manejarCambio}
                    type="text"
                    placeholder="RESPONSABLE"
                    className="border-1 border-cyan-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-cyan-300"
                />
            </div>

            {/* ============================================================ */}
            {/* BOTONES */}
            {/* ============================================================ */}
            <div className="col-span-2 flex justify-between mt-6 gap-4">
                <button 
                    type="button"
                    onClick={() => ejecutarEnvio(false)}
                    className="flex-1 bg-white border-1 border-cyan-400 text-cyan-500 px-6 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-cyan-50 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button 
                    type="button"
                    onClick={() => ejecutarEnvio(true)}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    Guardar y Salir
                </button>
            </div>
        </form>
    );
};