// src/components/ListaInsumos.tsx
import { useScrollPersonalizado } from "../hooks/useScrollPersonalizado";

interface ListaInsumosProps {
    items: string[];
    titulo?: string;  // opcional, por si quieres mostrar título
}

export const ListaInsumos = ({ items, titulo }: ListaInsumosProps) => {
    const { scrollRef, estilosScroll } = useScrollPersonalizado();

    return (
        <div className="flex flex-col h-full">
            {titulo && (
                <div className="flex flex-col border-b-1 border-dashed pb-2 gap-2 shrink-0">
                    <p className="tracking-[3px] font-black text-red-600">
                        <span>{items.length}</span>/DIAS
                    </p>
                    <p className="text-red-800 text-[0.8rem] font-bold uppercase">
                        {titulo}
                    </p>
                </div>
            )}
            
            <div 
                ref={scrollRef} 
                className="flex flex-col mt-4 gap-2 overflow-y-auto no-scrollbar h-full" 
                style={estilosScroll}
            >
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <p key={idx} className="whitespace-nowrap text-[0.9rem] border-b border-gray-50 pb-1 uppercase">
                            - {item}
                        </p>
                    ))
                ) : (
                    <p className="text-[0.8rem] text-gray-400 italic text-center py-4">
                        Sin datos disponibles
                    </p>
                )}
            </div>
        </div>
    );
};