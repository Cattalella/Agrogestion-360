import { useState, useEffect } from "react";
import { type Pago, type EstadoPago } from "../hooks/useRegistrarPagos";

interface Props {
    pagoAEditar: Pago | null;
    onGuardar: (datos: Omit<Pago, 'id' | 'contabilizado' | 'anulado'>, cerrar: boolean) => void;
    onCancelar: () => void;
}

export const FormularioPagos = ({ pagoAEditar, onGuardar, onCancelar }: Props) => {
    const [form, setForm] = useState<Omit<Pago, 'id' | 'contabilizado' | 'anulado'>>({
        id_trabajador: "",
        tipo_trabajo: "",
        fecha_pago: "",
        monto_total: 0,
        concepto: "",
        estado: "No pagado",
    });

    useEffect(() => {
        if (pagoAEditar) {
            setForm({
                id_trabajador: pagoAEditar.id_trabajador,
                tipo_trabajo: pagoAEditar.tipo_trabajo,
                fecha_pago: pagoAEditar.fecha_pago,
                monto_total: pagoAEditar.monto_total,
                concepto: pagoAEditar.concepto,
                estado: pagoAEditar.estado,
            });
        }
    }, [pagoAEditar]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGuardar(form, true);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    className="border p-2 rounded"
                    type="text"
                    placeholder="ID Trabajador"
                    value={form.id_trabajador}
                    onChange={(e) => setForm({ ...form, id_trabajador: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded"
                    type="text"
                    placeholder="Tipo de Trabajo"
                    value={form.tipo_trabajo}
                    onChange={(e) => setForm({ ...form, tipo_trabajo: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded"
                    type="date"
                    value={form.fecha_pago}
                    onChange={(e) => setForm({ ...form, fecha_pago: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded"
                    type="number"
                    placeholder="Monto Total"
                    value={form.monto_total}
                    onChange={(e) => setForm({ ...form, monto_total: Number(e.target.value) })}
                    required
                />
            </div>

            <select
                className="border p-2 rounded"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoPago })}
            >
                <option value="No pagado">No pagado</option>
                <option value="Pendiente de firma">Pendiente de firma</option>
                <option value="Pagado con firma">Pagado con firma</option>
            </select>

            <textarea
                className="border p-2 rounded"
                placeholder="Concepto"
                value={form.concepto}
                onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                required
            />

            <div className="flex justify-end gap-2 mt-4">
                <button
                    type="button"
                    onClick={onCancelar}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    {pagoAEditar ? "Actualizar Pago" : "Registrar Pago"}
                </button>
            </div>
        </form>
    );
};