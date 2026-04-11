// Definimos la interfaz para las props de Vacunas
interface FormularioVacunaProps {
    onGuardar: (datos: any, cerrar: boolean) => void;
}

export const FormularioVacuna = ({ onGuardar }: FormularioVacunaProps) => {
    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300 p-4">
            <div className="flex flex-col gap-3">
                <input 
                    name="tipoVacuna" 
                    type="text" 
                    placeholder="TIPO DE VACUNA" 
                    className="border-1 border-cyan-300 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" 
                />
                
                <input 
                    name="dosis" 
                    type="text" 
                    placeholder="DOSIS APLICADA" 
                    className="border-1 border-cyan-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" 
                />
                
                <select 
                    name="tipoAnimal" 
                    className="border-1 border-cyan-300 rounded-full px-6 py-2 text-[12px] bg-white text-gray-500 appearance-none cursor-pointer"
                >
                    <option value="">TIPO DE ANIMAL</option>
                    <option value="BOVINO">BOVINO</option>
                    <option value="PORCINO">PORCINO</option>
                </select>

                <input 
                    name="animalId" 
                    type="text" 
                    placeholder="ID LOCAL DE ANIMAL" 
                    className="border-1 border-cyan-300 rounded-full px-6 py-2 text-[12px] focus:outline-none font-bold text-cyan-700" 
                />
            </div>

            <div className="flex flex-col gap-3">
                <input 
                    name="fechaAplicacion" 
                    type="text" 
                    placeholder="FECHA DE APLICACIÓN (DD/MM/AA)" 
                    className="border-1 border-cyan-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" 
                />
                
                <select 
                    name="viaAplicacion" 
                    className="border-1 border-cyan-300 rounded-full px-6 py-2 text-[12px] bg-white text-gray-500 cursor-pointer"
                >
                    <option value="">VÍA DE APLICACIÓN</option>
                    <option value="INTRAMUSCULAR">INTRAMUSCULAR</option>
                    <option value="SUBCUTANEA">SUBCUTÁNEA</option>
                    <option value="ORAL">ORAL</option>
                </select>

                <input 
                    name="proximoRefuerzo" 
                    type="text" 
                    placeholder="PRÓXIMO REFUERZO (DD/MM/AA)" 
                    className="border-1 border-cyan-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" 
                />
                
                <select 
                    name="lote" 
                    className="border-1 border-cyan-300 rounded-full px-6 py-2 text-[12px] bg-white text-gray-500 cursor-pointer"
                >
                    <option value="">LOTE DE MEDICAMENTO</option>
                    <option value="L-001">L-001</option>
                    <option value="L-002">L-002</option>
                </select>
            </div>

            <div className="col-span-2 flex justify-between mt-6 gap-4">
                <button 
                    type="button"
                    onClick={() => onGuardar({}, false)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-md active:scale-95 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button 
                    type="button"
                    onClick={() => onGuardar({}, true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    Guardar y Salir
                </button>
            </div>
        </form>
    );
};