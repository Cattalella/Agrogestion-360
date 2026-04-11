// src/utils/storage.ts

export const guardarFotos = (fotos: any[]) => {
  localStorage.setItem('fotos_evidencia', JSON.stringify(fotos));
};

export const obtenerFotos = (): any[] => {
  const fotos = localStorage.getItem('fotos_evidencia');
  return fotos ? JSON.parse(fotos) : [];
};