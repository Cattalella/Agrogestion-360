import { useState } from "react";

// Utilidades
import { useFotosStorage } from "../utils/useFotosStorage";

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
import { type FotoEvidencia } from "../components/Carrusel";

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
    // HOOK DE FOTOS
    // ============================================================
    const { 
        fotos: todasLasFotos, 
        agregarFoto, 
        eliminarFoto, 
        eliminarTodasFotos, 
        toggleLike 
    } = useFotosStorage();

    // Filtrar solo fotos de trabajo realizado
    const fotosTrabajo = todasLasFotos.filter(f => f.origen === 'trabajo');

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

    // 🆕 Función para confirmar pago con firma (cuando se sube la foto)
    const handleConfirmarPagoConFirma = async (idPago: number) => {
        try {
            // Buscar el pago en la lista
            const pago = pagos.listaPagos?.find((p: any) => p.id_pago === idPago);
            if (pago && pago.estado_pago !== 'Pagado con firma') {
                // Actualizar el estado del pago
                await pagos.guardarPago({
                    ...pago,
                    estado_pago: 'Pagado con firma',
                    accion: 'actualizar'
                }, true);
                console.log(`✅ Pago ${idPago} marcado como Pagado con firma`);
                // Recargar la lista de pagos
                await pagos.recargarLista();
            }
        } catch (error) {
            console.error("Error al confirmar pago:", error);
        }
    };

    // ============================================================
    // MODAL DE CONFIRMACIÓN (BORRAR FOTOS)
    // ============================================================
    const [modalConfig, setModalConfig] = useState({ abierto: false, mensaje: "", accion: () => {} });

    const manejarSubida = (nuevaFoto: FotoEvidencia) => {
        console.log("📸 Nueva foto subida:", nuevaFoto);
        agregarFoto(nuevaFoto);
    };

    const abrirModalBorrarTodo = () => {
        setModalConfig({
            abierto: true,
            mensaje: "Vas a eliminar todas las fotos de evidencia. Esta acción no se puede deshacer.",
            accion: () => {
                eliminarTodasFotos();
                setModalConfig(prev => ({ ...prev, abierto: false }));
            }
        });
    };

    const abrirModalBorrarUna = (id: number) => {
        setModalConfig({   
            abierto: true,
            mensaje: "Vas a eliminar esta foto de evidencia permanentemente.",
            accion: () => {
                eliminarFoto(id);
                setModalConfig(prev => ({ ...prev, abierto: false }));
            }
        });
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
            {/* MODAL DE CONFIRMACIÓN (BORRAR FOTOS) */}
            {/* ============================================================ */}
            <Modal
                abierto={modalConfig.abierto}
                mensaje={modalConfig.mensaje}
                onConfirmar={modalConfig.accion}
                onCancelar={() => setModalConfig(prev => ({ ...prev, abierto: false }))}
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
                fotos={fotosTrabajo}
                rol="admin"
                pagosPendientes={pagos.listaPagos || []}
                onSubirClick={manejarSubida}
                onBorrarTodo={abrirModalBorrarTodo}
                onBorrarUnaFoto={abrirModalBorrarUna}
                onConfirmarPago={handleConfirmarPagoConFirma}
            />

        </div>
    );
};