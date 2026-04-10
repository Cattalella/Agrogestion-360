import { useState } from "react";
import { Download, FileText, X, CheckCircle2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// --- 1. COMPONENTE MODAL DE VISTA PREVIA ---
const ModalPreview = ({ isOpen, onClose, onConfirm, titulo, tipo, children }: any) => {
    if (!isOpen) return null;

    return (
        /* El onClick en este div detecta el clic afuera */
        <div 
            onClick={onClose}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
            <div 
                /* stopPropagation evita que el clic adentro cierre el modal */
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                        {tipo === 'pdf' ? <FileText size={16} className="text-emerald-500" /> : <Download size={16} className="text-blue-500" />}
                        Vista Previa: {titulo}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido (Vista Previa) */}
                <div className="p-8 bg-slate-50/50 max-h-[400px] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                <div className="p-6 bg-white border-t border-slate-50 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-2xl tracking-[2px] font-black text-[0.6rem] uppercase cursor-pointer bg-slate-200 text-slate-500 hover:bg-slate-400 hover:text-white transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3 rounded-2xl font-black tracking-[2px] text-[0.6rem] cursor-pointer uppercase bg-slate-900 text-white shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={14} />
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 2. COMPONENTE PRINCIPAL ---
export const ExportarButton = ({ datosFiltrados, targetId }: { datosFiltrados: any[], targetId: string }) => {
    const [modalCSV, setModalCSV] = useState(false);
    const [modalPDF, setModalPDF] = useState(false);

    const ejecutarDescargaCSV = () => {
        if (!datosFiltrados.length) return;
        const headers = ["FECHA", "CATEGORIA", "CONCEPTO", "VALOR", "NOTAS"].join(",");
        const cuerpo = datosFiltrados.map(fila =>
            [
                fila.fecha || "",
                fila.categoria || "",
                fila.concepto || "",
                fila.valor || "",
                fila.notas || ""
            ].map(val => `"${val}"`).join(",")
        ).join("\n");

        const blob = new Blob([`${headers}\n${cuerpo}`], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Datos_AgroGestion_${new Date().toLocaleDateString()}.csv`;
        link.click();
        setModalCSV(false);
    };

    const ejecutarDescargaPDF = async () => {
        const elemento = document.getElementById(targetId);
        if (!elemento) return;
        const canvas = await html2canvas(elemento, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const anchoPdf = pdf.internal.pageSize.getWidth();
        const altoPdf = (canvas.height * anchoPdf) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, anchoPdf, altoPdf);
        pdf.save("Informe_Visual_AgroGestion.pdf");
        setModalPDF(false);
    };

    return (
        <>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setModalCSV(true)}
                    className="flex items-center gap-2 bg-slate-300 text-slate-700 hover:scale-105 transition-all cursor-pointer px-4 py-2 rounded-full font-black 
                    text-[0.6rem] uppercase border border-slate-200 hover:bg-slate-200 "
                >
                    <Download size={14} />
                    CSV
                </button>

                <button
                    onClick={() => setModalPDF(true)}
                    className="flex items-center gap-2 bg-[#c44b00] text-white px-6 py-2 rounded-full font-black text-[0.6rem] uppercase hover:scale-105 transition-all cursor-pointer"
                >
                    <FileText size={14} />
                    PDF
                </button>
            </div>

            {/* MODAL PREVIEW CSV */}
            <ModalPreview 
                isOpen={modalCSV} 
                onClose={() => setModalCSV(false)} 
                onConfirm={ejecutarDescargaCSV}
                titulo="Archivo de Datos"
                tipo="csv"
            >
                <div className="space-y-2">
                    <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-tighter">
                        Resumen de filas ({datosFiltrados.length})
                    </p>
                    <div className="bg-white border border-slate-100 rounded-xl p-4 overflow-hidden shadow-inner">
                        <table className="w-full text-[0.5rem] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 text-slate-400 font-black italic">
                                    <th className="pb-2">FECHA</th>
                                    <th className="pb-2">CATEGORÍA</th>
                                    <th className="pb-2">CONCEPTO</th>
                                    <th className="pb-2">VALOR</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                {datosFiltrados.slice(0, 5).map((d, i) => (
                                    <tr key={i} className="border-b border-slate-50/50">
                                        <td className="py-2">{d.fecha}</td>
                                        <td className="py-2">{d.categoria}</td>
                                        <td className="py-2">{d.concepto}</td>
                                        <td className="py-2 font-bold text-slate-900">${d.valor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {datosFiltrados.length > 5 && (
                            <p className="text-[0.5rem] text-center mt-2 text-slate-300 italic font-medium">
                                ... y {datosFiltrados.length - 5} registros más
                            </p>
                        )}
                    </div>
                </div>
            </ModalPreview>

            {/* MODAL PREVIEW PDF */}
            <ModalPreview 
                isOpen={modalPDF} 
                onClose={() => setModalPDF(false)} 
                onConfirm={ejecutarDescargaPDF}
                titulo="Informe Visual"
                tipo="pdf"
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-40 bg-white shadow-md border border-slate-200 rounded-lg flex items-center justify-center p-2 relative">
                        <div className="w-full h-full bg-slate-50 rounded flex flex-col gap-2 p-2">
                            <div className="w-1/2 h-1 bg-slate-200 rounded" />
                            <div className="w-full h-8 bg-emerald-50 rounded" />
                            <div className="w-full flex-1 bg-slate-100 rounded-full flex items-center justify-center text-[0.4rem] font-black text-slate-300 uppercase">Analíticas</div>
                        </div>
                    </div>
                    <p className="text-center text-[0.6rem] text-slate-500 font-black tracking-widest leading-relaxed">
                        Se capturarán las gráficas y comparativas actuales de tu panel de gestión.
                    </p>
                </div>
            </ModalPreview>
        </>
    );
};