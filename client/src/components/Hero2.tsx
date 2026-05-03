import { useAdministradores } from '../hooks/useAdministradores';
import { useTrabajadores } from '../hooks/useTrabajadores';
import { useInsumos } from '../hooks/useInsumos';
import { usePagos } from '../hooks/usePagos';
import { useState, useRef } from "react";
import work from "../assets/imgs/icon_trabajadores.webp";
import isotipo from "../assets/imgs/isoB.svg";
import { Grafica3 } from "./Grafica3";
import { Animacion } from "./animations/Animacion";
import { ListaInsumos } from "./ListaInsumos";
import { ModalGenerico } from "./ModalGenerico";
import { useCerrarModal } from "../hooks/useCerrarModal";
import nuevoadmin from "../assets/imgs/icon_Nadmin.webp";
import administrador from "../assets/imgs/icon_administradores.webp";

interface Hero2Props {
    // ============================================================
    // PROPS DEL ADMIN
    // ============================================================
    pagos?: any;
    trabajo?: any;
    trabajadores?: any;
    compras?: any;
    onRegPagosClick?: () => void;
    onRegTrabajoClick?: () => void;
    onRegTrabajadoresClick?: () => void;
    onRegComprasClick?: () => void;
    onRegFormatoPagoClick?: () => void;
    onRegSolicitudClick?: () => void;
    onRegConsumoClick?: () => void;
    onVerInventarioClick?: () => void;
    
    // ============================================================
    // PROPS DEL BOSS
    // ============================================================
    insumos?: {
        dias: number;
        titulo: string;
        lista: any[];
    };
    pagosBoss?: {
        titulo: string;
        lista: any[];
    };
    trabajadoresactivos?: {
        titulo: string;
        lista: any[];
    };
    
    // ============================================================
    // 🆕 PROP PARA IDENTIFICAR AL BOSS
    // ============================================================
    esBoss?: boolean;
}

