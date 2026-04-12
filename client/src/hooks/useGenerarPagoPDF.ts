import { useState } from 'react';
import type { Pago } from './useRegistrarPagos';
import type { Trabajador } from './useNuevoTrabajador';
import type { TrabajoRealizado } from './useTrabajoRealizado';

// ─────────────────────────────────────────
// TIPOS — RF. 8.1.4
// ─────────────────────────────────────────
export interface FormatoPago {
    id: string;
    pagoId: number;
    trabajadorId: string;
    trabajoId: number | null;
    fechaGeneracion: string;
    detalles: {
        nombreTrabajador: string;
        tipoTrabajo: string;
        periodo: string;
        actividades: string[];
        montoTotal: number;
        montoLetras: string;
    };
    estadoFirma: 'pendiente' | 'firmado' | 'escaneado';
    firmaDigital?: string;        // Base64 o URL de la firma digital
    evidenciaEscaneo?: string;    // URL o Base64 del PDF/Imagen escaneado
    fechaFirma?: string;
    fechaRegistroPago?: string;    // Cuando se confirma el pago (solo después de firmar)
}

type Vista = 'lista' | 'formulario' | 'vistaPrevia';

// ─────────────────────────────────────────
// UTILIDAD: Convertir número a letras (CORREGIDA)
// ─────────────────────────────────────────
const numeroALetras = (numero: number): string => {
    if (numero === 0) return 'CERO';
    if (numero < 0) return 'MENOS ' + numeroALetras(Math.abs(numero));
    
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const especiales: { [key: number]: string } = {
        10: 'DIEZ', 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 
        15: 'QUINCE', 16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
        20: 'VEINTE', 21: 'VEINTIUN', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO',
        25: 'VEINTICINCO', 26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE'
    };
    
    const decenas: { [key: number]: string } = {
        30: 'TREINTA', 40: 'CUARENTA', 50: 'CINCUENTA',
        60: 'SESENTA', 70: 'SETENTA', 80: 'OCHENTA', 90: 'NOVENTA'
    };
    
    // Números especiales (1-29)
    if (numero <= 29) {
        return especiales[numero] || `${unidades[numero]}`;
    }
    
    // Decenas (30-99)
    if (numero < 100) {
        const decena = Math.floor(numero / 10) * 10;
        const unidad = numero % 10;
        if (unidad === 0) return decenas[decena];
        return `${decenas[decena]} Y ${unidades[unidad]}`;
    }
    
    // Centenas (100-999)
    if (numero < 1000) {
        const centena = Math.floor(numero / 100);
        const resto = numero % 100;
        
        let centenaStr = '';
        if (centena === 1) centenaStr = 'CIEN';
        else if (centena === 2) centenaStr = 'DOSCIENTOS';
        else if (centena === 3) centenaStr = 'TRESCIENTOS';
        else if (centena === 4) centenaStr = 'CUATROCIENTOS';
        else if (centena === 5) centenaStr = 'QUINIENTOS';
        else if (centena === 6) centenaStr = 'SEISCIENTOS';
        else if (centena === 7) centenaStr = 'SETECIENTOS';
        else if (centena === 8) centenaStr = 'OCHOCIENTOS';
        else if (centena === 9) centenaStr = 'NOVECIENTOS';
        
        if (resto === 0) return centenaStr;
        if (resto < 100) return `${centenaStr} ${numeroALetras(resto)}`;
        return `${centenaStr} ${numeroALetras(resto)}`;
    }
    
    // Miles (1000-999999)
    if (numero < 1000000) {
        const miles = Math.floor(numero / 1000);
        const resto = numero % 1000;
        
        let milesStr = '';
        if (miles === 1) milesStr = 'MIL';
        else milesStr = `${numeroALetras(miles)} MIL`;
        
        if (resto === 0) return milesStr;
        return `${milesStr} ${numeroALetras(resto)}`;
    }
    
    // Millones
    if (numero < 1000000000) {
        const millones = Math.floor(numero / 1000000);
        const resto = numero % 1000000;
        
        let millonesStr = '';
        if (millones === 1) millonesStr = 'UN MILLÓN';
        else millonesStr = `${numeroALetras(millones)} MILLONES`;
        
        if (resto === 0) return millonesStr;
        return `${millonesStr} ${numeroALetras(resto)}`;
    }
    
    return 'NÚMERO DEMASIADO GRANDE';
};

