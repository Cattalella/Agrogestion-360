// src/components/Hero1.tsx
import { Grafica } from "./Grafica";
import { Grafica2 } from "./Grafica2";
import { Solicitudes } from "./Solicitudes";
import { TarjetasMetricas } from "./TarjetasMetricas";
import ganancia from "../assets/imgs/icon_ganancia.webp";
import invertir from "../assets/imgs/icon_inversión.webp";

interface Hero1Props {
    ganancias: {
        tipo1: string;
        cantidad1: number;
    };
    inversion: {
        tipo1: string;
        cantidad1: number;
    };
    gastosPorSector?: any[];
}

export const Hero1 = ({ ganancias, inversion, gastosPorSector }: Hero1Props) => {
    const datosGastosSector = gastosPorSector || [
        { name: "PORCICULTURA", valor: 2, color: "#10b981", detalle: "Ene: 1M | Feb: 1M" },
        { name: "GANADERÍA", valor: 2, color: "#8b5cf6", detalle: "Ene: 1M | Feb: 1M" },
        { name: "INSUMOS", valor: 2, color: "#f43f5e", detalle: "Ene: 1M | Feb: 1M" },
    ];

    return (
        <div className="flex mt-[5rem] bg-white text-gray-500 w-full max-w-[80rem] mx-auto rounded-4xl justify-between">
            <div className="flex flex-col shadow-[0_3px_15px_rgba(0,0,0,0.5)] rounded-[2rem] gap-5 w-full max-w-[47rem]">
                <div className="flex justify-center ml-[10rem] mt-8 my-auto">
                    <p className="text-center tracking-[3px] font-semibold">-- GANANCIAS Y COMPARATIVAS --</p>
                </div>
                <div className="flex gap-5 items-stretch min-w-[45rem] mt-auto w-full p-5">
                    <div className="flex flex-col justify-between">
                        <TarjetasMetricas 
                            icono={ganancia} 
                            datos={ganancias} 
                            estilos="text-[0.8rem] flex-col !w-38 gap-8 h-37" 
                        />
                        <TarjetasMetricas 
                            icono={invertir} 
                            datos={inversion} 
                            estilos="text-[0.8rem] flex-col !w-38 gap-8 h-37" 
                        />
                    </div>
                    <Grafica />
                </div>
            </div>
            <div className="flex flex-col gap-4 justify-between">
                <Grafica2 titulo="GASTOS POR SECTOR" datos={datosGastosSector} />
                <Solicitudes />
            </div>
        </div>
    );
};