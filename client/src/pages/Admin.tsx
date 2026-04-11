import { useState, useEffect } from "react";

// Importaciones de utilidades de persistencia
import { guardarFotos, obtenerFotos } from "../utils/storage";
import { TablaHistorial } from "../components/TablaHistorial";

import { useTrabajoRealizado } from "../hooks/useTrabajoRealizado";
import { FormularioTrabajoRealizado } from "../components/FormularioPagoRealizado";

// los hooks
import { useGanado } from "../hooks/useGanado";
import { useCerdos } from "../hooks/useCerdos";
import { useVacunas } from "../hooks/useVacunas";
import { useVentas } from "../hooks/useVentas";

import { FormularioGanado } from "../components/FormularioGanado";
import { FormularioCerdo } from "../components/FormularioCerdo";
import { FormularioVacuna } from "../components/FormularioVacuna";
import { FormularioVenta } from "../components/FormularioVenta";

import { type DatosCard } from "../types/admin";

// Importaciones de componentes
import { Modal } from "../components/Modal";
import { ModalGenerico } from "../components/ModalGenerico";
import { Carrusel, type FotoEvidencia } from "../components/Carrusel";

import { CardRegistro } from "./CardRegistro";
import { Encabezado } from "../components/Encabezado";

import { FormularioPago } from "../components/FormularioPagos";
import { useRegistrarPagos } from "../hooks/useRegistrarPagos";

// Importaciones de iconos
import vaca from '../assets/imgs/icon_vaca.webp'
import insumo2 from '../assets/imgs/icon_insumo2.webp'
import cerdo from '../assets/imgs/icon_cerdo.webp'
import vacuna from '../assets/imgs/icon_vacuna.webp'
import venta from '../assets/imgs/icon_ventas.webp'
import sack from '../assets/imgs/icon_sack.webp'
import martillo from '../assets/imgs/icon_martillo.webp'
import trabajador from '../assets/imgs/icon_trabajadores.webp'
import compra from '../assets/imgs/icon_compra.webp'
import admin2 from '../assets/imgs/aguila.webp'
import docuemento from '../assets/imgs/icon_documento.webp'
import herramienta from '../assets/imgs/icon_herramienta.webp'
import insumo from '../assets/imgs/icon_insumo.webp'
import sol from '../assets/imgs/icon_sol.webp'
import luna from '../assets/imgs/icon_luna.webp'
import corral from '../assets/imgs/icon_corral.webp'
import alimentos from '../assets/imgs/icon_alimento.webp'
import sanidad from '../assets/imgs/icon_sanidad.webp'

// --- HERO 1: GANADERÍA ---
export const Hero = ({ ganado, cerdos, vacunas, ventas, onRegGanadoClick, onRegCerdosClick, onRegVacunasClick, onRegVentasClick }: any) => {
    const cards = [
        { titulo: "REGISTRAR GANADO", icono: vaca, datos: ganado, accion: onRegGanadoClick },
        { titulo: "REGISTRAR CERDOS", icono: cerdo, datos: cerdos, accion: onRegCerdosClick },
        { titulo: "REGISTRAR VACUNAS", icono: vacuna, datos: vacunas, accion: onRegVacunasClick },
        { titulo: "REGISTRAR VENTAS", icono: venta, datos: ventas, accion: onRegVentasClick },
    ];

    return (
        <section className="flex flex-col gap-8 shadow-[0_3px_15px_rgba(0,0,0,0.2)] mx-auto pl-20 pr-20 p-10 max-w-[80rem] rounded-[2rem] mt-40">
            <div className="text-center text-[var(--color-gray)] border-b-[var(--color-gray)] border-b-1 border-dashed pb-2 mb-2 w-full mx-auto max-w-100">
                <p className="text-[1.5rem]">GANADERÍA Y PORCICULTURA</p>
            </div>
            <div className="flex gap-8 justify-center ">
                {cards.map((card, idx) => (
                    <CardRegistro 
                        key={idx}
                        estilo={`border-[var(--color-gray)] pl-5 pr-5 !w-[16rem] ${card.accion ? 'hover:animate-pulse hover:scale-103 transition-all hover:shadow-[0_0_8px_rgba(120,0,139,0.8)]' : ''}`}
                        titulo={card.titulo}
                        icono={card.icono}
                        datos={card.datos}
                        onClick={card.accion}
                    />
                ))}
            </div>
        </section>
    );
}

