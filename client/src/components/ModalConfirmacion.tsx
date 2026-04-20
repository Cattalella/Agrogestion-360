import { useEffect } from "react";
import { AlertTriangle, X, Trash2, FileWarning } from "lucide-react";

interface ModalConfirmacionProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    titulo: string;
    mensaje: string;
    subtitulo?: string;
    loading?: boolean;
    tipo?: 'eliminar' | 'advertencia' | 'peligro';
}

export const ModalConfirmacion = ({
    isOpen,
    onClose,
    onConfirm,
    titulo,
    mensaje,
    subtitulo,
    loading = false,
    tipo = 'eliminar'
}: ModalConfirmacionProps) => {
    
    // Cerrar con tecla ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, loading, onClose]);

    // Configuración según el tipo
    const config = {
        eliminar: {
            icono: Trash2,
            color: 'red',
            bgIcono: 'bg-red-100',
            textoBoton: 'Eliminar',
            colorBoton: 'bg-red-500 hover:bg-red-600'
        },
        advertencia: {
            icono: AlertTriangle,
            color: 'yellow',
            bgIcono: 'bg-yellow-100',
            textoBoton: 'Aceptar',
            colorBoton: 'bg-yellow-500 hover:bg-yellow-600'
        },
        peligro: {
            icono: FileWarning,
            color: 'orange',
            bgIcono: 'bg-orange-100',
            textoBoton: 'Confirmar',
            colorBoton: 'bg-orange-500 hover:bg-orange-600'
        }
    };

    const Icono = config[tipo].icono;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
            {/* Fondo oscuro */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={!loading ? onClose : undefined}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${config[tipo].bgIcono} flex items-center justify-center`}>
                            <Icono size={16} className={`text-${config[tipo].color}-500`} />
                        </div>
                        <h3 className="font-black text-gray-800 uppercase text-sm tracking-wider">
                            {titulo}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {mensaje}
                    </p>
                    {subtitulo && (
                        <p className="text-gray-400 text-xs mt-2">
                            {subtitulo}
                        </p>
                    )}
                </div>
                
                {/* Footer */}
                <div className="flex gap-3 p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${config[tipo].colorBoton}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            config[tipo].textoBoton
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};