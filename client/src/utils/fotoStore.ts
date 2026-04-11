// src/utils/fotoStorage.ts
export const obtenerFotos = () => {
    const fotos = localStorage.getItem('fotos_evidencias');
    return fotos ? JSON.parse(fotos) : [];
};

export const guardarFotos = (fotos: any[]) => {
    localStorage.setItem('fotos_evidencias', JSON.stringify(fotos));
};