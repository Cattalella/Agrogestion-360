import { useState } from "react";
import type { Trabajador } from "../hooks/useNuevoTrabajador";
import type { InsumoInventario, ActividadConsumo } from "../hooks/useConsumoInsumos";

interface Props {
    inventario: InsumoInventario[];
    trabajadoresActivos: Trabajador[];
    onGuardar: (datos: any) => boolean;
    onCancelar: () => void;
}

export const FormularioConsumoInsumos = ({
    inventario,
    trabajadoresActivos,
    onGuardar,
    onCancelar
}: Props) => {

    const [form, setForm] = useState({
        actividadSeleccionada: "siembra" as ActividadConsumo,
        fechaPropuesta: "",
        tipoInsumoId: "",
        cantidadSolicitada: 0,
        responsable: "",
        motivo: ""
    });

    const [errorInsumo, setErrorInsumo] = useState("");

    const handleInsumoChange = (id: string, cantidad: number) => {
        const insumo = inventario.find(i => i.id === id);
        if (insumo && cantidad > insumo.stock) {
            setErrorInsumo(`Solo hay ${insumo.stock} ${insumo.unidad} disponibles.`);
        } else {
            setErrorInsumo("");
        }
        setForm({ ...form, tipoInsumoId: id, cantidadSolicitada: cantidad });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.fechaPropuesta) {
            alert("La fecha es obligatoria.");
            return;
        }
        if (form.cantidadSolicitada <= 0) {
            alert("La cantidad debe ser mayor a 0.");
            return;
        }
        if (!form.tipoInsumoId) {
            alert("Debes seleccionar un insumo del inventario.");
            return;
        }
        if (!form.responsable) {
            alert("Debes seleccionar un responsable activo.");
            return;
        }
        if (!form.motivo.trim()) {
            alert("El motivo es obligatorio.");
            return;
        }
        if (errorInsumo) {
            alert("Corrige los errores de stock antes de registrar.");
            return;
        }
        
        const exito = onGuardar(form);
        if (exito) {
            // El modal se cierra o cambia de vista en el hook si tiene éxito
        }
    };

    const insumoSeleccionado = inventario.find(i => i.id === form.tipoInsumoId);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
            <div className="text-center border-b pb-3">
                <h2 className="text-lg font-bold text-gray-700">
                    REGISTRAR CONSUMO
                </h2>
                <p className="text-xs text-gray-400">
                    RF.7.1.4 - Consumo de Insumos
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">Actividad *</label>
                    <select className="border rounded-lg p-2 text-sm bg-white" value={form.actividadSeleccionada} onChange={(e) => setForm({ ...form, actividadSeleccionada: e.target.value as ActividadConsumo })} required>
                        <option value="siembra">Siembra</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="alimentación">Alimentación</option>
                        <option value="vacunación">Vacunación</option>
                    </select>
                </div>
                
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">Fecha *</label>
                    <input type="date" className="border rounded-lg p-2 text-sm" value={form.fechaPropuesta} onChange={(e) => setForm({ ...form, fechaPropuesta: e.target.value })} required />
                </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-4">
                <p className="text-xs font-bold text-emerald-700 uppercase">Detalle del Insumo</p>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-600 uppercase">Seleccione Insumo *</label>
                    <select className="border rounded-lg p-2 text-sm bg-white" value={form.tipoInsumoId} onChange={(e) => handleInsumoChange(e.target.value, form.cantidadSolicitada)} required>
                        <option value="">-- Buscar en inventario --</option>
                        {inventario.map(insumo => (
                            <option key={insumo.id} value={insumo.id}>
                                {insumo.nombre} (Disp: {insumo.stock} {insumo.unidad})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">Cantidad *</label>
                    <div className="flex gap-2 items-center">
                        <input type="number" step="0.01" className="border rounded-lg p-2 text-sm flex-1" value={form.cantidadSolicitada} onChange={(e) => handleInsumoChange(form.tipoInsumoId, Number(e.target.value))} required />
                        <span className="text-sm text-gray-500 font-bold bg-white border border-gray-200 p-2 rounded-lg w-20 text-center">
                            {insumoSeleccionado ? insumoSeleccionado.unidad : '---'}
                        </span>
                    </div>
                    {errorInsumo && <p className="text-red-500 text-xs font-semibold">{errorInsumo}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase">Responsable *</label>
                    <select className="border rounded-lg p-2 text-sm bg-white" value={form.responsable} onChange={(e) => setForm({ ...form, responsable: e.target.value })} required>
                        <option value="">-- Seleccionar Trabajador Activo --</option>
                        {trabajadoresActivos.map(t => (
                            <option key={t.id_trabajador} value={t.nombre_completo}>
                                {t.nombre_completo} ({t.tipo_trabajo})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Motivo del Consumo *</label>
                <textarea className="border rounded-lg p-2 text-sm resize-none" rows={2} placeholder="Describa el motivo..." value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} required />
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={onCancelar} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={!!errorInsumo} className={`px-5 py-2 rounded-lg font-medium transition-colors text-sm ${errorInsumo ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                    📥 Registrar Consumo
                </button>
            </div>
        </form>
    );
};
