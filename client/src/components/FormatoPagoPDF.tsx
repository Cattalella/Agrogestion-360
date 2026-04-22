import { useState, useEffect } from 'react';
import type { Pago } from '../hooks/useRegistrarPagos';
import type { Trabajador } from '../hooks/useNuevoTrabajador';
import type { TrabajoRealizado } from '../hooks/useTrabajoRealizado';
import type { FormatoPago } from '../hooks/useGenerarPagoPDF';
import { DollarSign, User, Calendar, FileText, AlertCircle, Download } from 'lucide-react';

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
}

export const FormularioGenerarPagoPDF = ({
    pagoSeleccionado,
    trabajadores,
    trabajosRealizados,
    onGenerarPDF,
    onCancelar
}: Props) => {

    // ============================================================
    // FUNCIONES DE FORMATEO DE MONTOS
    // ============================================================
    const formatearMoneda = (valor: number): string => {
        return new Intl.NumberFormat('es-CO').format(valor);
    };

    // Estado para mes y año seleccionados
    const [mesSeleccionado, setMesSeleccionado] = useState<number>(() => new Date().getMonth());
    const [anoSeleccionado, setAnoSeleccionado] = useState<number>(() => new Date().getFullYear());
    const [generando, setGenerando] = useState(false);
    const [trabajador, setTrabajador] = useState<Trabajador | null>(null);
    const [trabajosDelPago, setTrabajosDelPago] = useState<TrabajoRealizado[]>([]);
    const [error, setError] = useState<string | null>(null);

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
            // Calcular fechas de inicio y fin del mes seleccionado
            const fechaInicio = new Date(anoSeleccionado, mesSeleccionado, 1);
            const fechaFin = new Date(anoSeleccionado, mesSeleccionado + 1, 0);
            
            // Si el pago tiene un trabajo específico asociado
            if (pagoSeleccionado.id_trabajo) {
                const trabajo = trabajosRealizados.filter(t => t.id_trabajo === pagoSeleccionado.id_trabajo);
                setTrabajosDelPago(trabajo);
            } else {
                // Buscar trabajos del trabajador en el mes seleccionado
                const trabajos = trabajosRealizados.filter(t => 
                    t.id_trabajador === pagoSeleccionado.id_trabajador &&
                    new Date(t.fecha_inicio) >= fechaInicio &&
                    new Date(t.fecha_inicio) <= fechaFin
                );
                setTrabajosDelPago(trabajos);
            }
        }
    }, [pagoSeleccionado, trabajosRealizados, mesSeleccionado, anoSeleccionado]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setError(null);
        
        if (!pagoSeleccionado) {
            setError("No hay un pago seleccionado para generar el formato");
            return;
        }
        
        if (!trabajador) {
            setError("No se encontró el trabajador asociado a este pago");
            return;
        }
        
        if (trabajosDelPago.length === 0) {
            setError(`No hay trabajos realizados en ${periodo} asociados a este pago`);
            return;
        }
        
        if (pagoSeleccionado.estado_pago === 'Pagado con firma') {
            setError("Este pago ya está registrado como pagado con firma");
            return;
        }
        
        setGenerando(true);
        
        try {
            await onGenerarPDF(
                pagoSeleccionado,
                trabajador,
                trabajosDelPago,
                periodo
            );
            onCancelar();
        } catch (err) {
            console.error("Error al generar PDF:", err);
            setError("Error al generar el formato de pago");
        } finally {
            setGenerando(false);
        }
    };

    // Calcular total de horas
    const totalHoras = trabajosDelPago.reduce((sum, t) => {
        const horas = Number(t.duracion_horas) || 0;
        return sum + horas;
    }, 0);

    // Verificar si el pago ya está pagado
    const yaPagado = pagoSeleccionado?.estado_pago === 'Pagado con firma';

    if (!pagoSeleccionado) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <p className="text-gray-500">No hay un pago seleccionado</p>
                <button
                    type="button"
                    onClick={onCancelar}
                    className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full text-sm"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
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
            {generando && (
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                    <p className="text-sm text-emerald-600">Generando PDF, por favor espera...</p>
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
            {/* INFORMACIÓN DEL PAGO (con monto formateado) */}
            {/* ============================================================ */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2">
                    <DollarSign size={12} />
                    INFORMACIÓN DEL PAGO
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white rounded-full px-4 py-2">
                        <span className="text-gray-400 text-[9px] uppercase">ID Pago</span>
                        <p className="font-bold text-gray-700">#{pagoSeleccionado.id_pago}</p>
                    </div>
                    <div className="bg-white rounded-full px-4 py-2">
                        <span className="text-gray-400 text-[9px] uppercase">Monto Total</span>
                        <p className="font-bold text-emerald-600 text-lg">${formatearMoneda(pagoSeleccionado.monto_total)}</p>
                    </div>
                    <div className="bg-white rounded-full px-4 py-2 col-span-2">
                        <span className="text-gray-400 text-[9px] uppercase">Concepto</span>
                        <p className="font-medium text-gray-700">{pagoSeleccionado.concepto}</p>
                    </div>
                    <div className="bg-white rounded-full px-4 py-2">
                        <span className="text-gray-400 text-[9px] uppercase">Estado Actual</span>
                        <p className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-bold ${
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
                <div className="bg-emerald-50/30 rounded-2xl p-4 border border-emerald-200">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2">
                        <User size={12} />
                        DATOS DEL TRABAJADOR
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white rounded-full px-4 py-2 col-span-2">
                            <span className="text-gray-400 text-[9px] uppercase">Nombre</span>
                            <p className="font-bold text-gray-700">{trabajador.nombre_completo}</p>
                        </div>
                        <div className="bg-white rounded-full px-4 py-2">
                            <span className="text-gray-400 text-[9px] uppercase">Documento</span>
                            <p className="font-medium text-gray-700">{trabajador.tipo_documento} {trabajador.num_documento}</p>
                        </div>
                        <div className="bg-white rounded-full px-4 py-2">
                            <span className="text-gray-400 text-[9px] uppercase">Teléfono</span>
                            <p className="font-medium text-gray-700">{trabajador.telefono || 'No registrado'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TRABAJOS ASOCIADOS */}
            {/* ============================================================ */}
            <div className="bg-emerald-50/30 rounded-2xl p-4 border border-emerald-200">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2">
                    <FileText size={12} />
                    TRABAJOS ASOCIADOS ({trabajosDelPago.length})
                </p>
                
                {trabajosDelPago.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-[11px]">
                            <thead className="text-emerald-600 border-b border-emerald-200">
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
                    <div className="bg-white rounded-full px-4 py-3 text-center">
                        <p className="text-[10px] text-gray-400 italic">
                            No hay trabajos en el período seleccionado
                        </p>
                    </div>
                )}
                
                {trabajosDelPago.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-emerald-200 flex justify-between items-center bg-white rounded-full px-4 py-2">
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Total Horas:</span>
                        <span className="text-sm font-bold text-emerald-700">{totalHoras.toFixed(1)} horas</span>
                    </div>
                )}
            </div>

            {/* ============================================================ */}
            {/* SELECTOR DE MES Y AÑO */}
            {/* ============================================================ */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-600 font-black tracking-tighter flex items-center gap-1">
                        <Calendar size={10} />
                        Mes
                    </label>
                    <select
                        value={mesSeleccionado}
                        onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                        className="border border-emerald-200 rounded-full px-6 py-3 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                        {meses.map((mes, idx) => (
                            <option key={idx} value={idx}>{mes}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-emerald-600 font-black tracking-tighter flex items-center gap-1">
                        <Calendar size={10} />
                        Año
                    </label>
                    <select
                        value={anoSeleccionado}
                        onChange={(e) => setAnoSeleccionado(parseInt(e.target.value))}
                        className="border border-emerald-200 rounded-full px-6 py-3 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
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
                <p className="text-[9px] text-amber-700 text-center flex items-center justify-center gap-2">
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
                    disabled={generando}
                    className="flex-1 bg-white border border-emerald-400 text-emerald-600 px-6 py-3 rounded-full font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-emerald-50 transition-all disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={generando || yaPagado || !trabajador || trabajosDelPago.length === 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-black text-[11px] uppercase shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {generando ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generando PDF...
                        </>
                    ) : (
                        <>
                            <Download size={14} />
                            Generar Formato de Pago
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};