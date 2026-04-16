import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

// ============================================================
// 📌 INTERFACES
// ============================================================
interface Vacuna {
    id: number;
    id_animal: number;
    animal: string;
    tipo_vacuna: string;
    fecha_aplicacion: string;
    dosis?: string;
    via_aplicacion?: string;
    lote_vacuna?: string;
    proximo_refuerzo?: string;
    responsable?: string;
    observaciones?: string;
}

export interface VacunasStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
}

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useVacunas = () => {
    const [listaVacunas, setListaVacunas] = useState<Vacuna[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');
    const [cargando, setCargando] = useState(false);
    
    // 🆕 Lista de animales disponibles para vacunar
    const [animalesDisponibles, setAnimalesDisponibles] = useState<any[]>([]);

    // ============================================================
    // CARGAR VACUNAS
    // ============================================================
    const cargarVacunas = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/vacunacion');
            setListaVacunas(respuesta.data);
            console.log('✅ Vacunas cargadas:', respuesta.data.length);
        } catch (error) {
            console.error('❌ Error al cargar vacunas:', error);
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // 🆕 CARGAR ANIMALES DISPONIBLES PARA VACUNAR
    // ============================================================
    const cargarAnimalesDisponibles = async () => {
        try {
            // Obtener animales bovinos
            const bovinos = await apiClient.get('/ganaderia');
            // Obtener animales porcinos
            const porcinos = await apiClient.get('/porcicultura/cerdos');
            
            const todos = [
                ...(bovinos.data || []).map((a: any) => ({ 
                    ...a, 
                    tipo_animal: 'BOVINO',
                    id: a.id_animal || a.id 
                })),
                ...(porcinos.data || []).map((a: any) => ({ 
                    ...a, 
                    tipo_animal: 'PORCINO',
                    id: a.id_animal || a.id 
                }))
            ];
            
            setAnimalesDisponibles(todos);
            console.log('✅ Animales disponibles para vacunar:', todos.length);
        } catch (error) {
            console.error('❌ Error al cargar animales disponibles:', error);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        cargarVacunas();
        cargarAnimalesDisponibles();
    }, []);

    // Refrescar al abrir modal
    useEffect(() => {
        if (isModalOpen) {
            cargarVacunas();
            cargarAnimalesDisponibles();
        }
    }, [isModalOpen]);

    // ============================================================
    // 🆕 CALCULAR STATS PARA LA CARD (CORREGIDO)
    // ============================================================
    const calcularStats = (): VacunasStats => {
        // Contar vacunas por tipo de animal
        const ganadosVacunados = listaVacunas.filter(v => {
            // Buscar el animal en la lista de disponibles
            const animal = animalesDisponibles.find(a => 
                (a.id_animal || a.id) === v.id_animal
            );
            
            // Verificar si es bovino
            const esBovino = animal?.tipo_animal === 'BOVINO' || 
                             animal?.especie === 'Bovino' ||
                             animal?.especie?.nombre === 'Bovino';
            
            return esBovino;
        }).length;
        
        const cerdosVacunados = listaVacunas.filter(v => {
            // Buscar el animal en la lista de disponibles
            const animal = animalesDisponibles.find(a => 
                (a.id_animal || a.id) === v.id_animal
            );
            
            // Verificar si es porcino
            const esPorcino = animal?.tipo_animal === 'PORCINO' || 
                              animal?.especie === 'Porcino' ||
                              animal?.especie?.nombre === 'Porcino' ||
                              animal?.especie?.nombre === 'Cerdo';
            
            return esPorcino;
        }).length;

        console.log('📊 Stats calculados:', { ganadosVacunados, cerdosVacunados });

        return {
            tipo1: "GANADOS VACUNADOS",
            cantidad1: ganadosVacunados,
            tipo2: "CERDOS VACUNADOS",
            cantidad2: cerdosVacunados
        };
    };

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
    const abrirModal = () => {
        setVista('lista');
        setIsModalOpen(true);
    };
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => setVista(nuevaVista);

    // ============================================================
    // GUARDAR VACUNA (BACKEND)
    // ============================================================
    const guardarVacuna = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                id_animal: parseInt(datos.id_animal),
                tipo_vacuna: datos.tipo_vacuna,
                fecha_aplicacion: datos.fecha_aplicacion,
                dosis: datos.dosis || null,
                via_aplicacion: datos.via_aplicacion || 'INTRAMUSCULAR',
                lote_vacuna: datos.lote_vacuna || null,
                proximo_refuerzo: datos.proximo_refuerzo || null,
                responsable: datos.responsable || 'Administrador',
                observaciones: datos.observaciones || null
            };

            console.log('📤 Enviando a backend (Vacuna):', datosParaBackend);
            
            await apiClient.post('/vacunacion', datosParaBackend);
            
            await cargarVacunas();
            
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

    // ============================================================
    // 🆕 ACTUALIZAR VACUNA
    // ============================================================
    const actualizarVacuna = async (id: number, datos: Partial<Vacuna>) => {
        try {
            const respuesta = await apiClient.put(`/vacunacion/${id}`, datos);
            setListaVacunas(prev => prev.map(v => 
                v.id === id ? { ...v, ...datos } : v
            ));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar vacuna:', error);
        }
    };

    // ============================================================
    // 🆕 ELIMINAR VACUNA
    // ============================================================
    const eliminarVacuna = async (id: number) => {
        try {
            const respuesta = await apiClient.delete(`/vacunacion/${id}`);
            setListaVacunas(prev => prev.filter(v => v.id !== id));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al eliminar vacuna:', error);
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        listaVacunas,
        animalesDisponibles,
        isModalOpen,
        vista,
        cargando,
        
        // Stats para la card
        stats: calcularStats(),
        
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarVacuna,
        actualizarVacuna,
        eliminarVacuna,
        recargarLista: cargarVacunas,
    };
};