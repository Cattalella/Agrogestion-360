import { useState, useRef } from "react";
import { CircleFadingPlus, BrushCleaning, Plus, ImageOff } from "lucide-react";

// 1. Definimos los tipos para que TypeScript esté feliz
export type FotoEvidencia = {
    id: number;
    url: string;
    fecha: string;
};

interface SeccionEvidenciasProps {
    fotos: FotoEvidencia[];
    rol: "admin" | "boss";
    onSubirClick?: (nueva: FotoEvidencia) => void; 
    onBorrarTodo?: () => void;
    onBorrarUnaFoto?: (idABorrar: number) => void;
}

export const Carrusel = ({ fotos, rol, onSubirClick, onBorrarTodo, onBorrarUnaFoto }: SeccionEvidenciasProps) => {
    const inputOculto = useRef<HTMLInputElement>(null);
    const [indiceActivo, setIndiceActivo] = useState(0);

    return (
        <div className="flex flex-col gap-8 w-full mx-auto shadow-[0_3px_15px_rgba(0,0,0,0.2)] rounded-[2rem]">
            
            {/* --- TU CARRUSEL --- */}
            <div className="overflow-hidden">

                <div className="p-5 text-gray-600">
                    {rol === "admin" && (
                        <p> -- EVIDENCIAS FOTOGRÁFICAS -- </p>
                    )}
                </div>
                
                <div className="flex gap-2 h-[30rem] w-full px-5">
                    {/* SI HAY FOTOS: Se renderiza el carrusel */}
                    {fotos.length > 0 ? (
                        fotos.map((foto, index) => (
                            <article
                                key={foto.id}
                                onMouseEnter={() => setIndiceActivo(index)}
                                className={`
                                    relative h-full cursor-pointer rounded-[2.5rem] border-[4px] border-white shadow-[0_3px_15px_rgba(0,0,0,0.4)]
                                    transition-all duration-700 ease-[cubic-bezier(0.05,0.61,0.41,0.95)]
                                    overflow-hidden shrink-0
                                    ${indiceActivo === index ? "flex-[6] opacity-100" : "flex-1 opacity-60 blur-[1px]"}
                                `}
                            >
                                <img src={foto.url} className="absolute inset-0 w-full h-full object-cover" alt="evidencia" />
                                {rol === "admin" && (
                                    <button onClick={(e) => {e.stopPropagation(); onBorrarUnaFoto?.(foto.id); } } 
                                    className="absolute top-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center 
                                    shadow-lg transition-all cursor-pointer active:scale-115 hover:scale-115 ">
                                        <Plus className="hover:rotate-20 transition-all" />
                                    </button>
                                )}
                                <div className={`
                                    absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent
                                    flex flex-col justify-end p-8 transition-opacity duration-500
                                    ${indiceActivo === index ? "opacity-100" : "opacity-0"}
                                `}>
                                    <p className="text-white/60 font-medium text-xs">#{index + 1}</p>
                                    <p className="text-white font-bold uppercase tracking-[2px] text-sm">
                                        Fecha: {foto.fecha}
                                    </p>
                                </div>
                            </article>
                        ))
                    ) : (
                        /* SI NO HAY FOTOS: Estado vacío (Lo verá tanto Admin como Boss) */
                        <div className="flex flex-col mx-5 items-center justify-center w-full h-full border-2 border-dashed border-gray-100 rounded-[2.5rem] text-gray-400 gap-4">
                            <ImageOff size={48} strokeWidth={1.5} className="opacity-60" />
                            <p className="font-bold tracking-[2px] text-sm uppercase opacity-60 italic"> NO HAY EVIDENCIAS ENVIADAS </p>
                        </div>
                    )}
                </div>

                <input 
                    type="file"
                    ref={inputOculto}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const archivo = e.target.files?.[0];
                        if (archivo) {
                            const nuevaFoto = URL.createObjectURL(archivo);
                            const evidencia: FotoEvidencia = {
                                id: Date.now(),
                                url: nuevaFoto,
                                fecha: new Date().toLocaleDateString()
                            };
                            if(onSubirClick) onSubirClick(evidencia);
                        }
                    }}
                />

                {/* --- PIE DE CARRUSEL --- */}
                <div className="flex justify-center py-5 gap-10">
                    {rol === "admin" && fotos.length > 0 && (
                        <button onClick={onBorrarTodo} className="bg-red-800 flex gap-3 items-center tracking-[2px] hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-[0_3px_15px_rgba(255,0,0,0.5)]
                                active:scale-95 cursor-pointer hover:scale-102 hover:shadow-[0_0px_10px_rgba(225,0,0,5)]">
                            <BrushCleaning className="hover:rotate-4" /> <span> BORRAR TODO </span>
                        </button>
                    )}

                    {rol === "admin" && (
                        <button 
                            onClick={() => inputOculto.current?.click()}
                            className="bg-green-800 flex gap-3 items-center tracking-[2px] hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-[0_3px_15px_rgba(0,255,0,0.4)]
                            active:scale-95 cursor-pointer hover:scale-102 hover:shadow-[0_0px_10px_rgba(0,255,0,1)]"
                        >
                            <CircleFadingPlus className="hover:rotate-4" />
                            <span> NUEVA FOTO </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};