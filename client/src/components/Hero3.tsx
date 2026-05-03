import { Carrusel, type FotoEvidencia } from "./Carrusel";
import { ExportarButton } from "./ExportarButton";

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
                    <div className="flex flex-col bg-white shadow-[0_3px_15px_rgba(0,0,0,0.2)] p-5 justify-center rounded-[2rem] gap-10">
                        <div className="flex flex-col mx-auto">
                            <p className="text-amber-800 text-[0.7rem] font-bold tracking-widest mb-4 uppercase">
                                Generar Reporte Oficial
                            </p>
                            <ExportarButton datosFiltrados={datosExportar} targetId="boss-report" />
                        </div>
                        <img className="w-50 bg-amber-100 mx-auto" src="/src/assets/imgs/icon_Nadmin.webp" alt="" />
                    </div>
                )}
            </div>
        </div>
    );
};