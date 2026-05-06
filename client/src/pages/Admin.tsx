import { useState } from "react";

// Utilidades
import { useEvidencias } from "../hooks/useEvidencias";

// Hooks pecuarios
import { useGanado } from "../hooks/useGanado";
import { useCerdos } from "../hooks/useCerdos";
import { useVacunas } from "../hooks/useVacunas";
import { useVentas } from "../hooks/useVentas";

// Hooks generar PDF
import { useGenerarPagoPDF } from "../hooks/useGenerarPagoPDF";

// Hooks de personal
import { useRegistrarPagos } from "../hooks/useRegistrarPagos";
import { useTrabajoRealizado } from "../hooks/useTrabajoRealizado";
import { useNuevoTrabajador } from "../hooks/useNuevoTrabajador";
import { useRegistrarCompra } from "../hooks/useRegistrarCompra";

// Hooks de inventario
import { useSolicitudCompra } from "../hooks/useSolicitudCompra";
import { useConsumoInsumos } from "../hooks/useConsumoInsumos";
import { useInventario } from "../hooks/useInventario";

// Componentes de layout
import { Encabezado } from "../components/Encabezado";
import { Modal } from "../components/Modal";

// Heroes
import { Hero, Hero2, Hero3 } from "../components/Heroes";

// Modales
import { AdminModales } from "../components/AdminModales";

// Iconos
import admin2 from '../assets/imgs/aguila.webp';

export const Admin = () => {

    // ============================================================
    // HOOKS PECUARIOS
    // ============================================================
    const ganado = useGanado() as any;
    const cerdos = useCerdos() as any;
    const vacunas = useVacunas() as any;
    const ventas = useVentas() as any;

    // ============================================================
    // HOOKS DE PERSONAL
    // ============================================================
    const pagos = useRegistrarPagos() as any;
    const trabajo = useTrabajoRealizado() as any;
    const trabajadores = useNuevoTrabajador() as any;
    const compras = useRegistrarCompra() as any;
    const generarPDF = useGenerarPagoPDF() as any;

    // ============================================================
    // HOOKS DE INVENTARIO
    // ============================================================
    const solicitudCompra = useSolicitudCompra() as any;
    const consumoInsumos = useConsumoInsumos() as any;
    const inventario = useInventario() as any;

    // ============================================================
    // HOOK DE EVIDENCIAS
    // ============================================================
    const {
        listasFotos: todasLasFotos,
        manejarSubida,
        abrirModalBorrarUna,
        abrirModalBorrarTodo,
        modalConfig,
        cerrarModal,
        toggleLike,
        recargar: recargarFotos
    } = useEvidencias();

    const fotosVisibles = todasLasFotos;

    // ============================================================
    // ESTADO PARA MODAL DE INVENTARIO
    // ============================================================
    const [isInventarioOpen, setIsInventarioOpen] = useState(false);

    // ============================================================
    // MANEJADORES
    // ============================================================
    const handleVerInventarioClick = () => {
        inventario.recargar();
        setIsInventarioOpen(true);
    };

    // 🔧 CORREGIDO: Cuando el admin sube la foto y la asocia a un pago,
    // el estado pasa a "Pendiente de firma" — NO a "Pagado con firma".
    // "Pagado con firma" SOLO ocurre cuando el boss da like en el carrusel.
    const handleConfirmarPagoConFirma = async (idPago: number) => {
        try {
            const pago = pagos.listaPagos?.find((p: any) => p.id_pago === idPago);
            if (pago && pago.estado_pago !== 'Pagado con firma') {
                await pagos.guardarPago({
                    id_pago: idPago,
                    estado_pago: 'Pendiente de firma', // ← antes decía 'Pagado con firma'
                    accion: 'actualizar'
                }, false); // ← false para no cerrar el modal
                console.log(`⏳ Pago ${idPago} → "Pendiente de firma" (esperando aprobación del Dueño)`);
                await pagos.recargarLista();
            }
        } catch (error) {
            console.error("Error al actualizar estado del pago:", error);
            alert("Error al actualizar el estado del pago");
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-20 font-[texto] justify-center">

            {/* ============================================================ */}
            {/* MODALES PECUARIOS Y DE PERSONAL */}
            {/* ============================================================ */}
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
                registrarCompra={compras}
                isInventarioOpen={isInventarioOpen}
                onCloseInventario={() => setIsInventarioOpen(false)}
            />

            {/* ============================================================ */}
            {/* MODAL DE CONFIRMACIÓN */}
            {/* ============================================================ */}
            <Modal
                abierto={modalConfig.abierto}
                mensaje={modalConfig.mensaje}
                onConfirmar={modalConfig.accion}
                onCancelar={cerrarModal}
            />

            {/* ============================================================ */}
            {/* ENCABEZADO */}
            {/* ============================================================ */}
            <Encabezado id="admin" titulo="PANEL PRINCIPAL">
                <img src={admin2} alt="Fondo" className="w-full h-full object-cover object-center" />
            </Encabezado>

            {/* ============================================================ */}
            {/* HERO 1 — GANADERÍA Y PORCICULTURA */}
            {/* ============================================================ */}
            <Hero
                ganado={ganado.stats}
                cerdos={cerdos.stats}
                vacunas={vacunas.stats}
                ventas={ventas.stats}
                onRegGanadoClick={ganado.abrirModal}
                onRegCerdosClick={cerdos.abrirModal}
                onRegVacunasClick={vacunas.abrirModal}
                onRegVentasClick={ventas.abrirModal}
            />

            {/* ============================================================ */}
            {/* HERO 2 — ADMINISTRACIÓN Y LOGÍSTICA */}
            {/* ============================================================ */}
            <Hero2
                pagos={pagos.stats}
                trabajo={trabajo.stats}
                trabajadores={trabajadores.stats}
                compras={compras.stats}
                onRegPagosClick={pagos.abrirModal}
                onRegTrabajoClick={trabajo.abrirModal}
                onRegTrabajadoresClick={trabajadores.abrirModal}
                onRegComprasClick={compras.abrirModal}
                onRegFormatoPagoClick={generarPDF.abrirModal}
                onRegSolicitudClick={solicitudCompra.abrirModal}
                onRegConsumoClick={consumoInsumos.abrirModal}
                onVerInventarioClick={handleVerInventarioClick}
            />

            {/* ============================================================ */}
            {/* HERO 3 — EVIDENCIAS */}
            {/* ============================================================ */}
            <Hero3
                fotos={fotosVisibles}
                rol="admin"
                pagosPendientes={pagos.listaPagos || []}
                onSubirClick={manejarSubida}
                onBorrarTodo={abrirModalBorrarTodo}
                onBorrarUnaFoto={abrirModalBorrarUna}
                onConfirmarPago={handleConfirmarPagoConFirma}
                onToggleLike={toggleLike}
            />

        </div>
    );
};