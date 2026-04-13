import { useState, useEffect } from "react";
import { Encabezado } from "../components/Encabezado";
import { useNavigate } from "react-router-dom";
import { BarraFiltros } from "../components/BarraFiltros";
import { Hero1 } from "../components/Hero1";
import { Hero2 } from "../components/Hero2";
import { Hero3 } from "../components/Hero3";
import toro from "../assets/imgs/TORO_IMG.webp";

// --- COMPONENTE CONTENEDOR PRINCIPAL --- 
export const Boss = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

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
            <BarraFiltros />
            <Hero1 ganancias={ganancias} inversion={inversion} />
            <Hero2 
                insumos={datosInsumos} 
                pagos={datosPagos} 
                trabajadoresactivos={datosTrabajadoresactivos} 
            />
            <Hero3 datosExportar={datosParaArchivo} />
        </div>
    );
};