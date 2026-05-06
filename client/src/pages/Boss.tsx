import { useEffect, useState } from "react";
import { Encabezado } from "../components/Encabezado";
import { useNavigate } from "react-router-dom";
import { BarraFiltros } from "../components/BarraFiltros";
import { Hero1 } from "../components/Hero1";
import { Hero2 } from "../components/Hero2";
import { Hero3 } from "../components/Hero3";
import { useBossData } from "../hooks/useBossData";
import { useEvidencias } from "../hooks/useEvidencias";
import toro from "../assets/imgs/TORO_IMG.webp";

const MOCK_FILTROS = ["ESTE MES", "MES PASADO", "SEIS MESES", "UN AÑO ATRÁS"];

export const Boss = () => {
    const navigate = useNavigate();
    const { data, loading, error, refetch } = useBossData();
    const { listasFotos: todasLasFotos, toggleLike } = useEvidencias();
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const formatearCOPcsv = (valor: number): string => {
        if (valor === 0) return '0';
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(valor);
    };

    const gastosPorSector = data?.gastos_por_sector || [];
    const datosGraficaBarras = data?.grafica_ganancias || [];

    const dashboard = {
        ganancias: { 
            tipo1: "TOTAL VENTAS", 
            cantidad1: data?.ganancias?.total_ventas || 0 
        },
        inversion: { 
            tipo1: "TOTAL INVERSIÓN", 
            cantidad1: data?.ganancias?.total_inversion || 0 
        },
        gastosPorSector: gastosPorSector,
        // 🔧 AGREGADO: usa insumos_vencimiento para días y lista de alertas
        // insumos_criticos sigue siendo el conteo (no se toca)
        insumosCriticos: {
            dias: data?.supervision?.insumos_vencimiento?.dias_proximos ?? 0,
            titulo: "Insumos Críticos",
            lista: data?.supervision?.insumos_vencimiento?.lista ?? [],
        },
        pagosTrabajadores: {
            titulo: `Pagado: ${formatearCOPcsv(data?.supervision?.pagos_trabajadores?.total_pagado || 0)}`,
            lista: new Array(data?.supervision?.pagos_trabajadores?.num_pagos || 0).fill("")
        },
        trabajadoresActivos: {
            titulo: "Trabajadores",
            lista: data?.supervision?.trabajadores_activos?.lista || []
        },
        filtrosDisponibles: Array.isArray(data?.filtrosDisponibles) ? data.filtrosDisponibles : MOCK_FILTROS,
    };

    const datosParaArchivo = [
        { fecha: new Date().toLocaleDateString(), categoria: "FINANCIERO", concepto: "TOTAL VENTAS", valor: formatearCOPcsv(dashboard.ganancias.cantidad1), notas: "Ganancias del período" },
        { fecha: new Date().toLocaleDateString(), categoria: "FINANCIERO", concepto: "TOTAL INVERSIÓN", valor: formatearCOPcsv(dashboard.inversion.cantidad1), notas: "Gastos del período" },
        { fecha: new Date().toLocaleDateString(), categoria: "FINANCIERO", concepto: "BALANCE NETO", valor: formatearCOPcsv(dashboard.ganancias.cantidad1 - dashboard.inversion.cantidad1), notas: "Ganancia - Inversión" },
        ...(Array.isArray(dashboard.gastosPorSector) ? dashboard.gastosPorSector.map(sector => ({
            fecha: new Date().toLocaleDateString(),
            categoria: "GASTO POR SECTOR",
            concepto: sector?.name || "Sector sin nombre",
            valor: formatearCOPcsv(sector?.valor || 0),
            notas: sector?.detalle || ""
        })) : []),
        { fecha: new Date().toLocaleDateString(), categoria: "SUPERVISIÓN", concepto: "Insumos Críticos", valor: (data?.supervision?.insumos_criticos || 0).toString(), notas: "Insumos por debajo del mínimo" },
        { fecha: new Date().toLocaleDateString(), categoria: "SUPERVISIÓN", concepto: "Total Pagado a Trabajadores", valor: formatearCOPcsv(data?.supervision?.pagos_trabajadores?.total_pagado || 0), notas: "Pagos realizados en el período" },
        { fecha: new Date().toLocaleDateString(), categoria: "SUPERVISIÓN", concepto: "Trabajadores Activos", valor: dashboard.trabajadoresActivos.lista.length.toString(), notas: "Personal actualmente activo" },
    ];

    const handleFiltrar = (filtro: string, fechaInicio?: Date, fechaFin?: Date) => {
        console.log("Filtrar por:", filtro, fechaInicio, fechaFin);
        
        if (filtro === "RANGO_PERSONALIZADO" && fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio);
            inicio.setHours(0, 0, 0, 0);
            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);
            refetch(filtro, inicio, fin);
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
        <div id="boss-report" className="font-[texto] bg-[#ffffff] min-h-screen">
            <Encabezado estilos="" titulo="PROPIETARIO" id="boss" subtitulo="AQUÍ TIENES EL PULSO DE TU FINCA HOY...">
                <img src={toro} alt="Fondo Toro" className="w-full h-full block object-center object-cover" />
            </Encabezado>
            
            <BarraFiltros onFiltrar={handleFiltrar} />
            
            <Hero1 
                ganancias={dashboard.ganancias}
                inversion={dashboard.inversion}
                gastosPorSector={dashboard.gastosPorSector}
                datosGrafica={datosGraficaBarras}
            />
            
            <Hero2 
                insumos={dashboard.insumosCriticos}
                pagos={dashboard.pagosTrabajadores}
                trabajadoresactivos={dashboard.trabajadoresActivos}
                esBoss={true}
            />
            
            <Hero3 
                datosExportar={datosParaArchivo} 
                fotos={todasLasFotos}
                rol="boss"
                onToggleLike={toggleLike}
            />
        </div>
    );
};