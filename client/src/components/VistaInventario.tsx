import type { ItemInventario, AlertaInventario, EstadoInventario } from "../hooks/useInventario";

interface Props {
    inventario: (ItemInventario & { estado: EstadoInventario })[];
    alertas: AlertaInventario[];
}

export const VistaInventario = ({ inventario, alertas }: Props) => {
    return (
        <div className="flex flex-col gap-6 p-4">
            {/* PANEL DE ALERTAS */}
            {alertas.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                    <h3 className="text-red-700 font-bold text-sm mb-3 flex items-center gap-2">
                        ⚠️ ALERTAS DEL SISTEMA ({alertas.length})
                    </h3>
                    <ul className="space-y-2">
                        {alertas.map(alerta => (
                            <li key={alerta.id} className="text-xs bg-white text-red-600 p-2 rounded border border-red-100 flex items-start gap-2 shadow-sm">
                                <span className="font-bold">{alerta.tipo === 'VENCIMIENTO' ? '⏱️' : '📉'}</span>
                                <div>
                                    <p className="font-semibold">{alerta.nombre}</p>
                                    <p>{alerta.mensaje}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* TABLA DE INVENTARIO */}
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <div className="bg-gray-50 text-gray-500 font-bold p-3 text-xs uppercase border-b border-gray-200">
                    Control de Inventario Actual
                </div>
                <table className="w-full text-left text-[11px] uppercase">
                    <thead className="bg-white text-gray-400 border-b border-gray-100">
                        <tr>
                            <th className="p-3">PRODUCTO</th>
                            <th className="p-3">CATEGORÍA</th>
                            <th className="p-3">STOCK ACTUAL</th>
                            <th className="p-3 hidden sm:table-cell">VENCIMIENTO</th>
                            <th className="p-3">ESTADO</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white text-gray-600 divide-y divide-gray-50">
                        {inventario.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 font-bold text-gray-800">{item.nombre}</td>
                                <td className="p-3">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-[9px]">
                                        {item.categoria}
                                    </span>
                                </td>
                                <td className="p-3 font-mono font-medium">
                                    <span className={item.stockActual <= item.stockMinimo ? 'text-red-600 font-bold' : 'text-emerald-600'}>
                                        {item.stockActual} {item.unidad}
                                    </span>
                                </td>
                                <td className="p-3 hidden sm:table-cell">
                                    {item.fechaVencimiento || <span className="text-gray-300">N/A</span>}
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold ${
                                        item.estado === 'Disponible' ? 'bg-green-100 text-green-700' :
                                        item.estado === 'Agotado' ? 'bg-gray-200 text-gray-600' :
                                        item.estado === 'Vencido' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700' // Bajo Stock
                                    }`}>
                                        {item.estado.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {inventario.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-gray-300 italic font-bold">
                                    — Inventario Vacío —
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="text-right">
                <p className="text-[10px] text-gray-400 italic">RF.7.1.5 - Mostrando reporte en tiempo real.</p>
            </div>
        </div>
    );
};
