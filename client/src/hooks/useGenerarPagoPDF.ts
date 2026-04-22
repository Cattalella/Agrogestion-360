import { useState } from 'react';
import jsPDF from 'jspdf';
import type { Pago } from './useRegistrarPagos';
import type { Trabajador } from './useNuevoTrabajador';
import type { TrabajoRealizado } from './useTrabajoRealizado';
import logo from '../assets/imgs/isoNG.svg';

// ─────────────────────────────────────────
// TIPOS — RF. 8.1.4
// ─────────────────────────────────────────
export interface FormatoPago {
    id: string;
    pagoId: number;
    trabajadorId: number;
    trabajoId: number | null;
    fechaGeneracion: string;
    detalles: {
        nombreTrabajador: string;
        tipoTrabajo: string;
        tipoDocumento: string;
        numDocumento: string;
        telefono: string;
        periodo: string;
        actividades: string[];
        totalHoras: number;
        montoTotal: number;
        montoLetras: string;
        concepto: string;
    };
    estadoFirma: 'pendiente' | 'firmado' | 'escaneado';
    firmaDigital?: string;
    evidenciaEscaneo?: string;
    fechaFirma?: string;
    fechaRegistroPago?: string;
    pdfUrl?: string;
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
// FUNCIÓN PARA FORMATEAR MONEDA (COP - puntos para miles)
// ─────────────────────────────────────────
const formatearMontoCOP = (monto: number): string => {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(monto);
};

// Función para convertir imagen a base64
const convertirImagenABase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
    });
};

