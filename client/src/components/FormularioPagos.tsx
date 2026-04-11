import { useState } from "react";

interface Props {
    onGuardar: (pago: any) => void;
    onCancelar: () => void;
}

export const FormularioPago = ({ onGuardar, onCancelar }: Props) => {
    const [formData, setFormData] = useState({
        trabajadorId: "",
        tipoTrabajo: "",
        fechaPago: "",
        concepto: "",
        totalPagado: ""
    });

    const manejarSubmit = (e: React.FormEvent, cerrar: boolean) => {
        e.preventDefault();
        onGuardar(formData);
        if (cerrar) onCancelar();
    };

    return (
        <form className="flex flex-col items-center gap-6 p-8">
            
            {/* Cabecera con Icono y Título */}
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-16 h-16 text-blue-500 border-2 border-blue-500 rounded-full flex items-center justify-center italic font-serif text-3xl">
                    i
                </div>
                <h2 className="text-3xl font-bold text-gray-500 tracking-tight">
                    REGISTRAR PAGOS
                </h2>
            </div>

            {/* Cuerpo del Formulario - Inputs Centrados */}
            <div className="w-full max-w-sm flex flex-col gap-3">
                <input 
                    type="text" 
                    placeholder="ID DEL TRABAJADOR" 
                    className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20"
                    style={{ borderColor: 'var(--color-gray)' }}
                    onChange={(e) => setFormData({...formData, trabajadorId: e.target.value})}
                />
                
                <input 
                    type="text" 
                    placeholder="TRABAJO REALIZADO" 
                    className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20"
                    style={{ borderColor: 'var(--color-gray)' }}
                    onChange={(e) => setFormData({...formData, tipoTrabajo: e.target.value})}
                />

                <input 
                    type="date" 
                    placeholder="FECHA DE PAGO" 
                    className="border rounded-full cursor-text p-3 text-center text-[var(--color-gray)] outline-none focus:ring-2 focus:ring-emerald-500/20"
                    style={{ borderColor: 'var(--color-gray)' }}
                    onChange={(e) => setFormData({...formData, fechaPago: e.target.value})}
                />

                <input 
                    type="text" 
                    placeholder="CONCEPTO DEL PAGO" 
                    className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20"
                    style={{ borderColor: 'var(--color-gray)' }}
                    onChange={(e) => setFormData({...formData, concepto: e.target.value})}
                />

                <input 
                    type="number" 
                    placeholder="TOTAL PAGADO" 
                    className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20"
                    style={{ borderColor: 'var(--color-gray)' }}
                    onChange={(e) => setFormData({...formData, totalPagado: e.target.value})}
                />
            </div>

            {/* Botones de Acción */}
            <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
                <button 
                    type="button"
                    onClick={(e) => manejarSubmit(e, false)}
                    className="bg-[#4ba300] text-white p-3 rounded-full font-bold shadow-md uppercase transition-all active:scale-95"
                >
                    GUARDAR Y SEGUIR
                </button>
                
                <button 
                    type="button"
                    onClick={(e) => manejarSubmit(e, true)}
                    className="bg-[#0028a3] text-white p-3 rounded-full font-bold shadow-md uppercase transition-all active:scale-95"
                >
                    GUARDAR Y SALIR
                </button>
            </div>

        </form>
    );
};