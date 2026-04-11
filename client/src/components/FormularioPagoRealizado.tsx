import { useState } from "react";

interface Props {
    onGuardar: (trabajo: any) => void;
    onCancelar: () => void;
}

export const FormularioTrabajoRealizado = ({ onGuardar, onCancelar }: Props) => {
    const [formData, setFormData] = useState({
        id_mantenimiento: "",
        id_trabajador: "",
        categoria_trabajo: "",
        tipo_activity: "",
        fecha_inicio: "",
        fecha_fin: "",
        observaciones: "",
        evidencia_fotografica: null as string | null // Para la URI de la imagen
    });

    const manejarSubmit = (e: React.FormEvent, cerrar: boolean) => {
        e.preventDefault();
        // RN. 8.1.2: Validación obligatoria de evidencia
        if (!formData.evidencia_fotografica) {
            alert("La evidencia fotográfica es obligatoria");
            return;
        }
        onGuardar(formData);
        if (cerrar) onCancelar();
    };

    return (
        <form className="flex flex-col items-center gap-6 p-8 max-w-4xl mx-auto">
            
            {/* Cabecera con Icono de Bombilla/Planta */}
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-16 h-16 text-emerald-600 border-2 border-emerald-600 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-10 h-10">
                        <path d="M12 2v8m0 0l-4-4m4 4l4-4" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeWidth="2"/>
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-[#446d1b] tracking-tight uppercase">
                    Trabajo Realizado
                </h2>
            </div>

            {/* Contenedor de Dos Columnas (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                
                {/* Columna Izquierda */}
                <div className="flex flex-col gap-3">
                    <input 
                        type="text" 
                        placeholder="ID MANTENIMIENTO" 
                        className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase text-sm"
                        style={{ borderColor: '#a3d17a' }}
                        onChange={(e) => setFormData({...formData, id_mantenimiento: e.target.value})}
                    />
                    <input 
                        type="text" 
                        placeholder="ID TRABAJADOR" 
                        className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase text-sm"
                        style={{ borderColor: '#a3d17a' }}
                        onChange={(e) => setFormData({...formData, id_trabajador: e.target.value})}
                    />
                    <input 
                        type="text" 
                        placeholder="CATEGORIA DEL TRABAJO" 
                        className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase text-sm"
                        style={{ borderColor: '#a3d17a' }}
                        onChange={(e) => setFormData({...formData, categoria_trabajo: e.target.value})}
                    />
                    <input 
                        type="text" 
                        placeholder="TIPO DE ACTIVIDAD" 
                        className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase text-sm"
                        style={{ borderColor: '#a3d17a' }}
                        onChange={(e) => setFormData({...formData, tipo_activity: e.target.value})}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 ml-4">FECHA INICIO</label>
                        <input 
                            type="date" 
                            className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase text-sm"
                            style={{ borderColor: '#a3d17a' }}
                            onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                        />
                    </div>
                </div>

                {/* Columna Derecha */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 ml-4">FECHA FIN</label>
                        <input 
                            type="date" 
                            className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase text-sm"
                            style={{ borderColor: '#a3d17a' }}
                            onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                        />
                    </div>
                    
                    {/* Campo Duración (Se calcula en el Hook, pero podemos mostrar un aviso) */}
                    <input 
                        type="text" 
                        placeholder="DURACIÓN DEL TRABAJO (AUTO)" 
                        disabled
                        className="border rounded-full p-3 text-center bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                        style={{ borderColor: '#a3d17a' }}
                    />

                    <input 
                        type="text" 
                        placeholder="OBSERVACIONES" 
                        className="border rounded-full p-3 text-center outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase text-sm"
                        style={{ borderColor: '#a3d17a' }}
                        onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    />

                    {/* Evidencia Fotográfica (RN. 8.1.2) */}
                    <div 
                        className="border-2 border-dashed rounded-[2rem] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors h-[100px]"
                        style={{ borderColor: '#a3d17a' }}
                        onClick={() => setFormData({...formData, evidencia_fotografica: "imagen_subida.jpg"})} // Simulación
                    >
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Evidencia Fotográfica</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8 text-gray-400">
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2"/>
                            <path d="M21 15l-5-5L5 21" strokeWidth="2"/>
                        </svg>
                        {formData.evidencia_fotografica && <span className="text-[9px] text-emerald-600 font-bold">¡LISTO!</span>}
                    </div>
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
                <button 
                    type="button"
                    onClick={(e) => manejarSubmit(e, false)}
                    className="bg-[#4ba300] text-white p-3 rounded-full font-bold shadow-md uppercase transition-all active:scale-95"
                >
                    Guardar y Seguir
                </button>
                <button 
                    type="button"
                    onClick={(e) => manejarSubmit(e, true)}
                    className="bg-[#a34b00] text-white p-3 rounded-full font-bold shadow-md uppercase transition-all active:scale-95"
                >
                    Guardar y Salir
                </button>
            </div>

        </form>
    );
};