import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Para que el modal flote sobre todo
import { useSolicitudCompra } from "../hooks/useSolicitudCompra";

import left from "../assets/imgs/icon_left.webp";
import right from "../assets/imgs/icon_rigth.webp";

// Imagen por defecto si no hay avatar en la solicitud (icono genérico vacío)
const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/512/1144/1144760.png";

export const Solicitudes = () => {
    const { solicitudesPendientes, cambiarEstadoSolicitud } = useSolicitudCompra();
    const [items, setItems] = useState<any[]>([]);
    
    // Configuración Carrusel
    const [indice, setIndice] = useState(4);
    const [conAnimacion, setConAnimacion] = useState(true);
    const [pausado, setPausado] = useState(false);

    // ESTADOS PARA EL MODAL
    const [modalAbierto, setModalAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<any>(null);

    const total = solicitudesPendientes.length;
    const itemWidth = 72;

    useEffect(() => {
        setItems([...solicitudesPendientes]);
        setConAnimacion(false);
        setIndice(0);
    }, [solicitudesPendientes, total]);

    const mover = (direccion: number) => {
        if (total <= 1) return; // No mover si hay 0 o 1 items
        
        let nuevoIndice = indice + direccion;
        if (nuevoIndice < 0) {
            nuevoIndice = total - 1;
        } else if (nuevoIndice >= total) {
            nuevoIndice = 0;
        }
        
        setConAnimacion(true);
        setIndice(nuevoIndice);
    };

    useEffect(() => {
        if (pausado || modalAbierto || total <= 1) return; 

        const intervalo = setInterval(() => {
            mover(1);
        }, 3000); 

        return () => clearInterval(intervalo);
    }, [pausado, indice, modalAbierto, total]);

    const alTerminarAnimacion = () => {
        // En un carrusel simple de índice, no necesitamos lógica de reseteo post-transición oculta.
        // Pero si tuviéramos un loop infinito sí, para este caso no hace falta nada aquí.
    };

    const abrirSolicitud = (item: any) => {
        setSeleccionado(item);
        setModalAbierto(true);
    };

    const manejarAccion = (estado: 'Aprobada' | 'Rechazada') => {
        if (seleccionado) {
            cambiarEstadoSolicitud(seleccionado.id, estado);
            setModalAbierto(false);
            setSeleccionado(null);
        }
    };

    // Helper p/ mostrar un buen detalle
    const formatearDetalle = (solicitud: any) => {
        return solicitud.motivo || `Solicitud para compra de ${solicitud.cantidad} ${solicitud.unidadMedida} de ${solicitud.tipoInsumo || solicitud.tipoAlimento || solicitud.tipo}.`;
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

            <div className="flex items-center gap-10 w-full justify-center min-h-[5rem]">
                <button onClick={() => mover(-1)}> 
                    <img src={left} alt="left" className="w-4 cursor-pointer hover:scale-110 transition-all opacity-50 hover:opacity-100" /> 
                </button>

                <div className="w-[20rem] overflow-hidden py-2 rounded-3xl relative">
                    {total === 0 ? (
                        <p className="text-center font-bold text-gray-400 text-xs italic tracking-widest my-4"> 
                            NO HAY SOLICITUDES PENDIENTES 
                        </p>
                    ) : (
                        <div
                            onTransitionEnd={alTerminarAnimacion}
                            className={`flex gap-4 ${conAnimacion ? "transition-transform duration-500 ease-in-out" : ""}`}
                            style={{ transform: `translateX(-${indice * itemWidth}px)` }}
                        >
                            {items.map((item, i) => (
                                <div 
                                    key={`${item.id}-${i}`} 
                                    className="relative shrink-0 cursor-pointer group"
                                    onClick={() => abrirSolicitud(item)}
                                >
                                    <div className="w-16 h-20 rounded-[1.2rem] bg-gray-100 flex items-center justify-center border-2 border-white shadow-md hover:scale-105 transition-transform overflow-hidden relative">
                                        <img
                                            src={item.fotoUsuario || DEFAULT_IMG}
                                            className="w-full h-full object-cover opacity-80"
                                            alt="usuario"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex flex-col justify-end p-2 transition-all">
                                            <p className="text-[8px] font-bold text-white uppercase text-center leading-tight truncate">{item.usuario || 'ADMIN'}</p>
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={() => mover(1)}> 
                    <img src={right} alt="right" className="w-4 cursor-pointer hover:scale-110 transition-all opacity-50 hover:opacity-100" /> 
                </button>
            </div>

            <p className="text-[0.7rem] font-bold uppercase tracking-widest mt-4">
                TIENES <span className={total > 0 ? "text-red-500 text-sm font-black" : "text-emerald-500 text-sm"}>{total}</span> SOLICITUDES PENDIENTES
            </p>

            {/* --- LÓGICA DEL MODAL --- */}
            {modalAbierto && seleccionado && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
                        onClick={() => setModalAbierto(false)}
                    />

                    <div className="relative bg-white w-full max-w-[320px] rounded-[1.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                        <img 
                            src={seleccionado.fotoUsuario || DEFAULT_IMG} 
                            className="w-24 h-24 rounded-[2rem] object-cover border-4 border-gray-50 shadow-lg mb-4"
                            alt="perfil"
                        />
                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-tighter mb-1">
                            {seleccionado.usuario || 'ADMINISTRADOR'}
                        </h3>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">
                            ID: #{seleccionado.id}
                        </p>
                        <p className="text-emerald-700 font-black text-xs uppercase mb-2">
                             TIPO: {seleccionado.tipo} ({seleccionado.cantidad} {seleccionado.unidadMedida})
                        </p>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8 bg-gray-50 p-3 rounded-xl italic">
                            "{formatearDetalle(seleccionado)}"
                        </p>

                        <div className="flex flex-col w-full gap-2">
                            <button 
                                onClick={() => manejarAccion('Aprobada')}
                                className="bg-slate-900 text-white font-black text-[10px] tracking-[0.2em] py-4 rounded-2xl hover:bg-emerald-600 transition-colors uppercase"
                            >
                                ACEPTAR SOLICITUD
                            </button>
                            <button 
                                onClick={() => manejarAccion('Rechazada')}
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