export const Hero2 = ({ 
    // Admin props
    onRegPagosClick,
    onRegTrabajoClick,
    onRegTrabajadoresClick,
    onRegComprasClick,
    onRegFormatoPagoClick,
    onRegSolicitudClick,
    onRegConsumoClick,
    onVerInventarioClick,
    // Boss props
    insumos: insumosBoss,
    pagosBoss,
    trabajadoresactivos: trabajadoresActivosBoss,
    // Identificador
    esBoss = false
}: Hero2Props) => {
    const [verModalRevocados, setVerModalRevocados] = useState(false);
    const [verModalTrabajadores, setVerModalTrabajadores] = useState(false);
    const [verModalAdmin, setVerModalAdmin] = useState(false);
    const [pasoRegistro, setPasoRegistro] = useState(false);

    const modalTrabajadoresRef = useRef<HTMLDivElement>(null);
    const modalRevocadosRef = useRef<HTMLDivElement>(null);
    const modalAdminRef = useRef<HTMLDivElement>(null);

    useCerrarModal(verModalTrabajadores, modalTrabajadoresRef, () => setVerModalTrabajadores(false));
    useCerrarModal(verModalRevocados, modalRevocadosRef, () => setVerModalRevocados(false));
    useCerrarModal(verModalAdmin, modalAdminRef, () => {
        setVerModalAdmin(false);
        setPasoRegistro(false);
    });

    // Hooks (siempre se usan, pero las tarjetas solo las ve el Boss)
    const { adminsActivos, adminsRevocados, inhabilitarAdmin, habilitarAdmin, registrarAdmin } = useAdministradores();
    const { totalActivos, listaNombres, loading: loadingTrabajadores } = useTrabajadores();
    const { totalCriticos, listaCriticos, loading: loadingInsumos } = useInsumos();
    const { totalPagado, totalPagos, loading: loadingPagos } = usePagos();

    const manejarRegistroAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);
        try {
            await registrarAdmin({
                nombre_completo: data.get('nombre_completo') as string,
                tipo_documento: data.get('tipo_documento') as string,
                num_documento: data.get('num_documento') as string,
                email: data.get('email') as string,
                telefono: data.get('telefono') as string,
                nombre_usuario: data.get('nombre_usuario') as string,
                contrasena: data.get('contrasena') as string,
                rol: data.get('rol') as string,
            });
            setVerModalAdmin(false);
            setPasoRegistro(false);
        } catch (err) {
            alert('Error al registrar administrador');
        }
    };

    // Determinar si es vista Boss (tiene props específicas del Boss)
    const tienePropsBoss = insumosBoss !== undefined || pagosBoss !== undefined || trabajadoresActivosBoss !== undefined;
    const esVistaBoss = esBoss || tienePropsBoss;
    
    // Datos a mostrar (según quien use el componente)
    const mostrarInsumosCriticos = esVistaBoss ? insumosBoss?.dias || 0 : totalCriticos;
    const colorDias = mostrarInsumosCriticos > 0 ? "text-red-600" : "text-green-700";
    
    const mostrarTotalPagado = esVistaBoss 
        ? (pagosBoss?.titulo?.replace('Pagado: $', '') || '0')
        : totalPagado;
    
    const mostrarTotalTrabajadores = esVistaBoss 
        ? trabajadoresActivosBoss?.lista?.length || 0
        : totalActivos;

    const mostrarListaInsumosCriticos = esVistaBoss
        ? (insumosBoss?.lista || [])
        : listaCriticos.map(i => `${i.nombre} (${i.stock_actual} ${i.unidad})`);

    return (
        <div className="flex mt-[5rem] text-[var(--color-gray)] w-full max-w-[80rem] justify-between mx-auto rounded-4xl gap-8">
            {/* ============================================================ */}
            {/* SECCIÓN IZQUIERDA - TARJETAS DE ADMINISTRADORES (SOLO BOSS) */}
            {/* ============================================================ */}
            {esVistaBoss && (
                <div className="flex gap-5 w-full max-w-[30rem]">
                    <div
                        onClick={() => setVerModalRevocados(true)}
                        className="flex flex-col rounded-[2rem] bg-[#ffffff] shadow-[0_3px_15px_rgba(0,0,0,0.5)] gap-8 p-5 items-center py-15 w-full cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <Animacion><img className="w-14" src={administrador} alt="revocar" /></Animacion>
                        <p className="text-center font-bold"> ADMINISTRADORES <br /> REVOCADOS </p>
                        <p className="text-[0.7rem] font-black"> TOTAL: {adminsRevocados.length} </p>
                    </div>

                    <div
                        onClick={() => setVerModalAdmin(true)}
                        className="flex flex-col rounded-[2rem] bg-[#ffffff] shadow-[0_3px_15px_rgba(0,0,0,0.5)] gap-8 p-5 items-center py-15 w-full cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <Animacion><img className="w-14" src={nuevoadmin} alt="nuevo" /></Animacion>
                        <p className="text-center font-bold"> REGISTRAR NUEVO <br /> ADMINISTRADOR </p>
                        <p className="text-[0.7rem] font-black"> ACTIVOS: {adminsActivos.length} </p>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* SECCIÓN PRINCIPAL - SUPERVISIÓN */}
            {/* ============================================================ */}
            <div className={`flex flex-col shadow-[0_3px_15px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden bg-white p-6 ${esVistaBoss ? 'w-full' : 'w-full'}`}>
                <div className="mx-auto pb-6 text-center">
                    <p className="tracking-[3px] font-semibold">-- SUPERVISIÓN DE ACTIVOS Y PERSONAL --</p>
                </div>

                <div className="flex justify-around items-center mx-auto my-auto w-full px-5 gap-6 max-w-[46rem]">

                    {/* TARJETA 1 — INSUMOS CRÍTICOS */}
                    <div className="flex flex-col shadow-[0_2px_5px_rgba(0,0,0,0.5)] p-5 rounded-2xl flex-1 bg-white h-[18rem] min-w-[0]">
                        <div className="flex flex-col border-b-1 border-dashed pb-2 gap-2 shrink-0">
                            <p className={`tracking-[3px] font-black ${colorDias}`}>
                                {mostrarInsumosCriticos} / DIAS
                            </p>
                            <p className="text-red-800 text-[0.8rem] font-bold uppercase"> vencen: </p>
                        </div>
                        <ListaInsumos items={mostrarListaInsumosCriticos} />
                    </div>

                    {/* TARJETA 2 — PAGOS A TRABAJADORES */}
                    <div 
                        onClick={onRegFormatoPagoClick}
                        className="flex flex-col shadow-[0_2px_5px_rgba(0,0,0,0.5)] p-5 rounded-2xl flex-1 bg-white h-[18rem] min-w-[0] cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all group"
                    >
                        <div className="flex flex-col border-b-1 border-dashed pb-2 shrink-0">
                            <p className="tracking-[2px] font-black text-green-600 uppercase text-[0.7rem]">PAGOS A TRABAJADORES</p>
                            {/* <p className="text-gray-800 text-[0.8rem] font-bold uppercase">
                                ${typeof mostrarTotalPagado === 'number' ? mostrarTotalPagado.toLocaleString('es-CO') : mostrarTotalPagado}
                            </p> */}
                        </div>
                        <ListaInsumos items={[]} />

                        <div className="mt-2">
                        <Grafica3
                            pagosRealizados={totalPagos}
                            totalTrabajadores={mostrarTotalTrabajadores}
                        />
                        </div>
                    </div>

                    {/* TARJETA 3 — TRABAJADORES ACTIVOS (MODIFICADA PARA MOSTRAR NOMBRES) */}
                    <div
                        onClick={!esVistaBoss ? onRegTrabajadoresClick : undefined}
                        className={`flex flex-col shadow-[0_2px_5px_rgba(0,0,0,0.5)] p-5 rounded-2xl flex-1 bg-white h-[18rem] min-w-[0] ${!esVistaBoss ? 'cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all group' : ''}`}
                    >
                        <div className="flex flex-col border-b-1 border-dashed pb-2 gap-2 shrink-0">
                            <p className="tracking-[2px] font-black text-green-600 uppercase text-[0.7rem]">TRABAJADORES ACTIVOS</p>
                        </div>
                        
                        {/* 👇 SECCIÓN MODIFICADA: Muestra los nombres de los trabajadores */}
                        <div className="flex-1 overflow-y-auto my-2 min-h-[80px]">
                            {esVistaBoss && trabajadoresActivosBoss?.lista && trabajadoresActivosBoss.lista.length > 0 ? (
                                <div className="space-y-1">
                                    {trabajadoresActivosBoss.lista.slice(0, 4).map((trab: any, idx: number) => (
                                        <p key={idx} className="text-[0.6rem] font-bold text-gray-600 truncate">
                                            {typeof trab === 'string' ? trab : trab.nombre_completo || trab.nombre}
                                        </p>
                                    ))}
                                    {trabajadoresActivosBoss.lista.length > 4 && (
                                        <p className="text-[0.5rem] text-gray-400 font-bold">
                                            +{trabajadoresActivosBoss.lista.length - 4} más
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="mx-auto my-auto transition-transform group-hover:scale-110 flex items-center justify-center h-full">
                                    <img className="w-15" src={work} alt="Trabajador" />
                                </div>
                            )}
                        </div>
                        
                        <p className="mt-auto text-[0.8rem] font-bold">
                            TOTAL: <span className="text-green-700">
                                {mostrarTotalTrabajadores}
                            </span>
                        </p>
                    </div>

                    {/* TARJETA 4 - VER INVENTARIO (solo para Admin) */}
                    {!esVistaBoss && (
                        <div
                            onClick={onVerInventarioClick}
                            className="flex flex-col shadow-[0_2px_5px_rgba(0,0,0,0.5)] p-5 rounded-2xl flex-1 bg-white h-[18rem] min-w-[0] cursor-pointer hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all group"
                        >
                            <div className="flex flex-col border-b-1 border-dashed pb-2 gap-2 shrink-0">
                                <p className="tracking-[2px] font-black text-orange-600 uppercase text-[0.7rem]">VER INVENTARIO</p>
                            </div>
                            <div className="mx-auto my-auto transition-transform group-hover:scale-110">
                                <svg className="w-15 h-15 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <p className="mt-auto text-[0.7rem] font-bold text-center text-orange-600">
                                VER STOCK Y ALERTAS
                            </p>
                        </div>
                    )}

                </div>

                {/* MODAL — NÓMINA ACTIVA */}
                {verModalTrabajadores && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4">
                        <div ref={modalTrabajadoresRef} className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
                            <div className="bg-green-900 p-8 text-white relative flex items-center gap-5">
                                <Animacion><img className="w-7" src={isotipo} alt="iso" /></Animacion>
                                <p className="text-2xl font-light tracking-[3px] uppercase">Nómina Activa</p>
                                <button
                                    onClick={() => setVerModalTrabajadores(false)}
                                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white border-none cursor-pointer"
                                >✕</button>
                            </div>
                            <div className="p-8 max-h-[50vh] overflow-y-auto no-scrollbar bg-gray-50">
                                {listaNombres.length > 0 ? (
                                    listaNombres.map((nombre, i) => (
                                        <div key={i} className="flex items-center p-4 bg-white border border-gray-100 rounded-2xl mb-2 shadow-sm">
                                            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-black mr-4">{i + 1}</span>
                                            <p className="text-sm font-bold text-gray-700 uppercase">{nombre}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 py-10 italic">No hay trabajadores activos</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* MODALES DE ADMINISTRADORES (SOLO BOSS) */}
            {/* ============================================================ */}
            {esVistaBoss && (
                <>
                    <ModalGenerico
                        titulo="ADMINISTRADORES REVOCADOS"
                        isOpen={verModalRevocados}
                        onClose={() => setVerModalRevocados(false)}
                        width="max-w-4xl"
                    >
                        <div ref={modalRevocadosRef} className="flex flex-col gap-3 min-h-[300px]">
                            {adminsRevocados.length > 0 ? (
                                adminsRevocados.map((admin) => (
                                    <div key={admin.id} className="group flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-emerald-50 transition-all">
                                        <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">{admin.nombre}</p>
                                        <button
                                            onClick={() => habilitarAdmin(admin.id)}
                                            className="opacity-0 group-hover:opacity-100 bg-green-700 hover:bg-black text-white px-6 py-2 rounded-full text-[0.7rem] font-black transition-all cursor-pointer border-none"
                                        >
                                            HABILITAR
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 py-20 italic">No hay administradores revocados</p>
                            )}
                        </div>
                    </ModalGenerico>

                    <ModalGenerico
                        titulo={pasoRegistro ? "COMPLETA LOS DATOS DEL NUEVO ADMIN" : "GESTIÓN DE ADMINISTRADORES ACTUALES"}
                        isOpen={verModalAdmin}
                        onClose={() => { setVerModalAdmin(false); setPasoRegistro(false); }}
                        width="max-w-5xl"
                    >
                        <div ref={modalAdminRef} className="min-h-[400px]">
                            {!pasoRegistro ? (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-8">
                                        <p className="text-gray-500 text-sm italic">Aquí puedes ver quiénes gestionan tu finca actualmente.</p>
                                        <button
                                            onClick={() => setPasoRegistro(true)}
                                            className="bg-black text-white px-8 py-3 rounded-2xl font-black text-[0.7rem] tracking-widest hover:bg-green-700 transition-all cursor-pointer border-none shadow-lg"
                                        >
                                            + REGISTRAR UNO NUEVO
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {adminsActivos.map((admin) => (
                                            <div key={admin.id} className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all">
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-black text-gray-800 uppercase">{admin.nombre}</p>
                                                    <p className="text-[0.6rem] text-green-600 font-bold tracking-tighter">{admin.rol}</p>
                                                </div>
                                                <button
                                                    onClick={() => inhabilitarAdmin(admin.id)}
                                                    className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-[0.6rem] font-black hover:bg-red-600 hover:text-white transition-all cursor-pointer border-none"
                                                >
                                                    INHABILITAR ACCESO
                                                </button>
                                            </div>
                                        ))}
                                        {adminsActivos.length === 0 && (
                                            <p className="text-center py-20 text-gray-400">No hay administradores activos.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={manejarRegistroAdmin} className="animate-in fade-in duration-500">
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                        <div className="flex flex-col gap-5">
                                            <input name="nombre_completo" type="text" placeholder="NOMBRE COMPLETO" required className="border-b border-gray-100 p-2 outline-none focus:border-green-600 uppercase text-[0.8rem] tracking-widest" />
                                            <select name="tipo_documento" className="border-b border-gray-100 p-2 outline-none text-gray-400 text-[0.8rem] bg-transparent">
                                                <option value="">TIPO DE DOCUMENTO</option>
                                                <option value="CC">CC</option>
                                            </select>
                                            <input name="num_documento" type="text" placeholder="NÚMERO DE DOCUMENTO" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                            <input name="email" type="email" placeholder="CORREO ELECTRÓNICO" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                        </div>
                                        <div className="flex flex-col gap-5">
                                            <input name="telefono" type="tel" placeholder="TELÉFONO DE CONTACTO" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                            <input name="nombre_usuario" type="text" placeholder="NOMBRE DE USUARIO" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                            <input name="contrasena" type="password" placeholder="CONTRASEÑA INICIAL" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                            <select name="rol" className="border-b border-gray-100 p-2 outline-none text-gray-400 text-[0.8rem] bg-transparent">
                                                <option value="">ROL ASIGNADO</option>
                                                <option value="Administrador">Administrador</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 flex gap-4 mt-8">
                                            <button type="submit" className="flex-1 bg-green-700 hover:bg-black text-white py-4 rounded-2xl font-black tracking-[3px] transition-all cursor-pointer border-none">
                                                GUARDAR REGISTRO
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPasoRegistro(false)}
                                                className="flex-1 bg-gray-200 text-gray-600 py-4 rounded-2xl font-black tracking-[3px] transition-all cursor-pointer border-none"
                                            >
                                                VOLVER A LA LISTA
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </ModalGenerico>
                </>
            )}
        </div>
    );
};