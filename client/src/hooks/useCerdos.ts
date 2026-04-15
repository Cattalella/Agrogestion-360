import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

export interface Cerdo {
    id_animal: number;
    codigo_local: string;
    num_ica_chapeta?: string;
    id_especie: number;
    id_estado_ani: number;
    id_ubicacion: number;
    sexo: string;
    raza: string;
    fecha_nacimiento: string;
    peso_actual: number;
    origen: string;
    foto_url?: string;
    EstadoAni?: { nombre: string };
    Ubicacion?: { nombre_ubi: string };
}

type Vista = 'lista' | 'formulario';

export const useCerdos = () => {
    const [cerdos, setCerdos] = useState<Cerdo[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [cargando, setCargando] = useState(false);

    const cargarCerdos = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/porcicultura/cerdos');
            setCerdos(respuesta.data);
        } catch (error) {
            console.error("Error al cargar cerdos:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) cargarCerdos();
    }, [isModalOpen]);

    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (v: Vista) => setVista(v);

    const guardarCerdo = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            await apiClient.post('/porcicultura/cerdos', datos);
            await cargarCerdos();
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error) {
            console.error("Error al guardar cerdo:", error);
            return false;
        } finally {
            setCargando(false);
        }
    };

    const [categoriaCerdo, setCategoriaCerdo] = useState("C");
    const [sugerenciaId, setSugerenciaId] = useState("");

    useEffect(() => {
        const registrosMismoTipo = cerdos.filter(c => c.codigo_local?.startsWith(categoriaCerdo));
        const ultimoNumero = registrosMismoTipo.reduce((max, curr) => {
            const partes = curr.codigo_local?.split('-') || [];
            const num = partes.length > 1 ? parseInt(partes[1]) : 0;
            return !isNaN(num) && num > max ? num : max;
        }, 0);
        setSugerenciaId(`${categoriaCerdo}-${String(ultimoNumero + 1).padStart(2, '0')}`);
    }, [categoriaCerdo, cerdos]);

    return {
        listaCerdos: cerdos,
        cargando,
        isModalOpen,
        vista,
        sugerenciaId,
        categoriaCerdo,
        setCategoriaCerdo,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarCerdo
    };
};