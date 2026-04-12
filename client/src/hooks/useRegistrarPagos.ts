import { useState } from "react";

// ─────────────────────────────────────────
// TIPOS — RI. 8.1.1
// ─────────────────────────────────────────
export type EstadoPago = "Pagado con firma" | "Pendiente de firma" | "No pagado";

export interface Pago {
    id: number;
    id_trabajador: string;
    tipo_trabajo: string;
    fecha_pago: string;
    monto_total: number;
    concepto: string;
    estado: EstadoPago;
    contabilizado: boolean;
    anulado: boolean;
    justificacion_anulacion?: string;
}

type Vista = 'lista' | 'formulario';

export const useRegistrarPagos = (inicial: Pago[] = []) => {

    const [listaPagos, setListaPagos] = useState<Pago[]>(inicial);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [pagoAEditar, setPagoAEditar] = useState<Pago | null>(null);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setPagoAEditar(null);
        setVista('lista');
    };

    // ✅ NUEVO: cambiarVista para usar en AdminModales
    const cambiarVista = (nuevaVista: Vista) => {
        setVista(nuevaVista);
    };

    const guardarPago = (datos: Omit<Pago, 'id' | 'contabilizado' | 'anulado'>, cerrar: boolean) => {
        if (pagoAEditar) {
            if (pagoAEditar.contabilizado) {
                alert("Este pago ya fue contabilizado y no puede editarse.");
                return;
            }
            setListaPagos(prev =>
                prev.map(p => p.id === pagoAEditar.id ? { ...p, ...datos } : p)
            );
            setPagoAEditar(null);
        } else {
            const nuevo: Pago = {
                ...datos,
                id: Date.now(),
                contabilizado: false,
                anulado: false,
            };
            setListaPagos(prev => [nuevo, ...prev]);
        }

        if (cerrar) {
            cerrarModal();
        } else {
            setVista('lista');
        }
    };

    const editarPago = (pago: Pago) => {
        if (pago.contabilizado) {
            alert("Este pago ya fue contabilizado y no puede editarse.");
            return;
        }
        setPagoAEditar(pago);
        setVista('formulario');
    };

    const anularPago = (id: number, justificacion: string) => {
        if (!justificacion.trim()) {
            alert("Debes ingresar una justificación para anular el pago.");
            return;
        }
        setListaPagos(prev =>
            prev.map(p => p.id === id
                ? { ...p, anulado: true, justificacion_anulacion: justificacion }
                : p
            )
        );
    };

    const contabilizarPago = (id: number) => {
        setListaPagos(prev =>
            prev.map(p => p.id === id ? { ...p, contabilizado: true } : p)
        );
    };

    return {
        listaPagos,
        isModalOpen,
        vista,
        pagoAEditar,
        setVista,
        cambiarVista,      // ✅ AGREGADO
        abrirModal,
        cerrarModal,
        guardarPago,
        editarPago,
        anularPago,
        contabilizarPago,
    };
};