// src/pages/Boss.tsx
import { useEffect } from "react";
import { Encabezado } from "../components/Encabezado";
import { useNavigate } from "react-router-dom";
import { BarraFiltros } from "../components/BarraFiltros";
import { Hero1 } from "../components/Hero1";
import { Hero2 } from "../components/Hero2";
import { Hero3 } from "../components/Hero3";
import { useBossData } from "../hooks/useBossData";
import toro from "../assets/imgs/TORO_IMG.webp";

// ============================================================
// 📌 DATOS DE EJEMPLO (MOCK) - SIEMPRE DISPONIBLES
// ============================================================
const MOCK_GASTOS_SECTOR = [
    { name: "PORCICULTURA", valor: 2, color: "#10b981", detalle: "Ene: 1M | Feb: 1M" },
    { name: "GANADERÍA", valor: 2, color: "#8b5cf6", detalle: "Ene: 1M | Feb: 1M" },
    { name: "tt", valor: 2, color: "#f43f5e", detalle: "Ene: 1M | Feb: 1M" },
];

const MOCK_FILTROS = ["ESTE MES", "SEIS MESES", "UN AÑO ATRÁS"];

export const Boss = () => {
    const navigate = useNavigate();
    const { data, loading, error, refetch } = useBossData();
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    // Datos seguros: siempre tienen las propiedades necesarias
    const dashboard = {
        ganancias: data?.ganancias || { tipo1: "GANANCIA NETA", cantidad1: 0 },
        inversion: data?.inversion || { tipo1: "INVERSIÓN", cantidad1: 0 },
        gastosPorSector: data?.gastosPorSector || MOCK_GASTOS_SECTOR,
        insumosCriticos: data?.insumosCriticos || { dias: 0, titulo: "Insumos Críticos", lista: [] },
        pagosTrabajadores: data?.pagosTrabajadores || { titulo: "", lista: [] },
        trabajadoresActivos: data?.trabajadoresActivos || { titulo: "PERSONAL", lista: [] },
        filtrosDisponibles: data?.filtrosDisponibles || MOCK_FILTROS,
    };

    // Datos para el reporte exportable
    const datosParaArchivo = [
        { item: "Ganancias Netas", valor: dashboard.ganancias.cantidad1 },
        { item: "Inversión Total", valor: dashboard.inversion.cantidad1 },
        { item: "Total Trabajadores", valor: dashboard.trabajadoresActivos.lista.length },
        { item: "Insumos por Vencer", valor: dashboard.insumosCriticos.lista.length }
    ];

    const handleFiltrar = (filtro: string) => {
        console.log("Filtrar por:", filtro);
        if (filtro === "RESETEAR") {
            refetch();
        } else {
            refetch(filtro);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando datos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        console.warn("Error en backend, usando datos mock:", error);
    }

    return (
        <div id="boss-report" className="font-[texto] bg-[#fafafa] min-h-screen">
            <Encabezado estilos="" titulo="PROPIETARIO" id="boss" subtitulo="AQUÍ TIENES EL PULSO DE TU FINCA HOY...">
                <img src={toro} alt="Fondo Toro" className="w-full h-full block object-center object-cover" />
            </Encabezado>
            
            <BarraFiltros 
                onFiltrar={handleFiltrar}
                filtrosDisponibles={dashboard.filtrosDisponibles}
            />
            
            <Hero1 
                ganancias={dashboard.ganancias}
                inversion={dashboard.inversion}
                gastosPorSector={dashboard.gastosPorSector}
            />
            
            <Hero2 
                insumos={dashboard.insumosCriticos}
                pagos={dashboard.pagosTrabajadores}
                trabajadoresactivos={dashboard.trabajadoresActivos}
            />
            
            <Hero3 datosExportar={datosParaArchivo} />
        </div>
    );
};