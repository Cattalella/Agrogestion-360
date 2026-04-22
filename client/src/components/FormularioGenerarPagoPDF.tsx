import { useState, useEffect } from 'react';
import type { Pago } from '../hooks/useRegistrarPagos';
import type { Trabajador } from '../hooks/useNuevoTrabajador';
import type { TrabajoRealizado } from '../hooks/useTrabajoRealizado';
import type { FormatoPago } from '../hooks/useGenerarPagoPDF';
import { DollarSign, User, Calendar, FileText, AlertCircle, Download, Eye } from 'lucide-react';

interface Props {
    pagoSeleccionado: Pago | null;
    trabajadores: Trabajador[];
    trabajosRealizados: TrabajoRealizado[];
    onGenerarPDF: (
        pago: Pago,
        trabajador: Trabajador,
        trabajos: TrabajoRealizado[],
        periodo: string
    ) => Promise<FormatoPago>;
    onCancelar: () => void;
    pdfPreviewUrl?: string | null;
    generandoPDF?: boolean;
    onPrevisualizar?: (
        pago: Pago,
        trabajador: Trabajador,
        trabajos: TrabajoRealizado[],
        periodo: string
    ) => Promise<void>;
    onDescargar?: () => void;
}

export const FormularioGenerarPagoPDF = ({
    pagoSeleccionado,
    trabajadores,
    trabajosRealizados,
    onGenerarPDF,
    onCancelar,
    pdfPreviewUrl,
    generandoPDF = false,
    onPrevisualizar,
    onDescargar
}: Props) => {

    // ============================================================
    // FUNCIONES DE FORMATEO DE MONEDA (COP - Puntos para miles)
    // ============================================================
    const formatearMoneda = (valor: number): string => {
        if (isNaN(valor)) return '0';
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    };

    // Estado para mes y año seleccionados
    const [mesSeleccionado, setMesSeleccionado] = useState<number>(() => new Date().getMonth());
    const [anoSeleccionado, setAnoSeleccionado] = useState<number>(() => new Date().getFullYear());
    const [generando, setGenerando] = useState(false);
    const [trabajador, setTrabajador] = useState<Trabajador | null>(null);
    const [trabajosDelPago, setTrabajosDelPago] = useState<TrabajoRealizado[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);

    // Lista de meses
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Generar años (desde 2020 hasta el próximo año)
    const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

    // Período formateado para mostrar
    const periodo = `${meses[mesSeleccionado]} ${anoSeleccionado}`;

    // Cargar el trabajador asociado al pago
    useEffect(() => {
        if (pagoSeleccionado && trabajadores.length > 0) {
            const trabajadorEncontrado = trabajadores.find(t => t.id_trabajador === pagoSeleccionado.id_trabajador);
            setTrabajador(trabajadorEncontrado || null);
        }
    }, [pagoSeleccionado, trabajadores]);

    // Cargar los trabajos realizados asociados al pago (filtrados por mes/año)
    useEffect(() => {
        if (pagoSeleccionado && trabajosRealizados.length > 0) {
            const fechaInicio = new Date(anoSeleccionado, mesSeleccionado, 1);
            const fechaFin = new Date(anoSeleccionado, mesSeleccionado + 1, 0);
            
            if (pagoSeleccionado.id_trabajo) {
                const trabajo = trabajosRealizados.filter(t => t.id_trabajo === pagoSeleccionado.id_trabajo);
                setTrabajosDelPago(trabajo);
            } else {
                const trabajos = trabajosRealizados.filter(t => 
                    t.id_trabajador === pagoSeleccionado.id_trabajador &&
                    new Date(t.fecha_inicio) >= fechaInicio &&
                    new Date(t.fecha_inicio) <= fechaFin
                );
                setTrabajosDelPago(trabajos);
            }
        }
    }, [pagoSeleccionado, trabajosRealizados, mesSeleccionado, anoSeleccionado]);

    const handlePrevisualizar = async () => {
        if (!pagoSeleccionado || !trabajador || trabajosDelPago.length === 0) {
            setError("Faltan datos para generar la vista previa");
            return;
        }
        
        if (onPrevisualizar) {
            setGenerando(true);
            await onPrevisualizar(pagoSeleccionado, trabajador, trabajosDelPago, periodo);
            setGenerando(false);
            setMostrarVistaPrevia(true);
        }
    };

    const handleDescargar = () => {
        if (onDescargar) {
            onDescargar();
        }
    };

    const handleGenerarDirecto = async () => {
        if (!pagoSeleccionado || !trabajador || trabajosDelPago.length === 0) {
            setError("Faltan datos para generar el PDF");
            return;
        }
        
        setGenerando(true);
        await onGenerarPDF(pagoSeleccionado, trabajador, trabajosDelPago, periodo);
        setGenerando(false);
        onCancelar();
    };

    const handleCerrarVistaPrevia = () => {
        setMostrarVistaPrevia(false);
        onCancelar();
    };

    const yaPagado = pagoSeleccionado?.estado_pago === 'Pagado con firma';
    const totalHoras = trabajosDelPago.reduce((sum, t) => sum + (Number(t.duracion_horas) || 0), 0);

    if (!pagoSeleccionado) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <p className="text-gray-500">No hay un pago seleccionado</p>
                <button
                    type="button"
                    onClick={onCancelar}
                    className="mt-4 px-6 py-2 bg-emerald-600 text-white text-sm"
                >
                    Volver
                </button>
            </div>
        );
    }

    // Vista previa del PDF
    if (mostrarVistaPrevia && pdfPreviewUrl) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <div className="bg-emerald-50 rounded-2xl p-3 text-center">
                    <p className="text-sm font-bold text-emerald-700">Vista previa del formato de pago</p>
                    <p className="text-xs text-gray-500">Revisa el documento antes de descargar</p>
                </div>
                
                <div className="border border-gray-200 rounded-2xl overflow-hidden border-b-2 border-gray-400">
                    <iframe 
                        src={pdfPreviewUrl} 
                        className="w-full h-[500px]"
                        title="Vista previa del formato de pago"
                    />
                </div>
                
                <div className="flex justify-between gap-4 mt-2">
                    <button
                        type="button"
                        onClick={handleCerrarVistaPrevia}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 font-black text-[11px] uppercase hover:bg-gray-300 transition-all"
                    >
                        Cerrar
                    </button>
                    <button
                        type="button"
                        onClick={handleDescargar}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-black text-[11px] uppercase shadow-md flex items-center justify-center gap-2"
                    >
                        <Download size={14} />
                        Descargar PDF
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleGenerarDirecto(); }} className="flex flex-col gap-5 p-4">
            {/* ============================================================ */}
            {/* TÍTULO */}
            {/* ============================================================ */}
            <div className="text-center border-b pb-3">
                <h2 className="text-lg font-bold text-emerald-700 flex items-center justify-center gap-2">
                    <DollarSign size={20} className="text-emerald-500" />
                    GENERAR FORMATO DE PAGO
                </h2>
                <p className="text-xs text-gray-400">RF.8.1.4 - Formato para firma del trabajador</p>
            </div>

            {/* ============================================================ */}
            {/* ERROR */}
            {/* ============================================================ */}
            {error && (
                <div className="bg-red-50 rounded-2xl p-3 border border-red-200 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="ml-auto text-red-400 hover:text-red-600 text-xs font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ============================================================ */}
            {/* INDICADOR DE CARGA */}
            {/* ============================================================ */}
            {(generando || generandoPDF) && (
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <div className="animate-spin h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                    <p className="text-sm text-emerald-800">Generando PDF, por favor espera...</p>
                    <p className="text-xs text-gray-400 mt-1">Esto puede tomar unos segundos</p>
                </div>
            )}

            {/* ============================================================ */}
            {/* ALERTA SI YA ESTÁ PAGADO */}
            {/* ============================================================ */}
            {yaPagado && (
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200 flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-500 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-red-600">Pago ya registrado</p>
                        <p className="text-xs text-red-500">
                            Este pago ya fue registrado como "Pagado con firma". No se puede generar otro formato.
                        </p>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* INFORMACIÓN DEL PAGO (CON MONEDA FORMATEADA) */}
            {/* ============================================================ */}
            <div className="rounded-2xl p-4 border border-emerald-200">
                <p className="text-[10px] font-black text-emerald-800 uppercase mb-3 flex items-center gap-2">
                    <DollarSign size={12} />
                    INFORMACIÓN DEL PAGO
                </p>
                <div className="grid grid-cols-2 gap-5 text-sm">
                    <div className="border-b-2 border-gray-400 px-4 py-2 border-b-2 border-gray-400">
                        <span className="text-gray-400 text-[10px] uppercase">ID Pago</span>
                        <p className="font-bold text-gray-700">#{pagoSeleccionado.id_pago}</p>
                    </div>
                    <div className="border-b-2 border-gray-400 px-4 py-2 border-b-2 border-gray-400">
                        <span className="text-gray-400 text-[10px] uppercase">Monto Total</span>
                        <p className="font-bold text-emerald-800 text-lg">${formatearMoneda(pagoSeleccionado.monto_total)}</p>
                    </div>
                    <div className="border-b-2 border-gray-400 px-4 py-2 col-span-2 border-b-2 border-gray-400">
                        <span className="text-gray-400 text-[10px] uppercase">Concepto</span>
                        <p className="font-medium text-gray-700 uppercase">{pagoSeleccionado.concepto}</p>
                    </div>
                    <div className="border-b-2 border-gray-400 px-4 py-2 border-b-2 border-gray-400 gap-6 flex items-center">
                        <span className="text-gray-400 text-[10px] uppercase">Estado Actual</span>
                        <p className={`inline-block px-3 py-0.5 text-[10px] font-bold uppercase tracking-[1px] ${
                            pagoSeleccionado.estado_pago === 'Pagado con firma' ? 'bg-green-100 text-green-600' :
                            pagoSeleccionado.estado_pago === 'Pendiente de firma' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                        }`}>
                            {pagoSeleccionado.estado_pago || 'No pagado'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ============================================================ */}
            {/* DATOS DEL TRABAJADOR */}
            {/* ============================================================ */}
            {trabajador && (
                <div className="rounded-2xl p-4 border border-emerald-200">
                    <p className="text-[13px] font-black text-emerald-800 uppercase mb-3 flex items-center gap-2">
                        <User size={20} />
                        DATOS DEL TRABAJADOR
                    </p>
                    <div className="grid grid-cols-2 gap-5 text-sm">
                        <div className="px-4 py-2 col-span-2 border-b-2 border-gray-400">
                            <span className="text-gray-400 text-[10px] uppercase">Nombre</span>
                            <p className="font-bold text-gray-700 uppercase">{trabajador.nombre_completo}</p>
                        </div>
                        <div className="border-b-2 border-gray-400 px-4 py-2">
                            <span className="text-gray-400 text-[10px] uppercase">Documento</span>
                            <p className="font-medium text-gray-700">{trabajador.tipo_documento} {trabajador.num_documento}</p>
                        </div>
                        <div className="border-b-2 border-gray-400 px-4 py-2">
                            <span className="text-gray-400 text-[10px] uppercase">Teléfono</span>
                            <p className="font-medium text-gray-700">{trabajador.telefono || 'No registrado'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TRABAJOS ASOCIADOS */}
            {/* ============================================================ */}
            <div className="bg-emerald-50/30 rounded-2xl p-4 border border-emerald-200">
                <p className="text-[10px] font-black text-emerald-800 uppercase mb-3 flex items-center gap-2">
                    <FileText size={12} />
                    TRABAJOS ASOCIADOS ({trabajosDelPago.length})
                </p>
                
                {trabajosDelPago.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-[11px]">
                            <thead className="text-emerald-800 border-b border-emerald-200">
                                <tr>
                                    <th className="text-left py-2">ACTIVIDAD</th>
                                    <th className="text-left py-2">DURACIÓN</th>
                                    <th className="text-left py-2">FECHA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trabajosDelPago.map((t) => {
                                    const fecha = t.fecha_inicio?.split('T')[0] || '';
                                    return (
                                        <tr key={t.id_trabajo} className="border-b border-emerald-100">
                                            <td className="py-2 font-medium">{t.tipo_actividad}</td>
                                            <td className="py-2">{Number(t.duracion_horas).toFixed(1)} hrs</td>
                                            <td className="py-2 text-gray-500">{fecha}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="border-b-2 border-gray-400 px-4 py-3 text-center">
                        <p className="text-[10px] text-gray-400 italic">
                            No hay trabajos en el período seleccionado
                        </p>
                    </div>
                )}
                
                {trabajosDelPago.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-emerald-200 flex justify-between items-center border-b-2 border-gray-400 px-4 py-2">
                        <span className="text-[10px] font-black text-emerald-800 uppercase">Total Horas:</span>
                        <span className="text-sm font-bold text-emerald-700">{totalHoras.toFixed(1)} horas</span>
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* SELECTOR DE MES Y AÑO */}
            {/* ============================================================ */}
            <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase ml-4 text-emerald-800 font-black tracking-[1px] flex items-center gap-1">
                        <Calendar size={10} />
                        Mes
                    </label>
                    <select
                        value={mesSeleccionado}
                        onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                        className="px-6 py-3 text-[12px] border-b-2 border-gray-400 focus:outline-none uppercase hover:border-emerald-500 transition-all"
                    >
                        {meses.map((mes, idx) => (
                            <option key={idx} value={idx}>{mes}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase ml-4 text-emerald-800 font-black tracking-[1px] flex items-center gap-1">
                        <Calendar size={10} />
                        Año
                    </label>
                    <select
                        value={anoSeleccionado}
                        onChange={(e) => setAnoSeleccionado(parseInt(e.target.value))}
                        className="border-b-2 border-gray-400 px-6 py-3 text-[12px] border-b-2 border-gray-400 focus:outline-none hover:border-emerald-500 transition-all"
                    >
                        {anos.map((ano) => (
                            <option key={ano} value={ano}>{ano}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ============================================================ */}
            {/* NOTA INFORMATIVA */}
            {/* ============================================================ */}
            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200">
                <p className="text-[10px] text-amber-700 text-center flex items-center justify-center gap-2">
                    <AlertCircle size={12} />
                    ⚠️ El pago en efectivo solo podrá registrarse después de que el trabajador 
                    haya firmado este formato. El formato firmado debe ser escaneado y subido como evidencia.
                </p>
            </div>

            {/* ============================================================ */}
            {/* BOTONES */}
            {/* ============================================================ */}
            <div className="flex justify-between gap-4 mt-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancelar}
                    disabled={generando || generandoPDF}
                    className="flex-1 border-b-2 border-gray-400 border border-emerald-400 text-emerald-800 px-6 py-3 font-black text-[11px] uppercase italic 
                    shadow-sm active:scale-95 hover:bg-emerald-50 transition-all disabled:opacity-50 rounded-full"
                >
                    Cancelar
                </button>
                {onPrevisualizar && (
                    <button
                        type="button"
                        onClick={handlePrevisualizar}
                        disabled={generando || generandoPDF || yaPagado || !trabajador || trabajosDelPago.length === 0}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-black text-[11px] uppercase shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Eye size={14} />
                        Previsualizar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={generando || generandoPDF || yaPagado || !trabajador || trabajosDelPago.length === 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 font-black text-[11px] uppercase shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                    rounded-full"
                >
                    <Download size={14} />
                    Descargar PDF
                </button>
            </div>
        </form>
    );
};