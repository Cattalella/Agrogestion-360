import { useState } from "react";

// Utilidades
import { useFotosStorage } from "../utils/storage";

// Hooks pecuarios
import { useGanado } from "../hooks/useGanado";
import { useCerdos } from "../hooks/useCerdos";
import { useVacunas } from "../hooks/useVacunas";
import { useVentas } from "../hooks/useVentas";

// ── HOOKS GENERAR PDF ──
import { useGenerarPagoPDF } from "../hooks/useGenerarPagoPDF";

// Hooks de personal
import { useRegistrarPagos } from "../hooks/useRegistrarPagos";
import { useTrabajoRealizado } from "../hooks/useTrabajoRealizado";
import { useNuevoTrabajador } from "../hooks/useNuevoTrabajador";
import { useRegistrarCompra } from "../hooks/useRegistrarCompra";

import { useSolicitudCompra } from "../hooks/useSolicitudCompra";
import { useConsumoInsumos } from "../hooks/useConsumoInsumos";

// Componentes de layout
import { Encabezado } from "../components/Encabezado";
import { Modal } from "../components/Modal";
import { type FotoEvidencia } from "../components/Carrusel";

// Heroes
import { Hero, Hero2, Hero3 } from "../components/Heroes";

// Modales
import { AdminModales } from "../components/AdminModales";

// Tipos
import { type DatosCard } from "../types/admin";

// Iconos
import admin2 from '../assets/imgs/aguila.webp';

