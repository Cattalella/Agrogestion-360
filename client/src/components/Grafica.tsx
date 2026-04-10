import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// --- TUS DATOS ---
const dataBase = [
    { name: 'Ene-Feb', m1: 34, m2: 56, n1: "Ene", n2: "Feb" },
    { name: 'Mar-Abr', m1: 36, m2: 99, n1: "Mar", n2: "Abr" },
    { name: 'May-Jun', m1: 45, m2: 55, n1: "May", n2: "Jun" },
    { name: 'Jul-Ago', m1: 75, m2: 70, n1: "Jul", n2: "Ago" },
    { name: 'Sep-Oct', m1: 55, m2: 60, n1: "Sep", n2: "Oct" },
    { name: 'Nov-Dic', m1: 100, m2: 100, n1: "Nov", n2: "Dic" },
];

const formatearY = (val: number) => {
    if (val >= 1) return `${val}M`;
    return `${val * 1000}K`;
};

export const Grafica = () => {
    const dataCalculada = dataBase.map(item => ({
        ...item,
        ganancia: item.m1 + item.m2,
        detalle: `${item.n1}: ${item.m1}M | ${item.n2}: ${item.m2}M`
    }));

    return (
        <div className="w-full h-[20rem] rounded-3xl shadow-[0_3px_15px_rgba(0,0,0,0.2)] bg-white p-2">
            <style>
                {`
                    .recharts-wrapper:focus, 
                    .recharts-surface:focus, 
                    .recharts-wrapper * :focus {
                        outline: none !important;
                    }
                `}
            </style>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={dataCalculada} 
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    barCategoryGap="35%"
                >
                    <defs>
                        <linearGradient id="azulGradiente" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                            <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>

                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#666', dy: 10 }} 
                    />
                    
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#666', dx: -5 }}
                        tickFormatter={formatearY}
                        width={45}
                    />

                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ 
                            borderRadius: '1rem', 
                            border: '1px solid rgba(0, 0, 0, 0.1)', 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            backdropFilter: 'blur(8px)',
                            padding: '12px'
                        }}
                        formatter={(value: any, name: any, props: any) => {
                            const { detalle } = props.payload;
                            return [
                                <div key="tooltip-content" className="flex flex-col gap-1">
                                    <span className="font-bold text-blue-600 text-lg">{formatearY(value)}</span>
                                    <span className="text-[0.7rem] text-gray-500 italic">{detalle}</span>
                                </div>, 
                                "" 
                            ];
                        }}
                    />

                    {/* ESTA SOLA BARRA HACE TODO EL TRABAJO */}
                    <Bar 
                        dataKey="ganancia" 
                        fill="url(#azulGradiente)" 
                        radius={[20, 20, 20, 20]} 
                        barSize={18}
                        // Aquí creamos la cápsula de fondo sin que se desacople
                        background={{ 
                            fill: 'transparent', 
                            stroke: '#e5e7eb', 
                            strokeWidth: 2, 
                            radius: 20 
                        }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};