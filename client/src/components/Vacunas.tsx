// src/components/FormularioVacunas.tsx
import { type FormularioSimpleProps } from "../types/admin";

export const Vacunas = ({ onGuardar }: FormularioSimpleProps) => {
    return (
        <div className="flex flex-col items-center p-2 animate-in fade-in zoom-in duration-300">
            {/* Logo e Icono Superior */}
            <div className="mb-4 flex flex-col items-center">
                <div className="w-10 h-10 border-1 border-teal-500 rounded-full flex items-center justify-center mb-1">
                    <span className="text-teal-500 text-xl font-light">🌱</span>
                </div>
                <h2 className="text-teal-600 font-black text-xl tracking-[0.2em] uppercase">
                    Registrar Vacunas
                </h2>
            </div>

            <form className="grid grid-cols-2 gap-x-10 gap-y-4 w-full max-w-xl px-4">
                {/* Columna Izquierda */}
                <div className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="TIPO DE VACUNA" 
                        className="border-1 border-blue-200 rounded-full px-6 py-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                    <input 
                        type="text" 
                        placeholder="DOSIS APLICADA" 
                        className="border-1 border-blue-200 rounded-full px-6 py-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                    <input 
                        type="text" 
                        placeholder="TIPO DE ANIMAL" 
                        className="border-1 border-blue-200 rounded-full px-6 py-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                    <input 
                        type="text" 
                        placeholder="ID LOCAL DE ANIMAL" 
                        className="border-1 border-blue-200 rounded-full px-6 py-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                </div>

                {/* Columna Derecha */}
                <div className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="FECHA DE APLICACION" 
                        className="border-1 border-blue-200 rounded-full px-6 py-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                    <div className="relative">
                        <select className="w-full border-1 border-blue-200 rounded-full px-6 py-2 text-[10px] text-gray-400 focus:outline-none bg-white appearance-none cursor-pointer font-medium uppercase">
                            <option>VIA DE APLICACION</option>
                            <option value="im">Intramuscular</option>
                            <option value="sq">Subcutánea</option>
                        </select>
                        <span className="absolute right-4 top-2.5 text-[8px] text-blue-300">▼</span>
                    </div>
                    <div className="relative">
                        <select className="w-full border-1 border-blue-200 rounded-full px-6 py-2 text-[10px] text-gray-400 focus:outline-none bg-white appearance-none cursor-pointer font-medium uppercase">
                            <option>PROXIMO REFUERZO</option>
                            <option value="15">15 Días</option>
                            <option value="30">30 Días</option>
                        </select>
                        <span className="absolute right-4 top-2.5 text-[8px] text-blue-300">▼</span>
                    </div>
                    <div className="relative">
                        <select className="w-full border-1 border-blue-200 rounded-full px-6 py-2 text-[10px] text-gray-400 focus:outline-none bg-white appearance-none cursor-pointer font-medium uppercase">
                            <option>LOTE DE MEDICAMENTO</option>
                        </select>
                        <span className="absolute right-4 top-2.5 text-[8px] text-blue-300">▼</span>
                    </div>
                </div>

                {/* Botones de Acción Estilo Cápsula Inclinada */}
                <div className="col-span-2 flex justify-center gap-8 mt-6">
                    <button 
                        onClick={() => onGuardar({}, false)}
                        type="button"
                        className="bg-teal-400 hover:bg-teal-500 text-white px-10 py-2.5 rounded-full font-black text-[11px] uppercase italic tracking-tighter shadow-md transform -skew-x-6 hover:skew-x-0 transition-all active:scale-95"
                    >
                        Guardar y Seguir
                    </button>
                    <button 
                        onClick={() => onGuardar({}, true)}
                        type="button"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-2.5 rounded-full font-black text-[11px] uppercase italic tracking-tighter shadow-md transform -skew-x-6 hover:skew-x-0 transition-all active:scale-95"
                    >
                        Guardar y Salir
                    </button>
                </div>
            </form>
        </div>
    );
};