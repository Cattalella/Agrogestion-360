import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navegar } from "./Navegar";
import apiClient from "../api/apiClient";

interface EncabezadoProps {
    children: React.ReactNode; 
    estilos?: string;
    titulo?: string; 
    titulos?: string;
    subtitulo?: string;
    id: string; 
}

interface Recordatorio {
    id: string;
    fecha: string;
    proposito: string;
    fechaCumplida?: string;
    cumplido: boolean;
}

// ============================================================
// 📌 TOOLTIP DE RECORDATORIO
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
        if (!fecha || !proposito) {
            alert("Por favor completa todos los campos");
            return;
        }
        onGuardar({ fecha, proposito });
        setFecha("");
        setProposito("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            ref={tooltipRef}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[200] overflow-hidden"
        >
            <div className="bg-green-700 p-3 text-white">
                <h3 className="text-sm font-bold text-center">📅 NUEVO RECORDATORIO</h3>
            </div>
            
            <div className="p-4 space-y-3">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                        FECHA DEL RECORDATORIO
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
                        PROPÓSITO DEL RECORDATORIO
                    </label>
                    <textarea
                        value={proposito}
                        onChange={(e) => setProposito(e.target.value)}
                        placeholder="Motivo De Recordatorio"
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
// 📌 MODAL DE CONFIRMACIÓN PARA CERRAR SESIÓN
// ============================================================
const ModalConfirmacion = ({ 
    isOpen, 
    onConfirmar, 
    onCancelar 
}: { 
    isOpen: boolean; 
    onConfirmar: () => void; 
    onCancelar: () => void;
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onCancelar();
            }
        };
        
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onCancelar]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancelar} />
            
            <div 
                ref={modalRef}
                className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200"
            >
                <div className="text-center">
                    <div className="text-4xl mb-3">⚠️</div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                        ¿Cerrar sesión?
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        ¿Estás seguro que deseas salir de tu cuenta?
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={onCancelar}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        CANCELAR
                    </button>
                    <button 
                        onClick={onConfirmar}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        CERRAR SESIÓN
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// 📌 BANNER DE RECORDATORIO
// ============================================================
const BannerRecordatorio = ({ 
    recordatorio, 
    onCerrar 
}: { 
    recordatorio: Recordatorio; 
    onCerrar: (id: string) => void;
}) => {
    const [visible, setVisible] = useState(true);

    const handleClick = async () => {
        setVisible(false);
        
        try {
            await apiClient.delete(`/recordatorios/${recordatorio.id}`);
        } catch (error) {
            console.error('Error al eliminar recordatorio:', error);
        }
        
        onCerrar(recordatorio.id);
    };

    if (!visible) return null;

    return (
        <div 
            onClick={handleClick}
            className="fixed bottom-5 right-5 z-[150] bg-green-500 text-white p-4 rounded-xl shadow-2xl cursor-pointer hover:bg-green-600 transition-all duration-300 max-w-md"
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(() => localStorage.getItem("foto_perfil"));
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [nombre, setNombre] = useState("");

    // Cargar perfil del backend
    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const respuesta = await apiClient.get('/encabezado/perfil');
                
                if (respuesta.status === 200) {
                    const datos = respuesta.data;
                    setNombre(datos.nombre || "Usuario");
                    setEmail(datos.email || "");
                    setTelefono(datos.telefono || "");
                    if (datos.foto_perfil) {
                        setFotoPerfil(datos.foto_perfil);
                        localStorage.setItem("foto_perfil", datos.foto_perfil);
                    }
                }
            } catch (error) {
                console.error('Error al cargar perfil:', error);
            }
        };
        
        cargarPerfil();
    }, []);

    // 🆕 Escuchar cambios de foto desde Navegar
    useEffect(() => {
        const handleFotoActualizada = () => {
            const nuevaFoto = localStorage.getItem('foto_perfil');
            if (nuevaFoto) {
                setFotoPerfil(nuevaFoto);
            }
        };
        
        window.addEventListener('fotoPerfilActualizada', handleFotoActualizada);
        return () => window.removeEventListener('fotoPerfilActualizada', handleFotoActualizada);
    }, []);

    // Cerrar al hacer clic fuera
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                localStorage.setItem("foto_perfil", base64String);
                setFotoPerfil(base64String);
                window.dispatchEvent(new Event('fotoPerfilActualizada')); // 🆕 Sincronizar
            };
            reader.readAsDataURL(file);
            
            try {
                const formData = new FormData();
                formData.append('foto', file);
                
                await apiClient.post('/encabezado/perfil/foto', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } catch (error) {
                console.error('Error al subir foto:', error);
            }
        }
    };

    const handleGuardarCambios = async () => {
        try {
            const respuesta = await apiClient.put('/encabezado/perfil', { email, telefono });
            
            if (respuesta.status === 200) {
                alert('Perfil actualizado correctamente');
                onClose();
            } else {
                alert('Error al guardar los cambios');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar los cambios');
        }
    };

    return (
        <div ref={modalRef} className="absolute top-14 right-0 w-64 backdrop-blur-xl bg-white/90 p-6 rounded-2xl shadow-2xl border border-white/50 z-50 flex flex-col gap-4 text-black">
            <div className="flex flex-col items-center gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                />
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors overflow-hidden border-2 border-white shadow-sm"
                >
                    {fotoPerfil ? (
                        <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] text-center font-bold">FOTO</span>
                    )}
                </div>
                <p 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter cursor-pointer hover:text-green-600 transition-colors"
                >
                    [ clic para cambiar ]
                </p>
            </div>

            <div className="space-y-3 text-xs font-bold">
                <p className="flex items-center gap-2">NOMBRE: {nombre || "Cargando..."} 🔒</p>
                <div className="flex flex-col gap-1">
                    <p>CORREO: 
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="ml-1 font-normal text-gray-600 border-b border-gray-300 focus:outline-none focus:border-green-500"
                            placeholder="correo@ejemplo.com"
                        />
                    </p>
                    <p>TELÉFONO: 
                        <input 
                            type="text" 
                            value={telefono} 
                            onChange={(e) => setTelefono(e.target.value)}
                            className="ml-1 font-normal text-gray-600 border-b border-gray-300 focus:outline-none focus:border-green-500"
                            placeholder="123456789"
                        />
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <button 
                    onClick={handleGuardarCambios}
                    className="bg-black text-white py-2 rounded-lg text-[10px] uppercase hover:bg-green-700 transition-colors"
                >
                    Guardar cambios
                </button>
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
// 📌 NAV2 CON SISTEMA DE RECORDATORIOS (BACKEND)
// ============================================================
export const Nav2 = () => {
    const navigate = useNavigate();
    const [mostrarPerfil, setMostrarPerfil] = useState(false);
    const [mostrarTooltipRecordatorio, setMostrarTooltipRecordatorio] = useState(false);
    const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
    const [recordatoriosActivos, setRecordatoriosActivos] = useState<Recordatorio[]>([]);
    const [mostrarModalCerrar, setMostrarModalCerrar] = useState(false);

    useEffect(() => {
        const cargarRecordatorios = async () => {
            try {
                const respuesta = await apiClient.get('/recordatorios');
                if (respuesta.status === 200) {
                    setRecordatorios(respuesta.data);
                }
            } catch (error) {
                console.error('Error al cargar recordatorios:', error);
            }
        };
        
        cargarRecordatorios();
    }, []);

    useEffect(() => {
        const verificarVencidos = () => {
            if (recordatorios.length === 0) return;
            
            const hoy = new Date().toISOString().split("T")[0];
            const vencidos = recordatorios.filter(r => !r.cumplido && r.fecha <= hoy);
            
            if (vencidos.length > 0) {
                vencidos.forEach(async (r) => {
                    try {
                        await apiClient.put(`/recordatorios/${r.id}/cumplido`);
                    } catch (error) {
                        console.error('Error al marcar cumplido:', error);
                    }
                });
                
                setRecordatorios(prev => prev.map(r => {
                    const vencido = vencidos.find(v => v.id === r.id);
                    if (vencido) {
                        return { ...r, cumplido: true, fechaCumplida: hoy };
                    }
                    return r;
                }));
                
                setRecordatoriosActivos(prev => [
                    ...prev.filter(activo => !vencidos.some(v => v.id === activo.id)),
                    ...vencidos.map(v => ({ ...v, cumplido: true, fechaCumplida: hoy }))
                ]);
            }
        };

        verificarVencidos();
        const intervalo = setInterval(verificarVencidos, 30000);
        
        return () => clearInterval(intervalo);
    }, [recordatorios]);

    const handleGuardarRecordatorio = async (datos: { fecha: string; proposito: string }) => {
        try {
            const respuesta = await apiClient.post('/recordatorios', datos);
            setRecordatorios(prev => [...prev, respuesta.data]);
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo guardar el recordatorio');
        }
    };

    const handleCerrarBanner = (id: string) => {
        setRecordatoriosActivos(prev => prev.filter(r => r.id !== id));
    };

    const estiloBoton = "backdrop-blur-md bg-white/60 px-4 py-2 rounded-full hover:bg-white transition-all cursor-pointer font-bold text-xs shadow-sm border border-white/80";

    const handleCerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        localStorage.removeItem('nombreUsuario');
        navigate('/star', { replace: true });
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

                <div className="relative">
                    <p className={estiloBoton} onClick={() => setMostrarTooltipRecordatorio(!mostrarTooltipRecordatorio)}> 
                        📅 RECORDATORIO 
                    </p>
                    <TooltipRecordatorio 
                        isOpen={mostrarTooltipRecordatorio}
                        onClose={() => setMostrarTooltipRecordatorio(false)}
                        onGuardar={handleGuardarRecordatorio}
                    />
                </div>
                
                <p className={estiloBoton} onClick={() => setMostrarModalCerrar(true)}> 
                    CERRAR 
                </p>
            </nav>

            <ModalConfirmacion 
                isOpen={mostrarModalCerrar}
                onConfirmar={() => {
                    setMostrarModalCerrar(false);
                    handleCerrarSesion();
                }}
                onCancelar={() => setMostrarModalCerrar(false)}
            />

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
    const keyFondo = `fondo_${id}`;

    const [colorH1, setColorH1] = useState(() => localStorage.getItem(keyH1) || "#000000");
    const [colorH2, setColorH2] = useState(() => localStorage.getItem(keyH2) || "#000000");
    const [fondoImagen, setFondoImagen] = useState<string | null>(() => {
        return localStorage.getItem(keyFondo) || null;
    });

    const inputH1Ref = useRef<HTMLInputElement>(null);
    const inputH2Ref = useRef<HTMLInputElement>(null);
    const inputFondoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        localStorage.setItem(keyH1, colorH1);
        localStorage.setItem(keyH2, colorH2);
        
        const guardarColores = async () => {
            try {
                await apiClient.put('/encabezado/colores', {
                    color_titulo: colorH1,
                    color_subtitulo: colorH2
                });
            } catch (error) {
                console.error('Error al guardar colores:', error);
            }
        };
        
        guardarColores();
    }, [colorH1, colorH2, keyH1, keyH2]);

    const handleFondoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert("El tamaño de la imagen no debe superar los 4MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                try {
                    localStorage.setItem(keyFondo, base64String);
                    setFondoImagen(base64String);
                    
                    await apiClient.put('/encabezado/wallpaper', { wallpaper_url: base64String });
                } catch (error) {
                    alert("Error al guardar la imagen de fondo.");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const restaurarFondoOriginal = async () => {
        localStorage.removeItem(keyFondo);
        setFondoImagen(null);
        if (inputFondoRef.current) {
            inputFondoRef.current.value = '';
        }
        
        try {
            await apiClient.delete('/encabezado/wallpaper');
        } catch (error) {
            console.error('Error al restaurar fondo:', error);
        }
    };

    return ( 
        <div className={`relative w-full flex justify-end overflow-hidden min-h-[45rem] ${estilos || ""}`}>
            <input type="color" ref={inputH1Ref} value={colorH1} onChange={(e) => setColorH1(e.target.value)} className="hidden" />
            <input type="color" ref={inputH2Ref} value={colorH2} onChange={(e) => setColorH2(e.target.value)} className="hidden" />
            <input type="file" ref={inputFondoRef} accept="image/*" onChange={handleFondoChange} className="hidden" />

            <div 
                className="absolute inset-0 z-0 w-full h-full max-h-[200rem] cursor-pointer group"
                onClick={() => inputFondoRef.current?.click()}
                title="Haz clic para cambiar la imagen de fondo"
            >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 z-10 flex items-center justify-end">
                    
                </div>
                
                {fondoImagen ? (
                    <img src={fondoImagen} alt="Fondo personalizado" className="w-full h-full object-cover object-center" />
                ) : (
                    children
                )}
            </div>

            {fondoImagen && (
                <button 
                    onClick={(e) => { e.stopPropagation(); restaurarFondoOriginal(); }} 
                    className="absolute bottom-5 right-5 z-30 bg-black/50 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-black/80 transition-all backdrop-blur-md shadow-lg"
                >
                    ↻ RESTAURAR FONDO ORIGINAL
                </button>
            )}

            <div className="flex items-center absolute w-fit h-fit gap-100 left-10 top-10 z-30 pointer-events-auto">
                <Navegar />
                <Nav2 />
            </div>

            <div style={{ borderColor: colorH1 }} className="absolute inset-0 z-20 flex flex-col w-fit h-fit top-60 left-10 border-b-3 pb-3">
                <h1 onClick={() => inputH1Ref.current?.click()} style={{ color: colorH1 }} className="text-[6rem] leading-[1.2] cursor-pointer select-none pointer-events-auto w-fit transition-colors duration-200 font-black">
                    BIENVENIDO<br /> 
                    <span>{titulo ? titulo : "ESTE ES EL"}</span><br />
                    <span>{titulos ? titulos : ""}</span>
                </h1>

                <div className="absolute top-68">
                    <h2 onClick={() => inputH2Ref.current?.click()} style={{ color: colorH2 }} className="text-[2.5rem] leading-[1.2] cursor-pointer select-none pointer-events-auto w-fit transition-colors duration-200 font-black">
                        <span>{subtitulo ? subtitulo : ""}</span>
                    </h2>
                </div>
            </div>
        </div>
    );
};