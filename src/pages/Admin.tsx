import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import encabezado from '../assets/imgs/Encabezado_admin.webp'
import { Imgs } from "../components/Imgs";
import casa from '../assets/imgs/icon_casa.webp'
import usuario from '../assets/imgs/icon_user.webp'
import reloj from '../assets/imgs/icon_reloj.webp'
import vaca from '../assets/imgs/icon_vaca.webp'
import cerdo from '../assets/imgs/icon_cerdo.webp'
import vacuna from '../assets/imgs/icon_vacuna.webp'
import venta from '../assets/imgs/icon_ventas.webp'
import sack from '../assets/imgs/icon_sack.webp'
import martillo from '../assets/imgs/icon_martillo.webp'
import trabajador from '../assets/imgs/icon_trabajadores.webp'
import compra from '../assets/imgs/icon_compra.webp'
import documento from '../assets/imgs/icon_documento.webp'
import consumo from '../assets/imgs/icon_alimento.webp'
import inventario from '../assets/imgs/icon_inventario.webp'
import alimentos from '../assets/imgs/icon_alimento.webp'
import herramientas from '../assets/imgs/icon_herramienta.webp'
import sanidad from '../assets/imgs/icon_sanidad.webp'
import admin2 from '../assets/imgs/admin.jpg'
import plantas from '../assets/imgs/PLANTAS.webp'
import { input } from "framer-motion/client";

// --- COMPONENTE REUTILIZABLE (MOLDE) ---
export const CardRegistro = ({ titulo, icono, datos }: any) => {
    return (
        <article className="flex border-1 rounded-[1.5rem] bg-white p-4 w-[15rem] min-h-[8rem] gap-4 justify-center shadow-sm">
            <div className="shrink-0">
                <img className="w-[2.5rem]" src={icono} alt={titulo} />
            </div>

            <div>
                <h1 className="mb-2 font-bold text-[12px] uppercase leading-tight">{titulo}</h1>
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase"> - {datos.cantidad1} {datos.tipo1}</p>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase"> - {datos.cantidad2} {datos.tipo2}</p>
                    
                    {datos.tipo3 && (
                        <p className="text-[11px] font-semibold text-gray-500 uppercase"> - {datos.cantidad3} {datos.tipo3}</p>
                    )}
                    {datos.tipo4 && (
                        <p className="text-[11px] font-semibold text-gray-500 uppercase"> - {datos.cantidad4} {datos.tipo4}</p>
                    )}
                </div>
            </div>
        </article>
    );
}

// --- ENCABEZADO (Solo visual) ---
export const Encabezado = () => {
    return ( 
        <div className="bg-white">
            <div className="w-full h-auto relative flex flex-col px-24 pt-32 overflow-hidden">
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-no-repeat blur-[3px] scale-110"
                    style={{ backgroundImage: `url(${admin2})` }}
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-white/100 to-white" />

                <div className="relative z-20 flex justify-between items-start w-full">
                    <div>
                        <h1 className="text-[85px] font-[texto] font-extrabold leading-[1] text-black tracking-[2px] uppercase">
                            BIENVENIDO<br /> ESTE ES EL<br /> PANEL PRINCIPAL
                        </h1>
                        <Imgs url={plantas} alt="Materas" estilos="!w-[30rem] h-auto mt-[5rem]" />
                    </div>

                    <div className="border-l-[5px] border-black pl-10 py-4 mt-8">
                        <ul className="space-y-4 text-[22px] font-bold text-gray-900/80">
                            <li>- Lidera con respeto</li>
                            <li>- Orden hoy, éxito mañana</li>
                            <li>- Registro al día, mente clara</li>
                            <li>- Claridad en las tareas</li>
                            <li>- Paciencia = Resultado</li>
                            <li>- Escucha sugerencias</li>
                            <li>- Tu calma guía el trabajo</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- HERO (Contenedor de tarjetas) ---    
export const Hero = ({ ganado, cerdos, vacunas, ventas }: any) => {
    return (
        <section className="flex flex-col gap-8 mt-20 border p-10 max-w-[80rem] rounded-[2rem]">
            <div className="">
            <p>GANADERÍA Y PORCICULTURA</p>
            </div>

            <div className="flex gap-6 justify-center">
            <CardRegistro titulo="REGISTRAR GANADO" icono={vaca} datos={ganado} />
            <CardRegistro titulo="REGISTRAR CERDOS" icono={cerdo} datos={cerdos} />
            <CardRegistro titulo="REGISTRAR VACUNAS" icono={vacuna} datos={vacunas} />
            <CardRegistro titulo="REGISTRAR VENTAS" icono={venta} datos={ventas} />
            </div>
        </section>
    );
}

// --- COMPONENTE PRINCIPAL ---
export const Admin = () => {
    const [ganado] = useState({
        tipo1: "VACAS", cantidad1: 98,
        tipo2: "TOROS", cantidad2: 15,
        tipo3: "NOVILLOS", cantidad3: 42,
        tipo4: "TERNEROS", cantidad4: 85
    });

    const [cerdos] = useState({
        tipo1: "VERRACOS", cantidad1: 110,
        tipo2: "CERDAS DE CRÍA", cantidad2: 112,
        tipo3: "LECHONES", cantidad3: 200,
        tipo4: "CERDOS DE CEBA", cantidad4: 150
    });

    const [vacunas] = useState({
        tipo1: "GANADOS VACUNADOS", cantidad1: 450,
        tipo2: "CERDOS VACUNADOS", cantidad2: 523,
    });

    const [ventas] = useState({
        tipo1: "GANADOS VENDIDOS", cantidad1: 234,
        tipo2: "CERDOS VENDIDOS", cantidad2: 356,
    });

    return (
        <div className="min-h-screen bg-white pb-20">
            <Encabezado />
            <Hero 
                ganado={ganado} 
                cerdos={cerdos} 
                vacunas={vacunas} 
                ventas={ventas} 
            />
        </div>
    )
}