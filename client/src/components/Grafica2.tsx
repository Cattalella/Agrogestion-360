import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface DataSector {
    name: string;
    valor: number;
    color?: string;
    detalle?: string;
}

interface Props {
    titulo: string;
    datos: DataSector[];
    soloDona?: boolean;
}

interface ItemCompleto {
    name: string;
    valor: number;
    color: string;
    detalle: string;
}

// Colores para los 3 sectores de gastos
const COLORES_POR_SECTOR: Record<string, string> = {
    'CONSUMO INSUMOS': '#f97316',     // Naranja
    'COMPRAS INSUMOS': '#8b5cf6',     // Morado
    'PAGOS TRABAJADORES': '#ec489a',  // Rosa
};

// Sectores fijos para EGRESOS (3 sectores)
const SECTORES_FIJOS = [
    { name: 'CONSUMO INSUMOS', color: '#f97316' },
    { name: 'COMPRAS INSUMOS', color: '#8b5cf6' },
    { name: 'PAGOS TRABAJADORES', color: '#ec489a' },
];

const formatearUnidades = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    return `${val}`;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const { name, valor, detalle } = payload[0].payload;
        return (
            <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-black/5 z-[9999] min-w-[140px] pointer-events-none">
                <div className="flex flex-col gap-1">
                    <span className="text-[0.6rem] font-black text-gray-400 uppercase">{name}</span>
                    <span className="font-bold text-slate-800 text-md">${formatearUnidades(valor)}</span>
                    {detalle && <span className="text-[0.6rem] text-gray-400 italic border-t pt-1">{detalle}</span>}
                </div>
            </div>
        );
    }
    return null;
};

export const Grafica2 = ({ titulo, datos, soloDona = false }: Props) => {
    // Combinar sectores fijos con los datos reales
    const mapaValores = new Map<string, number>();
    datos.forEach(item => {
        mapaValores.set(item.name.toUpperCase(), item.valor);
    });

    // Construir array completo con todos los sectores fijos
    let datosCompletos: ItemCompleto[] = SECTORES_FIJOS.map(sector => {
        const valor = mapaValores.get(sector.name) ?? 0;
        const datosEncontrado = datos.find(d => d.name.toUpperCase() === sector.name);
        return {
            name: sector.name,
            valor: valor,
            color: sector.color,
            detalle: datosEncontrado?.detalle || `Total: $${formatearUnidades(valor)}`
        };
    });

    // Filtrar sectores con valor 0 para la dona
    const datosDona = datosCompletos.filter(item => item.valor > 0);
    
    // Si no hay ningún sector con valor > 0, mostrar un sector gris
    const datosParaMostrar = datosDona.length > 0 ? datosDona : [{ name: 'Sin gastos', valor: 1, color: '#e5e7eb', detalle: 'No hay registros de gastos' }];
    const total = datosCompletos.reduce((acc, curr) => acc + curr.valor, 0);

    return (
        <div className={`bg-white p-6 rounded-[3rem] shadow-[0_3px_15px_rgba(0,0,0,0.5)] flex flex-col items-center ${soloDona ? 'w-64 h-80' : 'w-full max-w-2xl'}`}>
            <h2 className="font-black text-[#1e293b] tracking-[0.2em] text-[0.6rem] uppercase mb-4">
                -- {titulo} --
            </h2>

            <div className={`flex items-center w-full relative z-10 ${soloDona ? 'flex-col justify-center gap-2' : 'justify-between'}`}>
                
                {!soloDona && (
                    <div className="flex flex-col gap-2 flex-1">
                        {datosCompletos.map((entry, index) => {
                            const porcentaje = total > 0 ? (entry.valor / total) * 10 : 0;
                            return (
                                <div key={index} className="flex items-center gap-4">
                                    <span className="text-[0.6rem] font-bold text-gray-400 w-28 truncate">{entry.name}</span>
                                    <div className="flex gap-1">
                                        {[...Array(10)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className="w-3 h-3 rounded-full shadow-sm"
                                                style={{ backgroundColor: i < porcentaje ? entry.color : "#f3f4f6" }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[0.6rem] font-bold text-gray-500 w-16 text-right">${formatearUnidades(entry.valor)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className={`${soloDona ? 'w-40 h-40' : 'w-24 h-24'} relative shrink-0 overflow-visible flex justify-center`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip content={<CustomTooltip />} position={{ x: -13, y: 100 }} cursor={false} />
                            <Pie 
                                data={datosParaMostrar} 
                                cx="50%" cy="50%" 
                                innerRadius={soloDona ? 45 : 30} 
                                outerRadius={soloDona ? 70 : 45} 
                                paddingAngle={8}
                                dataKey="valor" 
                                stroke="none" 
                            > 
                                {datosParaMostrar.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {soloDona && (
                    <div className="w-full space-y-1">
                        {datosCompletos.map((item) => (
                            <div key={item.name} className="flex items-center gap-2 font-black uppercase text-[0.7rem]" style={{ color: item.color }}>
                                <span>- {item.name}: ${formatearUnidades(item.valor)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-auto pt-4 text-center">
                <p className="text-[0.6rem] font-bold tracking-widest uppercase">
                    TOTAL GASTOS: <span className="text-emerald-600">${formatearUnidades(total)}</span>
                </p>
            </div>
            
        </div>
    );
};