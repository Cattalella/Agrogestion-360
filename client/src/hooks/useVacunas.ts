import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';

interface Vacuna {
    id_reg_vac: number;
    id_animal: number;
    tipo_vacuna: string;
    fecha_aplicacion: string;
    dosis?: string;
    lote_vacuna?: string;
    proximo_refuerzo?: string;
    veterinario?: string;
    admin_id?: number;
    observaciones?: string;
    animal?: {
        codigo_local: string;
    };
}

export interface VacunasStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
}

interface ModalConfirmacionState {
    isOpen: boolean;
    id: number | null;
    nombre: string;
}

export const useVacunas = () => {
    const [listaVacunas, setListaVacunas] = useState<Vacuna[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');
    const [cargando, setCargando] = useState(false);
    const [animalesDisponibles, setAnimalesDisponibles] = useState<any[]>([]);
    
    const [vacunaAEditar, setVacunaAEditar] = useState<any | null>(null);
    const [modalConfirmacion, setModalConfirmacion] = useState<ModalConfirmacionState>({
        isOpen: false,
        id: null,
        nombre: ''
    });
    const [eliminando, setEliminando] = useState(false);

    const cargarVacunas = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/vacunacion');
            const vacunasTransformadas = respuesta.data.map((v: any) => ({
                id_reg_vac: v.id_reg_vac,
                id_animal: v.id_animal,
                tipo_vacuna: v.tipo_vacuna,
                fecha_aplicacion: v.fecha_aplicacion,
                dosis: v.dosis,
                lote_vacuna: v.lote_vacuna,
                proximo_refuerzo: v.proximo_refuerzo,
                veterinario: v.veterinario,
                admin_id: v.admin_id,
                admin_nombre: v.admin_nombre || 'No registrado',
                observaciones: v.observaciones,
                animal: v.animal
            }));
            setListaVacunas(vacunasTransformadas);
            console.log('✅ Vacunas cargadas:', vacunasTransformadas.length);
        } catch (error) {
            console.error('❌ Error al cargar vacunas:', error);
        } finally {
            setCargando(false);
        }
    };

    const cargarAnimalesDisponibles = async () => {
        try {
            const ganado = await apiClient.get('/ganaderia');
            const cerdos = await apiClient.get('/porcicultura/cerdos');
            
            console.log('📊 GANADO del backend:', ganado.data);
            console.log('📊 CERDOS del backend:', cerdos.data);
            
            const todos = [
                ...(ganado.data || []).map((a: any) => ({ 
                    ...a, 
                    tipo: 'GANADO',
                    id: a.id_animal || a.id 
                })),
                ...(cerdos.data || []).map((a: any) => ({ 
                    ...a, 
                    tipo: 'CERDO',
                    id: a.id_animal || a.id 
                }))
            ];
            
            console.log('📊 TODOS los animales después de mapear:', todos.map(a => ({ 
                id: a.id, 
                local: a.codigo_local || a.local, 
                tipo: a.tipo,
                especie: a.especie
            })));
            
            setAnimalesDisponibles(todos);
            console.log('✅ Animales disponibles para vacunar:', todos.length);
        } catch (error) {
            console.error('❌ Error al cargar animales disponibles:', error);
        }
    };

    useEffect(() => {
        cargarVacunas();
        cargarAnimalesDisponibles();
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            cargarVacunas();
            cargarAnimalesDisponibles();
        }
    }, [isModalOpen]);

    const stats = useMemo((): VacunasStats => {
        // Contar vacunas por tipo de animal usando el código local
        const ganadosVacunados = listaVacunas.filter(v => {
            const animal = animalesDisponibles.find(a => a.id === v.id_animal);
            const codigoLocal = animal?.codigo_local || animal?.local || '';
            
            // GANADO: prefijos VA, TO, NO, TE
            const esGanado = codigoLocal.startsWith('VA') || 
                            codigoLocal.startsWith('TO') || 
                            codigoLocal.startsWith('NO') || 
                            codigoLocal.startsWith('TE');
            return esGanado;
        }).length;
        
        const cerdosVacunados = listaVacunas.filter(v => {
            const animal = animalesDisponibles.find(a => a.id === v.id_animal);
            const codigoLocal = animal?.codigo_local || animal?.local || '';
            
            // CERDO: prefijos C, V, L, E
            const esCerdo = codigoLocal.startsWith('C') || 
                           codigoLocal.startsWith('V') || 
                           codigoLocal.startsWith('L') || 
                           codigoLocal.startsWith('E');
            return esCerdo;
        }).length;

        console.log('📊 Stats calculados:', { ganadosVacunados, cerdosVacunados });

        return {
            tipo1: "GANADOS VACUNADOS",
            cantidad1: ganadosVacunados,
            tipo2: "CERDOS VACUNADOS",
            cantidad2: cerdosVacunados
        };
    }, [listaVacunas, animalesDisponibles]);

    const abrirModal = () => {
        setVacunaAEditar(null);
        setVista('lista');
        setIsModalOpen(true);
    };
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
        setVacunaAEditar(null);
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => {
        setVista(nuevaVista);
        if (nuevaVista === 'lista') {
            setVacunaAEditar(null);
        }
    };

    const abrirEdicion = (vacuna: any) => {
        console.log('✏️ Abriendo edición para vacuna:', vacuna);
        setVacunaAEditar(vacuna);
        setVista('formulario');
    };

    const cancelarEdicion = () => {
        setVacunaAEditar(null);
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
            await apiClient.delete(`/vacunacion/${modalConfirmacion.id}`);
            await cargarVacunas();
            cerrarModalConfirmacion();
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
            alert('Error al eliminar la vacuna');
        } finally {
            setEliminando(false);
        }
    };

    const guardarVacuna = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_animal: datos.id_animal,
                tipo_vacuna: datos.tipo_vacuna,
                fecha_aplicacion: datos.fecha_aplicacion,
                dosis: datos.dosis || null,
                via_aplicacion: datos.via_aplicacion || 'INTRAMUSCULAR',
                lote_vacuna: datos.lote_vacuna || null,
                proximo_refuerzo: datos.proximo_refuerzo || null,
                veterinario: datos.veterinario || null,
                observaciones: datos.observaciones || null
            };

            if (vacunaAEditar) {
                console.log('✏️ Editando vacuna:', vacunaAEditar.id_reg_vac, datosParaBackend);
                await apiClient.put(`/vacunacion/${vacunaAEditar.id_reg_vac}`, datosParaBackend);
                console.log('✅ Vacuna actualizada');
            } else {
                console.log('📤 Creando nueva vacuna:', datosParaBackend);
                await apiClient.post('/vacunacion', datosParaBackend);
                console.log('✅ Vacuna creada');
            }
            
            await cargarVacunas();
            setVacunaAEditar(null);
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error('❌ Error al guardar vacuna:', error);
            alert(error.response?.data?.mensaje || 'Error al guardar la vacuna');
            return false;
        } finally {
            setCargando(false);
        }
    };

    const actualizarVacuna = async (id: number, datos: Partial<Vacuna>) => {
        try {
            const respuesta = await apiClient.put(`/vacunacion/${id}`, datos);
            await cargarVacunas();
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar:', error);
        }
    };

    return {
        listaVacunas,
        animalesDisponibles,
        isModalOpen,
        vista,
        cargando,
        stats,
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarVacuna,
        actualizarVacuna,
        recargarLista: cargarVacunas,
        vacunaAEditar,
        abrirEdicion,
        cancelarEdicion,
        modalConfirmacion,
        eliminando,
        abrirModalEliminar,
        cerrarModalConfirmacion,
        confirmarEliminar,
    };
};