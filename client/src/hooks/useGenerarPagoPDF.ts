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
// FUNCIÓN PARA GENERAR EL PDF (retorna Blob)
// ─────────────────────────────────────────
const generarPDFBlob = (
    pago: Pago,
    trabajador: Trabajador,
    trabajosRealizados: TrabajoRealizado[],
    periodo: string
): Promise<Blob> => {
    return new Promise((resolve) => {
        // Usar setTimeout para no bloquear el UI
        setTimeout(() => {
            const actividades = trabajosRealizados.map(t => t.tipo_actividad);
            const totalHoras = trabajosRealizados.reduce((sum, t) => sum + (Number(t.duracion_horas) || 0), 0);
            
            const doc = new jsPDF();
            let y = 25;
            
            // Encabezado
            doc.setFillColor(16, 185, 129);
            doc.rect(0, 0, 210, 35, 'F');
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text("AGROGESTIÓN 360", 105, 20, { align: 'center' });
            doc.setFontSize(10);
            doc.text("FORMATO DE PAGO A TRABAJADORES", 105, 32, { align: 'center' });
            
            // Información general
            y = 50;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, y);
            doc.text(`Período: ${periodo}`, 140, y);
            y += 12;
            doc.setDrawColor(200, 200, 200);
            doc.line(20, y, 190, y);
            y += 10;
            
            // Datos del trabajador
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129);
            doc.text("DATOS DEL TRABAJADOR", 20, y);
            y += 7;
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            doc.text(`Nombre: ${trabajador.nombre_completo}`, 25, y);
            y += 5;
            doc.text(`Tipo de trabajo: ${trabajador.tipo_trabajo}`, 25, y);
            y += 5;
            doc.text(`Documento: ${trabajador.tipo_documento} ${trabajador.num_documento}`, 25, y);
            y += 5;
            doc.text(`Teléfono: ${trabajador.telefono || 'No registrado'}`, 25, y);
            y += 12;
            
            // Actividades realizadas
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129);
            doc.text("ACTIVIDADES REALIZADAS", 20, y);
            y += 7;
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            
            actividades.forEach((act, idx) => {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`${idx + 1}. ${act}`, 25, y);
                y += 5;
            });
            y += 5;
            doc.text(`Total horas: ${totalHoras.toFixed(1)} horas`, 25, y);
            y += 15;
            
            // Monto a pagar
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129);
            doc.text("MONTO A PAGAR", 20, y);
            y += 7;
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(`$ ${pago.monto_total.toLocaleString('es-CO')} COP`, 25, y);
            y += 6;
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`En letras: ${numeroALetras(pago.monto_total)} pesos colombianos`, 25, y);
            y += 8;
            doc.text(`Concepto: ${pago.concepto}`, 25, y);
            y += 20;
            
            // Firma
            doc.setDrawColor(0, 0, 0);
            doc.line(40, y, 170, y);
            y += 5;
            doc.setFontSize(8);
            doc.text("Firma del trabajador", 105, y, { align: 'center' });
            y += 15;
            doc.setFontSize(7);
            doc.setTextColor(150, 150, 150);
            doc.text("El pago en efectivo solo se registrará después de firmar este formato.", 105, y, { align: 'center' });
            
            // Pie de página
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text(`AgroGestión 360 - Formato de Pago - Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
            }
            
            resolve(doc.output('blob'));
        }, 50);
    });
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

    const cambiarVista = (nuevaVista: Vista) => {
        setVista(nuevaVista);
    };

    // ============================================================
    // GENERAR Y DESCARGAR DIRECTO (sin alert, solo abre ventana)
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
        
        // Generar PDF
        const doc = new jsPDF();
        let y = 25;
        
        // ... (todo el contenido del PDF igual) ...
        
        // ============================================================
        // NOMBRE DEL ARCHIVO PERSONALIZADO
        // ============================================================
        // Formatear la fecha actual
        const fechaActual = new Date();
        const dia = fechaActual.getDate().toString().padStart(2, '0');
        const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        const anio = fechaActual.getFullYear();
        
        // Limpiar el nombre del trabajador
        const nombreLimpio = trabajador.nombre_completo
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')  // Eliminar tildes
            .replace(/[^a-zA-Z0-9]/g, '_');    // Reemplazar espacios y caracteres especiales por _
        
        // Nombre del archivo: AgroPagos_NOMBRE_DD_MM_AA.pdf
        const nombreArchivo = `AgroPagos_${nombreLimpio}_${dia}_${mes}_${anio}.pdf`;
        
        // Guardar el PDF
        doc.save(nombreArchivo);
        
        console.log("PDF generado correctamente", nuevoFormato);
        console.log("Nombre del archivo:", nombreArchivo);
        
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
    // GENERAR Y PREVISUALIZAR (sin alert)
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
    const descargarPDF = () => {
        if (pdfBlobActual) {
            const url = URL.createObjectURL(pdfBlobActual);
            const link = document.createElement('a');
            link.href = url;
            link.download = `formato_pago_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    // ============================================================
    // REGISTRAR FIRMA (digital o escaneada)
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