import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useSolicitudCompra } from "../hooks/useSolicitudCompra";

import left from "../assets/imgs/icon_left.webp";
import right from "../assets/imgs/icon_rigth.webp";

// Imagen por defecto si no hay avatar en la solicitud
const DEFAULT_IMG = "https://cdn-icons-png.flaticon.com/512/1144/1144760.png";

// ============================================================
// 📌 INTERFAZ PARA SOLICITUD
// ============================================================
interface Solicitud {
    id?: string | number;
    id_solicitud?: string | number;
    usuario?: string;
    fotoUsuario?: string;
    tipo?: string;
    tipoInsumo?: string;
    tipoAlimento?: string;
    cantidad?: number;
    unidadMedida?: string;
    motivo?: string;
    precio_total?: number;  // ✅ AGREGADO
}

export const Solicitudes = () => {
    const { solicitudesPendientes, cambiarEstadoSolicitud } = useSolicitudCompra();
    
    // ============================================================
    // ESTADOS
    // ============================================================
    const [indice, setIndice] = useState(0);
    const [conAnimacion, setConAnimacion] = useState(true);
    const [pausado, setPausado] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [seleccionado, setSeleccionado] = useState<Solicitud | null>(null);

    // Asegurar que solicitudesPendientes sea siempre un array
    const listaPendientes = Array.isArray(solicitudesPendientes) ? solicitudesPendientes : [];

    // Referencias y cálculos seguros
    const totalRef = useRef(listaPendientes.length);
    const total = listaPendientes.length;
    const itemWidth = 72;

    // ============================================================
    // RESETEAR ÍNDICE CUANDO CAMBIA EL TOTAL
    // ============================================================
    useEffect(() => {
        if (totalRef.current !== total) {
            totalRef.current = total;
            setConAnimacion(false);
            setIndice(0);
        }
    }, [total]);

    // ============================================================
    // MOVER CARRUSEL
    // ============================================================
    const mover = useCallback((direccion: number) => {
        if (total <= 1) return;
        
        setConAnimacion(true);
        setIndice(prevIndice => {
            let nuevoIndice = prevIndice + direccion;
            if (nuevoIndice < 0) {
                return total - 1;
            } else if (nuevoIndice >= total) {
                return 0;
            }
            return nuevoIndice;
        });
    }, [total]);

    // ============================================================
    // AUTO-ROTACIÓN
    // ============================================================
    useEffect(() => {
        if (pausado || modalAbierto || total <= 1) return;

        const intervalo = setInterval(() => {
            mover(1);
        }, 3000);

        return () => clearInterval(intervalo);
    }, [pausado, modalAbierto, total, mover]);

    // ============================================================
    // ABRIR MODAL
    // ============================================================
    const abrirSolicitud = (item: Solicitud) => {
        setSeleccionado(item);
        setModalAbierto(true);
    };

    // ============================================================
    // CERRAR MODAL
    // ============================================================
    const cerrarModal = () => {
        setModalAbierto(false);
        setSeleccionado(null);
    };

    // ============================================================
    // MANEJAR ACCIÓN (APROBAR/RECHAZAR)
    // ============================================================
    const manejarAccion = (estado: 'Aprobada' | 'Rechazada') => {
        if (seleccionado) {
            const id = (seleccionado as any).id_solicitud || seleccionado.id;
            console.log('ID a procesar:', id, seleccionado);
            cambiarEstadoSolicitud(Number(id), estado);
            cerrarModal();
        }
    };

    // ============================================================
    // FORMATEAR DETALLE
    // ============================================================
    const formatearDetalle = (solicitud: Solicitud) => {
        if (solicitud.motivo) return solicitud.motivo;
        
        const tipo = solicitud.tipoInsumo || solicitud.tipoAlimento || solicitud.tipo || 'insumo';
        return `Solicitud para compra de ${solicitud.cantidad} ${solicitud.unidadMedida} de ${tipo}.`;
    };

    // Obtener el nombre del producto (insumo o alimento)
    const getNombreProducto = (solicitud: Solicitud): string => {
        return solicitud.tipoInsumo || solicitud.tipoAlimento || solicitud.tipo || 'Producto';
    };

    // ============================================================
    // RENDER
    // ============================================================
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
                {/* Botón izquierdo */}
                <button 
                    onClick={() => mover(-1)}
                    disabled={total <= 1}
                    className={total <= 1 ? 'opacity-30 cursor-not-allowed' : ''}
                > 
                    <img 
                        src={left} 
                        alt="Anterior" 
                        className="w-4 cursor-pointer hover:scale-110 transition-all opacity-50 hover:opacity-100" 
                    /> 
                </button>

                {/* Carrusel */}
                <div className="w-[20rem] overflow-hidden py-2 rounded-3xl relative">
                    {total === 0 ? (
                        <p className="text-center font-bold text-gray-400 text-xs italic tracking-widest my-4"> 
                            NO HAY SOLICITUDES PENDIENTES 
                        </p>
                    ) : (
                        <div
                            className={`flex gap-4 ${conAnimacion ? "transition-transform duration-1000 ease-in-out" : ""}`}
                            style={{ transform: `translateX(-${indice * itemWidth}px)` }}
                        >
                            {listaPendientes.map((item: Solicitud) => (
                                <div 
                                    key={item.id} 
                                    className="relative shrink-0 cursor-pointer group"
                                    onClick={() => abrirSolicitud(item)}
                                >
                                    <div className="w-16 h-20 rounded-[1.2rem] bg-gray-100 flex items-center justify-center border-2 border-white shadow-md hover:scale-105 transition-transform overflow-hidden relative">
                                        <img
                                            src={item.fotoUsuario || DEFAULT_IMG}
                                            className="w-full h-full object-cover opacity-80"
                                            alt="usuario"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex flex-col justify-end p-1 transition-all">
                                            <p className="text-[10px] font-bold bg-black/60 rounded-full backdrop-blur-[5px] text-white uppercase tracking-[1px] text-center leading-tight truncate">
                                                {item.usuario || 'ADMIN'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Indicador de pendiente */}
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botón derecho */}
                <button 
                    onClick={() => mover(1)}
                    disabled={total <= 1}
                    className={total <= 1 ? 'opacity-30 cursor-not-allowed' : ''}
                > 
                    <img 
                        src={right} 
                        alt="Siguiente" 
                        className="w-4 cursor-pointer hover:scale-110 transition-all opacity-50 hover:opacity-100" 
                    /> 
                </button>
            </div>

            {/* Contador */}
            <p className="text-[0.7rem] font-bold uppercase tracking-widest mt-4">
                TIENES <span className={total > 0 ? "text-red-500 text-sm font-black" : "text-emerald-500 text-sm"}>
                    {total}
                </span> SOLICITUDES PENDIENTES
            </p>

            {/* ============================================================ */}
            {/* MODAL CORREGIDO - AHORA MUESTRA EL PRECIO TOTAL */}
            {/* ============================================================ */}
            {modalAbierto && seleccionado && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px] animate-in fade-in duration-300" 
                        onClick={cerrarModal}
                    />

                    {/* Contenido del modal */}
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
                        
                        <p className="text-emerald-700 font-black text-xs uppercase mb-1">
                            PRODUCTO: {getNombreProducto(seleccionado)}
                        </p>
                        
                        <p className="text-gray-500 text-xs mb-3">
                            CANTIDAD: {seleccionado.cantidad} {seleccionado.unidadMedida || 'unidades'}
                        </p>
                        
                        {/* 🆕 MOSTRAR PRECIO TOTAL */}
                        {seleccionado.precio_total !== undefined && seleccionado.precio_total > 0 && (
                            <p className="text-emerald-600 font-black text-sm uppercase mb-3">
                                TOTAL: ${seleccionado.precio_total.toLocaleString('es-CO')}
                            </p>
                        )}
                        
                        {seleccionado.motivo && (
                            <p className="text-gray-400 text-[10px] italic mb-3">
                                Motivo: {seleccionado.motivo}
                            </p>
                        )}
                        
                        <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6 bg-gray-50 p-3 rounded-xl italic">
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
                                className="bg-gray-300 text-gray-700 font-black text-[10px] tracking-[0.2em] py-4 rounded-2xl hover:bg-red-200 hover:text-red-700 transition-colors uppercase"
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