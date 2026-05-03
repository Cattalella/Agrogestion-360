import { useState, useRef, useEffect } from "react";
import { CircleFadingPlus, BrushCleaning, Plus, ImageOff, Heart } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase (usando las mismas variables que en el backend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xqxbqmalxinmqyjmrvmk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxeGJxbWFseGlubXF5am1ydm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjcyODEsImV4cCI6MjA5MTQwMzI4MX0.up2DjRg-wqDd9E5UWW-VBVIkheyHHUwLT0mXEpHlvac';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    pagosPendientes?: any[];
    onSubirClick?: (nueva: FotoEvidencia) => void;
    onBorrarTodo?: () => void;
    onBorrarUnaFoto?: (idABorrar: number) => void;
    onToggleLike?: (id: number) => void | Promise<void>;
    // 🔧 FIX: onConfirmarPago ya NO debe cambiar el estado del pago.
    // Solo se usa para registrar la asociación foto↔pago en el storage.
    // El estado del pago cambia ÚNICAMENTE cuando el boss da like.
    onConfirmarPago?: (idPago: number) => void;
}

// Función para subir imagen a Supabase Storage
const subirImagenASupabase = async (archivo: File): Promise<string> => {
    const extension = archivo.name.split('.').pop();
    const nombreArchivo = `evidencias/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    const { data, error } = await supabase.storage
        .from('evidencias')
        .upload(nombreArchivo, archivo, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Error subiendo imagen a Supabase:', error);
        throw error;
    }

    const { data: publicUrl } = supabase.storage
        .from('evidencias')
        .getPublicUrl(nombreArchivo);

    return publicUrl.publicUrl;
};

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
    const [mostrarSelectorPago, setMostrarSelectorPago] = useState(false);
    const [pagoSeleccionadoId, setPagoSeleccionadoId] = useState<number | null>(null);
    const [tempFotoUrl, setTempFotoUrl] = useState<string | null>(null);
    const [subiendo, setSubiendo] = useState(false);
    const [fotosLocal, setFotosLocal] = useState<FotoEvidencia[]>(fotos);

    // Sincronizar fotosLocal cuando cambien las props
    useEffect(() => {
        setFotosLocal(fotos);
    }, [fotos]);

    // 🔧 FIX: Solo mostrar pagos que están pendientes de firma, NO "No pagado".
    // Cuando el admin sube una foto y la asocia a un pago, ese pago pasa a
    // "Pendiente de firma" — eso lo gestiona el padre via onConfirmarPago.
    // El estado "Pagado con firma" SOLO lo puede dar el boss con el like.
    const pagosDisponibles = pagosPendientes.filter(p =>
        p.estado_pago === 'No pagado' || p.estado_pago === 'Pendiente de firma'
    );

    const manejarSubidaFoto = () => {
        inputOculto.current?.click();
    };

    const manejarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        setSubiendo(true);

        try {
            const previewUrl = URL.createObjectURL(archivo);
            setTempFotoUrl(previewUrl);

            const urlPermanente = await subirImagenASupabase(archivo);
            console.log('✅ Imagen subida a Supabase:', urlPermanente);

            URL.revokeObjectURL(previewUrl);

            if (pagosDisponibles.length > 0 && rol === "admin") {
                setTempFotoUrl(urlPermanente);
                setMostrarSelectorPago(true);
            } else {
                const evidencia: FotoEvidencia = {
                    id: Date.now(),
                    url: urlPermanente,
                    fecha: new Date().toLocaleDateString(),
                    origen: 'general'
                };
                onSubirClick?.(evidencia);
            }
        } catch (error) {
            console.error('❌ Error al subir imagen:', error);
            alert('Error al subir la imagen. Intenta de nuevo.');
        } finally {
            setSubiendo(false);
            e.target.value = '';
        }
    };

    const handleConfirmarAsociacion = () => {
        if (pagoSeleccionadoId && tempFotoUrl) {
            // 1. Registrar la foto en el carrusel con origen 'pago_firma' e idReferencia
            //    El estado del pago NO cambia aquí — sigue como "Pendiente de firma"
            const evidencia: FotoEvidencia = {
                id: Date.now(),
                url: tempFotoUrl,
                fecha: new Date().toLocaleDateString(),
                origen: 'pago_firma',
                idReferencia: pagoSeleccionadoId,
                like: false  // 🔧 Siempre empieza sin like, el boss lo aprueba después
            };
            onSubirClick?.(evidencia);

            // 2. Notificar al padre para que actualice el estado del pago a
            //    "Pendiente de firma" (no a "Pagado con firma" — eso es del boss)
            onConfirmarPago?.(pagoSeleccionadoId);

            setMostrarSelectorPago(false);
            setTempFotoUrl(null);
            setPagoSeleccionadoId(null);
        }
    };

    const handleCancelarAsociacion = () => {
        if (tempFotoUrl) {
            URL.revokeObjectURL(tempFotoUrl);
        }
        setMostrarSelectorPago(false);
        setTempFotoUrl(null);
        setPagoSeleccionadoId(null);
    };

    // Manejar like localmente (optimistic) + llamar al callback async
    const handleToggleLike = (id: number) => {
        // Optimistic update en UI local
        setFotosLocal(prev => prev.map(foto =>
            foto.id === id ? { ...foto, like: !foto.like } : foto
        ));
        // El callback hace la llamada al backend (puede ser async)
        onToggleLike?.(id);
    };

    return (
        <div className="flex flex-col gap-8 w-full mx-auto shadow-[0_3px_15px_rgba(0,0,0,0.2)] rounded-[2rem]">

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

            {mostrarSelectorPago && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="font-black text-gray-800 text-lg mb-2">Asociar a un pago</h3>
                        <p className="text-xs text-gray-500 mb-1">
                            Selecciona a qué pago corresponde esta foto del formato firmado.
                        </p>
                        {/* 🔧 Aclaración visual para el admin */}
                        <p className="text-[10px] text-amber-600 font-bold mb-4 bg-amber-50 px-3 py-1.5 rounded-full">
                            ⚠️ El pago quedará en "Pendiente de firma" hasta que el dueño apruebe la foto con ❤️
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

            <div className="overflow-hidden">

                {subiendo && (
                    <div className="text-center py-2">
                        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-xs">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-700"></div>
                            Subiendo imagen...
                        </div>
                    </div>
                )}

                <div className="flex gap-2 h-[30rem] w-full px-5 mt-6">
                    {fotosLocal.length > 0 ? (
                        fotosLocal.map((foto, index) => (
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

                                {/* VISTA ADMIN */}
                                {rol === "admin" && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onBorrarUnaFoto?.(foto.id); }}
                                            className="absolute top-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-115 hover:scale-115"
                                        >
                                            <Plus className="hover:rotate-20 transition-all" />
                                        </button>

                                        {foto.like && (
                                            <div className="absolute top-4 left-4 z-20 bg-white/90 text-red-500 px-3 py-1 rounded-full flex items-center justify-center shadow-lg gap-2" title="¡Aprobado por el dueño!">
                                                <Heart size={16} fill="currentColor" />
                                                <span className="text-xs font-bold text-gray-800">Aprobado</span>
                                            </div>
                                        )}

                                        {foto.origen === 'pago_firma' && (
                                            <div className={`absolute bottom-4 left-4 z-20 px-2 py-1 rounded-full text-[8px] font-bold text-white ${foto.like ? 'bg-emerald-500/90' : 'bg-amber-500/90'}`}>
                                                {foto.like
                                                    ? `✅ Pagado con firma #${foto.idReferencia}`
                                                    : `⏳ Pendiente firma #${foto.idReferencia}`
                                                }
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* VISTA BOSS */}
                                {rol === "boss" && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('🖱️ Click en like para foto:', foto.id, '| origen:', foto.origen, '| idReferencia:', foto.idReferencia);
                                            handleToggleLike(foto.id);
                                        }}
                                        title={
                                            foto.origen === 'pago_firma'
                                                ? foto.like
                                                    ? "Quitar aprobación del pago"
                                                    : "Aprobar pago con firma ❤️"
                                                : foto.like
                                                    ? "Quitar Me Gusta"
                                                    : "Dar Me Gusta"
                                        }
                                        className={`absolute top-4 right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer active:scale-95 hover:scale-105 ${foto.like
                                            ? 'bg-white text-red-500 shadow-[0_0_15px_rgba(255,255,255,0.7)]'
                                            : 'bg-black/40 text-white hover:bg-white/90 hover:text-red-500'
                                        }`}
                                    >
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
                                            {foto.like ? '✅ Pago aprobado' : '⏳ Esperando aprobación del dueño'} #{foto.idReferencia}
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))
                    ) : (
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

                <div className="flex justify-center py-5 gap-10">
                    {rol === "admin" && fotosLocal.length > 0 && (
                        <button
                            onClick={onBorrarTodo}
                            className="bg-red-800 flex gap-3 items-center tracking-[2px] hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-[0_3px_15px_rgba(255,0,0,0.5)] active:scale-95 cursor-pointer hover:scale-102 hover:shadow-[0_0px_10px_rgba(225,0,0,5)]"
                        >
                            <BrushCleaning className="hover:rotate-4" /> <span> BORRAR TODO </span>
                        </button>
                    )}

                    {rol === "admin" && (
                        <button
                            onClick={manejarSubidaFoto}
                            disabled={subiendo}
                            className="group bg-green-800 flex gap-3 items-center tracking-[2px] hover:bg-black text-white px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-[0_3px_15px_rgba(0,255,0,0.4)] active:scale-95 cursor-pointer hover:scale-102 hover:shadow-[0_0px_10px_rgba(0,255,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CircleFadingPlus className="group-hover:rotate-90" />
                            <span> {subiendo ? "SUBIENDO..." : "NUEVA FOTO"} </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};