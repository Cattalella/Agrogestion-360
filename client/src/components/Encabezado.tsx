import React, { useState, useRef, useEffect } from "react";
import { Navegar } from "./Navegar"; 
import { useNavigate } from "react-router-dom";

interface EncabezadoProps {
    children: React.ReactNode; 
    estilos?: string;
    titulo?: string; 
    titulos?: string;
    subtitulo?: string;
    id: string; 
}

// ============================================================
// 📌 TIPOS PARA RECORDATORIOS
// ============================================================
interface Recordatorio {
    id: string;
    fecha: string;
    proposito: string;
    fechaCumplida?: string;
    cumplido: boolean;
}

// ============================================================
// 📌 TOOLTIP DE RECORDATORIO (desplegable debajo del botón)
// ============================================================
const TooltipRecordatorio = ({ 
    isOpen, 
    onClose, 
    onGuardar 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onGuardar: (recordatorio: { fecha: string; proposito: string }) => void;
}) => {
    const [fecha, setFecha] = useState("");
    const [proposito, setProposito] = useState("");
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleGuardar = () => {
        // ✅ Solo la fecha es obligatoria, el propósito es opcional
        if (!fecha) {
            alert("Por favor selecciona una fecha");
            return;
        }
        onGuardar({ fecha, proposito: proposito || "Sin motivo" }); // Si no hay motivo, poner "Sin motivo"
        setFecha("");
        setProposito("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            ref={tooltipRef}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[200] overflow-hidden animate-in fade-in zoom-in duration-200"
        >
            <div className="bg-green-700 p-3 text-white">
                <h3 className="text-sm font-bold text-center">NUEVO RECORDATORIO</h3>
            </div>
            
            <div className="p-4 space-y-3">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                        FECHA DEL RECORDATORIO *
                    </label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg p-2 text-sm focus:border-green-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                        PROPÓSITO (Opcional)
                    </label>
                    <textarea
                        value={proposito}
                        onChange={(e) => setProposito(e.target.value)}
                        placeholder="Motivo del recordatorio (opcional)"
                        className="w-full border-2 border-gray-200 rounded-lg p-2 text-sm focus:border-green-500 outline-none resize-none"
                        rows={2}
                    />
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleGuardar}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                        GUARDAR
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                        CANCELAR
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// 📌 BANNER DE RECORDATORIO (Verde, no se quita hasta hacer clic)
// ============================================================
const BannerRecordatorio = ({ 
    recordatorio, 
    onCerrar 
}: { 
    recordatorio: Recordatorio; 
    onCerrar: (id: string) => void;
}) => {
    const [visible, setVisible] = useState(true);

    const handleClick = () => {
        setVisible(false);
        onCerrar(recordatorio.id);
    };

    if (!visible) return null;

    return (
        <div 
            onClick={handleClick}
            className="fixed bottom-5 right-5 z-[150] bg-green-500 text-white p-4 rounded-xl shadow-2xl cursor-pointer hover:bg-green-600 transition-all animate-in slide-in-from-right duration-300 max-w-md"
        >
            <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                    <p className="font-bold text-sm uppercase">¡RECORDATORIO CUMPLIDO!</p>
                    <p className="text-sm">{recordatorio.proposito}</p>
                    <p className="text-xs opacity-90">Fecha: {recordatorio.fechaCumplida}</p>
                </div>
                <button className="ml-auto text-white hover:text-gray-200 text-xl">✕</button>
            </div>
        </div>
    );
};

// ============================================================
// 📌 MODAL DE PERFIL
// ============================================================
const ModalPerfil = ({ onClose }: { onClose: () => void }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div ref={modalRef} className="absolute top-14 right-0 w-64 backdrop-blur-xl bg-white/90 p-6 rounded-2xl shadow-2xl border border-white/50 z-50 flex flex-col gap-4 text-black animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors">
                    <span className="text-[10px] text-center font-bold">FOTO</span>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter cursor-pointer underline">
                    [ clic para cambiar ]
                </p>
            </div>

            <div className="space-y-3 text-xs font-bold">
                <p className="flex items-center gap-2">NOMBRE: JUAN PÉREZ 🔒</p>
                <div className="flex flex-col gap-1">
                    <p>CORREO: <span className="font-normal text-gray-600">[ editable ]</span></p>
                    <p>TELÉFONO: <span className="font-normal text-gray-600">[ editable ]</span></p>
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <button className="bg-black text-white py-2 rounded-lg text-[10px] uppercase hover:bg-gray-800 transition-colors">Guardar cambios</button>
                <button onClick={onClose} className="border border-black py-2 rounded-lg text-[10px] uppercase hover:bg-gray-100 transition-colors">Cancelar</button>
            </div>

            <hr className="border-gray-300 my-1" />
            
            <button className="text-[10px] uppercase font-bold text-left hover:text-gray-600 transition-colors underline">
                [ Cambiar contraseña ]
            </button>
        </div>
    );
};

// ============================================================
// 📌 NAV2 CON SISTEMA DE RECORDATORIOS (Sin intervalo, verificación inmediata)
// ============================================================
export const Nav2 = () => {
    const navigate = useNavigate();
    const [mostrarPerfil, setMostrarPerfil] = useState(false);
    const [mostrarTooltipRecordatorio, setMostrarTooltipRecordatorio] = useState(false);
    const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
    const [recordatoriosActivos, setRecordatoriosActivos] = useState<Recordatorio[]>([]);

    // Función para verificar recordatorios vencidos
    const verificarRecordatoriosVencidos = () => {
        const hoy = new Date().toISOString().split("T")[0];
        const nuevosActivos: Recordatorio[] = [];
        
        const actualizados = recordatorios.map(recordatorio => {
            // Solo verificar los que NO están cumplidos
            if (!recordatorio.cumplido && recordatorio.fecha <= hoy) {
                nuevosActivos.push({
                    ...recordatorio,
                    fechaCumplida: hoy,
                    cumplido: true
                });
                return { ...recordatorio, cumplido: true, fechaCumplida: hoy };
            }
            return recordatorio;
        });
        
        if (nuevosActivos.length > 0) {
            setRecordatorios(actualizados);
            setRecordatoriosActivos(prev => [...prev, ...nuevosActivos]);
        }
    };

    // Cargar recordatorios guardados y verificar al iniciar
    useEffect(() => {
        const guardados = localStorage.getItem("recordatorios");
        if (guardados) {
            const parsed = JSON.parse(guardados);
            setRecordatorios(parsed);
        }
    }, []);

    // Verificar cuando cambien los recordatorios (después de cargar o guardar)
    useEffect(() => {
        verificarRecordatoriosVencidos();
    }, [recordatorios]);

    // Guardar recordatorios cada vez que cambian
    useEffect(() => {
        localStorage.setItem("recordatorios", JSON.stringify(recordatorios));
    }, [recordatorios]);

    const handleGuardarRecordatorio = (recordatorio: { fecha: string; proposito: string }) => {
        const nuevoRecordatorio: Recordatorio = {
            id: Date.now().toString(),
            fecha: recordatorio.fecha,
            proposito: recordatorio.proposito,
            cumplido: false
        };
        setRecordatorios(prev => [...prev, nuevoRecordatorio]);
        // La verificación se hará automáticamente cuando se actualice recordatorios
    };

    const handleCerrarBanner = (id: string) => {
        setRecordatoriosActivos(prev => prev.filter(r => r.id !== id));
    };

    const estiloBoton = "backdrop-blur-md bg-white/60 px-4 py-2 rounded-full hover:bg-white transition-all cursor-pointer font-bold text-xs shadow-sm border border-white/80";

    const handleCerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nombreUsuario');
        navigate('/', { replace: true });
        console.log("Sesión cerrada correctamente");
    };

    return (
        <>
            <nav className="flex gap-15 relative">
                <div className="relative">
                    <p className={estiloBoton} onClick={() => setMostrarPerfil(!mostrarPerfil)}> 
                        MI PERFIL 
                    </p>
                    {mostrarPerfil && <ModalPerfil onClose={() => setMostrarPerfil(false)} />}
                </div>

                {/* Botón RECORDATORIO sin emoji */}
                <div className="relative">
                    <p className={estiloBoton} onClick={() => setMostrarTooltipRecordatorio(!mostrarTooltipRecordatorio)}> 
                        RECORDATORIO
                    </p>
                    <TooltipRecordatorio 
                        isOpen={mostrarTooltipRecordatorio}
                        onClose={() => setMostrarTooltipRecordatorio(false)}
                        onGuardar={handleGuardarRecordatorio}
                    />
                </div>
                
                <p className={estiloBoton} onClick={handleCerrarSesion}> 
                    CERRAR 
                </p>
            </nav>

            {/* Banners de recordatorios activos */}
            {recordatoriosActivos.map(recordatorio => (
                <BannerRecordatorio 
                    key={recordatorio.id}
                    recordatorio={recordatorio}
                    onCerrar={handleCerrarBanner}
                />
            ))}
        </>
    );
};

