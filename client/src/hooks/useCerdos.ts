import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';

interface Cerdo {
    id: number;
    oficial: string;
    local: string;
    sexo: string;
    estado: string;
    raza?: string;
    fecha_nacimiento?: string;
    peso_actual?: number;
    origen?: string;
    ubicacion?: string;
    foto_url?: string;
}

export interface CerdosStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
    tipo3: string;
    cantidad3: number;
    tipo4: string;
    cantidad4: number;
}

interface ModalConfirmacionState {
    isOpen: boolean;
    id: number | null;
    nombre: string;
}

export const useCerdos = () => {
    const [listaCerdos, setListaCerdos] = useState<Cerdo[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("C");
    const [sugerenciaId, setSugerenciaId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');
    const [cargando, setCargando] = useState(false);
    const [cerdoAEditar, setCerdoAEditar] = useState<any | null>(null);
    const [modalConfirmacion, setModalConfirmacion] = useState<ModalConfirmacionState>({
        isOpen: false,
        id: null,
        nombre: ''
    });
    const [eliminando, setEliminando] = useState(false);

    const cargarCerdos = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/porcicultura/cerdos');
            console.log('📊 Datos crudos:', respuesta.data);
            
            const cerdosTransformados = respuesta.data.map((c: any) => ({
                id: c.id_animal || c.id,
                local: c.codigo_local || c.local,
                oficial: c.num_ica_chapeta || c.oficial,
                sexo: c.sexo === 'M' ? 'MACHO' : (c.sexo === 'F' ? 'HEMBRA' : c.sexo),
                estado: c.estado?.nombre || c.estado || 'Activo',
                raza: c.raza,
                fecha_nacimiento: c.fecha_nacimiento,
                peso_actual: c.peso_actual,
                origen: c.origen,
                ubicacion: c.ubicacion?.nombre_ubi,
                foto_url: c.foto_url
            }));
            
            console.log('📊 Cerdos transformados:', cerdosTransformados);
            setListaCerdos(cerdosTransformados);
        } catch (error) {
            console.error('❌ Error al cargar cerdos:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCerdos();
    }, []);

    const stats = useMemo((): CerdosStats => {
        const cerdas = listaCerdos.filter(c => 
            c.local?.startsWith('C') && c.sexo === 'HEMBRA'
        ).length;
        const verracos = listaCerdos.filter(c => 
            c.local?.startsWith('V') && c.sexo === 'MACHO'
        ).length;
        const lechones = listaCerdos.filter(c => 
            c.local?.startsWith('L')
        ).length;
        const ceba = listaCerdos.filter(c => 
            c.local?.startsWith('E')
        ).length;

        return {
            tipo1: "CERDAS",
            cantidad1: cerdas,
            tipo2: "VERRACOS",
            cantidad2: verracos,
            tipo3: "LECHONES",
            cantidad3: lechones,
            tipo4: "CEBA",
            cantidad4: ceba
        };
    }, [listaCerdos]);

    useEffect(() => {
        const registrosMismoTipo = listaCerdos.filter(c => 
            c.local?.startsWith(categoriaSeleccionada)
        );
        const ultimoNumero = registrosMismoTipo.reduce((max, curr) => {
            const partes = curr.local?.split('-') || [];
            const num = partes.length > 1 ? parseInt(partes[1]) : 0;
            return !isNaN(num) && num > max ? num : max;
        }, 0);
        const nuevoId = `${categoriaSeleccionada}-${String(ultimoNumero + 1).padStart(2, '0')}`;
        setSugerenciaId(nuevoId);
    }, [categoriaSeleccionada, listaCerdos]);

    const abrirModal = () => {
        setCerdoAEditar(null);
        setCategoriaSeleccionada("C");
        cargarCerdos();
        setIsModalOpen(true);
    };
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
        setCerdoAEditar(null);
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => {
        setVista(nuevaVista);
        if (nuevaVista === 'lista') {
            setCerdoAEditar(null);
        }
    };

    const abrirEdicion = (cerdo: any) => {
        console.log('✏️ Abriendo edición para:', cerdo);
        setCerdoAEditar(cerdo);
        const categoria = cerdo.local?.substring(0, 1) || "C";
        setCategoriaSeleccionada(categoria);
        setVista('formulario');
    };

    const cancelarEdicion = () => {
        setCerdoAEditar(null);
        setVista('lista');
    };

    const abrirModalEliminar = (id: number, nombre: string) => {
        setModalConfirmacion({ isOpen: true, id, nombre });
    };

    const cerrarModalConfirmacion = () => {
        setModalConfirmacion({ isOpen: false, id: null, nombre: '' });
        setEliminando(false);
    };

    const confirmarEliminar = async () => {
        if (!modalConfirmacion.id) return;
        setEliminando(true);
        try {
            await apiClient.delete(`/porcicultura/cerdos/${modalConfirmacion.id}`);
            await cargarCerdos();
            cerrarModalConfirmacion();
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
            alert('Error al eliminar el cerdo');
        } finally {
            setEliminando(false);
        }
    };

    const guardarCerdo = async (nuevoCerdo: any, cerrar: boolean) => {
        setCargando(true);
        try {
            console.log('📤 Datos recibidos en guardarCerdo:', nuevoCerdo);
            
            const datosParaBackend = {
                local: nuevoCerdo.local || sugerenciaId,
                oficial: nuevoCerdo.oficial || null,
                sexo: nuevoCerdo.sexo || (categoriaSeleccionada === 'V' ? 'MACHO' : 'HEMBRA'),
                raza: nuevoCerdo.raza || 'Criollo',
                nacimiento: nuevoCerdo.nacimiento || null,
                ingreso: nuevoCerdo.ingreso || new Date().toISOString().split('T')[0],
                peso: parseFloat(nuevoCerdo.peso) || 0,
                origen: nuevoCerdo.origen || 'Registro inicial',
                foto: null,
                establo: nuevoCerdo.establo || '',
                salud: nuevoCerdo.salud || 'SANO'
            };

            console.log('📤 Datos a enviar al backend:', datosParaBackend);

            if (cerdoAEditar) {
                await apiClient.put(`/porcicultura/cerdos/${cerdoAEditar.id}`, datosParaBackend);
                console.log('✅ Cerdo actualizado');
            } else {
                await apiClient.post('/porcicultura/cerdos', datosParaBackend);
                console.log('✅ Cerdo creado');
            }

            await cargarCerdos();
            setCerdoAEditar(null);

            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
        } catch (error: any) {
            console.error('❌ Error al guardar:', error);
            alert(error.response?.data?.mensaje || 'Error al guardar el cerdo');
        } finally {
            setCargando(false);
        }
    };

    const actualizarCerdo = async (id: number, datos: Partial<Cerdo>) => {
        try {
            const respuesta = await apiClient.put(`/porcicultura/cerdos/${id}`, datos);
            await cargarCerdos();
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar:', error);
        }
    };

    return {
        listaCerdos,
        cargando,
        stats,
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        sugerenciaId,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarCerdo,
        actualizarCerdo,
        recargarLista: cargarCerdos,
        cerdoAEditar,
        abrirEdicion,
        cancelarEdicion,
        modalConfirmacion,
        eliminando,
        abrirModalEliminar,
        cerrarModalConfirmacion,
        confirmarEliminar,
    };
};