// src/components/Hero3.tsx
import { useState } from "react";
import { Carrusel, type FotoEvidencia } from "./Carrusel";
import { ExportarButton } from "./ExportarButton";
import { obtenerFotos } from "../utils/storage";
import nuevoadmin from "../assets/imgs/icon_Nadmin.webp";

interface Hero3Props {
    datosExportar: any[];
}

export const Hero3 = ({ datosExportar }: Hero3Props) => {
    const [fotosPersistentes] = useState<FotoEvidencia[]>(obtenerFotos());

    return (
        <div className="flex mt-[5rem] w-full max-w-[80rem] mx-auto bg-white mb-20">
            <div className="flex w-full items-stretch gap-8">
                <div className="flex-1">
                    <Carrusel rol="boss" fotos={fotosPersistentes} /> 
                </div>
                <div className="flex flex-col bg-white shadow-[0_3px_15px_rgba(0,0,0,0.2)] p-5 justify-center rounded-[2rem] gap-10">
                    <div className="flex flex-col mx-auto">
                        <p className="text-amber-800 text-[0.7rem] font-bold tracking-widest mb-4 uppercase">
                            Generar Reporte Oficial
                        </p>
                        <ExportarButton datosFiltrados={datosExportar} targetId="boss-report" />
                    </div>
                    <img className="w-50 bg-amber-100 mx-auto" src={nuevoadmin} alt="" />
                </div>
            </div>
        </div>
    );
};