// --- HERO 2: SECCIÓN INTERMEDIA ---
export const Hero2 = ({ pagos, trabajo, trabajadores, compras, onRegPagosClick, onRegTrabajoClick, onRegTrabajadoresClick, onRegComprasClick }: any) => {
    const cardsHero2 = [
        { titulo: "REGISTRAR PAGOS", icono: sack, datos: pagos, accion: onRegPagosClick },
        { titulo: "TRABAJO REALIZADO", icono: martillo, datos: trabajo, accion: onRegTrabajoClick },
        { titulo: "NUEVO TRABAJADOR", icono: trabajador, datos: trabajadores, accion: onRegTrabajadoresClick },
        { titulo: "REGISTRAR COMPRA", icono: compra, datos: compras, accion: onRegComprasClick },
    ];

    return (
        <section className="flex justify-center gap-15 mt-20 w-full px-10">
            <div className="flex flex-col gap-7 h-full min-h-[38rem] justify-between">
                {cardsHero2.map((card, idx) => (
                    <CardRegistro 
                        key={idx}
                        estilo="rounded-[2rem] border-none w-[16rem] !shadow-[0_4px_8px_rgba(0,0,0,0.2)] flex items-center flex-1"
                        titulo={card.titulo}
                        icono={card.icono}
                        datos={card.datos}
                        onClick={card.accion}
                    />
                ))}
            </div>
            
            <div className="flex flex-col gap-5 w-fit rounded-[2rem] shadow-[0_4px_8px_rgba(0,0,0,0.2)] pl-15 pr-15 p-10 h-full min-h-[38rem]">
                <p className="text-[0.8rem] text-emerald-700">-- MÓDULO DE INFORMES --</p>
                <p className="text-[1.2rem] text-emerald-900 border-l-2 border-emerald-900 pl-3 text-[1.5rem]">
                    INFORME DE <br /> PAGOS <br /> REALIZADOS A LOS <br /> TRABAJADORES
                </p>
                <div className="flex flex-col gap-5 text-[0.8rem] text-[var(--color-gray)] mt-10">
                    <p> PODRÁ VER CON GRAN <br /> DETALLE: <br /> EL MONTO Y EL TRABAJO POR <br /> EL CUAL SE HA REALIZADO <br /> CUYO PAGO. </p>
                    <p> FECHA DE INICIO Y DE FINAL <br /> DEL TRABAJO REALIZADO. </p>
                    <p> NOMBRE COMPLETO, <br /> DOCUMENTO DE IDENTIDAD, <br /> TELÉFONO PERSONAL, <br /> DIRECCIÓN DE VIVIENDA Y <br /> EDAD DEL TRABAJADOR. </p>
                </div>
            </div>

            <div className="flex flex-col gap-5 w-fit h-full">
                <div className="grid grid-cols-2 rounded-[1.5rem] pl-5 pr-5 p-3 shadow-[0_4px_8px_rgba(0,0,0,0.2)] flex-1 content-center">
                    <div className="col-span-2 flex flex-col items-center justify-center gap-2 border-b-[var(--color-gray)] border-b border-dashed pb-2 mb-2">
                        <img className="w-8" src={docuemento} alt="doc" />
                        <p className="text-emerald-900 text-[0.8rem]">-- ENVIAR SOLICITUD --</p>
                    </div>
                    <div className="flex flex-col gap-3 pl-5 pr-5 p-2">
                        <div className="flex items-center gap-2"><img className="w-5" src={vaca} alt="vaca" /><p className="text-[0.7rem]">GANADERÍA</p></div>
                        <div className="flex items-center gap-2"><img className="w-5" src={cerdo} alt="cerdo" /><p className="text-[0.7rem]">PORCICULTURA</p></div>
                    </div>
                    <div className="flex flex-col gap-3 pl-5 pr-5 p-2">
                        <div className="flex items-center gap-2"><img className="w-5" src={insumo2} alt="insumo" /><p className="text-[0.7rem]">INSUMOS</p></div>
                        <div className="flex items-center gap-2"><img className="w-5" src={herramienta} alt="herramienta" /><p className="text-[0.7rem]">HERRAMIENTAS</p></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 rounded-[1.5rem] pl-5 pr-5 p-3 gap-4 shadow-[0_4px_8px_rgba(0,0,0,0.2)] flex-1 content-center">
                    <div className="col-span-1 flex flex-col items-center justify-center gap-2 border-b-[var(--color-gray)] border-b border-dashed pb-2 mb-2">
                        <img className="w-8" src={insumo} alt="insumo" />
                        <p className="text-emerald-900 text-[0.8rem]">-- REGISTRO DE CONSUMOS E INSUMOS --</p>
                    </div>
                    <div className="flex flex-col gap-3 pl-5 pr-5 p-2">
                        <div className="flex items-center gap-2"><img className="w-5" src={sol} alt="sol" /><p className="text-[0.7rem]">AL INICIAR EL DIA</p></div>
                        <div className="flex items-center gap-2"><img className="w-5" src={luna} alt="luna" /><p className="text-[0.7rem]">AL FINALIZAR EL DIA</p></div>
                        <div className="flex items-center gap-2">
                            <img className="w-5" src={corral} alt="corral" />
                            <p className="text-[0.7rem]">REGISTRAR POR LOTES - <span className="text-orange-600 font-semibold">(RECOMENDADO)</span></p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 rounded-[1.5rem] pl-5 pr-5 p-3 gap-4 shadow-[0_4px_8px_rgba(0,0,0,0.2)] flex-1 content-center">
                    <div className="col-span-2 flex flex-col items-center justify-center gap-2 border-b-[var(--color-gray)] border-b border-dashed pb-2 mb-2">
                        <img className="w-8" src={docuemento} alt="doc" />
                        <p className="text-emerald-900 text-[0.8rem]">-- ENVIAR SOLICITUD --</p>
                    </div>
                    <div className="flex flex-col gap-3 pl-5 pr-5 p-2">
                        <div className="flex items-center gap-2"><img className="w-5" src={alimentos} alt="vaca" /><p className="text-[0.7rem]">ALIMENTOS</p></div>
                        <div className="flex items-center gap-2"><img className="w-5" src={vacuna} alt="cerdo" /><p className="text-[0.7rem]">VACUNA</p></div>
                    </div>
                    <div className="flex flex-col gap-3 pl-5 pr-5 p-2">
                        <div className="flex items-center gap-2"><img className="w-5" src={sanidad} alt="insumo" /><p className="text-[0.7rem]">SANIDAD</p></div>
                        <div className="flex items-center gap-2"><img className="w-5" src={herramienta} alt="herramienta" /><p className="text-[0.7rem]">HERRAMIENTAS</p></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- HERO 3: EVIDENCIAS ---
export const Hero3 = ({ fotos, rol, onSubirClick, onBorrarTodo, onBorrarUnaFoto }: any) => {
    return (
        <section className="w-full max-w-[80rem] mx-auto mt-[5rem]">
            <Carrusel fotos={fotos} rol={rol} onSubirClick={onSubirClick} onBorrarTodo={onBorrarTodo} onBorrarUnaFoto={onBorrarUnaFoto} />
        </section>
    )
}

// --- COMPONENTE PRINCIPAL ---
export const Admin = () => {
    // 1. Datos estáticos de las Cards
    const [ganadoStats] = useState<DatosCard>({ tipo1: "VACAS", cantidad1: 0, tipo2: "TOROS", cantidad2: 0, tipo3: "NOVILLOS", cantidad3: 0, tipo4: "TERNEROS", cantidad4: 0 });
    const [cerdosStats] = useState<DatosCard>({ tipo1: "VERRACOS", cantidad1: 0, tipo2: "CERDAS DE CRÍA", cantidad2: 0, tipo3: "LECHONES", cantidad3: 200, tipo4: "CERDOS DE CEBA", cantidad4: 0 });
    const [vacunasStats] = useState<DatosCard>({ tipo1: "GANADOS VACUNADOS", cantidad1: 0, tipo2: "CERDOS VACUNADOS", cantidad2: 0 });
    const [ventasStats] = useState<DatosCard>({ tipo1: "GANADOS VENDIDOS", cantidad1: 0, tipo2: "CERDOS VENDIDOS", cantidad2: 0 });
    
    const [pagosStats] = useState<DatosCard>({ tipo1: "NÓMINA TOTAL", cantidad1: "$ 12M", tipo2: "PENDIENTES", cantidad2: 0 });
    const [trabajoStats] = useState<DatosCard>({ tipo1: "HORAS TOTALES", cantidad1: 0, tipo2: "TAREAS COMPLETAS", cantidad2: 0 });
    const [trabajadoresStats] = useState<DatosCard>({ tipo1: "ACTIVOS", cantidad1: 0, tipo2: "POR CONTRATAR", cantidad2: 0 });
    const [comprasStats] = useState<DatosCard>({ tipo1: "INSUMOS MES", cantidad1: 0, tipo2: "MAQUINARIA", cantidad2: 0 });

    // 2. Hooks Personalizados
    const { 
        listaGanado, 
        isModalOpen: isGanadoOpen, 
        vista: vistaGanado, 
        sugerenciaId, 
        categoriaSeleccionada,
        abrirModal: abrirGanado, 
        cerrarModal: cerrarGanado, 
        cambiarVista: setVistaGanado, 
        setCategoriaSeleccionada: setCatGanado, 
        guardarAnimal: guardarGanado 
    } = useGanado([{ id: 1, oficial: "ICA-001", local: "VA-01", sexo: "HEMBRA", estado: "Sano" }]);

    const { 
        listaPagos, 
        isModalOpen: isPagosOpen, 
        vista: vistaPagos, 
        guardarPago, 
        cerrarModal: cerrarPagos, 
        setVista: setVistaPagos,
        abrirModal: abrirPagos
    } = useRegistrarPagos();

    const {
        listaTrabajos,
        isModalOpen: isTrabajoOpen,
        vista: vistaTrabajo,
        abrirModal: abrirTrabajo,
        cerrarModal: cerrarTrabajo,
        setVista: setVistaTrabajo,
        guardarTrabajo,
    } = useTrabajoRealizado();

    const { 
        listaCerdos, isModalOpen: isCerdosOpen, vista: vistaCerdos, categoriaCerdo,
        abrirModal: abrirCerdos, cerrarModal: cerrarCerdos, cambiarVista: setVistaCerdos, setCategoriaCerdo, guardarCerdo 
    } = useCerdos([{ id: 1, local: "C-01", oficial: "ICA-P01", sexo: "HEMBRA", estado: "Sano" }]);

    const { 
        listaVacunas, isModalOpen: isVacunasOpen, vista: vistaVacunas,
        abrirModal: abrirVacunas, cerrarModal: cerrarVacunas, cambiarVista: setVistaVacunas, guardarVacuna 
    } = useVacunas([{ id: 1, animal: "VA-01", vacuna: "Aftosa", fecha: "10/04/26", refuerzo: "10/10/26" }]);

    const { 
        listaVentas, isModalOpen: isVentasOpen, vista: vistaVentas,
        abrirModal: abrirVentas, cerrarModal: cerrarVentas, cambiarVista: setVistaVentas, guardarVenta 
    } = useVentas([{ id: 1, animal: "VA-05", cliente: "Feria Ganadera", fecha: "08/04/26", monto: "$ 4.500.000" }]);

    // 3. Lógica de Fotos y Modales
    const [listasFotos, setListasFotos] = useState<FotoEvidencia[]>(obtenerFotos());
    const [modalConfig, setModalConfig] = useState({ abierto: false, mensaje: "", accion: () => {} });

    const manejarSubida = (nuevaFoto: FotoEvidencia) => {
        const nuevas = [nuevaFoto, ...listasFotos];
        setListasFotos(nuevas);
        guardarFotos(nuevas);
    };

    const abrirModalBorrarTodo = () => {
        setModalConfig({
            abierto: true,
            mensaje: "Vas a eliminar todas las fotos de evidencia. Esta acción no se puede deshacer.",
            accion: () => { setListasFotos([]); guardarFotos([]); setModalConfig(prev => ({ ...prev, abierto: false })); }
        });
    };

    const abrirModalBorrarUna = (id: number) => {
        setModalConfig({
            abierto: true,
            mensaje: "Vas a eliminar esta foto de evidencia permanentemente.",
            accion: () => { 
                const filtradas = listasFotos.filter(f => f.id !== id);
                setListasFotos(filtradas); guardarFotos(filtradas); 
                setModalConfig(prev => ({ ...prev, abierto: false })); 
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen pb-20 font-[texto] justify-center">
            
            {/* Modal Principal de Ganado */}
            <ModalGenerico titulo={vistaGanado === 'lista' ? "CONTROL DE INVENTARIO" : "REGISTRO DE GANADO"} isOpen={isGanadoOpen} onClose={cerrarGanado} width="max-w-2xl">
                {vistaGanado === 'lista' ? (
                    <div className="flex flex-col gap-6">
                        <div className="overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase tracking-wider">
                                <thead className="bg-gray-50 text-gray-400">
                                    <tr><th className="p-3">ID LOCAL</th><th className="p-3">OFICIAL</th><th className="p-3">SEXO</th><th className="p-3">ESTADO</th></tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {listaGanado.map((animal) => (
                                        <tr key={animal.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="p-3 font-bold">{animal.local}</td>
                                            <td className="p-3">{animal.oficial}</td>
                                            <td className="p-3">{animal.sexo}</td>
                                            <td className="p-3"><span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full text-[9px]">{animal.estado}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => setVistaGanado('formulario')} className="bg-emerald-600 text-white py-3 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">+ Añadir Nuevo Animal</button>
                    </div>
                ) : (
                    <FormularioGanado listaGanado={listaGanado} sugerenciaId={sugerenciaId} categoriaSeleccionada={categoriaSeleccionada} setCategoria={setCatGanado} onGuardar={(animal: any) => guardarGanado(animal, true)} />                  
                )}
            </ModalGenerico>

            {/* Modal de Porcicultura */}
            <ModalGenerico titulo={vistaCerdos === 'lista' ? "INVENTARIO PORCINO" : "REGISTRAR CERDOS"} isOpen={isCerdosOpen} onClose={cerrarCerdos} width="max-w-2xl">
                {vistaCerdos === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-emerald-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-emerald-50 text-emerald-700">
                                    <tr><th className="p-3">ID LOCAL</th><th className="p-3">SEXO</th><th className="p-3">ESTADO</th></tr>
                                </thead>
                                <tbody>
                                    {listaCerdos.map((cerdo) => (
                                        <tr key={cerdo.id} className="border-t border-emerald-50">
                                            <td className="p-3 font-bold">{cerdo.local}</td>
                                            <td className="p-3">{cerdo.sexo}</td>
                                            <td className="p-3"><span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">{cerdo.estado}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => setVistaCerdos('formulario')} className="bg-emerald-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:shadow-emerald-200 transition-all">+ Registrar Nuevo Cerdo</button>
                    </div>
                ) : (
                    <FormularioCerdo sugerenciaId="C-02" categoriaSeleccionada={categoriaCerdo} setCategoria={setCategoriaCerdo} onGuardar={guardarCerdo} />
                )}
            </ModalGenerico>

            {/* Modal de Vacunas */}
            <ModalGenerico titulo={vistaVacunas === 'lista' ? "HISTORIAL DE VACUNACIÓN" : "REGISTRAR VACUNAS"} isOpen={isVacunasOpen} onClose={cerrarVacunas} width="max-w-2xl">
                {vistaVacunas === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-cyan-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-cyan-50 text-cyan-700">
                                    <tr><th className="p-3">ANIMAL</th><th className="p-3">VACUNA</th><th className="p-3">FECHA</th><th className="p-3">REFUERZO</th></tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {listaVacunas.map((v) => (
                                        <tr key={v.id} className="border-t border-cyan-50">
                                            <td className="p-3 font-bold">{v.animal}</td>
                                            <td className="p-3">{v.vacuna}</td>
                                            <td className="p-3">{v.fecha}</td>
                                            <td className="p-3 font-semibold text-orange-500">{v.refuerzo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => setVistaVacunas('formulario')} className="bg-cyan-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:shadow-cyan-200 transition-all">+ Registrar Nueva Aplicación</button>
                    </div>
                ) : (
                    <FormularioVacuna onGuardar={guardarVacuna} />
                )}
            </ModalGenerico>

            {/* Modal de Ventas */}
            <ModalGenerico titulo={vistaVentas === 'lista' ? "HISTORIAL DE VENTAS" : "REGISTRAR VENTAS"} isOpen={isVentasOpen} onClose={cerrarVentas} width="max-w-2xl">
                {vistaVentas === 'lista' ? (
                    <div className="flex flex-col gap-6 p-4">
                        <div className="overflow-hidden rounded-xl border border-orange-100 shadow-sm">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-orange-50 text-orange-700">
                                    <tr><th className="p-3">ID ANIMAL</th><th className="p-3">CLIENTE/VEND.</th><th className="p-3">FECHA</th><th className="p-3">MONTO TOTAL</th></tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    {listaVentas.map((v) => (
                                        <tr key={v.id} className="border-t border-orange-50 hover:bg-orange-50/30 transition-colors">
                                            <td className="p-3 font-bold">{v.animal}</td>
                                            <td className="p-3">{v.cliente}</td>
                                            <td className="p-3">{v.fecha}</td>
                                            <td className="p-3 font-bold text-emerald-600">{v.monto}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => setVistaVentas('formulario')} className="bg-orange-600 text-white py-3 rounded-full font-bold uppercase text-[10px] shadow-lg hover:bg-orange-700 transition-all">+ Generar Nueva Venta</button>
                    </div>
                ) : (
                    <FormularioVenta onGuardar={guardarVenta} />
                )}
            </ModalGenerico>

            {/* Modal de Pagos */}
            <ModalGenerico 
                isOpen={isPagosOpen} 
                onClose={cerrarPagos}
                titulo={vistaPagos === 'lista' ? "HISTORIAL DE PAGOS" : "REGISTRO DE PAGO"}
            >
                {vistaPagos === 'lista' ? (
                    <TablaHistorial 
                        datos={listaPagos} 
                        onNuevo={() => setVistaPagos('formulario')} 
                    />
                ) : (
                    <FormularioPago 
                        onGuardar={guardarPago} 
                        onCancelar={() => setVistaPagos('lista')} 
                    />
                )}
            </ModalGenerico>

            {/* Modal de Trabajo Realizado */}
            <ModalGenerico
                isOpen={isTrabajoOpen}
                onClose={cerrarTrabajo}
                titulo={vistaTrabajo === 'lista' ? "HISTORIAL DE TRABAJOS" : "REGISTRAR TRABAJO"}
            >
                {vistaTrabajo === 'lista' ? (
                    <div className="flex flex-col gap-4">
                        <div className="overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-left text-[11px] uppercase">
                                <thead className="bg-gray-50">
                                    <tr><th className="p-3">FECHA</th><th className="p-3">TRABAJADOR</th><th className="p-3">LABOR</th></tr>
                                </thead>
                                <tbody>
                                    {listaTrabajos.map((t: any) => (
                                        <tr key={t.id} className="border-t">
                                            <td className="p-3">{t.fecha}</td>
                                            <td className="p-3">{t.trabajador}</td>
                                            <td className="p-3">{t.labor}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => setVistaTrabajo('formulario')} className="bg-emerald-600 text-white py-2 rounded-full text-[10px] font-bold uppercase">Nuevo Registro</button>
                    </div>
                ) : (
                    <FormularioTrabajoRealizado 
                        onGuardar={guardarTrabajo} 
                        onCancelar={() => setVistaTrabajo('lista')} 
                    />
                )}
            </ModalGenerico>

            {/* Modal de Confirmación */}
            <Modal abierto={modalConfig.abierto} mensaje={modalConfig.mensaje} onConfirmar={modalConfig.accion} onCancelar={() => setModalConfig(prev => ({ ...prev, abierto: false }))} />

            <Encabezado id="admin" titulos="PANEL PRINCIPAL">
                <img src={admin2} alt="Fondo" className="w-full h-full object-cover object-center" />
            </Encabezado>

            <Hero 
                ganado={ganadoStats} cerdos={cerdosStats} vacunas={vacunasStats} ventas={ventasStats} 
                onRegGanadoClick={abrirGanado} onRegCerdosClick={abrirCerdos} onRegVacunasClick={abrirVacunas} onRegVentasClick={abrirVentas} 
            />
            
            <Hero2 
                pagos={pagosStats} trabajo={trabajoStats} trabajadores={trabajadoresStats} compras={comprasStats} 
                onRegPagosClick={abrirPagos}
                onRegTrabajoClick={abrirTrabajo}
            />
            
            <Hero3 fotos={listasFotos} rol="admin" onSubirClick={manejarSubida} onBorrarTodo={abrirModalBorrarTodo} onBorrarUnaFoto={abrirModalBorrarUna} />
        </div>
    );
};