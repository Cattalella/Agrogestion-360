import { useState, useEffect } from "react";
import { DollarSign, TrendingUp } from "lucide-react";

interface FormularioVentaProps {
    listaAnimales: any[];
    onGuardar: (datos: any, cerrar: boolean) => void;
    ventaAEditar?: any | null;
    onCancelarEdicion?: () => void;
}

export const FormularioVenta = ({ 
    listaAnimales, 
    onGuardar,
    ventaAEditar,
    onCancelarEdicion
}: FormularioVentaProps) => {
    
    const esEdicion = !!ventaAEditar;

    const estadoInicial = {
        tipo_animal: "",
        id_animal: "",
        fecha_venta: new Date().toISOString().split('T')[0],
        peso_venta: "",
        precio_kilo: "",
        precio_total: "",
        comprador: "",
        num_factura: "",
        metodo_pago: "Efectivo",
        observaciones: ""
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [animalesFiltrados, setAnimalesFiltrados] = useState<any[]>([]);
    const [animalSeleccionado, setAnimalSeleccionado] = useState<any>(null);

    // Cargar datos cuando se está editando
    useEffect(() => {
        if (ventaAEditar) {
            console.log('✏️ Cargando venta para edición:', ventaAEditar);
            setFormData({
                tipo_animal: ventaAEditar.tipo_animal || "",
                id_animal: ventaAEditar.id_animal?.toString() || "",
                fecha_venta: ventaAEditar.fecha_venta?.split('T')[0] || new Date().toISOString().split('T')[0],
                peso_venta: ventaAEditar.peso_venta?.toString() || "",
                precio_kilo: "",
                precio_total: ventaAEditar.precio_total?.toString() || "",
                comprador: ventaAEditar.comprador || "",
                num_factura: ventaAEditar.num_factura || "",
                metodo_pago: ventaAEditar.metodo_pago || "Efectivo",
                observaciones: ventaAEditar.observaciones || ""
            });
        } else {
            setFormData(estadoInicial);
            setAnimalesFiltrados([]);
            setAnimalSeleccionado(null);
        }
    }, [ventaAEditar]);

    // Función para determinar si un animal es GANADO por su código local
    const esGanadoPorCodigo = (codigoLocal: string) => {
        return codigoLocal?.startsWith('VA') || 
               codigoLocal?.startsWith('TO') || 
               codigoLocal?.startsWith('NO') || 
               codigoLocal?.startsWith('TE');
    };

    // Función para determinar si un animal es CERDO por su código local
    const esCerdoPorCodigo = (codigoLocal: string) => {
        return codigoLocal?.startsWith('C') || 
               codigoLocal?.startsWith('V') || 
               codigoLocal?.startsWith('L') || 
               codigoLocal?.startsWith('E');
    };

    // Filtrar animales por tipo seleccionado usando el código local (solo ACTIVOS)
    useEffect(() => {
        if (formData.tipo_animal === "GANADO") {
            const ganado = listaAnimales.filter(a => {
                const codigoLocal = a.codigo_local || a.local || '';
                const esGanado = esGanadoPorCodigo(codigoLocal);
                const estaActivo = a.estado === 'Activo' || 
                                  a.estado?.nombre === 'Activo' || 
                                  a.EstadoAni?.nombre === 'Activo';
                return esGanado && estaActivo;
            });
            setAnimalesFiltrados(ganado);
        } else if (formData.tipo_animal === "CERDO") {
            const cerdos = listaAnimales.filter(a => {
                const codigoLocal = a.codigo_local || a.local || '';
                const esCerdo = esCerdoPorCodigo(codigoLocal);
                const estaActivo = a.estado === 'Activo' || 
                                  a.estado?.nombre === 'Activo' || 
                                  a.EstadoAni?.nombre === 'Activo';
                return esCerdo && estaActivo;
            });
            setAnimalesFiltrados(cerdos);
        } else {
            setAnimalesFiltrados([]);
        }
    }, [formData.tipo_animal, listaAnimales]);

    // Auto-completar peso al seleccionar animal
    useEffect(() => {
        if (formData.id_animal) {
            const animal = animalesFiltrados.find(a => 
                (a.id_animal || a.id) === parseInt(formData.id_animal)
            );
            setAnimalSeleccionado(animal);
            if (animal?.peso_actual && !esEdicion) {
                setFormData(prev => ({ ...prev, peso_venta: animal.peso_actual.toString() }));
            }
        } else {
            setAnimalSeleccionado(null);
        }
    }, [formData.id_animal, animalesFiltrados, esEdicion]);

    // Calcular precio total automáticamente
    useEffect(() => {
        const peso = parseFloat(formData.peso_venta) || 0;
        const precioKilo = parseFloat(formData.precio_kilo) || 0;
        
        if (peso > 0 && precioKilo > 0) {
            const total = peso * precioKilo;
            setFormData(prev => ({ ...prev, precio_total: total.toFixed(2) }));
        }
    }, [formData.peso_venta, formData.precio_kilo]);

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
        if (name === 'tipo_animal') {
            setFormData(prev => ({ ...prev, id_animal: '', peso_venta: '' }));
            setAnimalSeleccionado(null);
        }
    };

    const manejarCambioNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validarFormulario = (): boolean => {
        const nuevosErrores: Record<string, string> = {};
        
        if (!formData.tipo_animal) nuevosErrores.tipo_animal = 'Selecciona el tipo de animal';
        if (!formData.id_animal) nuevosErrores.id_animal = 'Selecciona un animal';
        if (!formData.peso_venta || parseFloat(formData.peso_venta) <= 0) nuevosErrores.peso_venta = 'El peso debe ser mayor a 0';
        if (!formData.precio_kilo || parseFloat(formData.precio_kilo) <= 0) nuevosErrores.precio_kilo = 'El precio por kilo debe ser mayor a 0';
        if (!formData.comprador) nuevosErrores.comprador = 'El comprador es obligatorio';
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const ejecutarEnvio = (cerrar: boolean) => {
        if (!validarFormulario()) return;

        const datosParaBackend = {
            id_animal: parseInt(formData.id_animal),
            fecha_venta: formData.fecha_venta,
            peso_venta: parseFloat(formData.peso_venta),
            precio_total: parseFloat(formData.precio_total),
            comprador: formData.comprador,
            num_factura: formData.num_factura || null,
            metodo_pago: formData.metodo_pago,
            observaciones: formData.observaciones || null
        };

        console.log('📤 Datos a enviar (Venta):', datosParaBackend);
        onGuardar(datosParaBackend, cerrar);
        
        if (!cerrar && !esEdicion) {
            setFormData(estadoInicial);
            setAnimalesFiltrados([]);
            setAnimalSeleccionado(null);
            setErrores({});
        }
    };

    const handleCancelar = () => {
        if (onCancelarEdicion) onCancelarEdicion();
    };

    // Formatear precio para mostrar
    const formatearPrecio = (precio: string) => {
        if (!precio) return '';
        const num = parseFloat(precio);
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 p-2">
            {/* COLUMNA IZQUIERDA */}
            <div className="flex flex-col gap-3">
                {/* Tipo de Animal - GANADO / CERDOS */}
                <div>
                    <select
                        name="tipo_animal"
                        value={formData.tipo_animal}
                        onChange={manejarCambio}
                        disabled={esEdicion}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.tipo_animal ? 'border-red-400 focus:ring-red-300 text-red-500' : 'border-orange-200 focus:ring-orange-300 text-gray-600'
                        } ${esEdicion ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="">TIPO DE ANIMAL *</option>
                        <option value="GANADO">🐄 GANADO</option>
                        <option value="CERDO">🐖 CERDOS</option>
                    </select>
                    {errores.tipo_animal && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.tipo_animal}</p>
                    )}
                    {esEdicion && (
                        <p className="text-[8px] text-gray-400 ml-4 mt-1">⚠️ Tipo de animal bloqueado en edición</p>
                    )}
                </div>

                {/* ID del Animal */}
                <div>
                    <select
                        name="id_animal"
                        value={formData.id_animal}
                        onChange={manejarCambio}
                        disabled={!formData.tipo_animal || animalesFiltrados.length === 0 || esEdicion}
                        className={`w-full border-1 rounded-full px-6 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                            errores.id_animal ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300 text-orange-700 font-bold'
                        } ${(!formData.tipo_animal || esEdicion) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="">SELECCIONAR ANIMAL *</option>
                        {animalesFiltrados.map(animal => {
                            const animalId = animal.id_animal || animal.id;
                            const animalLocal = animal.local || animal.codigo_local || '—';
                            const animalPeso = animal.peso_actual ? `${animal.peso_actual} kg` : '—';
                            const uniqueKey = `${animalId}-${animalLocal}`;
                            
                            return (
                                <option key={uniqueKey} value={animalId}>
                                    {animalLocal} - {animalPeso}
                                </option>
                            );
                        })}
                    </select>
                    {errores.id_animal && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.id_animal}</p>
                    )}
                    {formData.tipo_animal && animalesFiltrados.length === 0 && !esEdicion && (
                        <p className="text-[9px] text-amber-500 ml-4 mt-0.5">
                            ⚠️ No hay animales {formData.tipo_animal === 'GANADO' ? 'GANADO' : 'CERDOS'} activos disponibles
                        </p>
                    )}
                </div>

                {/* Peso del Animal con "kg" pegado */}
                <div className="relative">
                    <input
                        name="peso_venta"
                        value={formData.peso_venta}
                        onChange={manejarCambioNumerico}
                        type="text"
                        inputMode="decimal"
                        placeholder="PESO DEL ANIMAL"
                        className={`w-full border-1 rounded-full pl-4 pr-12 py-2 text-[12px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                            errores.peso_venta ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                        } ${animalSeleccionado && !esEdicion ? 'bg-orange-50' : ''}`}
                        readOnly={!!animalSeleccionado && !esEdicion}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-orange-400">
                        kg
                    </span>
                    {errores.peso_venta && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.peso_venta}</p>
                    )}
                </div>

                {/* Precio por Kilo con "$/kg" pegado */}
                <div className="relative">
                    <input
                        name="precio_kilo"
                        value={formData.precio_kilo}
                        onChange={manejarCambioNumerico}
                        type="text"
                        inputMode="decimal"
                        placeholder="PRECIO POR KILO"
                        className={`w-full border-1 rounded-full pl-4 pr-14 py-2 text-[12px] focus:outline-none focus:ring-2 text-right font-bold transition-all ${
                            errores.precio_kilo ? 'border-red-400 focus:ring-red-300' : 'border-orange-200 focus:ring-orange-300'
                        }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600">
                        $/kg
                    </span>
                    {errores.precio_kilo && (
                        <p className="text-[9px] text-red-500 ml-4 mt-0.5">{errores.precio_kilo}</p>
                    )}
                </div>
            </div>

            {/* COLUMNA DERECHA */}
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

                {/* Número de Factura */}
                <input
                    name="num_factura"
                    value={formData.num_factura}
                    onChange={manejarCambio}
                    type="text"
                    placeholder="NÚMERO DE FACTURA (opcional)"
                    className="border-1 border-orange-200 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-300"
                />

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

            {/* BOTONES */}
            <div className="col-span-2 flex justify-between mt-6 gap-4">
                {esEdicion ? (
                    <>
                        <button 
                            type="button"
                            onClick={handleCancelar}
                            className="flex-1 bg-gray-200 text-gray-600 px-6 py-3 rounded-full font-black text-[11px] uppercase italic shadow-sm active:scale-95 hover:bg-gray-300 transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="button"
                            onClick={() => ejecutarEnvio(true)}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                        >
                            ✏️ Actualizar Venta
                        </button>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </form>
    );
};