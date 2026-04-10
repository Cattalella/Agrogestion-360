// src/components/ModalConfirmacion.tsx

interface ModalProps {
    abierto: boolean;
    mensaje: string;
    onConfirmar: () => void;
    onCancelar: () => void;
}

export const Modal = ({ abierto, mensaje, onConfirmar, onCancelar }: ModalProps) => {
    // Si no está abierto, no renderizamos nada
    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Fondo oscuro con desenfoque */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={onCancelar} 
            />
            
            {/* Caja del Modal */}
            <div className="relative bg-white rounded-[2.5rem] p-10 shadow-2xl max-w-sm w-full transform transition-all border-1 border-gray-100">
                <div className="text-center">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-3xl font-black">!</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mb-2">¿ESTÁS SEGURO?</h3>
                    <p className="text-gray-500 text-sm leading-relaxed uppercase tracking-tight">
                        {mensaje}
                    </p>
                </div>

                <div className="flex gap-3 mt-8">
                    <button 
                        onClick={onCancelar}
                        className="flex-1 px-4 py-3 rounded-full font-bold text-gray-400 shadow-lg hover:border hover:border-dashed 0 hover:shadow-sky-200 shadow-lg transition-colors cursor-pointer"
                    >
                        CANCELAR
                    </button>
                    <button 
                        onClick={onConfirmar}
                        className="flex-1 px-4 py-3 rounded-full text-gray-400 font-bold hover:border hover:border-dashed hover:shadow-lg hover:shadow-red-200 shadow-lg transition-all cursor-pointer"
                    >
                        SÍ, BORRAR
                    </button>
                </div>
            </div>
        </div>
    );
};