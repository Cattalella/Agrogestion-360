import { type ReactNode } from "react";
import { X, Plus } from "lucide-react";

interface ModalGenericoProps {
    titulo: string;
    isOpen: boolean;
    onClose: () => void;
    width?: string;
    children: ReactNode;
}

export const ModalGenerico = ({ 
    titulo, 
    isOpen, 
    onClose, 
    width = "max-w-md", 
    children 
}: ModalGenericoProps) => {
    
    if (!isOpen) return null;

    // Función para manejar el clic en el fondo
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Si el id del elemento clickeado es 'modal-overlay', cerramos
        if ((e.target as HTMLDivElement).id === "modal-overlay") {
            onClose();
        }
    };

    return (
        <div 
            id="modal-overlay"
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        >
            
            {/* Contenedor del Modal */}
            <div className={`
                bg-white 
                w-full 
                ${width} 
                rounded-[2.5rem] 
                shadow-[0_10px_40px_rgba(0,0,0,0.2)] 
                relative 
                p-10 
                border-[1px] 
                border-gray-100
                animate-in zoom-in-95 duration-200
            `}>
                
                {/* Botón de cerrar */}
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-8 text-gray-300 hover:text-red-500 transition-all cursor-pointer active:scale-90"
                >
                    <X size={28} strokeWidth={2.5} />
                </button>

                {/* Encabezado */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-full border-2 border-blue-400 flex items-center justify-center mb-3 shadow-sm">
                        <Plus className="text-blue-500 w-6 h-6" /> 
                    </div>
                    
                    <h2 className="text-[1.1rem] font-black uppercase tracking-[3px] text-gray-600 text-center leading-tight">
                        {titulo}
                    </h2>
                </div>

                {/* Contenido */}
                <div className="w-full">
                    {children}
                </div>

            </div>
        </div>
    );
};