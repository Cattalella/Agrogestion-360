import { type FotoEvidencia } from "../components/Carrusel";

const KEY = "evidencias_agrogestion";

export const guardarFotos = (fotos: FotoEvidencia[]) => {
    localStorage.setItem(KEY, JSON.stringify(fotos));
};

export const obtenerFotos = (): FotoEvidencia[] => {
    const fotos = localStorage.getItem(KEY);
    return fotos ? JSON.parse(fotos) : [];
}