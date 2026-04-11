// 1. Importas el tipo de los datos que ya tienes definido
import { type DatosCard } from "../types/admin";

// 2. Defines la interface de las Props del componente
interface CardRegistroProps {
    estilo?: string;      // Opcional
    titulo: string;      // Obligatorio
    icono: string;       // La ruta de la imagen
    datos: DatosCard;    // Aquí reusamos la interface que ya existe
    onClick?: () => void; // Función opcional para el click
}

// 3. Aplicas la interface al componente
export const CardRegistro = ({ estilo, titulo, icono, datos, onClick }: CardRegistroProps) => {
    return (
        <article 
            onClick={onClick}
            className={`flex border-1 border-[var(--color-gray)] rounded-[1.5rem] bg-white p-4 w-[15rem] min-h-[8rem] gap-8 justify-center ${estilo} ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="shrink-0">
                <img className="w-[2.5rem]" src={icono} alt={titulo} />
            </div>
            <div>
                <h1 className="mb-2 text-[12px] uppercase leading-tight font-bold">{titulo}</h1>
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase"> - {datos.cantidad1} {datos.tipo1}</p>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase"> - {datos.cantidad2} {datos.tipo2}</p>
                    
                    {/* Renderizado condicional limpio */}
                    {datos.tipo3 && (
                        <p className="text-[11px] font-semibold text-gray-500 uppercase"> - {datos.cantidad3} {datos.tipo3}</p>
                    )}
                    {datos.tipo4 && (
                        <p className="text-[11px] font-semibold text-gray-500 uppercase"> - {datos.cantidad4} {datos.tipo4}</p>
                    )}
                </div>
            </div>
        </article>
    );
};