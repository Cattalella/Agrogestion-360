import { useState, useRef } from "react";
import { CircleFadingPlus, BrushCleaning, Plus, ImageOff, Heart } from "lucide-react";

// 1. Definimos los tipos para que TypeScript esté feliz
export type FotoEvidencia = {
    id: number;
    url: string;
    fecha: string;
    like?: boolean;
    origen?: 'consumo' | 'trabajo' | 'general' | 'pago_firma';
    idReferencia?: number;
};

interface SeccionEvidenciasProps {
    fotos: FotoEvidencia[];
    rol: "admin" | "boss";
    pagosPendientes?: any[];  // 🆕 Pagos pendientes de firma
    onSubirClick?: (nueva: FotoEvidencia) => void; 
    onBorrarTodo?: () => void;
    onBorrarUnaFoto?: (idABorrar: number) => void;
    onToggleLike?: (id: number) => void;
    onConfirmarPago?: (idPago: number) => void;  // 🆕 Confirmar pago con firma
}

export const Carrusel = ({ 
    fotos, 
    rol, 
    pagosPendientes = [],
    onSubirClick, 
    onBorrarTodo, 
    onBorrarUnaFoto, 
    onToggleLike,
    onConfirmarPago 
}: SeccionEvidenciasProps) => {
    const inputOculto = useRef<HTMLInputElement>(null);
    const [indiceActivo, setIndiceActivo] = useState(0);
    const [fotoExpandida, setFotoExpandida] = useState<string | null>(null);
    
    // 🆕 Estado para el selector de pago
    const [mostrarSelectorPago, setMostrarSelectorPago] = useState(false);
    const [pagoSeleccionadoId, setPagoSeleccionadoId] = useState<number | null>(null);
    const [tempFotoUrl, setTempFotoUrl] = useState<string | null>(null);

    // Filtrar pagos pendientes de firma (No pagado o Pendiente de firma)
    const pagosDisponibles = pagosPendientes.filter(p => 
        p.estado_pago === 'No pagado' || p.estado_pago === 'Pendiente de firma'
    );

    const manejarSubidaFoto = () => {
        inputOculto.current?.click();
    };

    const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (archivo) {
            const url = URL.createObjectURL(archivo);
            setTempFotoUrl(url);
            
            // Si hay pagos pendientes, mostrar selector
            if (pagosDisponibles.length > 0 && rol === "admin") {
                setMostrarSelectorPago(true);
            } else {
                // Si no hay pagos pendientes, subir como foto general
                const evidencia: FotoEvidencia = {
                    id: Date.now(),
                    url: url,
                    fecha: new Date().toLocaleDateString(),
                    origen: 'general'
                };
                onSubirClick?.(evidencia);
            }
        }
        e.target.value = ''; // Resetear input
    };

    const handleConfirmarAsociacion = () => {
        if (pagoSeleccionadoId && tempFotoUrl) {
            const evidencia: FotoEvidencia = {
                id: Date.now(),
                url: tempFotoUrl,
                fecha: new Date().toLocaleDateString(),
                origen: 'pago_firma',
                idReferencia: pagoSeleccionadoId
            };
            onSubirClick?.(evidencia);
            
            // Confirmar el pago con firma
            if (onConfirmarPago) {
                onConfirmarPago(pagoSeleccionadoId);
            }
            
            // Limpiar estado
            setMostrarSelectorPago(false);
            setTempFotoUrl(null);
            setPagoSeleccionadoId(null);
        }
    };

    const handleCancelarAsociacion = () => {
        // Limpiar la URL temporal
        if (tempFotoUrl) {
            URL.revokeObjectURL(tempFotoUrl);
        }
        setMostrarSelectorPago(false);
        setTempFotoUrl(null);
        setPagoSeleccionadoId(null);
    };

    return (
        <div className="flex flex-col gap-8 w-full mx-auto shadow-[0_3px_15px_rgba(0,0,0,0.2)] rounded-[2rem]">
            
            {/* Modal para pantalla completa */}
            {fotoExpandida && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 cursor-zoom-out backdrop-blur-sm"
                    onClick={() => setFotoExpandida(null)}
                >
                    <img 
                        src={fotoExpandida} 
                        alt="Evidencia ampliada" 
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}

            {/* 🆕 Modal para seleccionar el pago al subir foto */}
            {mostrarSelectorPago && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="font-black text-gray-800 text-lg mb-2">Asociar a un pago</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Selecciona a qué pago corresponde esta foto del formato firmado.
                        </p>
                        
                        {tempFotoUrl && (
                            <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
                                <img src={tempFotoUrl} alt="Vista previa" className="w-full h-32 object-cover" />
                            </div>
                        )}
                        
                        <select 
                            className="w-full border border-gray-200 rounded-full px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            value={pagoSeleccionadoId || ''}
                            onChange={(e) => setPagoSeleccionadoId(Number(e.target.value))}
                        >
                            <option value="">-- Seleccionar pago --</option>
                            {pagosDisponibles.map(p => (
                                <option key={p.id_pago} value={p.id_pago}>
                                    #{p.id_pago} - {p.Trabajador?.nombre_completo || `ID: ${p.id_trabajador}`} - ${p.monto_total?.toLocaleString()}
                                </option>
                            ))}
                        </select>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={handleCancelarAsociacion} 
                                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmarAsociacion} 
                                disabled={!pagoSeleccionadoId}
                                className="flex-1 bg-emerald-600 text-white py-2 rounded-full font-bold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Asociar y subir
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                onClick={() => setFotoExpandida(foto.url)}
                                className={`
                                    relative h-full cursor-pointer rounded-[2.5rem] border-[4px] border-white shadow-[0_3px_15px_rgba(0,0,0,0.4)]
                                    transition-all duration-700 ease-[cubic-bezier(0.05,0.61,0.41,0.95)]
                                    overflow-hidden shrink-0
                                    ${indiceActivo === index ? "flex-[6] opacity-100" : "flex-1 opacity-60 blur-[1px]"}
                                `}
                                title={rol === "boss" ? "Click para expandir" : ""}
                            >
                                <img src={foto.url} className="absolute inset-0 w-full h-full object-cover" alt="evidencia" />
                                {rol === "admin" && (
                                    <>
                                        <button onClick={(e) => {e.stopPropagation(); onBorrarUnaFoto?.(foto.id); } } 
                                        className="absolute top-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center 
                                        shadow-lg transition-all cursor-pointer active:scale-115 hover:scale-115 ">
                                            <Plus className="hover:rotate-20 transition-all" />
                                        </button>
                                        {foto.like && (
                                            <div className="absolute top-4 left-4 z-20 bg-white/90 text-red-500 px-3 py-1 rounded-full flex items-center justify-center shadow-lg gap-2" title="¡Visto por el dueño!">
                                                <Heart size={16} fill="currentColor" />
                                                <span className="text-xs font-bold text-gray-800">Visto</span>
                                            </div>
                                        )}
                                        {foto.origen === 'pago_firma' && (
                                            <div className="absolute bottom-4 left-4 z-20 bg-emerald-500/90 text-white px-2 py-1 rounded-full text-[8px] font-bold">
                                                📄 Firma de pago #{foto.idReferencia}
                                            </div>
                                        )}
                                    </>
                                )}
                                {rol === "boss" && (
                                    <button onClick={(e) => { e.stopPropagation(); onToggleLike?.(foto.id); }}
                                    title={foto.like ? "Quitar Me Gusta" : "Dar Me Gusta para que Admin lo vea"}
                                    className={`absolute top-4 right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 hover:scale-105 ${foto.like ? 'bg-white text-red-500 shadow-[0_0_15px_rgba(255,255,255,0.7)]' : 'bg-black/40 text-white hover:bg-white/90 hover:text-red-500'}`}>
                                        <Heart size={26} fill={foto.like ? "currentColor" : "none"} />
                                    </button>
                                )}
                                <div className={`
                                    absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent
                                    flex flex-col justify-end p-8 transition-opacity duration-500 pointer-events-none
                                    ${indiceActivo === index ? "opacity-100" : "opacity-0"}
                                `}>
                                    <p className="text-white/60 font-medium text-xs">#{index + 1}</p>
                                    <p className="text-white font-bold uppercase tracking-[2px] text-sm">
                                        Fecha: {foto.fecha}
                                    </p>
                                    {foto.origen === 'pago_firma' && (
                                        <p className="text-white/80 text-[10px] mt-1">
                                            Pago #{foto.idReferencia}
                                        </p>
                                    )}
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
                    onChange={manejarArchivo}
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
                            onClick={manejarSubidaFoto}
                            className="group bg-green-800 flex gap-3 items-center tracking-[2px] hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-[0_3px_15px_rgba(0,255,0,0.4)]
                            active:scale-95 cursor-pointer hover:scale-102 hover:shadow-[0_0px_10px_rgba(0,255,0,1)]"
                        >
                            <CircleFadingPlus className="group-hover:rotate-90" />
                            <span> NUEVA FOTO </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};