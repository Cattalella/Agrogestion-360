import { useState, useEffect } from "react";
import type { 
    SolicitudCompra, 
    TipoSolicitud, 
    CategoriaInsumo, 
    EspecieDestino, 
    UnidadMedida 
} from "../hooks/useSolicitudCompra";
import type { Trabajador } from "../hooks/useNuevoTrabajador";

interface Props {
    solicitudAEditar: SolicitudCompra | null;
    tipoSeleccionado: TipoSolicitud;
    setTipoSeleccionado: (tipo: TipoSolicitud) => void;
    trabajadoresActivos: Trabajador[];
    onGuardar: (datos: any, usuario: string) => void;
    onCancelar: () => void;
    usuarioActual: string;
}

export const FormularioSolicitudCompra = ({
    solicitudAEditar,
    tipoSeleccionado,
    setTipoSeleccionado,
    trabajadoresActivos,
    onGuardar,
    onCancelar,
    usuarioActual
}: Props) => {

    const [form, setForm] = useState({
        tipo: tipoSeleccionado,
        fechaPropuesta: "",
        cantidad: 0,
        unidadMedida: "kg" as UnidadMedida,
        motivo: "",
        tipoInsumo: "",
        categoriaInsumo: "" as CategoriaInsumo | "",
        fechaVencimiento: "",
        tipoAlimento: "",
        especieDestino: "" as EspecieDestino | "",
        proveedor: "",
        categoriaAlimento: "",
    });

    useEffect(() => {
        if (solicitudAEditar) {
            setForm({
                tipo: solicitudAEditar.tipo,
                fechaPropuesta: solicitudAEditar.fechaPropuesta,
                cantidad: solicitudAEditar.cantidad,
                unidadMedida: solicitudAEditar.unidadMedida,
                motivo: solicitudAEditar.motivo,
                tipoInsumo: solicitudAEditar.tipoInsumo || "",
                categoriaInsumo: solicitudAEditar.categoriaInsumo || "",
                fechaVencimiento: solicitudAEditar.fechaVencimiento || "",
                tipoAlimento: solicitudAEditar.tipoAlimento || "",
                especieDestino: solicitudAEditar.especieDestino || "",
                proveedor: solicitudAEditar.proveedor || "",
                categoriaAlimento: solicitudAEditar.categoriaAlimento || "",
            });
        }
    }, [solicitudAEditar]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.fechaPropuesta) {
            alert("La fecha propuesta es obligatoria.");
            return;
        }
        if (form.cantidad <= 0) {
            alert("La cantidad debe ser mayor a 0.");
            return;
        }
        if (!form.motivo.trim()) {
            alert("El motivo es obligatorio.");
            return;
        }
        
        if (form.tipo === 'insumo' && !form.tipoInsumo) {
            alert("Debes especificar el tipo de insumo.");
            return;
        }
        
        if (form.tipo === 'alimento') {
            if (!form.tipoAlimento) {
                alert("Debes especificar el tipo de alimento.");
                return;
            }
            if (!form.especieDestino) {
                alert("Debes seleccionar la especie destino.");
                return;
            }
        }
        
        onGuardar(form, usuarioActual);
    };

    const tipoActual = tipoSeleccionado;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
            <div className="text-center border-b pb-3">
                <h2 className="text-lg font-bold text-gray-700">
                    {solicitudAEditar ? "EDITAR SOLICITUD" : "NUEVA SOLICITUD"}
                </h2>
                <p className="text-xs text-gray-400">
                    {tipoActual === 'insumo' ? 'RF.7.1.1 - Insumos Agrícolas' : 
                    tipoActual === 'alimento' ? 'RF.7.1.2 - Alimentos para Animales' : 
                    'RF.7.1.4 - Consumo de Insumos'}
                </p>
            </div>

            <div className="flex gap-4 border-b pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipo" checked={tipoActual === 'insumo'} onChange={() => setTipoSeleccionado('insumo')} disabled={!!solicitudAEditar} />
                    <span className={tipoActual === 'insumo' ? "font-bold text-green-600" : "text-gray-600"}>📦 Insumo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipo" checked={tipoActual === 'alimento'} onChange={() => setTipoSeleccionado('alimento')} disabled={!!solicitudAEditar} />
                    <span className={tipoActual === 'alimento' ? "font-bold text-blue-600" : "text-gray-600"}>🍖 Alimento</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">Fecha Propuesta *</label>
                    <input type="date" className="border rounded-lg p-2 text-sm" value={form.fechaPropuesta} onChange={(e) => setForm({ ...form, fechaPropuesta: e.target.value })} required />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">Cantidad *</label>
                    <input type="number" step="0.01" className="border rounded-lg p-2 text-sm" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} required />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase">Unidad de Medida *</label>
                    <select className="border rounded-lg p-2 text-sm bg-white" value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value as UnidadMedida })} required>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="litros">Litros (L)</option>
                        <option value="sacos">Sacos</option>
                        <option value="unidades">Unidades</option>
                        <option value="toneladas">Toneladas</option>
                    </select>
                </div>
            </div>

            {tipoActual === 'insumo' && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 space-y-4">
                    <p className="text-xs font-bold text-green-600 uppercase">Datos del Insumo</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Tipo de insumo *" className="border rounded-lg p-2 text-sm" value={form.tipoInsumo} onChange={(e) => setForm({ ...form, tipoInsumo: e.target.value })} required />
                        <select className="border rounded-lg p-2 text-sm bg-white" value={form.categoriaInsumo} onChange={(e) => setForm({ ...form, categoriaInsumo: e.target.value as CategoriaInsumo })}>
                            <option value="">Categoría</option>
                            <option value="fertilizante">Fertilizante</option>
                            <option value="herramienta">Herramienta</option>
                            <option value="empaque">Empaque</option>
                            <option value="otro">Otro</option>
                        </select>
                        <input type="date" placeholder="Fecha de vencimiento" className="border rounded-lg p-2 text-sm" value={form.fechaVencimiento} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })} />
                    </div>
                </div>
            )}

            {tipoActual === 'alimento' && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-4">
                    <p className="text-xs font-bold text-blue-600 uppercase">Datos del Alimento</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Tipo de alimento *" className="border rounded-lg p-2 text-sm" value={form.tipoAlimento} onChange={(e) => setForm({ ...form, tipoAlimento: e.target.value })} required />
                        <select className="border rounded-lg p-2 text-sm bg-white" value={form.especieDestino} onChange={(e) => setForm({ ...form, especieDestino: e.target.value as EspecieDestino })} required>
                            <option value="">Especie destino *</option>
                            <option value="cerdos">Cerdos</option>
                            <option value="peces">Peces</option>
                            <option value="ganado">Ganado</option>
                            <option value="gallinas">Gallinas</option>
                        </select>
                        <input type="text" placeholder="Proveedor" className="border rounded-lg p-2 text-sm" value={form.proveedor} onChange={(e) => setForm({ ...form, proveedor: e.target.value })} />
                        <input type="text" placeholder="Categoría" className="border rounded-lg p-2 text-sm" value={form.categoriaAlimento} onChange={(e) => setForm({ ...form, categoriaAlimento: e.target.value })} />
                        <input type="date" placeholder="Fecha de vencimiento" className="border rounded-lg p-2 text-sm" value={form.fechaVencimiento} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })} />
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Motivo de la solicitud *</label>
                <textarea className="border rounded-lg p-2 text-sm resize-none" rows={3} placeholder="Describa el motivo de la solicitud..." value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} required />
            </div>

            <div className="text-[10px] text-gray-400 bg-gray-50 rounded-lg p-2 text-center">
                📋 La solicitud se registrará con fecha, hora y usuario: <strong>{usuarioActual}</strong>
                <br />
                Estado inicial: <strong className="text-yellow-600">Pendiente</strong> - Solo el dueño puede aprobar/rechazar.
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={onCancelar} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm">Cancelar</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors text-sm">{solicitudAEditar ? "✏️ Actualizar Solicitud" : "📤 Enviar Solicitud"}</button>
            </div>
        </form>
    );
};