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

    const esGanadoPorCodigo = (codigoLocal: string) => {
        if (!codigoLocal) return false;
        const upperCode = codigoLocal.toUpperCase();
        return upperCode.startsWith('VA') ||
            upperCode.startsWith('TO') ||
            upperCode.startsWith('NO') ||
            upperCode.startsWith('TE');
    };

    const esCerdoPorCodigo = (codigoLocal: string) => {
        if (!codigoLocal) return false;
        const upperCode = codigoLocal.toUpperCase();
        if (esGanadoPorCodigo(codigoLocal)) return false;
        return upperCode.startsWith('C-') ||
            upperCode.startsWith('C') ||
            upperCode.startsWith('V-') ||
            upperCode.startsWith('V') ||
            upperCode.startsWith('L-') ||
            upperCode.startsWith('L') ||
            upperCode.startsWith('E-') ||
            upperCode.startsWith('E');
    };

    // 🔧 CORREGIDO: acepta 'Sano' (ganado) y 'Activo' (cerdos/legacy)
    // Excluye solo estados negativos: vendido, muerto, inactivo
    // RN.4.1.2: "solo animales activos pueden ser vacunados"
    const estaActivo = (animal: any): boolean => {
        const estado = String(
            animal.estado?.nombre || animal.estado || ''
        ).toLowerCase();

        if (!estado) return true;

        const estadosNegativos = ['vendido', 'muerto', 'inactivo', 'fallecido', 'anulado'];
        return !estadosNegativos.includes(estado);
    };

    const cargarAnimalesDisponibles = async () => {
        try {
            const ganado = await apiClient.get('/ganaderia');
            const cerdos = await apiClient.get('/porcicultura/cerdos');

            console.log('📊 GANADO raw:', ganado.data.map((g: any) => ({
                id: g.id_animal, local: g.codigo_local, estado: g.estado
            })));
            console.log('📊 CERDOS raw:', cerdos.data.map((c: any) => ({
                id: c.id_animal, local: c.codigo_local, estado: c.estado
            })));

            const todos = [
                ...(ganado.data || []).map((a: any) => ({
                    ...a,
                    tipo: 'GANADO',
                    id: a.id_animal || a.id,
                    codigo_local: a.codigo_local || a.local,
                    local: a.local || a.codigo_local,
                    // Ganado devuelve estado como string directo ('Sano', 'Vendido', etc.)
                    estado: a.estado || 'Sano'
                })),
                ...(cerdos.data || []).map((a: any) => ({
                    ...a,
                    tipo: 'CERDO',
                    id: a.id_animal || a.id,
                    codigo_local: a.codigo_local || a.local,
                    local: a.local || a.codigo_local,
                    // Cerdos devuelve estado como string también
                    estado: a.estado || 'Activo'
                }))
            ];

            // 🔧 CORREGIDO: filtrar con estaActivo que acepta 'Sano' y 'Activo'
            const activos = todos.filter(a => estaActivo(a));

            console.log('📊 Todos los animales:', todos.length);
            console.log('✅ Animales activos para vacunar:', activos.length);
            activos.forEach(a => {
                console.log(`   - ${a.codigo_local} (${a.tipo}) estado: "${a.estado}"`);
            });

            setAnimalesDisponibles(activos);
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
        const ganadosVacunados = listaVacunas.filter(v => {
            const animal = animalesDisponibles.find(a => a.id === v.id_animal);
            const codigoLocal = animal?.codigo_local || animal?.local || '';
            return esGanadoPorCodigo(codigoLocal);
        }).length;

        const cerdosVacunados = listaVacunas.filter(v => {
            const animal = animalesDisponibles.find(a => a.id === v.id_animal);
            const codigoLocal = animal?.codigo_local || animal?.local || '';
            return esCerdoPorCodigo(codigoLocal);
        }).length;

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
                await apiClient.put(`/vacunacion/${vacunaAEditar.id_reg_vac}`, datosParaBackend);
                console.log('✅ Vacuna actualizada');
            } else {
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