import { useState, useEffect } from "react";
import { type Trabajador, type EstadoTrabajador } from "../hooks/useNuevoTrabajador";

interface Props {
    trabajadorAEditar: Trabajador | null;
    onGuardar: (datos: Omit<Trabajador, 'id' | 'eliminado'>, cerrar: boolean) => void;
    onCancelar: () => void;
}

export const FormularioNuevoTrabajador = ({ trabajadorAEditar, onGuardar, onCancelar }: Props) => {
    const [form, setForm] = useState<Omit<Trabajador, 'id' | 'eliminado'>>({
        id_trabajador: "",
        nombre_completo: "",
        tipo_documento: "",
        numero_documento: "",
        tipo_trabajo: "",
        telefono: "",
        telefono_familiar: "",
        direccion: "",
        estado: "activo",
        fecha_ingreso: "",
        observaciones: "",
    });

    useEffect(() => {
        if (trabajadorAEditar) {
            setForm({
                id_trabajador: trabajadorAEditar.id_trabajador,
                nombre_completo: trabajadorAEditar.nombre_completo,
                tipo_documento: trabajadorAEditar.tipo_documento,
                numero_documento: trabajadorAEditar.numero_documento,
                tipo_trabajo: trabajadorAEditar.tipo_trabajo,
                telefono: trabajadorAEditar.telefono,
                telefono_familiar: trabajadorAEditar.telefono_familiar,
                direccion: trabajadorAEditar.direccion,
                estado: trabajadorAEditar.estado,
                fecha_ingreso: trabajadorAEditar.fecha_ingreso,
                observaciones: trabajadorAEditar.observaciones || "",
            });
        }
    }, [trabajadorAEditar]);

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
                    placeholder="ID Interno (Ej: TR-01)"
                    value={form.id_trabajador}
                    onChange={(e) => setForm({ ...form, id_trabajador: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded"
                    type="text"
                    placeholder="Nombre Completo"
                    value={form.nombre_completo}
                    onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
                    required
                />
                <select
                    className="border p-2 rounded"
                    value={form.tipo_documento}
                    onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}
                    required
                >
                    <option value="">Tipo Documento</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PPT">PPT</option>
                </select>
                <input
                    className="border p-2 rounded"
                    type="text"
                    placeholder="Número de Documento"
                    value={form.numero_documento}
                    onChange={(e) => setForm({ ...form, numero_documento: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded"
                    type="text"
                    placeholder="Tipo de Trabajo / Cargo"
                    value={form.tipo_trabajo}
                    onChange={(e) => setForm({ ...form, tipo_trabajo: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded"
                    type="date"
                    value={form.fecha_ingreso}
                    onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded"
                    type="tel"
                    placeholder="Teléfono Personal"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded"
                    type="tel"
                    placeholder="Teléfono Familiar / Emergencia"
                    value={form.telefono_familiar}
                    onChange={(e) => setForm({ ...form, telefono_familiar: e.target.value })}
                    required
                />
                <input
                    className="border p-2 rounded md:col-span-2"
                    type="text"
                    placeholder="Dirección de Residencia"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600">Estado Laboral</label>
                <select
                    className="border p-2 rounded bg-gray-50"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoTrabajador })}
                >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                </select>
            </div>

            <textarea
                className="border p-2 rounded"
                placeholder="Observaciones adicionales..."
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
                    className="bg-indigo-600 text-white px-4 py-2 rounded font-medium"
                >
                    {trabajadorAEditar ? "Guardar Cambios" : "Vincular Trabajador"}
                </button>
            </div>
        </form>
    );
};