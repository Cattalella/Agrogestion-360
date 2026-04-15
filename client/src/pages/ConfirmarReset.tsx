import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Botones } from "../components/Botones";

export const ConfirmarReset = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [estado, setEstado] = useState<'cargando' | 'exito' | 'error'>('cargando');
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const confirmar = async () => {
            const token = searchParams.get("token");
            const email = searchParams.get("email");

            if (!token || !email) {
                setEstado('error');
                setMensaje("Link de confirmación inválido.");
                return;
            }

            try {
                const respuesta = await apiClient.get(`/autenticacion/confirmar-reset?token=${token}&email=${email}`);
                setEstado('exito');
                setMensaje(respuesta.data.mensaje);
            } catch (error: any) {
                setEstado('error');
                setMensaje(error.response?.data?.mensaje || "El link ha expirado o ya fue utilizado.");
            }
        };

        confirmar();
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black/50 backdrop-blur-md">
            <div className="bg-black/80 p-10 rounded-[2rem] border-2 border-white/20 text-center max-w-sm w-full mx-4 shadow-2xl">
                
                {estado === 'cargando' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-green-400 animate-spin mb-4" />
                        <h2 className="text-white text-xl uppercase tracking-widest font-light">
                            Verificando <span className="font-bold">Token</span>
                        </h2>
                    </div>
                )}

                {estado === 'exito' && (
                    <div className="animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
                        <h2 className="text-white text-2xl font-bold mb-2 uppercase tracking-tighter">¡TODO LISTO!</h2>
                        <p className="text-gray-400 mb-8">{mensaje}</p>
                        <Botones 
                            texto="INGRESAR AHORA" 
                            estilo="!bg-green-600 !text-white hover:!bg-green-500 w-full"
                            onClick={() => navigate("/")}
                        />
                    </div>
                )}

                {estado === 'error' && (
                    <div className="animate-in shake duration-300">
                        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                        <h2 className="text-white text-2xl font-bold mb-2 uppercase tracking-tighter">ERROR</h2>
                        <p className="text-red-300/80 mb-8">{mensaje}</p>
                        <Botones 
                            texto="VOLVER A INTENTAR" 
                            estilo="!bg-white/10 !text-white hover:!bg-white/20 w-full border-white/30"
                            onClick={() => navigate("/contrasena")}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
