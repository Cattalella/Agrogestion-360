import { useState, useRef, useEffect } from "react";
import { Grafica } from "../components/Grafica";
import { ExportarButton } from "../components/ExportarButton";
import { Carrusel, type FotoEvidencia } from "../components/Carrusel";
import work from "../assets/imgs/icon_trabajadores.webp";
import isotipo from "../assets/imgs/isoB.svg";
import { Grafica3 } from "../components/Grafica3";
import { Animacion } from "../components/animations/Animacion";
import { Solicitudes } from "../components/Solicitudes";
import { Grafica2 } from "../components/Grafica2";
import { Encabezado } from "../components/Encabezado";
import nuevoadmin from "../assets/imgs/icon_Nadmin.webp";
import administrador from "../assets/imgs/icon_administradores.webp";
import ganancia from "../assets/imgs/icon_ganancia.webp";
import filtrar from "../assets/imgs/icon_filtrar.webp";
import toro from "../assets/imgs/TORO_IMG.webp";
import invertir from "../assets/imgs/icon_inversión.webp";
import { useNavigate } from "react-router-dom";
import { obtenerFotos } from "../utils/storage"; 
import { ModalGenerico } from "../components/ModalGenerico";

const ocultarScroll = {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    WebkitScrollbar: 'none',
} as React.CSSProperties;

// --- LISTA CON SCROLL VERTICAL ASISTIDO ---
const ListaInsumos = ({ items }: { items: string[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            const manejarRueda = (e: WheelEvent) => {
                if (e.deltaY === 0) return;
                e.preventDefault();
                el.scrollTop += e.deltaY * 1.2; 
            };
            el.addEventListener("wheel", manejarRueda, { passive: false });
            return () => el.removeEventListener("wheel", manejarRueda);
        }
    }, []);

    return (
        <div ref={scrollRef} className="flex flex-col mt-4 gap-2 overflow-y-auto no-scrollbar h-full" style={ocultarScroll}>
            {items.length > 0 ? (
                items.map((item, idx) => (
                    <p key={idx} className="whitespace-nowrap text-[0.9rem] border-b border-gray-50 pb-1 uppercase"> - {item} </p>
                ))
            ) : (
                <p className="text-[0.8rem] text-gray-400 italic">Sin registros pendientes</p>
            )}
        </div>
    );
};

