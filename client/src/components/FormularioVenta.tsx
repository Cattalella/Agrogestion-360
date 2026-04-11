// Definimos la interfaz para las props de Ventas
interface FormularioVentaProps {
    onGuardar: (datos: any, cerrar: boolean) => void;
}

export const FormularioVenta = ({ onGuardar }: FormularioVentaProps) => {
    return (
        <form className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300 p-4">
            <div className="flex flex-col gap-3">
                <input 
                    name="idAnimal" 
                    type="text" 
                    placeholder="ID ANIMAL" 
                    className="border-1 border-orange-300 rounded-full px-6 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-400 font-bold text-orange-800 transition-all" 
                />
                
                <input 
                    name="pesoAnimal" 
                    type="text" 
                    placeholder="PESO DEL ANIMAL KG" 
                    className="border-1 border-orange-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" 
                />
                
                <input 
                    name="pesoKiloUnidad" 
                    type="text" 
                    placeholder="PESO POR KILO/UNIDAD" 
                    className="border-1 border-orange-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" 
                />
            </div>

            <div className="flex flex-col gap-3">
                <input 
                    name="vendedor" 
                    type="text" 
                    placeholder="VENDEDOR" 
                    className="border-1 border-orange-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" 
                />
                
                <input 
                    name="fechaVenta" 
                    type="text" 
                    placeholder="FECHA DE VENTA" 
                    className="border-1 border-orange-300 rounded-full px-6 py-2 text-[12px] focus:outline-none" 
                />
                
                <input 
                    name="precioVenta" 
                    type="text" 
                    placeholder="PRECIO DE VENTA" 
                    className="border-1 border-orange-300 rounded-full px-6 py-2 text-[12px] focus:outline-none font-bold text-emerald-600" 
                />
            </div>

            <div className="col-span-2 flex justify-between mt-6 gap-4">
                <button 
                    type="button"
                    onClick={() => onGuardar({}, false)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white flex-1 py-3 rounded-l-full rounded-r-lg font-black text-[11px] uppercase italic shadow-md active:scale-95 transition-all"
                >
                    Guardar y Seguir
                </button>
                <button 
                    type="button"
                    onClick={() => onGuardar({}, true)}
                    className="bg-[#A0522D] hover:bg-[#8B4513] text-white flex-1 py-3 rounded-r-full rounded-l-lg font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                >
                    Guardar y Salir
                </button>
            </div>
        </form>
    );
};