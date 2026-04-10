import { useState, useRef, useEffect } from "react";
import { Plus, Camera } from "lucide-react";

interface FormularioGanadoProps {
    listaGanado: any[]; // Para filtrar las madres disponibles
    sugerenciaId: string;
    onGuardar: (datos: any, salir: boolean) => void;
}

export const FormularioGanado = ({ listaGanado, sugerenciaId, onGuardar }: FormularioGanadoProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const estadoInicial = {
        idOficial: "",
        idLocal: sugerenciaId,
        idMadre: "",
        peso: "",
        ingreso: new Date().toISOString().split('T')[0],
        nacimiento: "",
        sexo: "HEMBRA",
        lote: "",
        salud: "SANO",
        foto: null as string | null
    };

    const [formData, setFormData] = useState(estadoInicial);

    useEffect(() => {
        setFormData(prev => ({ ...prev, idLocal: sugerenciaId }));
    }, [sugerenciaId]);

    const esCria = formData.idLocal.startsWith("TE") || formData.idLocal.startsWith("NO");

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const ejecutarEnvio = (salir: boolean) => {
        if (!formData.idLocal) {
            alert("El ID Local es obligatorio.");
            return;
        }
        onGuardar(formData, salir);
        
        if (!salir) {
            setFormData(estadoInicial);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Columna Izquierda: Identificación y Fechas */}
            <div className="flex flex-col gap-3">
                <input 
                    name="idOficial" 
                    value={formData.idOficial}
                    onChange={manejarCambio} 
                    type="text" 
                    placeholder="ID OFICIAL (ICA)" 
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-purple-300 transition-all" 
                />
                
                <input 
                    name="idLocal" 
                    value={formData.idLocal} 
                    onChange={manejarCambio} 
                    type="text" 
                    placeholder="ID LOCAL (V-01)" 
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300 font-bold text-purple-600 bg-purple-50/30" 
                />

                {esCria && (
                    <select 
                        name="idMadre" 
                        value={formData.idMadre}
                        onChange={manejarCambio} 
                        className="border-2 border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full px-6 py-2 text-[12px] font-bold focus:outline-none animate-in slide-in-from-left-4 duration-300"
                    >
                        <option value="">ASIGNAR MADRE...</option>
                        {listaGanado
                            .filter(a => a.sexo === "HEMBRA")
                            .map(madre => (
                                <option key={madre.id} value={madre.local}>
                                    {madre.local} {madre.oficial ? `(${madre.oficial})` : ''}
                                </option>
                            ))
                        }
                    </select>
                )}

                <div className="flex flex-col gap-1 mt-1">
                    <label className="text-[9px] uppercase ml-4 text-purple-400 font-black tracking-tighter">Fecha Ingreso</label>
                    <input 
                        name="ingreso" 
                        value={formData.ingreso} 
                        onChange={manejarCambio} 
                        type="date" 
                        className="border-1 border-purple-100 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-500" 
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-purple-400 font-black tracking-tighter">Nacimiento</label>
                    <input 
                        name="nacimiento" 
                        value={formData.nacimiento}
                        onChange={manejarCambio} 
                        type="date" 
                        className="border-1 border-purple-100 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-500" 
                    />
                </div>
            </div>

            {/* Columna Derecha: Estado y Foto */}
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                    <select 
                        name="sexo" 
                        value={formData.sexo}
                        onChange={manejarCambio} 
                        className="border-1 border-purple-200 rounded-full px-4 py-2 text-[11px] bg-white text-purple-600 focus:outline-none font-black appearance-none text-center"
                    >
                        <option value="HEMBRA">HEMBRA</option>
                        <option value="MACHO">MACHO</option>
                    </select>

                    <input 
                        name="peso" 
                        value={formData.peso}
                        onChange={manejarCambio} 
                        type="number" 
                        placeholder="PESO (KG)" 
                        className="border-1 border-purple-200 rounded-full px-4 py-2 text-[11px] focus:outline-none text-center font-bold" 
                    />
                </div>
                
                <input 
                    name="lote" 
                    value={formData.lote}
                    onChange={manejarCambio} 
                    type="text" 
                    placeholder="UBICACIÓN / LOTE" 
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none placeholder:text-gray-300" 
                />
                
                <input 
                    name="salud" 
                    value={formData.salud}
                    onChange={manejarCambio} 
                    type="text" 
                    placeholder="ESTADO DE SALUD" 
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none placeholder:text-gray-300 italic" 
                />
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={manejarFoto} 
                    accept="image/*" 
                    className="hidden" 
                />

                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-1 border-purple-200 border-dashed rounded-[1.5rem] p-3 flex flex-col items-center justify-center text-purple-300 gap-1 cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all min-h-[110px] relative overflow-hidden"
                >
                    {formData.foto ? (
                        <>
                            <img src={formData.foto} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                            <div className="absolute inset-0 bg-purple-900/20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                                <Camera size={18} className="text-white drop-shadow-md" />
                                <span className="text-[8px] font-black text-white uppercase tracking-widest mt-1">Cambiar</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-[9px] uppercase font-black tracking-widest">Fotografía</p>
                            <div className="w-8 h-8 border-1 border-purple-200 rounded-full flex items-center justify-center bg-white shadow-sm group-hover:rotate-90 transition-transform">
                                <Plus size={14} className="text-purple-400" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Botones */}
            <div className="col-span-2 flex justify-between gap-4 mt-2">
                <button 
                    type="button" 
                    onClick={() => ejecutarEnvio(false)}
                    className="flex-1 bg-white border-1 border-purple-400 text-purple-500 px-6 py-2.5 rounded-full font-black text-[10px] uppercase italic shadow-sm active:scale-95 hover:bg-purple-50 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button 
                    type="button" 
                    onClick={() => ejecutarEnvio(true)}
                    className="flex-1 bg-purple-600 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase shadow-lg shadow-purple-200 active:scale-95 hover:bg-purple-700 transition-all"
                >
                    Guardar y Salir
                </button>
            </div>
        </form>
    );
};