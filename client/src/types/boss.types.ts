// src/types/boss.types.ts

export interface DatosGanancias {
    tipo1: string;
    cantidad1: number;
}

export interface DatosInsumos {
    dias: number;
    titulo: string;
    lista: string[];
}

export interface DatosPagos {
    titulo: string;
    lista: string[];
}

export interface DatosTrabajadores {
    titulo: string;
    lista: string[];
}

export interface DatosExportar {
    item: string;
    valor: number;
}

export interface DatosGraficaGastos {
    name: string;
    valor: number;
    color: string;
    detalle: string;
}

export interface Dashboard {
    ganancias: DatosGanancias;
    inversion: DatosGanancias;
    gastosPorSector: DatosGraficaGastos[];  // ✅ Verifica que esto existe
    insumosCriticos: DatosInsumos;
    pagosTrabajadores: DatosPagos;
    trabajadoresActivos: DatosTrabajadores;
    filtrosDisponibles: string[];  // ✅ Verifica que esto existe
}