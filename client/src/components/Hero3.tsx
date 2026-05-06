import { Carrusel, type FotoEvidencia } from "./Carrusel";
import { ExportarButton } from "./ExportarButton";
import isotipo from "../assets/imgs/isoACM.svg";
import { Animacion } from "./animations/Animacion";

interface Hero3Props {
    fotos: FotoEvidencia[];
    rol: "admin" | "boss";
    pagosPendientes?: any[];
    datosExportar?: any[];
    onSubirClick?: (nueva: FotoEvidencia) => void;
    onBorrarTodo?: () => void;
    onBorrarUnaFoto?: (id: number) => void;
    onConfirmarPago?: (idPago: number) => void;
    onToggleLike?: (id: number) => void;
}

export const Hero3 = ({ 
    fotos, 
    rol, 
    pagosPendientes = [],
    datosExportar = [],
    onSubirClick, 
    onBorrarTodo, 
    onBorrarUnaFoto,
    onConfirmarPago,
    onToggleLike
}: Hero3Props) => {
    return (
        <div className="flex mt-[5rem] w-full max-w-[80rem] mx-auto bg-white mb-20">
            <div className="flex w-full items-stretch gap-8">
                <div className="flex-1">
                    <Carrusel 
                        rol={rol} 
                        fotos={fotos} 
                        pagosPendientes={pagosPendientes}
                        onSubirClick={onSubirClick}
                        onBorrarTodo={onBorrarTodo}
                        onBorrarUnaFoto={onBorrarUnaFoto}
                        onConfirmarPago={onConfirmarPago}
                        onToggleLike={onToggleLike}
                    /> 
                </div>
                {rol === "boss" && (
                    <div className="flex flex-col bg-white shadow-[0_3px_15px_rgba(0,0,0,0.2)] py-5 px-10 rounded-[2rem]">
                        <div className="flex flex-col mx-auto mb-6 border-b-2 border-gray-300 pb-4">
                            <p className="text-amber-800 text-[0.7rem] font-bold tracking-widest mb-3 uppercase">
                                Generar Reporte Oficial
                            </p>
                            <ExportarButton datosFiltrados={datosExportar} targetId="boss-report" />
                            
                        </div>
                        <p className="mb-15 uppercase text-center"> agrogestión 360 <br /> <span className="text-amber-600 tracking-[1px]">una idea que crece</span> </p>
                        <Animacion>
                            <img className="w-40 mx-auto animate-pulse" src={isotipo} alt="Isotipo" />
                        </Animacion>
                    </div>
                )}
            </div>
        </div>
    );
};