// src/components/BannerRecordatorio.tsx
import { useState, useEffect } from "react";

interface Recordatorio {
    id: string;
    fecha: string;
    proposito: string;
    fechaCumplida: string;
}

interface BannerRecordatorioProps {
    recordatorio: Recordatorio;
    onCerrar: (id: string) => void;
}

export const BannerRecordatorio = ({ recordatorio, onCerrar }: BannerRecordatorioProps) => {
    const [visible, setVisible] = useState(true);

    const handleClick = () => {
        setVisible(false);
        onCerrar(recordatorio.id);
    };

    if (!visible) return null;

    return (
        <div 
            onClick={handleClick}
            className="fixed bottom-5 right-5 z-[150] bg-green-500 text-white p-4 rounded-xl shadow-2xl cursor-pointer hover:bg-green-600 transition-all animate-in slide-in-from-right duration-300 max-w-md"
        >
            <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                    <p className="font-bold text-sm uppercase">¡RECORDATORIO CUMPLIDO!</p>
                    <p className="text-sm">{recordatorio.proposito}</p>
                    <p className="text-xs opacity-90">Fecha: {recordatorio.fechaCumplida}</p>
                </div>
                <button className="ml-auto text-white hover:text-gray-200 text-xl">✕</button>
            </div>
        </div>
    );
};