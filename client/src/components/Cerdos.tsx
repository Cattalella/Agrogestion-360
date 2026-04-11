// src/components/FormularioCerdos.tsx
import { Plus } from "lucide-react";
import { type GanadoProps } from "../types/admin";

export const Cerdos = ({ 
    sugerenciaId, 
    categoriaSeleccionada, 
    setCategoria, 
    onGuardar 
}: GanadoProps) => {
    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300 p-4">
            {/* Columna Izquierda */}
            <div className="flex flex-col gap-3">
                <input 
                    type="text" 
                    placeholder="ID OFICIAL (ICA)" 
                    className="border-1 border-emerald-300 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all" 
                />
                
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder={`ID LOCAL (EJ: ${sugerenciaId})`} 
                        className="w-full border-1 border-emerald-300 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all font-bold text-emerald-700 placeholder:font-normal" 
                    />
                    <span className="absolute right-4 top-2 text-[8px] text-emerald-400 uppercase font-black">Sugerido</span>
                </div>

                <input type="text" placeholder="PESO INICIAL (KG)" className="border-1 border-emerald-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" />
                <input type="text" placeholder="INGRESO (DD/MM/AA)" className="border-1 border-emerald-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" />
                <input type="text" placeholder="NACIMIENTO (DD/MM/AA)" className="border-1 border-emerald-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" />
            </div>

            {/* Columna Derecha */}
            <div className="flex flex-col gap-3">
                <select 
                    value={categoriaSeleccionada}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="border-1 border-emerald-300 rounded-full px-6 py-2 text-[12px] bg-white text-gray-600 font-bold focus:outline-none cursor-pointer appearance-none"
                >
                    <option value="HEMBRA">HEMBRA</option>
                    <option value="MACHO">MACHO</option>
                    <option value="BEBE">BEBÉ / LECHÓN</option>
                </select>

                <input type="text" placeholder="ESTABLO" className="border-1 border-emerald-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" />
                <input type="text" placeholder="ESTADO" className="border-1 border-emerald-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" />
                
                {/* Botón de Fotografía (Estilo Esmeralda) */}
                <div className="border-1 border-emerald-300 rounded-[2rem] p-4 flex flex-col items-center justify-center text-gray-400 gap-1 cursor-pointer hover:bg-emerald-50 transition-colors h-full">
                    <p className="text-[10px] uppercase font-bold tracking-wider">Subir Fotografía</p>
                    <Plus size={24} className="text-emerald-300" />
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="col-span-2 flex justify-between mt-6 gap-4">
                <button 
                    onClick={() => onGuardar({}, false)}
                    type="button" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-md active:scale-95 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button 
                    onClick={() => onGuardar({}, true)}
                    type="button" 
                    className="bg-teal-600 hover:bg-teal-700 text-white flex-1 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    Guardar y Salir
                </button>
            </div>
        </form>
    );
};