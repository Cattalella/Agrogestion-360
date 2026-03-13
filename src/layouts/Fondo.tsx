import { Outlet } from "react-router-dom";
import fondo from "../assets/imgs/background.webp"

export const PublicLayout = () => {
    return (
    // AQUÍ es donde vive la imagen de 4.5MB. 
    // Se carga una vez y NO se mueve mientras navegues entre Home y Star.
    <div className="min-h-screen w-full bg-cover bg-fixed bg-center flex items-center justify-center"
    style={{ backgroundImage: `url(${fondo})` }}
    >
        <Outlet /> 
    </div>
    );
};