// ─────────────────────────────────────────
// FUNCIÓN PARA GENERAR EL PDF (retorna Blob) - CON DISEÑO PROFESIONAL
// ─────────────────────────────────────────
const generarPDFBlob = async (
    pago: Pago,
    trabajador: Trabajador,
    trabajosRealizados: TrabajoRealizado[],
    periodo: string
): Promise<Blob> => {
    return new Promise(async (resolve) => {
        setTimeout(async () => {
            const actividades = trabajosRealizados.map(t => t.tipo_actividad);
            const totalHoras = trabajosRealizados.reduce((sum, t) => sum + (Number(t.duracion_horas) || 0), 0);
            const montoFormateado = formatearMontoCOP(pago.monto_total);
            const fechaActual = new Date();
            
            const doc = new jsPDF();
            let y = 20;
            const marginX = 20;
            const pageWidth = 210;
            const rightX = pageWidth - marginX;
            
            // ============================================================
            // ENCABEZADO CON LOGO Y TÍTULO
            // ============================================================
            
            // Cargar y dibujar el logo
            let logoBase64 = null;
            try {
                logoBase64 = await convertirImagenABase64(logo);
                console.log("Logo cargado correctamente");
            } catch (e) {
                console.log("Error cargando logo:", e);
            }
            
            if (logoBase64) {
                try {
                    doc.addImage(logoBase64, 'PNG', marginX, y, 20, 20);
                } catch (e) {
                    // Fallback: círculo verde
                    doc.setFillColor(16, 185, 129);
                    doc.circle(marginX + 10, y + 10, 10, 'F');
                }
            } else {
                // Fallback: círculo verde
                doc.setFillColor(16, 185, 129);
                doc.circle(marginX + 10, y + 10, 10, 'F');
            }
            
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129);
            doc.text("AGROGESTIÓN 360", marginX + 25, y + 14);
            
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("FORMATO DE PAGO A TRABAJADORES", marginX + 25, y + 20);
            
            // Línea decorativa
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(0.5);
            doc.line(marginX, y + 28, rightX, y + 28);
            
            y = 55;
            
            // ============================================================
            // INFORMACIÓN DEL DOCUMENTO (como factura)
            // ============================================================
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(80, 80, 80);
            
            doc.text("FECHA DE EMISIÓN:", marginX, y);
            doc.text("PERÍODO:", marginX, y + 6);
            doc.text("ID FORMATO:", marginX, y + 12);
            
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            doc.text(`${fechaActual.toLocaleDateString()}`, marginX + 45, y);
            doc.text(`${periodo}`, marginX + 45, y + 6);
            doc.text(`F-${pago.id_pago}-${Date.now()}`, marginX + 45, y + 12);
            
            // Línea separadora
            y += 22;
            doc.setDrawColor(220, 220, 220);
            doc.line(marginX, y, rightX, y);
            y += 10;
            
            // ============================================================
            // DATOS DEL TRABAJADOR (tarjeta)
            // ============================================================
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(marginX, y, pageWidth - 40, 45, 5, 5, 'F');
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129);
            doc.text("DATOS DEL TRABAJADOR", marginX + 5, y + 6);
            
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 60, 60);
            doc.text(`Nombre: ${trabajador.nombre_completo}`, marginX + 5, y + 15);
            doc.text(`Documento: ${trabajador.tipo_documento} ${trabajador.num_documento}`, marginX + 5, y + 23);
            doc.text(`Tipo de trabajo: ${trabajador.tipo_trabajo}`, marginX + 5, y + 31);
            doc.text(`Teléfono: ${trabajador.telefono || 'No registrado'}`, marginX + 5, y + 39);
            
            y += 55;
            
            // ============================================================
            // TABLA DE ACTIVIDADES REALIZADAS
            // ============================================================
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129);
            doc.text("ACTIVIDADES REALIZADAS", marginX, y);
            y += 6;
            
            // Encabezados de tabla
            doc.setFillColor(16, 185, 129);
            doc.rect(marginX, y, pageWidth - 40, 8, 'F');
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text("#", marginX + 5, y + 5.5);
            doc.text("ACTIVIDAD", marginX + 15, y + 5.5);
            doc.text("DURACIÓN", rightX - 30, y + 5.5);
            doc.text("FECHA", rightX - 15, y + 5.5);
            y += 8;
            
            // Filas de la tabla
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 60, 60);
            actividades.forEach((act, idx) => {
                const fecha = trabajosRealizados[idx]?.fecha_inicio?.split('T')[0] || '';
                const duracion = `${Number(trabajosRealizados[idx]?.duracion_horas || 0).toFixed(1)} hrs`;
                
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.setFillColor(idx % 2 === 0 ? 255 : 250, 250, 250);
                doc.rect(marginX, y, pageWidth - 40, 6, 'F');
                doc.setFontSize(7);
                doc.text(`${idx + 1}`, marginX + 5, y + 4);
                doc.text(act.length > 40 ? act.substring(0, 37) + '...' : act, marginX + 15, y + 4);
                doc.text(duracion, rightX - 30, y + 4);
                doc.text(fecha, rightX - 15, y + 4);
                y += 6;
            });
            
            // Total de horas
            y += 4;
            doc.setDrawColor(220, 220, 220);
            doc.line(marginX, y, rightX, y);
            y += 4;
            doc.setFont("helvetica", "bold");
            doc.text(`TOTAL HORAS: ${totalHoras.toFixed(1)} horas`, rightX - 40, y);
            y += 12;
            
            // ============================================================
            // MONTO A PAGAR (destacado)
            // ============================================================
            doc.setFillColor(16, 185, 129);
            doc.roundedRect(marginX, y, pageWidth - 40, 35, 5, 5, 'F');
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text("MONTO A PAGAR", marginX + 10, y + 10);
            
            doc.setFontSize(16);
            doc.text(`$ ${montoFormateado} COP`, marginX + 10, y + 24);
            
            y += 45;
            
            // ============================================================
            // CONCEPTO
            // ============================================================
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129);
            doc.text("CONCEPTO DEL PAGO:", marginX, y);
            y += 5;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            doc.text(pago.concepto, marginX, y);
            y += 12;
            
            // Monto en letras
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(100, 100, 100);
            doc.text(`Son: ${numeroALetras(pago.monto_total)} pesos colombianos`, marginX, y);
            y += 15;
            
            // ============================================================
            // FIRMA
            // ============================================================
            doc.setDrawColor(0, 0, 0);
            doc.line(marginX + 20, y, rightX - 20, y);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text("Firma del trabajador", (pageWidth / 2), y + 5, { align: 'center' });
            y += 20;
            
            // ============================================================
            // NOTA INFORMATIVA
            // ============================================================
            doc.setFillColor(255, 245, 235);
            doc.roundedRect(marginX, y, pageWidth - 40, 15, 5, 5, 'F');
            doc.setFontSize(6);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(150, 100, 50);
            doc.text("⚠️ El pago en efectivo solo se registrará después de que el trabajador haya firmado este formato.", marginX + 5, y + 6);
            doc.text("El formato firmado debe ser escaneado y subido como evidencia.", marginX + 5, y + 11);
            y += 20;
            
            // ============================================================
            // PIE DE PÁGINA
            // ============================================================
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(6);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `AgroGestión 360 - Formato de Pago - Generado el ${fechaActual.toLocaleDateString()} - Página ${i} de ${pageCount}`,
                    pageWidth / 2,
                    285,
                    { align: 'center' }
                );
            }
            
            resolve(doc.output('blob'));
        }, 50);
    });
};