// --- BARRA DE FILTROS ---
export const Barra = () => {
    const [mostrar, setMostrar] = useState(false);
    return (
        <div className="flex relative border-b-3 rounded-full border-[var(--color-verdeBorde)] w-full max-w-[80rem] mx-auto pl-6 items-center mt-[10rem] h-12">
            <p className="font-bold text-gray-600">ANALÍTICAS</p>
            <div className="flex border-3 rounded-full w-[10rem] border-[var(--color-verdeBorde)] justify-center items-center p-1 absolute right-0 mt-3 z-20 gap-5 cursor-pointer bg-white" onClick={() => setMostrar(!mostrar)}>
                <img src={filtrar} alt="filtrar" className="w-6" />
                <p>FILTRAR</p>
            </div>
            {mostrar && (
                <div className="flex flex-col bg-white shadow-[0_3px_15px_rgba(0,0,0,0.2)] p-4 rounded-lg gap-2 absolute right-0 top-full mt-4 z-30">
                    <ul className="flex flex-col tracking-wider gap-3 cursor-pointer">
                        <li className="hover:bg-emerald-50 p-1 rounded text-sm"> 📅 ESTE MES </li>
                        <li className="hover:bg-emerald-50 p-1 rounded text-sm"> 📊 SEIS MESES </li>
                        <li className="hover:bg-emerald-50 p-1 rounded text-sm"> 📈 UN AÑO ATRÁS </li>
                        <li onClick={() => setMostrar(false)} className="cursor-pointer hover:bg-red-50 p-1 rounded text-sm text-red-600"> 📅 RESETEAR </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const formatearUnidades = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1).replace(/\.0$/, "")}B`;
    if (val >= 1) return `${val.toFixed(1).replace(/\.0$/, "")}M`;
    return `${(val * 1000).toFixed(0)}K`;
};

export const Tarjetas = ({ titulo, icono, datos, estilos, tamanoIcono = "w-10" }: any) => (
    <div className={`flex shadow-[0_4px_10px_rgba(0,0,0,0.3)] rounded-[0.5rem] bg-white p-4 min-h-[8rem] justify-center w-fit ${estilos}`}>
        <img src={icono} alt={titulo} className={`shrink-0 object-contain ${tamanoIcono}`} />
        <div className="flex flex-col ml-2">
            {titulo && <p className="font-bold text-[0.7rem]"> {titulo} </p>}
            {datos?.tipo1 && <p className="text-[0.8rem]"> {datos?.tipo1} <br /> {formatearUnidades(datos?.cantidad1)} </p>}
        </div>
    </div>
);

// --- SECCIÓN DE GRÁFICAS PRINCIPALES ---
export const Hero1 = ({ ganancias, inversion }: any) => {
    const datosGastosSector = [
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
                        <Tarjetas icono={ganancia} datos={ganancias} estilos="text-[0.8rem] flex-col !w-38 gap-8 h-37" />
                        <Tarjetas icono={invertir} datos={inversion} estilos="text-[0.8rem] flex-col !w-38 gap-8 h-37" />
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

// --- SECCIÓN DE SUPERVISIÓN ---
export const Hero2 = ({ insumos, pagos, trabajadoresactivos }: any) => {
    const [verModalRevocados, setVerModalRevocados] = useState(false);
    const [verModalTrabajadores, setVerModalTrabajadores] = useState(false);
    const [verModalAdmin, setVerModalAdmin] = useState(false);
    const [pasoRegistro, setPasoRegistro] = useState(false); // FALSE = Lista, TRUE = Formulario

    const modalTrabajadoresRef = useRef<HTMLDivElement>(null);
    const modalRevocadosRef = useRef<HTMLDivElement>(null);
    const modalAdminRef = useRef<HTMLDivElement>(null);

    const [adminsRevocados, setAdminsRevocados] = useState([
        { id: 1, nombre: "Camila Hurtado Vallegos" },
        { id: 2, nombre: "Andrés Felipe Castro" }
    ]);

    const [adminsActivos, setAdminsActivos] = useState([
        { id: 10, nombre: "Juan Pablo Montoya", rol: "ADMINISTRADOR GENERAL" },
        { id: 11, nombre: "Elena Rodriguez", rol: "AUXILIAR CONTABLE" }
    ]);

    useEffect(() => {
        const manejarClicAfuera = (event: MouseEvent) => {
            const target = event.target as Node;
            if (verModalTrabajadores && modalTrabajadoresRef.current && !modalTrabajadoresRef.current.contains(target)) setVerModalTrabajadores(false);
            if (verModalRevocados && modalRevocadosRef.current && !modalRevocadosRef.current.contains(target)) setVerModalRevocados(false);
            if (verModalAdmin && modalAdminRef.current && !modalAdminRef.current.contains(target)) {
                setVerModalAdmin(false);
                setPasoRegistro(false); // Resetear al cerrar
            }
        };
        document.addEventListener('mousedown', manejarClicAfuera);
        return () => document.removeEventListener('mousedown', manejarClicAfuera);
    }, [verModalTrabajadores, verModalRevocados, verModalAdmin]);

    const manejarRegistroAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de guardado simulada
        setVerModalAdmin(false);
        setPasoRegistro(false);
    };

    const inhabilitarAdmin = (admin: any) => {
        setAdminsActivos(adminsActivos.filter(a => a.id !== admin.id));
        setAdminsRevocados([...adminsRevocados, { id: admin.id, nombre: admin.nombre }]);
    };

    const habilitarAdmin = (admin: any) => {
        setAdminsRevocados(adminsRevocados.filter(a => a.id !== admin.id));
        setAdminsActivos([...adminsActivos, { id: admin.id, nombre: admin.nombre, rol: "ADMINISTRADOR REINSTALADO" }]);
    };

    const colorDias = insumos.dias <= 5 ? "text-red-600" : "text-green-700";

    return (
        <div className="flex mt-[5rem] text-[var(--color-gray)] w-full max-w-[80rem] justify-between mx-auto rounded-4xl gap-8">
            <div className="flex gap-5 w-full max-w-[30rem]">
                
                {/* TARJETA REVOCAR */}
                <div 
                    onClick={() => setVerModalRevocados(true)}
                    className="flex flex-col rounded-[2rem] shadow-[0_3px_15px_rgba(0,0,0,0.5)] gap-8 p-5 items-center py-15 w-full cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <Animacion>
                        <img className="w-14" src={administrador} alt="revocar" />
                    </Animacion>
                    <p className="text-center font-bold"> ADMINISTRADORES <br /> REVOCADOS </p>
                    <p className="text-[0.7rem] font-black"> TOTAL: {adminsRevocados.length} </p>
                </div>

                {/* TARJETA REGISTRAR (Ahora abre la lista primero) */}
                <div 
                    onClick={() => setVerModalAdmin(true)}
                    className="flex flex-col rounded-[2rem] shadow-[0_3px_15px_rgba(0,0,0,0.5)] gap-8 p-5 items-center py-15 w-full cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <Animacion>
                        <img className="w-14" src={nuevoadmin} alt="nuevo" />
                    </Animacion>
                    <p className="text-center font-bold"> REGISTRAR NUEVO <br /> ADMINISTRADOR </p>
                    <p className="text-[0.7rem] font-black"> ACTIVOS: {adminsActivos.length} </p>
                </div>
            </div>

            <div className="flex flex-col w-full shadow-[0_3px_15px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden p-6">
                <div className="mx-auto bg-white pb-6 text-center">
                    <p className="tracking-[3px] font-semibold">-- SUPERVISIÓN DE ACTIVOS Y PERSONAL --</p>
                </div>

                <div className="flex justify-around items-center mx-auto my-auto w-full px-5 gap-6 max-w-[46rem]">
                    <div className="flex flex-col shadow-[0_2px_5px_rgba(0,0,0,0.5)] p-5 rounded-2xl flex-1 bg-white h-[18rem] min-w-[0]">
                        <div className="flex flex-col border-b-1 border-dashed pb-2 gap-2 shrink-0">
                            <p className={`tracking-[3px] font-black ${colorDias}`}> <span>{insumos.dias}</span>/DIAS </p>
                            <p className="text-red-800 text-[0.8rem] font-bold uppercase"> {insumos.titulo} </p>
                        </div>
                        <ListaInsumos items={insumos.lista} />
                    </div>

                    <div className="flex flex-col shadow-[0_2px_5px_rgba(0,0,0,0.5)] p-5 rounded-2xl flex-1 bg-white h-[18rem] min-w-[0]">
                        <div className="flex flex-col border-b-1 border-dashed pb-2 shrink-0">
                            <p className="tracking-[2px] font-black text-green-600 uppercase text-[0.7rem]"> pagos a trabajadores </p>
                            <p className="text-gray-800 text-[0.8rem] font-bold uppercase"> {pagos.titulo} </p>
                        </div>
                        <ListaInsumos items={pagos.lista} />
                        <Grafica3 
                            pagosRealizados={pagos.lista?.length || 0} 
                            totalTrabajadores={trabajadoresactivos.lista?.length || 0} 
                        />
                    </div>

                    <div onClick={() => setVerModalTrabajadores(true)} className="flex flex-col shadow-[0_2px_5px_rgba(0,0,0,0.5)] p-5 rounded-2xl flex-1 bg-white h-[18rem] min-w-[0] cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all group">
                        <div className="flex flex-col border-b-1 border-dashed pb-2 gap-2 shrink-0">
                            <p className="tracking-[2px] font-black text-green-600 uppercase text-[0.7rem]"> trabajadores activos </p>
                        </div>
                        <div className="mx-auto my-auto transition-transform group-hover:scale-110">
                            <img className="w-15" src={work} alt="Trabajador" />
                        </div>
                        <p className="mt-auto text-[0.8rem] font-bold">TOTAL: <span className="text-green-700"> {trabajadoresactivos.lista?.length || 0} </span> </p>
                    </div>
                </div>

                {/* MODAL TRABAJADORES (NÓMINA) */}
                {verModalTrabajadores && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4">
                        <div ref={modalTrabajadoresRef} className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
                            <div className="bg-green-900 p-8 text-white relative flex items-center gap-5">
                                <Animacion> <img className="w-7" src={isotipo} alt="iso" /> </Animacion>
                                <p className="text-2xl font-light tracking-[3px] uppercase"> Nómina Activa </p>
                                <button onClick={() => setVerModalTrabajadores(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white border-none cursor-pointer"> ✕ </button>
                            </div>
                            <div className="p-8 max-h-[50vh] overflow-y-auto no-scrollbar bg-gray-50">
                                {trabajadoresactivos.lista?.length > 0 ? (
                                    trabajadoresactivos.lista.map((nombre: string, i: number) => (
                                        <div key={i} className="flex items-center p-4 bg-white border border-gray-100 rounded-2xl mb-2 shadow-sm">
                                            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-black mr-4">{i + 1}</span>
                                            <p className="text-sm font-bold text-gray-700 uppercase">{nombre}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 py-10">No hay trabajadores registrados</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL REVOCADOS (BÁSICO) */}
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
                                    onClick={() => habilitarAdmin(admin)}
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

            {/* MODAL UNIFICADO: LISTA + REGISTRO */}
            <ModalGenerico 
                titulo={pasoRegistro ? "COMPLETA LOS DATOS DEL NUEVO ADMIN" : "GESTIÓN DE ADMINISTRADORES ACTUALES"} 
                isOpen={verModalAdmin} 
                onClose={() => { setVerModalAdmin(false); setPasoRegistro(false); }}
                width="max-w-5xl"
            >
                <div ref={modalAdminRef} className="min-h-[400px]">
                    {!pasoRegistro ? (
                        /* PASO 1: VER LISTA ACTUAL */
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
                                            onClick={() => inhabilitarAdmin(admin)}
                                            className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-[0.6rem] font-black hover:bg-red-600 hover:text-white transition-all cursor-pointer border-none"
                                        >
                                            INHABILITAR ACCESO
                                        </button>
                                    </div>
                                ))}
                                {adminsActivos.length === 0 && <p className="text-center py-20 text-gray-400">No hay administradores activos.</p>}
                            </div>
                        </div>
                    ) : (
                        /* PASO 2: FORMULARIO DE REGISTRO */
                        <form onSubmit={manejarRegistroAdmin} className="animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div className="flex flex-col gap-5">
                                    <input type="text" placeholder="NOMBRE COMPLETO" required className="border-b border-gray-100 p-2 outline-none focus:border-green-600 uppercase text-[0.8rem] tracking-widest" />
                                    <select className="border-b border-gray-100 p-2 outline-none text-gray-400 text-[0.8rem] bg-transparent">
                                        <option>TIPO DE DOCUMENTO</option>
                                        <option>CÉDULA DE CIUDADANÍA</option>
                                        <option>NIT</option>
                                    </select>
                                    <input type="text" placeholder="NÚMERO DE DOCUMENTO" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                    <input type="email" placeholder="CORREO ELECTRÓNICO" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                </div>

                                <div className="flex flex-col gap-5">
                                    <input type="tel" placeholder="TELÉFONO DE CONTACTO" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                    <input type="text" placeholder="NOMBRE DE USUARIO" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                    <input type="password" placeholder="CONTRASEÑA INICIAL" className="border-b border-gray-100 p-2 outline-none focus:border-green-600 text-[0.8rem]" />
                                    <select className="border-b border-gray-100 p-2 outline-none text-gray-400 text-[0.8rem] bg-transparent">
                                        <option>ROL ASIGNADO</option>
                                        <option>ADMINISTRADOR GENERAL</option>
                                        <option>AUXILIAR CONTABLE</option>
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
        </div>
    );
};

// --- FOOTER / EXPORTACIÓN ---
export const Hero3 = ({ datosExportar }: { datosExportar: any[] }) => {
    const [fotosPersistentes] = useState<FotoEvidencia[]>(obtenerFotos());

    return (
        <div className="flex mt-[5rem] w-full max-w-[80rem] mx-auto bg-white mb-20">
            <div className="flex w-full items-stretch gap-8">
                <div className="flex-1">
                    <Carrusel rol="boss" fotos={fotosPersistentes} /> 
                </div>
                <div className="flex flex-col bg-white shadow-[0_3px_15px_rgba(0,0,0,0.2)] p-5 justify-center rounded-[2rem] gap-10">
                    <div className="flex flex-col mx-auto ">
                        <p className="text-amber-800 text-[0.7rem] font-bold tracking-widest mb-4 uppercase">Generar Reporte Oficial</p>
                        <ExportarButton datosFiltrados={datosExportar} targetId="boss-report" />
                    </div>
                    <img className="w-50 bg-amber-100 mx-auto" src={nuevoadmin} alt="" />
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE CONTENEDOR PRINCIPAL --- 
export const Boss = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("nombreUsuario");
        navigate("/", { replace: true });
    }

    const [ganancias] = useState({ tipo1: "GANANCIA NETA", cantidad1: 0 });
    const [inversion] = useState({ tipo1: "INVERSIÓN", cantidad1: 0 });

    const [datosInsumos] = useState({ dias: 0, titulo: "Insumos Críticos", lista: [] });
    const [datosPagos] = useState({ titulo: "", lista: [] });
    const [datosTrabajadoresactivos] = useState({ titulo: "PERSONAL", lista: [] });

    const datosParaArchivo = [
        { item: "Ganancias Netas", valor: ganancias.cantidad1 },
        { item: "Inversión Total", valor: inversion.cantidad1 },
        { item: "Total Trabajadores", valor: datosTrabajadoresactivos.lista.length },
        { item: "Insumos por Vencer", valor: datosInsumos.lista.length }
    ];

    return (
        <div id="boss-report" className="font-[texto] bg-[#fafafa] min-h-screen">
            <Encabezado estilos="" titulo="PROPIETARIO" id="boss" subtitulo="AQUÍ TIENES EL PULSO DE TU FINCA HOY..." >
                <img src={toro} alt="Fondo Toro" className="w-full h-full block object-center object-cover" />
            </Encabezado>
            <Barra />
            <Hero1 ganancias={ganancias} inversion={inversion} />
            <Hero2 insumos={datosInsumos} pagos={datosPagos} trabajadoresactivos={datosTrabajadoresactivos} />
            <Hero3 datosExportar={datosParaArchivo} />
        </div>
    );
};