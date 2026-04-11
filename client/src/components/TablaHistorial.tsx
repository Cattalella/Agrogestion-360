interface Props {
    datos: any[];
    onNuevo: () => void;
}

export const TablaHistorial = ({ datos, onNuevo }: Props) => {
    return (
        <div className="flex flex-col gap-6 p-4 uppercase tracking-widest text-[10px]">
            
            {/* Contenedor de la Tabla */}
            <div className="overflow-x-auto rounded-3xl border shadow-sm" style={{ borderColor: 'var(--color-gray)' }}>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-400 font-black">
                        <tr>
                            <th className="p-5">TRABAJADOR</th>
                            <th className="p-5 text-center">FECHA</th>
                            <th className="p-5 text-center">MONTO</th>
                            <th className="p-5 text-right">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 font-bold">
                        {datos.length > 0 ? (
                            datos.map((pago) => (
                                <tr key={pago.id} className="border-t hover:bg-gray-50/50 transition-colors" style={{ borderTopColor: 'var(--color-gray)' }}>
                                    <td className="p-5 text-emerald-900 font-black">
                                        {pago.trabajadorId}
                                    </td>
                                    <td className="p-5 text-center">
                                        {pago.fechaPago}
                                    </td>
                                    <td className="p-5 text-center text-emerald-600">
                                        ${pago.totalPagado}
                                    </td>
                                    <td className="p-5 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 transition-colors font-black">
                                            DETALLES
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-16 text-center lowercase italic opacity-30 text-[14px]">
                                    No se han encontrado registros de pagos...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Botón para cambiar a la vista de formulario */}
            <button 
                onClick={onNuevo}
                className="w-full py-5 bg-[#4ba300] text-white rounded-full font-black text-[14px] shadow-lg hover:bg-[#3d8200] transition-all active:scale-95"
            >
                + REGISTRAR NUEVO PAGO
            </button>

        </div>
    );
};