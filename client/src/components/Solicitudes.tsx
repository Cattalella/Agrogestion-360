import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Para que el modal flote sobre todo

import left from "../assets/imgs/icon_left.webp";
import right from "../assets/imgs/icon_rigth.webp";

const originales = [
    { id: 1, img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", nombre: "Carlos Ruiz", detalle: "Solicita acceso al módulo de vacunación bovina." },
    { id: 2, img: "https://images.unsplash.com/photo-1520155707362-70321722cf74?w=150", nombre: "Ana Beltrán", detalle: "Requiere actualizar el inventario de insumos." },
    { id: 3, img: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=150", nombre: "Marcos Peña", detalle: "Petición de revisión para el lote #4." },
    { id: 4, img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150", nombre: "Lucía Gómez", detalle: "Solicitud de reporte financiero mensual." },
    { id: 5, img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150", nombre: "Elena Sanz", detalle: "Registro de nuevo personal de campo." },
    { id: 6, img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", nombre: "Roberto Díaz", detalle: "Aprobación de compra de concentrados." },
];

export const Solicitudes = () => {
    const [items] = useState([
        ...originales.slice(-4),
        ...originales,
        ...originales.slice(0, 4),
    ]);



    const [indice, setIndice] = useState(4);
    const [conAnimacion, setConAnimacion] = useState(true);
    const [pausado, setPausado] = useState(false);



    // ESTADOS PARA EL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<any>(null);

    const total = originales.length;
    const itemWidth = 72;

    const mover = (direccion: number) => {
        setConAnimacion(true);
        setIndice((prev) => prev + direccion);
    };



    useEffect(() => {
        if (pausado || modalAbierto) return; // Pausamos si el mouse está encima o el modal abierto

        const intervalo = setInterval(() => {
            mover(1);
        }, 1000);

        return () => clearInterval(intervalo);
    }, [pausado, indice, modalAbierto]);



    const alTerminarAnimacion = () => {
        if (indice >= total + 4) {
            setConAnimacion(false);
            setIndice(4);
        } else if (indice <= 0) {
            setConAnimacion(false);
            setIndice(total);
        }
    };



    const abrirSolicitud = (item: any) => {
        setSeleccionado(item);
        setModalAbierto(true);
    };



    return (
        <div 
            className="bg-white rounded-[2.5rem] shadow-[0_3px_15px_rgba(0,0,0,0.5)] w-full p-8 pb-4 flex flex-col items-center"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
        >
            <p className="font-black tracking-[0.3em] text-[0.7rem] uppercase mb-4">
                -- SOLICITUDES --
            </p>



            <div className="flex items-center gap-10 w-full justify-center">
                <button onClick={() => mover(-1)}> 
                    <img src={left} alt="left" className="w-4 cursor-pointer hover:scale-110 transition-all" /> 
                </button>



                <div className="w-[20rem] overflow-hidden py-2 rounded-3xl">
                    <div
                        onTransitionEnd={alTerminarAnimacion}
                        className={`flex gap-4 ${conAnimacion ? "transition-transform duration-500 ease-in-out" : ""}`}
                        style={{ transform: `translateX(-${indice * itemWidth}px)` }}
                    >
                        {items.map((item, i) => (
                            <div 
                                key={`${item.id}-${i}`} 
                                className="relative shrink-0 cursor-pointer"
                                onClick={() => abrirSolicitud(item)}
                            >
                                <img
                                    src={item.img}
                                    className="w-16 h-20 rounded-[1.2rem] object-cover border-2 border-white shadow-md hover:scale-105 transition-transform"
                                    alt="usuario"
                                />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                            </div>
                        ))}
                    </div>
                </div>



                <button onClick={() => mover(1)}> 
                    <img src={right} alt="right" className="w-4 cursor-pointer hover:scale-110 transition-all" /> 
                </button>
            </div>



            <p className="text-[0.7rem] font-bold uppercase tracking-widest mt-4">
                TIENES <span className="text-emerald-500 text-sm">{total}</span> SOLICITUDES PENDIENTES
            </p>



            {/* --- LÓGICA DEL MODAL --- */}
            {modalAbierto && seleccionado && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Fondo oscuro con desenfoque */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
                        onClick={() => setModalAbierto(false)}
                    />



                    {/* La Carta de Solicitud */}
                    <div className="relative bg-white w-full max-w-[320px] rounded-[1.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                        <img 
                            src={seleccionado.img} 
                            className="w-24 h-24 rounded-[2rem] object-cover border-4 border-gray-50 shadow-lg mb-4"
                            alt="perfil"
                        />
                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-tighter mb-1">
                            {seleccionado.nombre}
                        </h3>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">
                            ID: #{seleccionado.id}0923
                        </p>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">
                            "{seleccionado.detalle}"
                        </p>



                        <div className="flex flex-col w-full gap-2">
                            <button 
                                onClick={() => setModalAbierto(false)}
                                className="bg-slate-900 text-white font-black text-[10px] tracking-[0.2em] py-4 rounded-2xl hover:bg-emerald-600 transition-colors uppercase"
                            >
                                ACEPTAR SOLICITUD
                            </button>
                            <button 
                                onClick={() => setModalAbierto(false)}
                                className="bg-gray-300 text-[var(--color-gray)] font-black text-[10px] tracking-[0.2em] py-4 rounded-2xl hover:bg-red-200 hover:text-red-700 transition-colors uppercase"
                            >
                                RECHAZAR
                            </button>
                        </div>
                    </div>

                </div>,
                document.body
            )}
        </div>
    );
};