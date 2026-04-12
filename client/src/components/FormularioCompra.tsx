import { useState } from "react";
import { type SolicitudCompra, type CategoriaGeneral } from "../hooks/useRegistrarCompra";

interface Props {
    tipoSeleccionado: CategoriaGeneral;
    setTipoSeleccionado: (tipo: CategoriaGeneral) => void;
    onGuardar: (datos: Omit<SolicitudCompra, 'id' | 'estado' | 'ejecutada' | 'eliminada' | 'fecha_creacion' | 'hora_creacion'>) => void;
    onCancelar: () => void;
}

export const FormularioCompra = ({ tipoSeleccionado, setTipoSeleccionado, onGuardar, onCancelar }: Props) => {
    const [form, setForm] = useState({
        categoria_general: tipoSeleccionado,
        fecha_propuesta: "",
        cantidad: 0,
        motivo: "",
        usuario: "",
        fecha_vencimiento: "",
        // Insumo
        categoria_insumo: "" as any,
        tipo_insumo: "",
        // Alimento
        especie_destino: "" as any,
        tipo_alimento: "",
        unidad_medida: "",
        proveedor: "",
        categoria_alimento: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGuardar({ ...form, categoria_general: tipoSeleccionado });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-4 border-b pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="tipo"
                        checked={tipoSeleccionado === 'insumo'}
                        onChange={() => setTipoSeleccionado('insumo')}
                    />
                    <span className={tipoSeleccionado === 'insumo' ? "font-bold text-green-600" : ""}>Insumo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="tipo"
                        checked={tipoSeleccionado === 'alimento'}
                        onChange={() => setTipoSeleccionado('alimento')}
                    />
                    <span className={tipoSeleccionado === 'alimento' ? "font-bold text-blue-600" : ""}>Alimento</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500 ml-1">Fecha Propuesta</label>
                    <input
                        className="border p-2 rounded"
                        type="date"
                        value={form.fecha_propuesta}
                        onChange={(e) => setForm({ ...form, fecha_propuesta: e.target.value })}
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500 ml-1">Cantidad</label>
                    <input
                        className="border p-2 rounded"
                        type="number"
                        placeholder="0"
                        value={form.cantidad}
                        onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
                        required
                    />
                </div>
            </div>

            {tipoSeleccionado === 'insumo' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-3 rounded">
                    <select
                        className="border p-2 rounded"
                        value={form.categoria_insumo}
                        onChange={(e) => setForm({ ...form, categoria_insumo: e.target.value as any })}
                    >
                        <option value="">Categoría de Insumo</option>
                        <option value="fertilizante">Fertilizante</option>
                        <option value="herramienta">Herramienta</option>
                        <option value="empaque">Empaque</option>
                    </select>
                    <input
                        className="border p-2 rounded"
                        type="text"
                        placeholder="Tipo de insumo (ej: Urea)"
                        value={form.tipo_insumo}
                        onChange={(e) => setForm({ ...form, tipo_insumo: e.target.value })}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-3 rounded">
                    <select
                        className="border p-2 rounded"
                        value={form.especie_destino}
                        onChange={(e) => setForm({ ...form, especie_destino: e.target.value as any })}
                    >
                        <option value="">Especie Destino</option>
                        <option value="cerdos">Cerdos</option>
                        <option value="peces">Peces</option>
                        <option value="ganado">Ganado</option>
                        <option value="gallinas">Gallinas</option>
                    </select>
                    <input
                        className="border p-2 rounded"
                        type="text"
                        placeholder="Proveedor sugerido"
                        value={form.proveedor}
                        onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        type="text"
                        placeholder="Unidad (Ej: Bulto 40kg)"
                        value={form.unidad_medida}
                        onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded"
                        type="text"
                        placeholder="Tipo Alimento"
                        value={form.tipo_alimento}
                        onChange={(e) => setForm({ ...form, tipo_alimento: e.target.value })}
                    />
                </div>
            )}

            <div className="flex flex-col">
                <label className="text-xs text-gray-500 ml-1">Fecha Vencimiento (Si aplica)</label>
                <input
                    className="border p-2 rounded"
                    type="date"
                    value={form.fecha_vencimiento}
                    onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                />
            </div>

            <input
                className="border p-2 rounded"
                type="text"
                placeholder="Solicitado por (Usuario)"
                value={form.usuario}
                onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                required
            />

            <textarea
                className="border p-2 rounded"
                placeholder="Motivo de la solicitud"
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                required
            />

            <div className="flex justify-end gap-2 mt-4">
                <button
                    type="button"
                    onClick={onCancelar}
                    className="px-4 py-2 border rounded text-gray-600"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-700 text-white rounded font-bold"
                >
                    Registrar Solicitud
                </button>
            </div>
        </form>
    );
};