import { useState, useRef, useEffect } from "react";
import { Plus, Camera } from "lucide-react";

interface FormularioCerdoProps {
    listaCerdos: any[];
    sugerenciaId: string;
    categoriaSeleccionada: string;
    setCategoria: (valor: string) => void;
    onGuardar: (datos: any, salir: boolean) => void;
    cerdoAEditar?: any | null;
    onCancelarEdicion?: () => void;
}

export const FormularioCerdo = ({ 
    listaCerdos,
    sugerenciaId, 
    categoriaSeleccionada, 
    setCategoria, 
    onGuardar,
    cerdoAEditar,
    onCancelarEdicion
}: FormularioCerdoProps) => {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const esEdicion = !!cerdoAEditar;

    // Determinar sexo por defecto según categoría
    const sexoPorDefecto = () => {
        switch(categoriaSeleccionada) {
            case 'C': return 'HEMBRA';      // CERDA
            case 'V': return 'MACHO';       // VERRACO
            case 'L': return 'HEMBRA';      // LECHÓN
            case 'E': return 'MACHO';       // CEBA
            default: return 'HEMBRA';
        }
    };

    // Determinar si el sexo es editable (solo para LECHÓN y CEBA)
    const sexoEditable = categoriaSeleccionada === 'L' || categoriaSeleccionada === 'E';

    // Determinar si es lechón para mostrar campo MADRE
    const esLechon = categoriaSeleccionada === 'L';

    // Nombres amigables para cada categoría
    const nombreCategoria = () => {
        switch(categoriaSeleccionada) {
            case 'C': return 'CERDA';
            case 'V': return 'VERRACO';
            case 'L': return 'LECHÓN/A';
            case 'E': return 'CERDO/A DE CEBA';
            default: return 'ANIMAL';
        }
    };

    const estadoInicial = {
        oficial: "",
        local: sugerenciaId,
        idMadre: "",
        peso: "",
        ingreso: new Date().toISOString().split('T')[0],
        nacimiento: "",
        sexo: sexoPorDefecto(),
        raza: "",
        establo: "",
        salud: "SANO",
        origen: "Nacimiento",
        foto: null as string | null
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [errores, setErrores] = useState<Record<string, string>>({});

    // Cargar datos cuando se está editando
    useEffect(() => {
        if (cerdoAEditar) {
            console.log('✏️ Cargando datos para edición:', cerdoAEditar);
            setFormData({
                oficial: cerdoAEditar.oficial || "",
                local: cerdoAEditar.local || sugerenciaId,
                idMadre: cerdoAEditar.id_madre || "",
                peso: cerdoAEditar.peso_actual?.toString() || "",
                ingreso: cerdoAEditar.ingreso?.split('T')[0] || new Date().toISOString().split('T')[0],
                nacimiento: cerdoAEditar.fecha_nacimiento?.split('T')[0] || "",
                sexo: cerdoAEditar.sexo || sexoPorDefecto(),
                raza: cerdoAEditar.raza || "",
                establo: cerdoAEditar.ubicacion || "",
                salud: cerdoAEditar.estado || "SANO",
                origen: cerdoAEditar.origen || "Registro inicial",
                foto: null
            });
        } else {
            setFormData({
                ...estadoInicial,
                local: sugerenciaId,
                sexo: sexoPorDefecto()
            });
        }
    }, [cerdoAEditar, sugerenciaId, categoriaSeleccionada]);

    // Actualizar cuando cambia la categoría (solo si no estamos editando)
    useEffect(() => {
        if (!esEdicion) {
            setFormData(prev => ({ 
                ...prev, 
                local: sugerenciaId,
                sexo: sexoPorDefecto()
            }));
        }
    }, [sugerenciaId, categoriaSeleccionada, esEdicion]);

    // Validar solo números para campos numéricos
    const manejarCambioNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (value && parseFloat(value) > 0) {
                setErrores(prev => ({ ...prev, [name]: '' }));
            }
        }
    };

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    const manejarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, foto: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!formData.local) nuevosErrores.local = 'El ID Local es obligatorio';
        if (!formData.peso || parseFloat(formData.peso) <= 0) nuevosErrores.peso = 'El peso debe ser mayor a 0';
        if (!formData.ingreso) nuevosErrores.ingreso = 'La fecha de ingreso es obligatoria';
        
        if (formData.nacimiento && formData.ingreso) {
            const nacimiento = new Date(formData.nacimiento);
            const ingreso = new Date(formData.ingreso);
            if (nacimiento > ingreso) {
                nuevosErrores.nacimiento = 'El nacimiento no puede ser posterior al ingreso';
            }
        }
        
        if (formData.nacimiento) {
            const nacimiento = new Date(formData.nacimiento);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (nacimiento > hoy) {
                nuevosErrores.nacimiento = 'La fecha de nacimiento no puede ser futura';
            }
        }
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const ejecutarEnvio = (salir: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            local: formData.local,
            oficial: formData.oficial || null,
            sexo: formData.sexo,
            raza: formData.raza || 'Criollo',
            nacimiento: formData.nacimiento || null,
            ingreso: formData.ingreso,
            peso: formData.peso,
            origen: formData.origen || 'Registro inicial',
            foto: null,
            idMadre: formData.idMadre || null,
            establo: formData.establo || '',
            salud: formData.salud || 'SANO',
        };

        console.log('📤 Datos a enviar:', datosParaBackend);
        onGuardar(datosParaBackend, salir);
        
        if (!salir && !esEdicion) {
            setFormData(estadoInicial);
            setErrores({});
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleCancelar = () => {
        if (onCancelarEdicion) onCancelarEdicion();
    };

    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Columna Izquierda: Identificación y Fechas */}
            <div className="flex flex-col gap-3">
                {/* Selector de Categoría */}
                <div>
                    <label className="text-[9px] uppercase ml-4 text-emerald-400 font-black tracking-tighter">
                        Categoría
                    </label>
                    <select
                        value={categoriaSeleccionada}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="w-full border-1 border-emerald-200 rounded-full px-6 py-2 text-[12px] bg-white text-emerald-600 focus:outline-none font-bold"
                        disabled={esEdicion}
                    >
                        <option value="C">🐷 CERDA (C)</option>
                        <option value="V">🐗 VERRACO (V)</option>
                        <option value="L">🐽 LECHÓN/A (L)</option>
                        <option value="E">🍖 CERDO/A DE CEBA (E)</option>
                    </select>
                    {esEdicion && (
                        <p className="text-[8px] text-gray-400 ml-4 mt-1">
                            ⚠️ Categoría bloqueada en edición
                        </p>
                    )}
                </div>

                {/* ID Oficial */}
                <div>
                    <input 
                        name="oficial"
                        value={formData.oficial}
                        onChange={manejarCambio} 
                        type="text" 
                        placeholder="ID OFICIAL (ICA)" 
                        className="w-full border-1 border-emerald-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-emerald-300 transition-all" 
                    />
                </div>
                
                {/* ID Local */}
                <div>
                    <input 
                        name="local"
                        value={formData.local} 
                        onChange={manejarCambio} 
                        type="text" 
                        placeholder={`ID LOCAL (${categoriaSeleccionada}-01)`}
                        disabled={esEdicion}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 font-bold text-emerald-600 transition-all ${
                            esEdicion ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50/30'
                        } ${
                            errores.local ? 'border-red-400 focus:ring-red-300' : 'border-emerald-200 focus:ring-emerald-300'
                        }`}
                    />
                    {errores.local && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.local}</p>
                    )}
                    {esEdicion && (
                        <p className="text-[8px] text-gray-400 ml-4 mt-1">
                            🔒 ID Local no editable
                        </p>
                    )}
                </div>

                {/* Campo Madre (solo para lechones) */}
                {esLechon && (
                    <select 
                        name="idMadre" 
                        value={formData.idMadre}
                        onChange={manejarCambio} 
                        className="border-2 border-amber-200 bg-amber-50 text-amber-700 rounded-full px-6 py-2 text-[12px] font-bold focus:outline-none"
                    >
                        <option value="">ASIGNAR MADRE...</option>
                        {listaCerdos
                            .filter(c => c.sexo === "HEMBRA" && c.local?.startsWith('C'))
                            .map(madre => (
                                <option key={madre.id} value={madre.local}>
                                    {madre.local} {madre.oficial ? `(${madre.oficial})` : ''}
                                </option>
                            ))
                        }
                    </select>
                )}

                {/* Fecha Ingreso - OBLIGATORIA */}
                <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-400 font-black tracking-tighter">
                        Fecha Ingreso <span className="text-red-400">*</span>
                    </label>
                    <input 
                        name="ingreso" 
                        value={formData.ingreso} 
                        onChange={manejarCambio} 
                        type="date" 
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.ingreso ? 'border-red-400 focus:ring-red-300' : 'border-emerald-100 focus:ring-emerald-300'
                        }`}
                    />
                    {errores.ingreso && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.ingreso}</p>
                    )}
                </div>

                {/* Fecha Nacimiento - OPCIONAL */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-400 font-black tracking-tighter">
                        Nacimiento (Opcional)
                    </label>
                    <input 
                        name="nacimiento" 
                        value={formData.nacimiento}
                        onChange={manejarCambio} 
                        type="date" 
                        className={`border-1 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 text-gray-500 transition-all ${
                            errores.nacimiento ? 'border-red-400 focus:ring-red-300' : 'border-emerald-100 focus:ring-emerald-300'
                        }`}
                    />
                    {errores.nacimiento && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.nacimiento}</p>
                    )}
                </div>
            </div>

            {/* Columna Derecha: Estado y Foto */}
            <div className="flex flex-col gap-3">
                {/* Info de categoría seleccionada */}
                <div className={`rounded-full px-4 py-2 text-center ${esEdicion ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                    <p className={`text-[11px] font-bold ${esEdicion ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {esEdicion ? '✏️ EDITANDO:' : 'Registrando:'} {nombreCategoria()} → Sexo: {formData.sexo} {!sexoEditable && '🔒'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {/* Select de sexo - BLOQUEADO para CERDA y VERRACO */}
                    {sexoEditable ? (
                        <select 
                            name="sexo" 
                            value={formData.sexo}
                            onChange={manejarCambio} 
                            className="border-1 border-emerald-200 rounded-full px-4 py-2 text-[11px] bg-white text-emerald-600 focus:outline-none font-black appearance-none text-center"
                        >
                            <option value="HEMBRA">HEMBRA</option>
                            <option value="MACHO">MACHO</option>
                        </select>
                    ) : (
                        <div className="relative">
                            <input 
                                type="text"
                                value={formData.sexo}
                                className="w-full border-1 border-emerald-200 bg-emerald-50 rounded-full px-4 py-2 text-[11px] focus:outline-none text-center font-bold text-emerald-600"
                                readOnly
                                disabled
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-emerald-400">
                                🔒
                            </span>
                        </div>
                    )}

                    {/* Campo Peso con "kg" pegado */}
                    <div className="relative">
                        <input 
                            name="peso" 
                            value={formData.peso}
                            onChange={manejarCambioNumerico} 
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            className={`w-full border-1 rounded-full pl-4 pr-12 py-2 text-[11px] focus:outline-none text-right font-bold transition-all ${
                                errores.peso ? 'border-red-400 focus:ring-red-300' : 'border-emerald-200 focus:ring-emerald-300'
                            }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-400">
                            kg
                        </span>
                    </div>
                </div>
                {errores.peso && (
                    <p className="text-[9px] text-red-500 -mt-2 ml-4">{errores.peso}</p>
                )}
                
                {/* Campo Raza */}
                <input 
                    name="raza" 
                    value={formData.raza}
                    onChange={manejarCambio} 
                    type="text" 
                    placeholder="RAZA (Ej: Yorkshire)" 
                    className="border-1 border-emerald-200 rounded-full px-6 py-2 text-[12px] focus:outline-none placeholder:text-gray-300" 
                />
                
                {/* Establo / Corral */}
                <input 
                    name="establo" 
                    value={formData.establo}
                    onChange={manejarCambio} 
                    type="text" 
                    placeholder="ESTABLO / CORRAL" 
                    className="border-1 border-emerald-200 rounded-full px-6 py-2 text-[12px] focus:outline-none placeholder:text-gray-300" 
                />
                
                {/* Estado de Salud - Select */}
                <select 
                    name="salud" 
                    value={formData.salud}
                    onChange={manejarCambio}
                    className="border-1 border-emerald-200 rounded-full px-6 py-2 text-[12px] bg-white text-emerald-600 focus:outline-none"
                >
                    <option value="SANO">🟢 SANO</option>
                    <option value="ENFERMO">🔴 ENFERMO</option>
                    <option value="EN CUIDADO">🟡 EN CUIDADO</option>
                </select>
                
                {/* Campo Origen */}
                <select 
                    name="origen" 
                    value={formData.origen}
                    onChange={manejarCambio} 
                    className="border-1 border-emerald-200 rounded-full px-6 py-2 text-[11px] bg-white text-emerald-600 focus:outline-none"
                >
                    <option value="Nacimiento">NACIMIENTO</option>
                    <option value="Compra">COMPRA</option>
                    <option value="Registro inicial">REGISTRO INICIAL</option>
                </select>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={manejarFoto} 
                    accept="image/*" 
                    className="hidden" 
                />

                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-1 border-emerald-200 border-dashed rounded-[1.5rem] p-3 flex flex-col items-center justify-center text-emerald-300 gap-1 cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all min-h-[110px] relative overflow-hidden"
                >
                    {formData.foto ? (
                        <>
                            <img src={formData.foto} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                            <div className="absolute inset-0 bg-emerald-900/20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Camera size={18} className="text-white drop-shadow-md" />
                                <span className="text-[8px] font-black text-white uppercase tracking-widest mt-1">Cambiar</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-[9px] uppercase font-black tracking-widest">Fotografía</p>
                            <div className="w-8 h-8 border-1 border-emerald-200 rounded-full flex items-center justify-center bg-white shadow-sm group-hover:rotate-90 transition-transform">
                                <Plus size={14} className="text-emerald-400" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Botones */}
            <div className="col-span-2 flex justify-between gap-4 mt-2">
                {esEdicion ? (
                    <>
                        <button 
                            type="button" 
                            onClick={handleCancelar}
                            className="flex-1 bg-gray-200 text-gray-600 px-6 py-2.5 rounded-full font-black text-[10px] uppercase italic shadow-sm active:scale-95 hover:bg-gray-300 transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button" 
                            onClick={() => ejecutarEnvio(true)}
                            className="flex-1 bg-amber-600 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase shadow-lg shadow-amber-200 active:scale-95 hover:bg-amber-700 transition-all"
                        >
                            ✏️ Actualizar y Salir
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            type="button" 
                            onClick={() => ejecutarEnvio(false)}
                            className="flex-1 bg-white border-1 border-emerald-400 text-emerald-500 px-6 py-2.5 rounded-full font-black text-[10px] uppercase italic shadow-sm active:scale-95 hover:bg-emerald-50 transition-all"
                        >
                            Guardar y Seguir
                        </button>
                        <button 
                            type="button" 
                            onClick={() => ejecutarEnvio(true)}
                            className="flex-1 bg-emerald-600 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase shadow-lg shadow-emerald-200 active:scale-95 hover:bg-emerald-700 transition-all"
                        >
                            Guardar y Salir
                        </button>
                    </>
                )}
            </div>
        </form>
    );
};