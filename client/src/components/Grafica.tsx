import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface DatosGrafica {
  name: string;
  m1: number;
  m2: number;
  n1: string;
  n2: string;
}

interface GraficaProps {
  datos?: DatosGrafica[];
}

const formatearY = (val: number) => {
  if (val >= 1) return `${val}M`;
  if (val > 0 && val < 1) return `${(val * 1000).toFixed(0)}K`;
  return "0";
};

const datosPorDefecto: DatosGrafica[] = [
  { name: 'Ene-Feb', m1: 0, m2: 0, n1: "Ene", n2: "Feb" },
  { name: 'Mar-Abr', m1: 0, m2: 0, n1: "Mar", n2: "Abr" },
  { name: 'May-Jun', m1: 0, m2: 0, n1: "May", n2: "Jun" },
  { name: 'Jul-Ago', m1: 0, m2: 0, n1: "Jul", n2: "Ago" },
  { name: 'Sep-Oct', m1: 0, m2: 0, n1: "Sep", n2: "Oct" },
  { name: 'Nov-Dic', m1: 0, m2: 0, n1: "Nov", n2: "Dic" },
];

export const Grafica = ({ datos }: GraficaProps) => {
  // Se prioriza el orden y la estructura limpia (index.ts/barrel pattern)
  const datosUsar = datos && datos.length > 0 ? datos : datosPorDefecto;

  const valoresReales = datosUsar.map(item => item.m1 + item.m2);
  const maxValor = Math.max(...valoresReales, 10);
  const barSize = 18; 

  const dataCalculada = datosUsar.map(item => ({
    ...item,
    ganancia: item.m1 + item.m2,
    detalle: `${item.n1}: ${item.m1}M | ${item.n2}: ${item.m2}M`,
    fondo: maxValor, 
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
          /* Alineación exacta de las barras para evitar el desplazamiento visual */
          barGap={-barSize}
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
            domain={[0, maxValor]}
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
              const { detalle, ganancia } = props.payload;
              if (name === "fondo" || ganancia === 0) return [null, null];
              return [
                <div key="tooltip-content" className="flex flex-col gap-1">
                  <span className="font-bold text-blue-600 text-lg">{formatearY(ganancia)}</span>
                  <span className="text-[0.7rem] text-gray-500 italic">{detalle}</span>
                </div>, 
                "" 
              ];
            }}
          />

          {/* Barra Gris de Fondo: Siempre visible para mantener la estética */}
          <Bar 
            dataKey="fondo" 
            fill="transparent" 
            stroke="#e5e7eb" 
            strokeWidth={2}
            radius={[20, 20, 20, 20]} 
            barSize={barSize}
            isAnimationActive={false}
          />
          
          {/* Barra Azul: Representa el progreso real del proyecto AgroGestión-360 */}
          <Bar 
            dataKey="ganancia" 
            fill="url(#azulGradiente)" 
            radius={[20, 20, 20, 20]} 
            barSize={barSize}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};