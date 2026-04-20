import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import apiClient from "../api/apiClient";
import { Botones } from "../components/Botones";

export const ConfirmarReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<"cargando" | "exito" | "error">("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setEstado("error");
      setMensaje("El link es inválido o está incompleto.");
      return;
    }

    apiClient
      .get(`/autenticacion/confirmar-reset?token=${token}&email=${email}`)
      .then((res) => {
        setEstado("exito");
        setMensaje(res.data.mensaje);
      })
      .catch((err) => {
        setEstado("error");
        setMensaje(
          err.response?.data?.mensaje || "El link es inválido o ha expirado."
        );
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/40 backdrop-blur-sm">
      <div className="bg-black/80 p-12 rounded-[2rem] border-2 border-white/30 text-center max-w-md animate-in fade-in zoom-in duration-300">

        {estado === "cargando" && (
          <>
            <Loader2 className="w-20 h-20 text-white/50 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">
              Verificando...
            </h2>
            <p className="text-gray-400">Estamos confirmando tu solicitud.</p>
          </>
        )}

        {estado === "exito" && (
          <>
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">
              ¡Contraseña Actualizada!
            </h2>
            <p className="text-gray-300 mb-8">{mensaje}</p>
            <Botones
              texto="IR AL LOGIN"
              estilo="!bg-white !text-black hover:!bg-green-500 hover:!text-white border-none w-full"
              onClick={() => navigate("/")}
            />
          </>
        )}

        {estado === "error" && (
          <>
            <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">
              Link Inválido
            </h2>
            <p className="text-gray-300 mb-8">{mensaje}</p>
            <Botones
              texto="VOLVER AL LOGIN"
              estilo="!bg-white !text-black hover:!bg-red-500 hover:!text-white border-none w-full"
              onClick={() => navigate("/")}
            />
          </>
        )}

      </div>
    </div>
  );
};