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
import admin2 from '../assets/imgs/aguila.webp'
import { input, section } from "framer-motion/client";

// --- COMPONENTE REUTILIZABLE (MOLDE) ---
export const CardRegistro = ({ titulo, icono, datos }: any) => {
    return (
        <article className="flex border-1 rounded-[1.5rem] bg-white p-4 w-[17rem] min-h-[8rem] gap-4 justify-center shadow-sm">
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
        <div className="relative w-full overflow-hidden bg-white flex justify-end">
            
            {/* 2. LA IMAGEN COMPLETA */}
            {/* Al no ponerle 'absolute', esta imagen es la que manda en el TAMAÑO del contenedor. */}
            {/* Si quieres que el ave se vea más grande, solo sube el 'w-[1200px]' o lo que necesites */}
            <img 
                src={admin2} 
                alt="Fondo Águila" 
                className=" w-full h-auto block object-contain max-w-[60rem]" 
            />

            {/* 3. EL TEXTO ENCIMA */}
            {/* 'absolute' con 'inset-0' para que cubra toda la imagen y podamos posicionar el texto */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center p-10">
                
                <h1 className="text-[5rem] font-black leading-[1] text-black uppercase">
                    BIENVENIDO<br /> 
                    ESTE ES EL<br /> 
                    PANEL PRINCIPAL
                </h1>

                {/* Si quieres que el texto suba o baje, cambia 'justify-center' por 'justify-start' o 'pt-20' */}
            </div>

        </div>
    );
}

// --- HERO (Contenedor de tarjetas) ---    
export const Hero = ({ ganado, cerdos, vacunas, ventas }: any) => {
    return (
        <section className="flex flex-col gap-8 mt-20 border mx-auto p-10 max-w-[80rem] rounded-[2rem]">
            <div className="text-center font-[texto] text-[var(--color-gray)]">
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

// -- Hero 2 --
export const Hero2 = () => {
    return (
        <section className="flex font-[texto] max-w-[80rem] mx-auto mt-15">

            <div className=""> {/* Izquierda */}
            <article className="flex border rounded-[3rem] p-4 pl-9 pr-9 gap-5"> 
                <img className="w-13 self-center object-contain" src={sack} alt="Bolsa de dinero" />
                <div className="">
                    <p className="font-medium text-amber-950 text-[1.4rem] leading-6">REGISTAR <br /> PAGOS </p>
                    <p className="mt-2 text-[var(--color-gray)] leading-5">Pagos a <br /> trabajadores </p>
                </div>
            </article>
            
            </div>

        </section>
    )
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
            <Hero2 />
        </div>
    )
}