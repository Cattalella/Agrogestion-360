// src/components/BarraFiltros.tsx
import { useState } from "react";
import filtrar from "../assets/imgs/icon_filtrar.webp";

interface BarraFiltrosProps {
    onFiltrar?: (filtro: string) => void;
    filtrosDisponibles?: string[];
}

export const BarraFiltros = ({ onFiltrar, filtrosDisponibles = ["ESTE MES", "SEIS MESES", "UN AÑO ATRÁS"] }: BarraFiltrosProps) => {
    const [mostrar, setMostrar] = useState(false);

    const handleFiltro = (filtro: string) => {
        if (onFiltrar) {
            onFiltrar(filtro);
        }
        setMostrar(false);
    };

    return (
        <div className="flex relative border-b-3 rounded-full border-[var(--color-verdeBorde)] w-full max-w-[80rem] mx-auto pl-6 items-center mt-[10rem] h-12">
            <p className="font-bold text-gray-600">ANALÍTICAS</p>
            <div 
                className="flex border-3 rounded-full w-[10rem] border-[var(--color-verdeBorde)] justify-center items-center p-1 absolute right-0 mt-3 z-20 gap-5 cursor-pointer bg-white" 
                onClick={() => setMostrar(!mostrar)}
            >
                <img src={filtrar} alt="filtrar" className="w-6" />
                <p>FILTRAR</p>
            </div>
            {mostrar && (
                <div className="flex flex-col bg-white shadow-[0_3px_15px_rgba(0,0,0,0.2)] p-4 rounded-lg gap-2 absolute right-0 top-full mt-4 z-30">
                    <ul className="flex flex-col tracking-wider gap-3 cursor-pointer">
                        {filtrosDisponibles.map((filtroTexto, index) => (
                            <li 
                                key={index}
                                onClick={() => handleFiltro(filtroTexto)}
                                className="hover:bg-emerald-50 p-1 rounded text-sm"
                            > 
                                {index === 0 ? "📅" : index === 1 ? "📊" : "📈"} {filtroTexto}
                            </li>
                        ))}
                        <li 
                            onClick={() => handleFiltro("FECHA ACTUAL")}
                            className="cursor-pointer hover:bg-red-50 p-1 rounded text-sm text-red-600"
                        > 
                            📅 FECHA ACTUAL
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};