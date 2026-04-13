// src/components/RecordatorioModal.tsx
import { useState } from "react";

interface RecordatorioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGuardar: (recordatorio: { fecha: string; proposito: string }) => void;
}

export const RecordatorioModal = ({ isOpen, onClose, onGuardar }: RecordatorioModalProps) => {
    const [fecha, setFecha] = useState("");
    const [proposito, setProposito] = useState("");

    const handleGuardar = () => {
        if (!fecha || !proposito) {
            alert("Por favor completa todos los campos");
            return;
        }
        onGuardar({ fecha, proposito });
        setFecha("");
        setProposito("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-green-700 p-4 text-white">
                    <h3 className="text-xl font-bold text-center">📅 NUEVO RECORDATORIO</h3>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            FECHA DEL RECORDATORIO
                        </label>
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-green-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            PROPÓSITO DEL RECORDATORIO
                        </label>
                        <textarea
                            value={proposito}
                            onChange={(e) => setProposito(e.target.value)}
                            placeholder="Ej: Pago de impuestos, Revisión de inventario, etc."
                            className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-green-500 outline-none resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleGuardar}
                            className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg font-bold transition-colors"
                        >
                            GUARDAR
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-bold transition-colors"
                        >
                            CANCELAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};