import React, { useState, useEffect, useRef } from 'react';
import setting from '../assets/imgs/icon_setting.webp';
import { Animacion } from './animations/Animacion';

interface Grafica3Props {
    pagosRealizados: number;   // pagos aprobados con firma (boss dio like)
    totalTrabajadores: number; // trabajadores activos
}

export const Grafica3 = ({ pagosRealizados = 0, totalTrabajadores = 0 }: Grafica3Props) => {
    const [ciclo, setCiclo] = useState("Quincenal");
    const [mostrarMenu, setMostrarMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const manejarClicAfuera = (event: MouseEvent) => {
            if (mostrarMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMostrarMenu(false);
            }
        };
        document.addEventListener('mousedown', manejarClicAfuera);
        return () => document.removeEventListener('mousedown', manejarClicAfuera);
    }, [mostrarMenu]);

    // 🔧 CORREGIDO:
    // Barra TOTAL → siempre al 100% si hay al menos 1 trabajador activo
    // Barra PAGOS → proporción de pagos aprobados / trabajadores activos
    const hayTrabajadores = totalTrabajadores > 0;
    const porcentajeTotal = hayTrabajadores ? 100 : 0;
    const porcentajePagos = hayTrabajadores
        ? Math.min((pagosRealizados / totalTrabajadores) * 100, 100)
        : 0;

    const estiloCapsula = "relative h-full w-[2.2rem] rounded-full border border-gray-100 bg-gray-50 flex items-end overflow-hidden shadow-[0_3px_5px_rgba(0,0,0,0.2)]";

    return (
        <div className="flex flex-col items-center justify-between w-full h-full relative gap-1">

            <div className="absolute top-0 right-0 z-50" ref={menuRef}>
                <div
                    onClick={() => setMostrarMenu(!mostrarMenu)}
                    className={`w-6 h-6 rounded-full flex items-center bg-blue-200 justify-center cursor-pointer transition-all ${
                        mostrarMenu ? 'shadow-lg scale-110' : 'hover:bg-blue-200'
                    }`}
                >
                    <Animacion>
                        <img
                            className={`w-5 transition-all ${mostrarMenu ? 'brightness-200 rotate-90' : 'animate-spin'}`}
                            src={setting}
                            alt="Configuración"
                        />
                    </Animacion>
                </div>

                {mostrarMenu && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-100 p-2 rounded-xl shadow-2xl w-[120px] animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col gap-1">
                            {["Diario", "Semanal", "Quincenal", "Mensual"].map((opcion) => (
                                <button
                                    key={opcion}
                                    onClick={() => {
                                        setCiclo(opcion);
                                        setMostrarMenu(false);
                                    }}
                                    className={`text-[0.6rem] text-left px-2 py-1 rounded transition-colors ${
                                        ciclo === opcion
                                        ? 'bg-blue-200 text-gray-800 font-bold'
                                        : 'hover:bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {opcion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mb-2">
                <p className="text-[0.5rem] font-black text-gray-400 uppercase tracking-[2px]">CUMPLIMIENTO</p>
                <p className="text-[0.6rem] font-bold text-blue-400 italic tracking-[1px]">-- {ciclo.toUpperCase()} --</p>
            </div>

            <div className="flex gap-4 flex-1 items-stretch min-h-[6rem] mb-2 mt-2">
                {/* Barra PAGOS — sube según pagos aprobados / trabajadores activos */}
                <div className="flex flex-col items-center gap-1">
                    <div className={estiloCapsula}>
                        <div
                            className="w-full bg-gradient-to-t from-blue-100 to-blue-400 transition-all duration-1000"
                            style={{ height: `${porcentajePagos}%` }}
                        />
                    </div>
                    <span className="text-[0.5rem] font-bold text-blue-400 tracking-[1px]">PAGOS</span>
                </div>

                {/* Barra TOTAL — siempre llena si hay trabajadores activos */}
                <div className="flex flex-col items-center gap-1">
                    <div className={estiloCapsula}>
                        <div
                            className="w-full bg-gradient-to-t from-amber-100 to-amber-500 transition-all duration-1000"
                            style={{ height: `${porcentajeTotal}%` }}
                        />
                    </div>
                    <span className="text-[0.5rem] font-bold text-gray-400 tracking-[1px]">TOTAL</span>
                </div>
            </div>

            {/* 🔧 CORREGIDO: muestra pagosRealizados / totalTrabajadores correctamente */}
            <div className="text-center rounded-2xl mt-2 w-full">
                <p className="text-[1rem] font-light text-gray-500 leading-none">
                    {pagosRealizados}<span className="text-gray-400 mx-1">/</span>{totalTrabajadores}
                </p>
                <p className="text-[0.6rem] text-gray-400 uppercase tracking-[2px] mt-1">Trabajadores al día</p>
            </div>
        </div>
    );
};