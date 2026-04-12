import { useState, useEffect } from 'react';
import type { Pago } from '../hooks/useRegistrarPagos';
import type { Trabajador } from '../hooks/useNuevoTrabajador';
import type { TrabajoRealizado } from '../hooks/useTrabajoRealizado';
import type { FormatoPago } from '../hooks/useGenerarPagoPDF';

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

    const [trabajadorId, setTrabajadorId] = useState<string>('');
    const [periodo, setPeriodo] = useState<string>(() => {
        const ahora = new Date();
        return `${ahora.getMonth() + 1}/${ahora.getFullYear()}`;
    });
    const [fechaInicio, setFechaInicio] = useState<string>(() => {
        const hoy = new Date();
        hoy.setDate(1);
        return hoy.toISOString().split('T')[0];
    });
    const [fechaFin, setFechaFin] = useState<string>(() => {
        const hoy = new Date();
        return hoy.toISOString().split('T')[0];
    });
    const [generando, setGenerando] = useState(false);
    const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<Trabajador | null>(null);
    const [trabajosFiltrados, setTrabajosFiltrados] = useState<TrabajoRealizado[]>([]);

    // Filtrar trabajos por trabajador y período
    useEffect(() => {
        if (!trabajadorId) {
            setTrabajosFiltrados([]);
            return;
        }

        const filtrados = trabajosRealizados.filter(t => {
            const fechaInicioTrabajo = new Date(t.fecha_inicio);
            const fechaFinTrabajo = new Date(t.fecha_fin);
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            
            return t.id_trabajador === trabajadorId &&
                   fechaInicioTrabajo >= inicio &&
                   fechaFinTrabajo <= fin;
        });

        setTrabajosFiltrados(filtrados);
    }, [trabajadorId, fechaInicio, fechaFin, trabajosRealizados]);

    // Obtener trabajador seleccionado
    useEffect(() => {
        const trabajador = trabajadores.find(t => t.id_trabajador === trabajadorId);
        setTrabajadorSeleccionado(trabajador || null);
    }, [trabajadorId, trabajadores]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!pagoSeleccionado) {
            alert("No hay un pago seleccionado para generar el formato");
            return;
        }
        
        if (!trabajadorSeleccionado) {
            alert("Selecciona un trabajador");
            return;
        }
        
        if (trabajosFiltrados.length === 0) {
            alert("No hay trabajos realizados en el período seleccionado");
            return;
        }
        
        setGenerando(true);
        
        try {
            await onGenerarPDF(
                pagoSeleccionado,
                trabajadorSeleccionado,
                trabajosFiltrados,
                periodo
            );
            alert("✅ Formato de pago generado correctamente");
            onCancelar();
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("❌ Error al generar el formato de pago");
        } finally {
            setGenerando(false);
        }
    };

    // Calcular monto total de los trabajos filtrados
    const montoTotal = pagoSeleccionado?.monto_total || 0;
    const totalHoras = trabajosFiltrados.reduce((sum, t) => {
        const horas = parseInt(t.duracion_trabajo) || 0;
        return sum + horas;
    }, 0);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
            <div className="text-center border-b pb-3">
                <h2 className="text-lg font-bold text-gray-700">GENERAR FORMATO DE PAGO</h2>
                <p className="text-xs text-gray-400">RF.8.1.4 - Formato para firma del trabajador</p>
            </div>

            {/* Información del Pago */}
            {pagoSeleccionado && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <p className="text-xs font-bold text-purple-600 uppercase mb-2">Información del Pago</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500">ID Pago:</span>
                            <span className="font-semibold ml-2">#{pagoSeleccionado.id}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Monto Total:</span>
                            <span className="font-bold text-green-600 ml-2">${pagoSeleccionado.monto_total.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Concepto:</span>
                            <span className="ml-2">{pagoSeleccionado.concepto}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Estado:</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                                pagoSeleccionado.estado === 'Pagado con firma' ? 'bg-green-100 text-green-600' :
                                pagoSeleccionado.estado === 'Pendiente de firma' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                            }`}>
                                {pagoSeleccionado.estado}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seleccionar Trabajador */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                        Trabajador *
                    </label>
                    <select
                        className="border rounded-lg p-2 text-sm bg-white"
                        value={trabajadorId}
                        onChange={(e) => setTrabajadorId(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar trabajador</option>
                        {trabajadores.map(t => (
                            <option key={t.id} value={t.id_trabajador}>
                                {t.nombre_completo} - {t.tipo_trabajo}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Período (texto) */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                        Período (Mes/Año)
                    </label>
                    <input
                        type="text"
                        className="border rounded-lg p-2 text-sm bg-gray-50"
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                        placeholder="Ej: Enero 2024"
                    />
                </div>

                {/* Fecha Inicio */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                        Fecha Inicio *
                    </label>
                    <input
                        type="date"
                        className="border rounded-lg p-2 text-sm"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        required
                    />
                </div>

                {/* Fecha Fin */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">
                        Fecha Fin *
                    </label>
                    <input
                        type="date"
                        className="border rounded-lg p-2 text-sm"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Resumen de Trabajos */}
            {trabajadorSeleccionado && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2">
                        Trabajos Realizados ({trabajosFiltrados.length})
                    </p>
                    {trabajosFiltrados.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="text-gray-500 border-b">
                                    <tr>
                                        <th className="text-left py-1">Actividad</th>
                                        <th className="text-left py-1">Duración</th>
                                        <th className="text-left py-1">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trabajosFiltrados.map(t => (
                                        <tr key={t.id} className="border-b border-blue-100">
                                            <td className="py-1">{t.tipo_actividad}</td>
                                            <td className="py-1">{t.duracion_trabajo}</td>
                                            <td className="py-1">{t.fecha_inicio.split('T')[0]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">
                            No hay trabajos en el período seleccionado
                        </p>
                    )}
                    
                    {trabajosFiltrados.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-blue-200 flex justify-between">
                            <span className="text-xs font-bold">Total Horas:</span>
                            <span className="text-xs font-bold text-blue-600">{totalHoras} horas</span>
                        </div>
                    )}
                </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancelar}
                    className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={generando || !trabajadorSeleccionado || trabajosFiltrados.length === 0}
                    className="px-5 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                >
                    {generando ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generando PDF...
                        </>
                    ) : (
                        '📄 Generar Formato de Pago'
                    )}
                </button>
            </div>

            {/* Nota informativa */}
            <div className="text-[10px] text-gray-400 text-center border-t pt-3 mt-2">
                ⚠️ El pago en efectivo solo podrá registrarse después de que el trabajador 
                haya firmado este formato. El formato firmado debe ser escaneado y subido como evidencia.
            </div>
        </form>
    );
};