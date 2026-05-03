import { useState, useEffect } from "react";
import pajaro from "../assets/imgs/PAJARO.png";
import { Botones } from "../components/Botones";
import apiClient from "../api/apiClient";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MoveLeft, Mail, Lock, CheckCircle2, Send } from "lucide-react";

export const Contrasena = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Estados
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [nuevaClave, setNuevaClave] = useState("");
    const [confirmarClave, setConfirmarClave] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState(false);
    const [modo, setModo] = useState<"solicitar" | "restablecer">("solicitar");

    // Verificar si llegamos con token (desde el correo)
    useEffect(() => {
        const tokenParam = searchParams.get("token");
        const emailParam = searchParams.get("email");
        
        if (tokenParam && emailParam) {
            setToken(tokenParam);
            setEmail(emailParam);
            setModo("restablecer");
        }
    }, [searchParams]);

    // ============================================================
    // PASO 1: Solicitar recuperación (solo email)
    // ============================================================
    const handleSolicitar = async () => {
        if (!email) {
            setError("El correo electrónico es obligatorio");
            return;
        }

        setCargando(true);
        setError(null);

        try {
            await apiClient.post("/autenticacion/solicitar-recuperacion", {
                email: email
            });
            setExito(true);
        } catch (err: any) {
            setError(err.response?.data?.mensaje || "Error al enviar el correo");
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // PASO 2: Restablecer contraseña (con token)
    // ============================================================
    const handleRestablecer = async () => {
        if (!nuevaClave || !confirmarClave) {
            setError("Todos los campos son obligatorios");
            return;
        }

        if (nuevaClave !== confirmarClave) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (nuevaClave.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setCargando(true);
        setError(null);

        try {
            await apiClient.post("/autenticacion/restablecer-contrasena", {
                email: email,
                token: token,
                nueva_contrasena: nuevaClave
            });
            
            // Éxito, redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate("/");
            }, 2000);
            
            setExito(true);
        } catch (err: any) {
            setError(err.response?.data?.mensaje || "Error al restablecer la contraseña");
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // Pantalla de éxito
    // ============================================================
    if (exito && modo === "solicitar") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-sm">
                <div className="bg-black/80 p-12 rounded-[2rem] border-2 border-white/30 text-center max-w-md animate-in fade-in zoom-in duration-300">
                    <Send className="w-20 h-20 text-green-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">¡Correo Enviado!</h2>
                    <p className="text-gray-300 mb-8">
                        Hemos enviado un link de recuperación a <span className="text-white font-semibold">{email}</span>. 
                        Por favor, revisa tu bandeja de entrada.
                    </p>
                    <Botones 
                        texto="VOLVER AL LOGIN" 
                        estilo="!bg-white !text-black hover:!bg-green-500 hover:!text-white border-none w-full"
                        onClick={() => navigate("/star")}
                    />
                </div>
            </div>
        );
    }

    if (exito && modo === "restablecer") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-sm">
                <div className="bg-black/80 p-12 rounded-[2rem] border-2 border-white/30 text-center max-w-md animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">¡Contraseña Actualizada!</h2>
                    <p className="text-gray-300 mb-8">
                        Tu contraseña ha sido restablecida correctamente. Serás redirigido al login.
                    </p>
                    <Botones 
                        texto="IR AL LOGIN" 
                        estilo="!bg-white !text-black hover:!bg-green-500 hover:!text-white border-none w-full"
                        onClick={() => navigate("/")}
                    />
                </div>
            </div>
        );
    }

    // ============================================================
    // Renderizado según el modo
    // ============================================================
    return (
        <div className="relative w-full flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-green-900/20 to-black">
            
            {/* Botón Volver */}
            <button 
                onClick={() => navigate("/star")}
                className="absolute top-10 left-10 text-white flex items-center gap-2 hover:text-green-400 transition-colors group z-50"
            >
                <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="uppercase text-sm tracking-widest">Regresar</span>
            </button>

            {/* Contenedor Principal */}
            <div className="relative flex items-center justify-center w-full max-w-4xl px-4">
                
                {/* Imagen del Colibrí */}
                <div className="absolute left-[-10%] md:left-[-60%] lg:left-0 z-20 pointer-events-none animate-float">
                    <img 
                        src={pajaro} 
                        alt="Colibrí" 
                        className="w-[25rem] md:w-[35rem] lg:w-[45rem] drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] -ml-50"
                    />
                </div>

                {/* Card de Cristal */}
                <div className="relative z-10 bg-black/60 backdrop-blur-xl p-10 md:p-16 w-full max-w-lg
                                border-4 border-white/80
                                rounded-tr-[15rem] rounded-bl-[15rem] rounded-tl-lg rounded-br-lg
                                shadow-[0_0_100px_rgba(0,0,0,0.5)]
                                flex flex-col items-center">
                    
                    <h1 className="text-white text-3xl font-light mb-12 text-center uppercase tracking-[0.2em] drop-shadow-lg">
                        {modo === "solicitar" ? "Recuperar" : "Restablecer"} 
                        <span className="font-bold block">Contraseña</span>
                    </h1>

                    <div className="w-full space-y-8">
                        {/* Error Badge */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs py-2 px-4 rounded-full text-center animate-shake">
                                {error.toUpperCase()}
                            </div>
                        )}

                        {/* Campo Correo (siempre visible) */}
                        <div className="relative group">
                            <Mail className="absolute left-0 bottom-3 w-5 h-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                            <input 
                                type="email" 
                                placeholder="CORREO ELECTRÓNICO" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={modo === "restablecer"}
                                className={`w-full pl-8 pb-2 bg-transparent border-b-2 border-white/50 text-white outline-none focus:border-green-400 transition-all placeholder:text-gray-600 tracking-widest text-sm ${
                                    modo === "restablecer" ? "opacity-70 cursor-not-allowed" : ""
                                }`} 
                            />
                        </div>

                        {/* Campos de contraseña (solo en modo restablecer) */}
                        {modo === "restablecer" && (
                            <>
                                <div className="relative group">
                                    <Lock className="absolute left-0 bottom-3 w-5 h-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                                    <input 
                                        type="password" 
                                        placeholder="NUEVA CONTRASEÑA" 
                                        value={nuevaClave}
                                        onChange={(e) => setNuevaClave(e.target.value)}
                                        className="w-full pl-8 pb-2 bg-transparent border-b-2 border-white/50 text-white outline-none focus:border-green-400 transition-all placeholder:text-gray-600 tracking-widest text-sm" 
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-0 bottom-3 w-5 h-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                                    <input 
                                        type="password" 
                                        placeholder="CONFIRMAR CONTRASEÑA" 
                                        value={confirmarClave}
                                        onChange={(e) => setConfirmarClave(e.target.value)}
                                        className="w-full pl-8 pb-2 bg-transparent border-b-2 border-white/50 text-white outline-none focus:border-green-400 transition-all placeholder:text-gray-600 tracking-widest text-sm" 
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-16 w-full flex justify-center">
                        <Botones 
                            texto={cargando ? "PROCESANDO..." : (modo === "solicitar" ? "ENVIAR ENLACE" : "ACTUALIZAR CONTRASEÑA")}
                            estilo="!bg-[#70a33a] !text-white !border-none !w-full !rounded-tl-[5rem] !rounded-none !rounded-br-[5rem] !p-0 !text-lg !font-bold hover:!bg-[#8cc64a] hover:scale-105 !transition-all shadow-lg"
                            onClick={modo === "solicitar" ? handleSolicitar : handleRestablecer}
                        />
                    </div>

                    {modo === "solicitar" && (
                        <p className="text-gray-400 text-[10px] mt-6 uppercase tracking-wider">
                            Te enviaremos un enlace para restablecer tu contraseña
                        </p>
                    )}
                </div>
            </div>

            {/* Estilos para animaciones */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}} />
        </div>
    );
};