// ─────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────
export const useGenerarPagoPDF = () => {

    const [formatosPago, setFormatosPago] = useState<FormatoPago[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [formatoSeleccionado, setFormatoSeleccionado] = useState<FormatoPago | null>(null);
    const [generandoPDF, setGenerandoPDF] = useState(false);

    // ── Abrir / Cerrar ──
    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setFormatoSeleccionado(null);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: Vista) => {
        setVista(nuevaVista);
    };

    // ── Generar formato de pago (PDF) ──
    const generarFormatoPago = async (
        pago: Pago,
        trabajador: Trabajador,
        trabajosRealizados: TrabajoRealizado[],
        periodo: string
    ): Promise<FormatoPago> => {
        
        setGenerandoPDF(true);
        
        try {
            // Filtrar trabajos del trabajador en el período
            const actividades = trabajosRealizados
                .filter(t => t.id_trabajador === trabajador.id_trabajador)
                .map(t => `${t.tipo_actividad} (${t.duracion_trabajo})`);
            
            const nuevoFormato: FormatoPago = {
                id: `F-${Date.now()}`,
                pagoId: pago.id,
                trabajadorId: trabajador.id_trabajador,
                trabajoId: trabajosRealizados[0]?.id || null,
                fechaGeneracion: new Date().toISOString(),
                detalles: {
                    nombreTrabajador: trabajador.nombre_completo,
                    tipoTrabajo: trabajador.tipo_trabajo,
                    periodo: periodo,
                    actividades: actividades,
                    montoTotal: pago.monto_total,
                    montoLetras: numeroALetras(pago.monto_total)
                },
                estadoFirma: 'pendiente'
            };
            
            // Aquí iría la generación del PDF con una librería (jsPDF, react-pdf, etc.)
            // Por ahora simulamos
            console.log("Generando PDF...", nuevoFormato);
            
            setFormatosPago(prev => [nuevoFormato, ...prev]);
            return nuevoFormato;
            
        } finally {
            setGenerandoPDF(false);
        }
    };

    // ── Registrar firma (digital o escaneo) ──
    const registrarFirma = (
        idFormato: string, 
        tipo: 'digital' | 'escaneo',
        firmaData: string  // Base64 de firma o URL de escaneo
    ) => {
        setFormatosPago(prev =>
            prev.map(f => {
                if (f.id !== idFormato) return f;
                
                const update: Partial<FormatoPago> = {
                    estadoFirma: tipo === 'digital' ? 'firmado' : 'escaneado',
                    fechaFirma: new Date().toISOString()
                };
                
                if (tipo === 'digital') {
                    update.firmaDigital = firmaData;
                } else {
                    update.evidenciaEscaneo = firmaData;
                }
                
                return { ...f, ...update };
            })
        );
    };

    // ── Confirmar pago (solo si está firmado o escaneado) RN.8.1.4 ──
    const confirmarPagoConFirma = (idFormato: string, pagoId: number, onConfirmarPago?: () => void) => {
        const formato = formatosPago.find(f => f.id === idFormato);
        
        if (!formato) {
            alert("Formato no encontrado");
            return false;
        }
        
        if (formato.estadoFirma === 'pendiente') {
            alert("❌ El pago en efectivo solo puede registrarse si el trabajador ha firmado el formato.");
            return false;
        }
        
        // Actualizar el formato con fecha de registro de pago
        setFormatosPago(prev =>
            prev.map(f =>
                f.id === idFormato
                    ? { ...f, fechaRegistroPago: new Date().toISOString() }
                    : f
            )
        );
        
        // Llamar al callback para actualizar el estado del pago en useRegistrarPagos
        if (onConfirmarPago) {
            onConfirmarPago();
        }
        
        alert("✅ Pago registrado correctamente con firma del trabajador");
        return true;
    };

    // ── Obtener historial de pagos firmados ──
    const historialPagosFirmados = formatosPago.filter(
        f => f.estadoFirma !== 'pendiente'
    );

    return {
        formatosPago,
        historialPagosFirmados,
        isModalOpen,
        vista,
        formatoSeleccionado,
        generandoPDF,
        setVista,
        setFormatoSeleccionado,
        abrirModal,
        cerrarModal,
        cambiarVista,
        generarFormatoPago,
        registrarFirma,
        confirmarPagoConFirma
    };
};