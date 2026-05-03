import { type DatosCard } from "../types/admin";

interface CardRegistroProps {
    estilo?: string;
    titulo: string;
    icono: string;
    datos: any;
    onClick?: () => void;
}

export const CardRegistro = ({ estilo, titulo, icono, datos, onClick }: CardRegistroProps) => {
    // Mostrar valor correctamente (si ya viene formateado o es número)
    const mostrarValor = (valor: any): string => {
        // Si ya es string con $, devolverlo tal cual
        if (typeof valor === 'string' && valor.includes('$')) {
            return valor;
        }
        // Si es número, formatear
        if (typeof valor === 'number') {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
            }).format(valor);
        }
        return '0';
    };

    // Detectar si es la card de pagos
    const esCardPagos = datos?.tipo1 === "NÓMINA TOTAL" || datos?.tipo2 === "PENDIENTES";
    
    if (esCardPagos) {
        return (
            <article 
                onClick={onClick}
                className={`flex border-1 border-[var(--color-gray)] rounded-[1.5rem] bg-white p-4 w-[15rem] min-h-[8rem] hover:-translate-x-2 transition-all gap-8 justify-center ${estilo} ${onClick ? 'cursor-pointer' : ''}`}
            >
                <div className="shrink-0">
                    <img className="w-[2.5rem]" src={icono} alt={titulo} />
                </div>
                <div>
                    <h1 className="mb-2 text-[12px] uppercase leading-tight font-bold">{titulo}</h1>
                    <div className="flex flex-col gap-1">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase">
                            - {mostrarValor(datos?.cantidad1)} {datos?.tipo1}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase">
                            - {datos?.cantidad2} {datos?.tipo2}
                        </p>
                    </div>
                </div>
            </article>
        );
    }

    // Formato normal para las demás cards
    return (
        <article 
            onClick={onClick}
            className={`flex border-1 border-[var(--color-gray)] rounded-[1.5rem] bg-white p-4 w-[15rem] min-h-[8rem] hover:-translate-x-2 transition-all gap-8 justify-center ${estilo} ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="shrink-0">
                <img className="w-[2.5rem]" src={icono} alt={titulo} />
            </div>
            <div>
                <h1 className="mb-2 text-[12px] uppercase leading-tight font-bold">{titulo}</h1>
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase">
                        - {datos?.cantidad1 ?? 0} {datos?.tipo1 ?? ''}
                    </p>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase">
                        - {datos?.cantidad2 ?? 0} {datos?.tipo2 ?? ''}
                    </p>
                    {datos?.tipo3 && (
                        <p className="text-[11px] font-semibold text-gray-500 uppercase">
                            - {datos?.cantidad3 ?? 0} {datos.tipo3}
                        </p>
                    )}
                    {datos?.tipo4 && (
                        <p className="text-[11px] font-semibold text-gray-500 uppercase">
                            - {datos?.cantidad4 ?? 0} {datos.tipo4}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
};