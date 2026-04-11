import { useState } from 'react';
import { obtenerFotos, guardarFotos } from '../utils/storage';

// 1. Definimos qué es una FotoEvidencia para que TS no se queje
export interface FotoEvidencia {
    id: number;
    url: string;
    fecha: string;
}

export const useEvidencias = () => {
    // 2. Ahora sí, usamos la interfaz en el useState
    const [listasFotos, setListasFotos] = useState<FotoEvidencia[]>(obtenerFotos());
    
    const [modalConfig, setModalConfig] = useState({ 
        abierto: false, 
        mensaje: "", 
        accion: () => {} 
    });

    const manejarSubida = (nuevaFoto: FotoEvidencia) => {
        const nuevas = [nuevaFoto, ...listasFotos];
        setListasFotos(nuevas);
        guardarFotos(nuevas);
    };

    const abrirModalBorrarTodo = () => {
        setModalConfig({
            abierto: true,
            mensaje: "Vas a eliminar todas las fotos de evidencia permanentemente.",
            accion: () => { 
                setListasFotos([]); 
                guardarFotos([]); 
                cerrarModal(); 
            }
        });
    };

    const abrirModalBorrarUna = (id: number) => {
        setModalConfig({
            abierto: true,
            mensaje: "¿Eliminar esta foto de evidencia?",
            accion: () => {
                const filtradas = listasFotos.filter(f => f.id !== id);
                setListasFotos(filtradas);
                guardarFotos(filtradas);
                cerrarModal();
            }
        });
    };

    const cerrarModal = () => setModalConfig(prev => ({ ...prev, abierto: false }));

    return { 
        listasFotos, 
        modalConfig, 
        manejarSubida, 
        abrirModalBorrarTodo, 
        abrirModalBorrarUna, 
        cerrarModal 
    };
};