import { useState, useEffect } from "react";
import { DollarSign, TrendingUp } from "lucide-react";

interface FormularioVentasProps {
    listaAnimales: any[];
    onGuardar: (datos: any, cerrar: boolean) => void;
}

export const FormularioVenta = ({ listaAnimales, onGuardar }: FormularioVentasProps) => {
    
    // ============================================================
    // ESTADO INICIAL
    // ============================================================
    const estadoInicial = {
        tipo_animal: "",
        id_animal: "",
        fecha_venta: new Date().toISOString().split('T')[0],
        peso_animal: "",
        peso_kilo_unidad: "",
        precio_total: "",
        comprador: "",
        metodo_pago: "Efectivo",
        observaciones: ""
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [animalesFiltrados, setAnimalesFiltrados] = useState<any[]>([]);
    const [animalSeleccionado, setAnimalSeleccionado] = useState<any>(null);

    // ============================================================
    // FILTRAR ANIMALES POR TIPO SELECCIONADO (solo ACTIVOS)
    // ============================================================
    useEffect(() => {
        if (formData.tipo_animal) {
            const filtrados = listaAnimales.filter(a => {
                const esBovino = a.especie === 'Bovino' || a.especie?.nombre === 'Bovino' || a.tipo === 'BOVINO';
                const esPorcino = a.especie === 'Porcino' || a.especie?.nombre === 'Porcino' || a.tipo === 'PORCINO';
                const estaActivo = a.estado === 'Activo' || a.estado?.nombre === 'Activo' || a.EstadoAni?.nombre === 'Activo';
                
                if (formData.tipo_animal === 'BOVINO') {
                    return esBovino && estaActivo;
                } else {
                    return esPorcino && estaActivo;
                }
            });
            setAnimalesFiltrados(filtrados);
        } else {
            setAnimalesFiltrados([]);
        }
    }, [formData.tipo_animal, listaAnimales]);

    // ============================================================
    // AUTO-COMPLETAR PESO AL SELECCIONAR ANIMAL
    // ============================================================
    useEffect(() => {
        if (formData.id_animal) {
            const animal = animalesFiltrados.find(a => 
                (a.id_animal || a.id) === parseInt(formData.id_animal)
            );
            setAnimalSeleccionado(animal);
            if (animal?.peso_actual) {
                setFormData(prev => ({ ...prev, peso_animal: animal.peso_actual.toString() }));
            }
        } else {
            setAnimalSeleccionado(null);
        }
    }, [formData.id_animal, animalesFiltrados]);

    // ============================================================
    // CALCULAR PRECIO TOTAL AUTOMÁTICAMENTE
    // ============================================================
    useEffect(() => {
        const peso = parseFloat(formData.peso_animal) || 0;
        const precioKilo = parseFloat(formData.peso_kilo_unidad) || 0;
        
        if (peso > 0 && precioKilo > 0) {
            const total = peso * precioKilo;
            setFormData(prev => ({ ...prev, precio_total: total.toFixed(2) }));
        }
    }, [formData.peso_animal, formData.peso_kilo_unidad]);

    // ============================================================
    // MANEJADORES DE CAMBIOS
    // ============================================================
    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
        if (name === 'tipo_animal') {
            setFormData(prev => ({ ...prev, id_animal: '', peso_animal: '' }));
        }
    };

    const manejarCambioNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // ============================================================
    // VALIDACIÓN
    // ============================================================
    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!formData.tipo_animal) nuevosErrores.tipo_animal = 'Selecciona el tipo de animal';
        if (!formData.id_animal) nuevosErrores.id_animal = 'Selecciona un animal';
        if (!formData.peso_animal || parseFloat(formData.peso_animal) <= 0) nuevosErrores.peso_animal = 'El peso debe ser mayor a 0';
        if (!formData.peso_kilo_unidad || parseFloat(formData.peso_kilo_unidad) <= 0) nuevosErrores.peso_kilo_unidad = 'El precio por kilo debe ser mayor a 0';
        if (!formData.comprador) nuevosErrores.comprador = 'El comprador es obligatorio';
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // ============================================================
    // ENVIAR FORMULARIO
    // ============================================================
    const ejecutarEnvio = (cerrar: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            id_animal: parseInt(formData.id_animal),
            fecha_venta: formData.fecha_venta,
            peso_venta: parseFloat(formData.peso_animal),
            precio_total: parseFloat(formData.precio_total),
            comprador: formData.comprador,
            metodo_pago: formData.metodo_pago,
            observaciones: formData.observaciones || null
        };

        console.log('📤 Datos a enviar (Venta):', datosParaBackend);
        onGuardar(datosParaBackend, cerrar);
        
        if (!cerrar) {
            setFormData(estadoInicial);
            setErrores({});
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 p-2">
            {/* ============================================================ */}
            {/* COLUMNA IZQUIERDA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">
                {/* Tipo de Animal */}
                <div>
                    <select
                        name="tipo_animal"
                        value={formData.tipo_animal}
                        onChange={manejarCambio}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.tipo_animal ? 'border-red-400 focus:ring-red-300 text-red-500' : 'border-orange-200 focus:ring-orange-300 text-gray-600'
                        }`}
                    >
                        <option value="">TIPO DE ANIMAL *</option>
                        <option value="BOVINO">🐄 BOVINO</option>
                        <option value="PORCINO">🐖 PORCINO</option>
                    </select>
                    {errores.tipo_animal && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipo_animal}</p>
                    )}
                </div>

                {/* ID del Animal */}
                <div>
                    <select
                        name="id_animal"
                        value={formData.id_animal}
                        onChange={manejarCambio}
                        disabled={!formData.tipo_animal || animalesFiltrados.length === 0}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.id_animal ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300 text-orange-700 font-bold'
                        } ${!formData.tipo_animal ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="">SELECCIONAR ANIMAL *</option>
                        {animalesFiltrados.map(animal => {
                            const animalId = animal.id_animal || animal.id;
                            const animalLocal = animal.local || animal.codigo_local || '—';
                            const animalPeso = animal.peso_actual || animal.peso || '—';
                            
                            return (
                                <option key={animalId} value={animalId}>
                                    {animalLocal} - {animalPeso}kg
                                </option>
                            );
                        })}
                    </select>
                    {errores.id_animal && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.id_animal}</p>
                    )}
                </div>

                {/* Peso del Animal con "kg" pegado */}
                <div className="relative">
                    <input
                        name="peso_animal"
                        value={formData.peso_animal}
                        onChange={manejarCambioNumerico}
                        type="text"
                        inputMode="decimal"
                        placeholder="PESO DEL ANIMAL"
                        className={`w-full border-1 rounded-full pl-4 pr-12 py-2 text-[12px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                            errores.peso_animal ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                        } ${animalSeleccionado ? 'bg-orange-50' : ''}`}
                        readOnly={!!animalSeleccionado}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-orange-400">
                        kg
                    </span>
                    {errores.peso_animal && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.peso_animal}</p>
                    )}
                </div>

                {/* Precio por Kilo con "$" pegado */}
                <div className="relative">
                    <input
                        name="peso_kilo_unidad"
                        value={formData.peso_kilo_unidad}
                        onChange={manejarCambioNumerico}
                        type="text"
                        inputMode="decimal"
                        placeholder="PRECIO POR KILO"
                        className={`w-full border-1 rounded-full pl-4 pr-12 py-2 text-[12px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                            errores.peso_kilo_unidad ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                        }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600">
                        $/kg
                    </span>
                    {errores.peso_kilo_unidad && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.peso_kilo_unidad}</p>
                    )}
                </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMNA DERECHA */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-3">
                {/* Comprador */}
                <div>
                    <input
                        name="comprador"
                        value={formData.comprador}
                        onChange={manejarCambio}
                        type="text"
                        placeholder="COMPRADOR *"
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 transition-all ${
                            errores.comprador ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                        }`}
                    />
                    {errores.comprador && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.comprador}</p>
                    )}
                </div>

                {/* Fecha de Venta */}
                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase ml-4 text-orange-400 font-black tracking-tighter">
                        Fecha de Venta <span className="text-red-400">*</span>
                    </label>
                    <input
                        name="fecha_venta"
                        value={formData.fecha_venta}
                        onChange={manejarCambio}
                        type="date"
                        className="border-1 border-orange-100 rounded-full px-6 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-500"
                    />
                </div>

                {/* Método de Pago */}
                <select
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={manejarCambio}
                    className="border-1 border-orange-200 rounded-full px-6 py-2 text-[12px] bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
                >
                    <option value="Efectivo">💵 EFECTIVO</option>
                    <option value="Transferencia">🏦 TRANSFERENCIA</option>
                    <option value="Cheque">📝 CHEQUE</option>
                    <option value="Mixto">🔄 MIXTO</option>
                </select>

                {/* Precio Total (calculado automáticamente) */}
                <div className="relative">
                    <input
                        name="precio_total"
                        value={formData.precio_total}
                        type="text"
                        placeholder="PRECIO TOTAL"
                        className="w-full border-1 border-emerald-200 bg-emerald-50 rounded-full pl-4 pr-12 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-300 text-right font-bold text-emerald-700"
                        readOnly
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-emerald-600">
                        $
                    </span>
                </div>

                {/* Icono indicador */}
                <div className="flex items-center justify-end gap-1 text-[9px] text-orange-400 uppercase font-bold">
                    <TrendingUp size={12} />
                    <span>Total calculado automáticamente</span>
                </div>
            </div>

            {/* ============================================================ */}
            {/* BOTONES */}
            {/* ============================================================ */}
            <div className="col-span-2 flex justify-between mt-6 gap-4">
                <button 
                    type="button"
                    onClick={() => ejecutarEnvio(false)}
                    className="flex-1 bg-white border-1 border-orange-400 text-orange-500 px-6 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-orange-50 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button 
                    type="button"
                    onClick={() => ejecutarEnvio(true)}
                    className="flex-1 bg-[#A0522D] hover:bg-[#8B4513] text-white px-6 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    Guardar y Salir
                </button>
            </div>
        </form>
    );
};