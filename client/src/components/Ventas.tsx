// src/components/Ventas.tsx
import { type FormularioSimpleProps } from "../types/admin";

export const Ventas = ({ onGuardar }: FormularioSimpleProps) => {
    return (
        <div className="flex flex-col items-center p-2 animate-in fade-in zoom-in duration-300">
            {/* Icono de bombilla/idea en color naranja */}
            <div className="mb-4 flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center mb-1">
                    <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-orange-500" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h2 className="text-orange-600 font-black text-2xl tracking-widest uppercase">
                    Registrar Ventas
                </h2>
            </div>

            <form className="grid grid-cols-2 gap-x-10 gap-y-5 w-full max-w-xl px-4 mt-4">
                {/* Columna Izquierda */}
                <div className="flex flex-col gap-5">
                    <input 
                        type="text" 
                        placeholder="ID ANIMAL" 
                        className="border-1 border-orange-200 rounded-full px-6 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                    <input 
                        type="text" 
                        placeholder="PESO DEL ANIMAL KG" 
                        className="border-1 border-orange-200 rounded-full px-6 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                    <input 
                        type="text" 
                        placeholder="PESO POR KILO/UNIDAD" 
                        className="border-1 border-orange-200 rounded-full px-6 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                </div>

                {/* Columna Derecha */}
                <div className="flex flex-col gap-5">
                    <input 
                        type="text" 
                        placeholder="VENDEDOR" 
                        className="border-1 border-orange-200 rounded-full px-6 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                    <input 
                        type="text" 
                        placeholder="FECHA DE VENTA" 
                        className="border-1 border-orange-200 rounded-full px-6 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                    <input 
                        type="text" 
                        placeholder="PRECIO DE VENTA" 
                        className="border-1 border-orange-200 rounded-full px-6 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400 font-medium"
                    />
                </div>

                {/* Botones de Acción Estilo Cápsula */}
                <div className="col-span-2 flex justify-center gap-8 mt-8">
                    <button 
                        onClick={() => onGuardar({}, false)}
                        type="button"
                        className="bg-[#4d7c2c] hover:bg-[#3d6323] text-white px-10 py-3 rounded-full font-black text-[12px] uppercase italic shadow-lg transition-all active:scale-95"
                    >
                        Guardar y Seguir
                    </button>
                    <button 
                        onClick={() => onGuardar({}, true)}
                        type="button"
                        className="bg-[#a34b37] hover:bg-[#8a3f2e] text-white px-10 py-3 rounded-full font-black text-[12px] uppercase italic shadow-lg transition-all active:scale-95"
                    >
                        Guardar y Salir
                    </button>
                </div>
            </form>
        </div>
    );
};