import { Carrusel, type FotoEvidencia } from "../components/Carrusel";
import { CardRegistro } from "../pages/CardRegistro";

// Iconos Hero 1
import vaca from '../assets/imgs/icon_vaca.webp';
import cerdo from '../assets/imgs/icon_cerdo.webp';
import vacuna from '../assets/imgs/icon_vacuna.webp';
import venta from '../assets/imgs/icon_ventas.webp';

// Iconos Hero 2
import sack from '../assets/imgs/icon_sack.webp';
import martillo from '../assets/imgs/icon_martillo.webp';
import trabajador from '../assets/imgs/icon_trabajadores.webp';
import compra from '../assets/imgs/icon_compra.webp';
import docuemento from '../assets/imgs/icon_documento.webp';
import herramienta from '../assets/imgs/icon_herramienta.webp';
import insumo from '../assets/imgs/icon_insumo.webp';
import insumo2 from '../assets/imgs/icon_insumo2.webp';
import sol from '../assets/imgs/icon_sol.webp';
import luna from '../assets/imgs/icon_luna.webp';
import corral from '../assets/imgs/icon_corral.webp';
import alimentos from '../assets/imgs/icon_alimento.webp';
import sanidad from '../assets/imgs/icon_sanidad.webp';

// ─────────────────────────────────────────
// HERO 1 — GANADERÍA Y PORCICULTURA
// ─────────────────────────────────────────
export const Hero = ({ ganado, cerdos, vacunas, ventas, onRegGanadoClick, onRegCerdosClick, onRegVacunasClick, onRegVentasClick }: any) => {
    const cards = [
        { titulo: "REGISTRAR GANADO",  icono: vaca,   datos: ganado,  accion: onRegGanadoClick },
        { titulo: "REGISTRAR CERDOS",  icono: cerdo,  datos: cerdos,  accion: onRegCerdosClick },
        { titulo: "REGISTRAR VACUNAS", icono: vacuna, datos: vacunas, accion: onRegVacunasClick },
        { titulo: "REGISTRAR VENTAS",  icono: venta,  datos: ventas,  accion: onRegVentasClick },
    ];

    return (
        <section className="flex flex-col gap-8 shadow-[0_3px_15px_rgba(0,0,0,0.2)] mx-auto pl-20 pr-20 p-10 max-w-[80rem] rounded-[2rem] mt-40">
            <div className="text-center text-[var(--color-gray)] border-b-[var(--color-gray)] border-b-1 border-dashed pb-2 mb-2 w-full mx-auto max-w-100">
                <p className="text-[1.5rem]">GANADERÍA Y PORCICULTURA</p>
            </div>
            <div className="flex gap-8 justify-center">
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
};

// ─────────────────────────────────────────
// HERO 2 — ADMINISTRACIÓN Y LOGÍSTICA
// ─────────────────────────────────────────
export const Hero2 = ({ 
    pagos, trabajo, trabajadores, compras, 
    onRegPagosClick, 
    onRegTrabajoClick, 
    onRegTrabajadoresClick, 
    onRegComprasClick, 
    onRegFormatoPagoClick,
    onRegSolicitudClick,
    onRegConsumoClick,
    onVerInventarioClick
}: any) => {
    const cards = [
        { titulo: "REGISTRAR PAGOS",   icono: sack,      datos: pagos,        accion: onRegPagosClick },
        { titulo: "TRABAJO REALIZADO", icono: martillo,  datos: trabajo,      accion: onRegTrabajoClick },
        { titulo: "NUEVO TRABAJADOR",  icono: trabajador,datos: trabajadores, accion: onRegTrabajadoresClick },
        { titulo: "REGISTRAR COMPRA",  icono: compra,    datos: compras,      accion: onRegComprasClick },
        // Card SOLICITUDES ELIMINADA
    ];

    return (
        <section className="flex justify-center gap-15 mt-20 w-full px-10">

            {/* Cards izquierda */}
            <div className="flex flex-col gap-7 h-full min-h-[38rem] justify-between">
                {cards.map((card, idx) => (
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

            {/* Panel de Informes */}
            <div onClick={onRegFormatoPagoClick} className="flex flex-col gap-5 w-fit rounded-[2rem] shadow-[0_4px_8px_rgba(0,0,0,0.2)] pl-15 pr-15 p-10 h-full min-h-[38rem] cursor-pointer">
                <p className="text-[0.8rem] text-emerald-700">-- MÓDULO DE INFORMES --</p>
                <p className="text-[1.2rem] text-emerald-900 border-l-2 border-emerald-900 pl-3 text-[1.5rem]">
                    INFORME DE <br /> PAGOS <br /> REALIZADOS A LOS <br /> TRABAJADORES
                </p>
                <div className="flex flex-col gap-5 text-[0.8rem] text-[var(--color-gray)] mt-10">
                    <p>PODRÁ VER CON GRAN <br /> DETALLE: <br /> EL MONTO Y EL TRABAJO POR <br /> EL CUAL SE HA REALIZADO <br /> CUYO PAGO.</p>
                    <p>FECHA DE INICIO Y DE FINAL <br /> DEL TRABAJO REALIZADO.</p>
                    <p>NOMBRE COMPLETO, <br /> DOCUMENTO DE IDENTIDAD, <br /> TELÉFONO PERSONAL, <br /> DIRECCIÓN DE VIVIENDA Y <br /> EDAD DEL TRABAJADOR.</p>
                </div>
            </div>

            {/* Panel derecho — Solicitudes e Insumos */}
            <div className="flex flex-col gap-5 w-fit h-full">

                {/* Solicitud 1 - AHORA CLICKEABLE */}
                <div 
                    onClick={onRegSolicitudClick}
                    className="grid grid-cols-2 rounded-[1.5rem] pl-5 pr-5 p-3 shadow-[0_4px_8px_rgba(0,0,0,0.2)] flex-1 content-center cursor-pointer hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all duration-300"
                >
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

                {/* Consumos e Insumos */}
                <div 
                    onClick={onRegConsumoClick}
                    className="grid grid-cols-1 rounded-[1.5rem] pl-5 pr-5 p-3 gap-4 shadow-[0_4px_8px_rgba(0,0,0,0.2)] flex-1 content-center cursor-pointer hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all duration-300"
                >
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

                {/* Solicitud 2 - VER INVENTARIO (Desnudo) */}
                <div onClick={onVerInventarioClick} className="grid grid-cols-2 rounded-[1.5rem] pl-5 pr-5 p-3 gap-4 shadow-[0_4px_8px_rgba(0,0,0,0.2)] flex-1 content-center cursor-pointer hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all duration-300">
                    <div className="col-span-2 flex flex-col items-center justify-center gap-2 border-b-[var(--color-gray)] border-b border-dashed pb-2 mb-2">
                        <img className="w-8" src={docuemento} alt="doc" />
                        <p className="text-emerald-900 text-[0.8rem]">-- VER INVENTARIO --</p>
                    </div>
                    <div className="flex flex-col gap-3 pl-5 pr-5 p-2">
                        <div className="flex items-center gap-2"><img className="w-5" src={alimentos} alt="alimentos" /><p className="text-[0.7rem]">ALIMENTOS</p></div>
                        <div className="flex items-center gap-2"><img className="w-5" src={vacuna} alt="vacuna" /><p className="text-[0.7rem]">VACUNA</p></div>
                    </div>
                    <div className="flex flex-col gap-3 pl-5 pr-5 p-2">
                        <div className="flex items-center gap-2"><img className="w-5" src={sanidad} alt="sanidad" /><p className="text-[0.7rem]">SANIDAD</p></div>
                        <div className="flex items-center gap-2"><img className="w-5" src={herramienta} alt="herramienta" /><p className="text-[0.7rem]">HERRAMIENTAS</p></div>
                    </div>
                </div>

            </div>
        </section>
    );
};

// ─────────────────────────────────────────
// HERO 3 — EVIDENCIAS FOTOGRÁFICAS
// ─────────────────────────────────────────
export const Hero3 = ({ fotos, rol, onSubirClick, onBorrarTodo, onBorrarUnaFoto }: any) => {
    return (
        <section className="w-full max-w-[80rem] mx-auto mt-[5rem]">
            <Carrusel
                fotos={fotos}
                rol={rol}
                onSubirClick={onSubirClick}
                onBorrarTodo={onBorrarTodo}
                onBorrarUnaFoto={onBorrarUnaFoto}
            />
        </section>
    );
};