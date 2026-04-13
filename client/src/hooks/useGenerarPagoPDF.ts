import { useState } from 'react';
import jsPDF from 'jspdf';
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
    firmaDigital?: string;
    evidenciaEscaneo?: string;
    fechaFirma?: string;
    fechaRegistroPago?: string;
}

type Vista = 'lista' | 'formulario' | 'vistaPrevia';

// ─────────────────────────────────────────
// UTILIDAD: Convertir número a letras
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
    
    if (numero <= 29) {
        return especiales[numero] || `${unidades[numero]}`;
    }
    
    if (numero < 100) {
        const decena = Math.floor(numero / 10) * 10;
        const unidad = numero % 10;
        if (unidad === 0) return decenas[decena];
        return `${decenas[decena]} Y ${unidades[unidad]}`;
    }
    
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
        return `${centenaStr} ${numeroALetras(resto)}`;
    }
    
    if (numero < 1000000) {
        const miles = Math.floor(numero / 1000);
        const resto = numero % 1000;
        const milesStr = miles === 1 ? 'MIL' : `${numeroALetras(miles)} MIL`;
        if (resto === 0) return milesStr;
        return `${milesStr} ${numeroALetras(resto)}`;
    }
    
    if (numero < 1000000000) {
        const millones = Math.floor(numero / 1000000);
        const resto = numero % 1000000;
        const millonesStr = millones === 1 ? 'UN MILLÓN' : `${numeroALetras(millones)} MILLONES`;
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

    const generarFormatoPago = async (
        pago: Pago,
        trabajador: Trabajador,
        trabajosRealizados: TrabajoRealizado[],
        periodo: string
    ): Promise<FormatoPago> => {
        
        setGenerandoPDF(true);
        
        try {
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
            
            // 📄 GENERAR PDF CON jsPDF
            const doc = new jsPDF();
            let y = 20;
            
            // Título
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("FORMATO DE PAGO", 20, y);
            y += 10;
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, y);
            y += 15;
            
            // Línea separadora
            doc.line(20, y, 190, y);
            y += 10;
            
            // DATOS DEL TRABAJADOR
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("DATOS DEL TRABAJADOR", 20, y);
            y += 8;
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Nombre: ${trabajador.nombre_completo}`, 20, y);
            y += 6;
            doc.text(`ID Trabajador: ${trabajador.id_trabajador}`, 20, y);
            y += 6;
            doc.text(`Tipo de trabajo: ${trabajador.tipo_trabajo}`, 20, y);
            y += 6;
            doc.text(`Período: ${periodo}`, 20, y);
            y += 15;
            
            // ACTIVIDADES REALIZADAS
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("ACTIVIDADES REALIZADAS", 20, y);
            y += 8;
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            actividades.forEach((act, idx) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`• ${act}`, 25, y);
                y += 5;
            });
            y += 10;
            
            // MONTO A PAGAR
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("MONTO A PAGAR", 20, y);
            y += 8;
            
            doc.setFontSize(11);
            doc.text(`Monto total: $${pago.monto_total.toLocaleString()}`, 20, y);
            y += 7;
            doc.setFontSize(9);
            doc.text(`En letras: ${numeroALetras(pago.monto_total)}`, 20, y);
            y += 20;
            
            // FIRMA
            doc.line(60, y, 150, y);
            y += 5;
            doc.setFontSize(9);
            doc.text("Firma del trabajador", 80, y);
            y += 15;
            
            // Nota
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("El pago en efectivo solo se registrará después de firmar este formato.", 20, y);
            
            // Guardar PDF
            doc.save(`formato_pago_${nuevoFormato.id}.pdf`);
            
            console.log("PDF generado correctamente", nuevoFormato);
            
            setFormatosPago(prev => [nuevoFormato, ...prev]);
            return nuevoFormato;
            
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("❌ Error al generar el PDF. Por favor intenta de nuevo.");
            throw error;
        } finally {
            setGenerandoPDF(false);
        }
    };

    const registrarFirma = (
        idFormato: string, 
        tipo: 'digital' | 'escaneo',
        firmaData: string
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
        
        setFormatosPago(prev =>
            prev.map(f =>
                f.id === idFormato
                    ? { ...f, fechaRegistroPago: new Date().toISOString() }
                    : f
            )
        );
        
        if (onConfirmarPago) {
            onConfirmarPago();
        }
        
        alert("✅ Pago registrado correctamente con firma del trabajador");
        return true;
    };

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