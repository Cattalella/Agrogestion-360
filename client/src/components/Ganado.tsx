// src/components/FormularioGanado.tsx
import { Plus } from "lucide-react";
import { type GanadoProps } from "../types/admin";

export const FormularioGanado = ({ 
    sugerenciaId, 
    categoriaSeleccionada, 
    setCategoria, 
    onGuardar 
}: GanadoProps) => {
    
    // Lógica para mostrar el campo de la madre solo en Terneros o Novillos
    const mostrarMadre = ["TE", "NO"].includes(categoriaSeleccionada);

    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
            {/* Columna Izquierda: Identificación y Pesos */}
            <div className="flex flex-col gap-3">
                <input 
                    type="text" 
                    placeholder="ID OFICIAL (ICA) - OPCIONAL" 
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" 
                />
                
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder={`ID LOCAL (EJ: ${sugerenciaId})`} 
                        className="w-full border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all font-bold text-purple-700 placeholder:font-normal" 
                    />
                    <span className="absolute right-4 top-2 text-[8px] text-purple-300 uppercase font-black">Sugerido</span>
                </div>

                {mostrarMadre && (
                    <input 
                        type="text" 
                        placeholder="ID DE LA MADRE (TRAZABILIDAD)" 
                        className="border-2 border-emerald-200 bg-emerald-50 rounded-full px-6 py-2 text-[12px] focus:outline-none animate-in slide-in-from-left-2" 
                    />
                )}

                <input 
                    type="text" 
                    placeholder="PESO INICIAL (KG)" 
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" 
                />
                <input 
                    type="text" 
                    placeholder="INGRESO (DD/MM/AA)" 
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" 
                />
            </div>

            {/* Columna Derecha: Categoría y Estado */}
            <div className="flex flex-col gap-3">
                <select 
                    value={categoriaSeleccionada}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] bg-white text-gray-600 font-bold focus:outline-none cursor-pointer"
                >
                    <option value="VA">VACA (ADULTA)</option>
                    <option value="TO">TORO (ADULTO)</option>
                    <option value="TE">TERNERO/A (BEBÉ)</option>
                    <option value="NO">NOVILLO/A (JOVEN)</option>
                </select>

                <input 
                    type="text" 
                    placeholder="ESTABLO / LOTE" 
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none" 
                />
                <input 
                    type="text" 
                    placeholder="ESTADO DE SALUD" 
                    className="border-1 border-purple-200 rounded-full px-6 py-2 text-[12px] focus:outline-none" 
                />
                
                {/* Botón de Fotografía */}
                <div className="border-1 border-purple-200 rounded-[1.5rem] p-3 flex flex-col items-center justify-center text-gray-400 gap-1 cursor-pointer hover:bg-purple-50 transition-colors h-full">
                    <p className="text-[9px] uppercase font-bold tracking-wider">Subir Fotografía</p>
                    <div className="w-8 h-8 border-1 border-dashed border-purple-300 rounded-lg flex items-center justify-center">
                        <Plus size={16} className="text-purple-300" />
                    </div>
                </div>
            </div>

            {/* Botones de Acción: Ocupan las 2 columnas */}
            <div className="col-span-2 flex justify-between mt-4">
                <button 
                    onClick={() => onGuardar({}, false)}
                    type="button" 
                    className="bg-purple-400 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase italic shadow-md active:scale-95 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button 
                    onClick={() => onGuardar({}, true)}
                    type="button" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"
                >
                    Guardar y Salir
                </button>
            </div>
        </form>
    );
};