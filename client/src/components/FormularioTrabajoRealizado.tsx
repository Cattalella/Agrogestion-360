import { useState, useEffect } from "react";
import { type TrabajoRealizado } from "../hooks/useTrabajoRealizado";

interface Props {
    trabajoAEditar: TrabajoRealizado | null;
    onGuardar: (datos: Omit<TrabajoRealizado, 'id' | 'duracion_trabajo' | 'eliminado'>, cerrar: boolean) => void;
    onCancelar: () => void;
}

export const FormularioTrabajoRealizado = ({ trabajoAEditar, onGuardar, onCancelar }: Props) => {
    const [form, setForm] = useState<Omit<TrabajoRealizado, 'id' | 'duracion_trabajo' | 'eliminado'>>({
        id_mantenimiento: "",
        id_trabajador: "",
        categoria_trabajo: "",
        tipo_actividad: "",
        fecha_inicio: "",
        fecha_fin: "",
        evidencia_fotografica: "",
        observaciones: "",
    });

    useEffect(() => {
        if (trabajoAEditar) {
            setForm({
                id_mantenimiento: trabajoAEditar.id_mantenimiento,
                id_trabajador: trabajoAEditar.id_trabajador,
                categoria_trabajo: trabajoAEditar.categoria_trabajo,
                tipo_actividad: trabajoAEditar.tipo_actividad,
                fecha_inicio: trabajoAEditar.fecha_inicio,
                fecha_fin: trabajoAEditar.fecha_fin,
                evidencia_fotografica: trabajoAEditar.evidencia_fotografica,
                observaciones: trabajoAEditar.observaciones,
            });
        }
    }, [trabajoAEditar]);

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
                    placeholder="ID Mantenimiento"
                    value={form.id_mantenimiento}
                    onChange={(e) => setForm({ ...form, id_mantenimiento: e.target.value })}
                    required
                />
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
                    placeholder="Categoría (Ej: Cerca, Maquinaria)"
                    value={form.categoria_trabajo}
                    onChange={(e) => setForm({ ...form, categoria_trabajo: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded"
                    type="text"
                    placeholder="Tipo de Actividad"
                    value={form.tipo_actividad}
                    onChange={(e) => setForm({ ...form, tipo_actividad: e.target.value })}
                    required
                />
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500 ml-1">Fecha/Hora Inicio</label>
                    <input
                        className="border p-2 rounded"
                        type="datetime-local"
                        value={form.fecha_inicio}
                        onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                        required
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500 ml-1">Fecha/Hora Fin</label>
                    <input
                        className="border p-2 rounded"
                        type="datetime-local"
                        value={form.fecha_fin}
                        onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                        required
                    />
                </div>
            </div>

            <input
                className="border p-2 rounded"
                type="text"
                placeholder="URL Evidencia Fotográfica (Obligatorio)"
                value={form.evidencia_fotografica}
                onChange={(e) => setForm({ ...form, evidencia_fotografica: e.target.value })}
                required
            />

            <textarea
                className="border p-2 rounded"
                placeholder="Observaciones"
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
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
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    {trabajoAEditar ? "Actualizar Registro" : "Registrar Trabajo"}
                </button>
            </div>
        </form>
    );
};