// ─────────────────────────────────────────
// UTILIDAD: Generar nombre de archivo personalizado
// ─────────────────────────────────────────
const generarNombreArchivo = (trabajador: Trabajador): string => {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear();
    
    const nombreLimpio = trabajador.nombre_completo
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_');
    
    return `AgroPagos_${nombreLimpio}_${dia}_${mes}_${anio}.pdf`;
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
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [pdfBlobActual, setPdfBlobActual] = useState<Blob | null>(null);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
        setPdfPreviewUrl(null);
        setPdfBlobActual(null);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setFormatoSeleccionado(null);
        setVista('lista');
        if (pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
        }
        setPdfPreviewUrl(null);
        setPdfBlobActual(null);
    };

    const cambiarVista = (nuevaVista: Vista) => setVista(nuevaVista);

    // ============================================================
    // GENERAR Y DESCARGAR DIRECTO (con nombre personalizado)
    // ============================================================
    const generarFormatoPago = async (
        pago: Pago,
        trabajador: Trabajador,
        trabajosRealizados: TrabajoRealizado[],
        periodo: string
    ): Promise<FormatoPago> => {
        
        setGenerandoPDF(true);
        
        try {
            const actividades = trabajosRealizados.map(t => t.tipo_actividad);
            const totalHoras = trabajosRealizados.reduce((sum, t) => sum + (Number(t.duracion_horas) || 0), 0);
            
            const nuevoFormato: FormatoPago = {
                id: `F-${Date.now()}`,
                pagoId: pago.id_pago,
                trabajadorId: trabajador.id_trabajador,
                trabajoId: trabajosRealizados[0]?.id_trabajo || null,
                fechaGeneracion: new Date().toISOString(),
                detalles: {
                    nombreTrabajador: trabajador.nombre_completo,
                    tipoTrabajo: trabajador.tipo_trabajo,
                    tipoDocumento: trabajador.tipo_documento,
                    numDocumento: trabajador.num_documento,
                    telefono: trabajador.telefono || '',
                    periodo: periodo,
                    actividades: actividades,
                    totalHoras: totalHoras,
                    montoTotal: pago.monto_total,
                    montoLetras: numeroALetras(pago.monto_total),
                    concepto: pago.concepto
                },
                estadoFirma: 'pendiente'
            };
            
            // Generar el PDF
            const pdfBlob = await generarPDFBlob(pago, trabajador, trabajosRealizados, periodo);
            
            // Descargar directamente con nombre personalizado
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = generarNombreArchivo(trabajador);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log("PDF descargado:", generarNombreArchivo(trabajador));
            
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

    // ============================================================
    // GENERAR Y PREVISUALIZAR EN EL MISMO MODAL (sin abrir pestaña)
    // ============================================================
    const previsualizarPDF = async (
        pago: Pago,
        trabajador: Trabajador,
        trabajosRealizados: TrabajoRealizado[],
        periodo: string
    ): Promise<void> => {
        setGenerandoPDF(true);
        try {
            const pdfBlob = await generarPDFBlob(pago, trabajador, trabajosRealizados, periodo);
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPdfBlobActual(pdfBlob);
            setPdfPreviewUrl(pdfUrl);
            setVista('vistaPrevia');
        } catch (error) {
            console.error("Error al previsualizar PDF:", error);
        } finally {
            setGenerandoPDF(false);
        }
    };

    // ============================================================
    // DESCARGAR PDF (desde previsualización)
    // ============================================================
    const descargarPDF = (trabajador?: Trabajador) => {
        if (pdfBlobActual) {
            const url = URL.createObjectURL(pdfBlobActual);
            const link = document.createElement('a');
            link.href = url;
            if (trabajador) {
                link.download = generarNombreArchivo(trabajador);
            } else {
                link.download = `formato_pago_${Date.now()}.pdf`;
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    // ============================================================
    // REGISTRAR FIRMA
    // ============================================================
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
                if (tipo === 'digital') update.firmaDigital = firmaData;
                else update.evidenciaEscaneo = firmaData;
                return { ...f, ...update };
            })
        );
    };

    // ============================================================
    // CONFIRMAR PAGO CON FIRMA
    // ============================================================
    const confirmarPagoConFirma = (idFormato: string, pagoId: number, onConfirmarPago?: () => void) => {
        const formato = formatosPago.find(f => f.id === idFormato);
        if (!formato) return false;
        if (formato.estadoFirma === 'pendiente') return false;
        
        setFormatosPago(prev =>
            prev.map(f => f.id === idFormato ? { ...f, fechaRegistroPago: new Date().toISOString() } : f)
        );
        
        if (onConfirmarPago) onConfirmarPago();
        return true;
    };

    const historialPagosFirmados = formatosPago.filter(f => f.estadoFirma !== 'pendiente');

    return {
        formatosPago,
        historialPagosFirmados,
        isModalOpen,
        vista,
        formatoSeleccionado,
        generandoPDF,
        pdfPreviewUrl,
        pdfBlobActual,
        setVista,
        setFormatoSeleccionado,
        abrirModal,
        cerrarModal,
        cambiarVista,
        generarFormatoPago,
        previsualizarPDF,
        descargarPDF,
        registrarFirma,
        confirmarPagoConFirma
    };
};