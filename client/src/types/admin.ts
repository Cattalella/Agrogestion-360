// src/types/admin.ts

export interface DatosCard {
    tipo1: string;
    cantidad1: string | number;
    tipo2: string;
    cantidad2: string | number;
    tipo3?: string;
    cantidad3?: string | number;
    tipo4?: string;
    cantidad4?: string | number;
}

export interface CardRegistroProps {
    estilo?: string;
    titulo: string;
    icono: string;
    datos: DatosCard;
    onClick?: () => void;
}

export interface GanadoProps {
    sugerenciaId: string;
    categoriaSeleccionada: string;
    setCategoria: (categoria: string) => void;
    onGuardar: (datos: any, cerrar: boolean) => void;
}

export interface FormularioSimpleProps {
    onGuardar: (datos: any, cerrar: boolean) => void;
}