export const Admin = () => {

    // ── STATS DE CARDS ──
    const [ganadoStats] = useState<DatosCard>({ tipo1: "VACAS", cantidad1: 0, tipo2: "TOROS", cantidad2: 0, tipo3: "NOVILLOS", cantidad3: 0, tipo4: "TERNEROS", cantidad4: 0 });
    const [cerdosStats] = useState<DatosCard>({ tipo1: "VERRACOS", cantidad1: 0, tipo2: "CERDAS DE CRÍA", cantidad2: 0, tipo3: "LECHONES", cantidad3: 200, tipo4: "CERDOS DE CEBA", cantidad4: 0 });
    const [vacunasStats] = useState<DatosCard>({ tipo1: "GANADOS VACUNADOS", cantidad1: 0, tipo2: "CERDOS VACUNADOS", cantidad2: 0 });
    const [ventasStats] = useState<DatosCard>({ tipo1: "GANADOS VENDIDOS", cantidad1: 0, tipo2: "CERDOS VENDIDOS", cantidad2: 0 });
    const [pagosStats] = useState<DatosCard>({ tipo1: "NÓMINA TOTAL", cantidad1: "$ 12M", tipo2: "PENDIENTES", cantidad2: 0 });
    const [trabajoStats] = useState<DatosCard>({ tipo1: "HORAS TOTALES", cantidad1: 0, tipo2: "TAREAS COMPLETAS", cantidad2: 0 });
    const [trabajadoresStats] = useState<DatosCard>({ tipo1: "ACTIVOS", cantidad1: 0, tipo2: "POR CONTRATAR", cantidad2: 0 });
    const [comprasStats] = useState<DatosCard>({ tipo1: "INSUMOS MES", cantidad1: 0, tipo2: "MAQUINARIA", cantidad2: 0 });

    // ── HOOKS PECUARIOS ──
    const ganado   = useGanado([{ id: 1, oficial: "ICA-001", local: "VA-01", sexo: "HEMBRA", estado: "Sano" }]);
    const cerdos   = useCerdos([{ id: 1, local: "C-01", oficial: "ICA-P01", sexo: "HEMBRA", estado: "Sano" }]);
    const vacunas  = useVacunas([{ id: 1, animal: "VA-01", vacuna: "Aftosa", fecha: "10/04/26", refuerzo: "10/10/26" }]);
    const ventas   = useVentas([{ id: 1, animal: "VA-05", cliente: "Feria Ganadera", fecha: "08/04/26", monto: "$ 4.500.000" }]);

    // ── HOOKS DE PERSONAL ──
    const pagos = useRegistrarPagos([{ 
        id: 1, 
        id_trabajador: "TR-01", 
        tipo_trabajo: "Mantenimiento",
        fecha_pago: "2026-04-10",
        monto_total: 500000,
        concepto: "Pago semanal",
        estado: "No pagado",
        contabilizado: false,
        anulado: false 
    }]);

    const trabajo = useTrabajoRealizado();
    const trabajadores = useNuevoTrabajador();
    const compras = useRegistrarCompra();
    const generarPDF = useGenerarPagoPDF();
    
    // ── NUEVO HOOK SOLICITUD COMPRA Y CONSUMOS ──
    const solicitudCompra = useSolicitudCompra([]);
    const consumoInsumos = useConsumoInsumos([]);

    // ── FOTOS Y EVIDENCIAS ──
    const [listasFotos, setListasFotos] = useFotosStorage();
    const [modalConfig, setModalConfig] = useState({ abierto: false, mensaje: "", accion: () => {} });

    const manejarSubida = (nuevaFoto: FotoEvidencia) => {
        const nuevas = [nuevaFoto, ...listasFotos];
        setListasFotos(nuevas);
    };

    const abrirModalBorrarTodo = () => {
        setModalConfig({
            abierto: true,
            mensaje: "Vas a eliminar todas las fotos de evidencia. Esta acción no se puede deshacer.",
            accion: () => {
                setListasFotos([]);
                setModalConfig(prev => ({ ...prev, abierto: false }));
            }
        });
    };

    const abrirModalBorrarUna = (id: number) => {
        setModalConfig({   
            abierto: true,
            mensaje: "Vas a eliminar esta foto de evidencia permanentemente.",
            accion: () => {
                const filtradas = listasFotos.filter(f => f.id !== id);
                setListasFotos(filtradas);
                setModalConfig(prev => ({ ...prev, abierto: false }));
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen pb-20 font-[texto] justify-center">

            {/* Modales pecuarios y de personal */}
            <AdminModales
                ganado={ganado}
                cerdos={cerdos}
                vacunas={vacunas}
                ventas={ventas}
                pagos={pagos}
                trabajo={trabajo}
                trabajadores={trabajadores}
                compras={compras}
                generarPDF={generarPDF}
                solicitudCompra={solicitudCompra}
                consumoInsumos={consumoInsumos}
            />

            {/* Modal de confirmación (borrar fotos) */}
            <Modal
                abierto={modalConfig.abierto}
                mensaje={modalConfig.mensaje}
                onConfirmar={modalConfig.accion}
                onCancelar={() => setModalConfig(prev => ({ ...prev, abierto: false }))}
            />

            {/* Encabezado */}
            <Encabezado id="admin" titulos="PANEL PRINCIPAL">
                <img src={admin2} alt="Fondo" className="w-full h-full object-cover object-center" />
            </Encabezado>

            {/* Hero 1 — Ganadería y Porcicultura */}
            <Hero
                ganado={ganadoStats}
                cerdos={cerdosStats}
                vacunas={vacunasStats}
                ventas={ventasStats}
                onRegGanadoClick={ganado.abrirModal}
                onRegCerdosClick={cerdos.abrirModal}
                onRegVacunasClick={vacunas.abrirModal}
                onRegVentasClick={ventas.abrirModal}
            />

            {/* Hero 2 — Administración y Logística */}
            <Hero2
                pagos={pagosStats}
                trabajo={trabajoStats}
                trabajadores={trabajadoresStats}
                compras={comprasStats}
                onRegPagosClick={pagos.abrirModal}
                onRegTrabajoClick={trabajo.abrirModal}
                onRegTrabajadoresClick={trabajadores.abrirModal}
                onRegComprasClick={compras.abrirModal}
                onRegFormatoPagoClick={generarPDF.abrirModal}
                onRegSolicitudClick={solicitudCompra.abrirModal}
                onRegConsumoClick={consumoInsumos.abrirModal}
            />

            {/* Hero 3 — Evidencias */}
            <Hero3
                fotos={listasFotos}
                rol="admin"
                onSubirClick={manejarSubida}
                onBorrarTodo={abrirModalBorrarTodo}
                onBorrarUnaFoto={abrirModalBorrarUna}
            />

        </div>
    );
};