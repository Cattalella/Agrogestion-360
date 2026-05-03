import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X, Filter } from "lucide-react";

interface BarraFiltrosProps {
    onFiltrar?: (filtro: string, fechaInicio?: Date, fechaFin?: Date) => void;
}

export const BarraFiltros = ({ onFiltrar }: BarraFiltrosProps) => {
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);

    const filtrosRapidos = [
        { label: "ESTE MES", valor: "ESTE_MES" },
        { label: "MES PASADO", valor: "MES_PASADO" },
        { label: "ÚLTIMOS 6 MESES", valor: "SEIS_MESES" },
        { label: "ÚLTIMO AÑO", valor: "UN_ANO_ATRAS" },
    ];

    const handleFiltroRapido = (filtro: string) => {
        setFechaInicio(null);
        setFechaFin(null);
        setMostrarCalendario(false);
        setMostrarMenu(false);
        if (onFiltrar) onFiltrar(filtro);
    };

    const aplicarRango = () => {
        if (fechaInicio && fechaFin && onFiltrar) {
            onFiltrar("RANGO_PERSONALIZADO", fechaInicio, fechaFin);
            setMostrarCalendario(false);
            setMostrarMenu(false);
        }
    };

    const limpiarRango = () => {
        setFechaInicio(null);
        setFechaFin(null);
        setMostrarCalendario(false);
        if (onFiltrar) onFiltrar("ESTE_MES");
    };

    const tieneRangoActivo = fechaInicio && fechaFin;

    return (
        <div className="flex relative border-b-3 rounded-full border-[var(--color-verdeBorde)] w-full max-w-[80rem] mx-auto pl-6 items-center mt-[10rem] h-12">
            <p className="font-bold text-gray-600">ANALÍTICAS</p>
            
            {tieneRangoActivo && (
                <div className="ml-4 flex items-center gap-2 bg-emerald-100 px-3 py-1 rounded-full">
                    <Calendar size={14} className="text-emerald-600" />
                    <span className="text-[0.65rem] font-bold text-emerald-700">
                        {fechaInicio?.toLocaleDateString('es-CO')} - {fechaFin?.toLocaleDateString('es-CO')}
                    </span>
                    <button onClick={limpiarRango} className="hover:bg-emerald-200 rounded-full p-0.5">
                        <X size={12} />
                    </button>
                </div>
            )}
            
            <div 
                className="flex border-3 rounded-full w-[10rem] border-[var(--color-verdeBorde)] justify-center items-center p-1 absolute right-0 mt-3 z-20 gap-2 cursor-pointer bg-white hover:bg-gray-50" 
                onClick={() => setMostrarMenu(!mostrarMenu)}
            >
                <Filter size={16} />
                <p className="text-sm font-medium">FILTRAR</p>
            </div>
            
            {mostrarMenu && (
                <div className="absolute right-0 top-full mt-4 z-30 bg-white shadow-2xl rounded-2xl border border-gray-100 w-64">
                    <div className="p-3 border-b border-gray-100">
                        <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-wider">Filtros rápidos</p>
                    </div>
                    <div className="p-2">
                        {filtrosRapidos.map((f) => (
                            <button
                                key={f.valor}
                                onClick={() => handleFiltroRapido(f.valor)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 rounded-xl transition-colors"
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 p-2">
                        <button
                            onClick={() => {
                                setMostrarCalendario(!mostrarCalendario);
                                setMostrarMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 rounded-xl transition-colors"
                        >
                            📅 Rango personalizado
                        </button>
                    </div>
                </div>
            )}
            
            {mostrarCalendario && (
                <div className="absolute right-0 top-full mt-4 z-40 bg-white shadow-2xl rounded-2xl p-5 border border-gray-100 w-auto">
                    <p className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider mb-3">Selecciona rango de fechas</p>
                    <div className="flex gap-4 flex-wrap">
                        <div>
                            <label className="text-[0.55rem] font-bold text-gray-400 uppercase block mb-1">Desde</label>
                            <DatePicker
                                selected={fechaInicio}
                                onChange={(date: Date | null) => setFechaInicio(date)}
                                selectsStart
                                startDate={fechaInicio || undefined}
                                endDate={fechaFin || undefined}
                                className="border border-gray-200 rounded-xl p-2 text-sm w-36 focus:border-emerald-400 outline-none"
                                placeholderText="DD/MM/YYYY"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                        <div>
                            <label className="text-[0.55rem] font-bold text-gray-400 uppercase block mb-1">Hasta</label>
                            <DatePicker
                                selected={fechaFin}
                                onChange={(date: Date | null) => setFechaFin(date)}
                                selectsEnd
                                startDate={fechaInicio || undefined}
                                endDate={fechaFin || undefined}
                                minDate={fechaInicio || undefined}
                                className="border border-gray-200 rounded-xl p-2 text-sm w-36 focus:border-emerald-400 outline-none"
                                placeholderText="DD/MM/YYYY"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                        <button
                            onClick={aplicarRango}
                            disabled={!fechaInicio || !fechaFin}
                            className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-[0.7rem] font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                        >
                            Aplicar
                        </button>
                        <button
                            onClick={() => setMostrarCalendario(false)}
                            className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-[0.7rem] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};