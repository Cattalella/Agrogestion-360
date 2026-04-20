import { useState, useEffect } from "react";

interface FormularioVacunaProps {
    listaAnimales: any[];
    onGuardar: (datos: any, cerrar: boolean) => void;
    vacunaAEditar?: any | null;
    onCancelarEdicion?: () => void;
}

export const FormularioVacuna = ({ 
    listaAnimales, 
    onGuardar,
    vacunaAEditar,
    onCancelarEdicion
}: FormularioVacunaProps) => {
    
    const esEdicion = !!vacunaAEditar;

    const estadoInicial = {
        tipo_animal: "",
        id_animal: "",
        tipo_vacuna: "",
        fecha_aplicacion: new Date().toISOString().split('T')[0],
        dosis: "",
        via_aplicacion: "INTRAMUSCULAR",
        lote_vacuna: "",
        proximo_refuerzo: "",
        veterinario: "",
        observaciones: ""
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [animalesFiltrados, setAnimalesFiltrados] = useState<any[]>([]);

    useEffect(() => {
        if (vacunaAEditar) {
            console.log('✏️ Cargando vacuna para edición:', vacunaAEditar);
            setFormData({
                tipo_animal: vacunaAEditar.tipo_animal || "",
                id_animal: vacunaAEditar.id_animal?.toString() || "",
                tipo_vacuna: vacunaAEditar.tipo_vacuna || "",
                fecha_aplicacion: vacunaAEditar.fecha_aplicacion?.split('T')[0] || new Date().toISOString().split('T')[0],
                dosis: vacunaAEditar.dosis || "",
                via_aplicacion: vacunaAEditar.via_aplicacion || "INTRAMUSCULAR",
                lote_vacuna: vacunaAEditar.lote_vacuna || "",
                proximo_refuerzo: vacunaAEditar.proximo_refuerzo?.split('T')[0] || "",
                veterinario: vacunaAEditar.veterinario || "",
                observaciones: vacunaAEditar.observaciones || ""
            });
        } else {
            setFormData(estadoInicial);
            setAnimalesFiltrados([]);
        }
    }, [vacunaAEditar]);

    // Función para determinar si un animal es GANADO por su código local
    const esGanadoPorCodigo = (codigoLocal: string) => {
        return codigoLocal?.startsWith('VA') || 
               codigoLocal?.startsWith('TO') || 
               codigoLocal?.startsWith('NO') || 
               codigoLocal?.startsWith('TE');
    };

    // Función para determinar si un animal es CERDO por su código local
    const esCerdoPorCodigo = (codigoLocal: string) => {
        return codigoLocal?.startsWith('C') || 
               codigoLocal?.startsWith('V') || 
               codigoLocal?.startsWith('L') || 
               codigoLocal?.startsWith('E');
    };

    // Filtrar animales por tipo seleccionado usando el código local
    useEffect(() => {
        if (formData.tipo_animal === "GANADO") {
            const ganado = listaAnimales.filter(a => {
                const codigoLocal = a.codigo_local || a.local || '';
                const esGanado = esGanadoPorCodigo(codigoLocal);
                const estaActivo = a.estado === 'Activo' || 
                                  a.estado?.nombre === 'Activo' || 
                                  a.EstadoAni?.nombre === 'Activo';
                return esGanado && estaActivo;
            });
            setAnimalesFiltrados(ganado);
        } else if (formData.tipo_animal === "CERDO") {
            const cerdos = listaAnimales.filter(a => {
                const codigoLocal = a.codigo_local || a.local || '';
                const esCerdo = esCerdoPorCodigo(codigoLocal);
                const estaActivo = a.estado === 'Activo' || 
                                  a.estado?.nombre === 'Activo' || 
                                  a.EstadoAni?.nombre === 'Activo';
                return esCerdo && estaActivo;
            });
            setAnimalesFiltrados(cerdos);
        } else {
            setAnimalesFiltrados([]);
        }
    }, [formData.tipo_animal, listaAnimales]);

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
        if (name === 'tipo_animal') {
            setFormData(prev => ({ ...prev, id_animal: '' }));
            setAnimalesFiltrados([]);
        }
    };

    const manejarCambioNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!formData.tipo_animal) nuevosErrores.tipo_animal = 'Selecciona el tipo de animal';
        if (!formData.id_animal) nuevosErrores.id_animal = 'Selecciona un animal';
        if (!formData.tipo_vacuna) nuevosErrores.tipo_vacuna = 'El tipo de vacuna es obligatorio';
        if (!formData.fecha_aplicacion) nuevosErrores.fecha_aplicacion = 'La fecha es obligatoria';
        
        if (formData.dosis && parseFloat(formData.dosis) <= 0) {
            nuevosErrores.dosis = 'La dosis debe ser mayor a 0';
        }
        
        if (formData.fecha_aplicacion) {
            const fechaApp = new Date(formData.fecha_aplicacion);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (fechaApp > hoy) {
                nuevosErrores.fecha_aplicacion = 'La fecha de aplicación no puede ser futura';
            }
        }
        
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

    const ejecutarEnvio = (cerrar: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            id_animal: parseInt(formData.id_animal),
            tipo_vacuna: formData.tipo_vacuna,
            fecha_aplicacion: formData.fecha_aplicacion,
            dosis: formData.dosis || null,
            via_aplicacion: formData.via_aplicacion,
            lote_vacuna: formData.lote_vacuna || null,
            proximo_refuerzo: formData.proximo_refuerzo || null,
            veterinario: formData.veterinario || null,
            observaciones: formData.observaciones || null
        };

        console.log('📤 Datos a enviar (Vacuna):', datosParaBackend);
        onGuardar(datosParaBackend, cerrar);
        
        if (!cerrar && !esEdicion) {
            setFormData(estadoInicial);
            setAnimalesFiltrados([]);
            setErrores({});
        }
    };

    const handleCancelar = () => {
        if (onCancelarEdicion) onCancelarEdicion();
    };

    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 p-2">
            {/* COLUMNA IZQUIERDA */}
            <div className="flex flex-col gap-3">
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

                <div className="relative">
                    <input
                        name="dosis"
                        value={formData.dosis}
                        onChange={manejarCambioNumerico}
                        type="text"
                        inputMode="decimal"
                        placeholder="DOSIS APLICADA (opcional)"
                        className="w-full border-1 border-cyan-200 rounded-full pl-4 pr-14 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-cyan-300 text-right font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-cyan-400">ml</span>
                    {errores.dosis && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.dosis}</p>
                    )}
                </div>

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
                        <option value="GANADO">🐄 GANADO</option>
                        <option value="CERDO">🐖 CERDOS</option>
                    </select>
                    {errores.tipo_animal && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipo_animal}</p>
                    )}
                </div>

                <div>
                    <select
                        name="id_animal"
                        value={formData.id_animal}
                        onChange={manejarCambio}
                        disabled={!formData.tipo_animal || animalesFiltrados.length === 0}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.id_animal ? 'border-red-400 focus:ring-red-300' : 'border-cyan-200 focus:ring-cyan-300 text-cyan-700 font-bold'
                        } ${(!formData.tipo_animal) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="">SELECCIONAR ANIMAL *</option>
                        {animalesFiltrados.map(animal => {
                            const idLocal = animal.local || animal.codigo_local || '—';
                            const raza = animal.raza || 'Sin raza';
                            const sexo = animal.sexo === 'F' ? 'HEMBRA' : animal.sexo === 'M' ? 'MACHO' : animal.sexo || '—';
                            const peso = animal.peso_actual ? `${animal.peso_actual}kg` : '—';
                            // Clave única combinando id y código local para evitar duplicados
                            const uniqueKey = `${animal.id_animal || animal.id}-${animal.codigo_local || animal.local || animal.id}`;
                            
                            return (
                                <option key={uniqueKey} value={animal.id_animal || animal.id}>
                                    {idLocal} | {raza} | {sexo} | {peso}
                                </option>
                            );
                        })}
                    </select>
                    {errores.id_animal && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.id_animal}</p>
                    )}
                    {formData.tipo_animal && animalesFiltrados.length === 0 && !esEdicion && (
                        <p className="text-[9px] text-amber-500 ml-4 mt-0.5">
                            ⚠️ No hay animales {formData.tipo_animal === 'GANADO' ? 'GANADO' : 'CERDOS'} activos disponibles
                        </p>
                    )}
                </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="flex flex-col gap-3">
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

                <input
                    name="lote_vacuna"
                    value={formData.lote_vacuna}
                    onChange={manejarCambio}
                    type="text"
                    placeholder="LOTE DE VACUNA"
                    className="border-1 border-cyan-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-cyan-300"
                />

                <input
                    name="veterinario"
                    value={formData.veterinario}
                    onChange={manejarCambio}
                    type="text"
                    placeholder="VETERINARIO (nombre)"
                    className="border-1 border-cyan-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-cyan-300"
                />
            </div>

            {/* BOTONES */}
            <div className="col-span-2 flex justify-between mt-6 gap-4">
                {esEdicion ? (
                    <>
                        <button 
                            type="button"
                            onClick={handleCancelar}
                            className="flex-1 bg-gray-200 text-gray-600 px-6 py-3 rounded-full font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-gray-300 transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button"
                            onClick={() => ejecutarEnvio(true)}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                        >
                            ✏️ Actualizar Vacuna
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            type="button"
                            onClick={() => ejecutarEnvio(false)}
                            className="flex-1 bg-white border-1 border-cyan-400 text-cyan-500 px-6 py-3 rounded-full font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-cyan-50 transition-all"
                        >
                            Guardar y Seguir
                        </button>
                        <button 
                            type="button"
                            onClick={() => ejecutarEnvio(true)}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                        >
                            Guardar y Salir
                        </button>
                    </>
                )}
            </div>
        </form>
    );
};