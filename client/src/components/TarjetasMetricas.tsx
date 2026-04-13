// src/components/TarjetasMetricas.tsx
import { formatearUnidades } from "../utils/formatearUnidades";

interface DatosTarjeta {
    tipo1?: string;
    cantidad1?: number;
}

interface TarjetasMetricasProps {
    titulo?: string;
    icono: string;
    datos?: DatosTarjeta;
    estilos?: string;
    tamanoIcono?: string;
}

export const TarjetasMetricas = ({ 
    titulo, 
    icono, 
    datos, 
    estilos = "", 
    tamanoIcono = "w-10" 
}: TarjetasMetricasProps) => {
    return (
        <div className={`flex shadow-[0_4px_10px_rgba(0,0,0,0.3)] rounded-[0.5rem] bg-white p-4 min-h-[8rem] justify-center w-fit ${estilos}`}>
            <img src={icono} alt={titulo} className={`shrink-0 object-contain ${tamanoIcono}`} />
            <div className="flex flex-col ml-2">
                {titulo && <p className="font-bold text-[0.7rem]"> {titulo} </p>}
                {datos?.tipo1 && (
                    <p className="text-[0.8rem]"> 
                        {datos?.tipo1} <br /> {formatearUnidades(datos?.cantidad1 || 0)} 
                    </p>
                )}
            </div>
        </div>
    );
};