// ============================================================
// 📌 ENCABEZADO PRINCIPAL
// ============================================================
export const Encabezado = ({ children, estilos, titulo, id, titulos, subtitulo }: EncabezadoProps) => {
    const keyH1 = `colorH1_${id}`;
    const keyH2 = `colorH2_${id}`;

    const [colorH1, setColorH1] = useState(() => localStorage.getItem(keyH1) || "#000000");
    const [colorH2, setColorH2] = useState(() => localStorage.getItem(keyH2) || "#000000");

    const inputH1Ref = useRef<HTMLInputElement>(null);
    const inputH2Ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        localStorage.setItem(keyH1, colorH1);
        localStorage.setItem(keyH2, colorH2);
    }, [colorH1, colorH2, keyH1, keyH2]);

    return ( 
        <div className={`relative w-full flex justify-end overflow-hidden min-h-[45rem] ${estilos || ""}`}>
            <input 
                type="color" 
                ref={inputH1Ref} 
                value={colorH1} 
                onChange={(e) => setColorH1(e.target.value)} 
                className="hidden" 
            />
            <input 
                type="color" 
                ref={inputH2Ref} 
                value={colorH2} 
                onChange={(e) => setColorH2(e.target.value)} 
                className="hidden" 
            />

            <div className="absolute inset-0 z-0 w-full h-full max-h-[200rem]">
                {children}
            </div>

            <div className="flex items-center absolute w-fit h-fit gap-100 left-10 top-10 z-30">
                <Navegar />
                <Nav2 />
            </div>

            <div 
                style={{ borderColor: colorH1 }} 
                className="absolute inset-0 z-20 flex flex-col w-fit h-fit top-60 left-10 border-b-3 pb-3"
            >
                <h1 
                    onClick={() => inputH1Ref.current?.click()}
                    style={{ color: colorH1 }}
                    className="text-[6rem] leading-[1.2] cursor-pointer select-none pointer-events-auto w-fit transition-colors duration-200 font-black"
                >
                    BIENVENIDO<br /> 
                    <span>
                        {titulo ? titulo : "ESTE ES EL"}
                    </span>
                    <br />
                    <span>
                        {titulos ? titulos : ""}
                    </span>
                </h1>

                <div className="absolute top-68">
                    <h2 
                        onClick={() => inputH2Ref.current?.click()}
                        style={{ color: colorH2 }}
                        className="text-[2.5rem] leading-[1.2] cursor-pointer select-none pointer-events-auto w-fit transition-colors duration-200 font-black"
                    >
                        <span>
                            {subtitulo ? subtitulo : ""}
                        </span>
                    </h2>
                </div>
            </div>
        </div>
    );
};