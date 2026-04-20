import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';

// ============================================================
// 📌 INTERFACES
// ============================================================
interface Animal {
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

interface CatalogoEspecie {
    id_especie: number;
    nombre: string;
}

interface CatalogoUbicacion {
    id_ubicacion: number;
    nombre_ubi: string;
}

interface CatalogoEstado {
    id_estado_ani: number;
    nombre: string;
}

// ============================================================
// 📌 INTERFAZ PARA STATS DE LA CARD
// ============================================================
export interface GanadoStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
    tipo3: string;
    cantidad3: number;
    tipo4: string;
    cantidad4: number;
}

// ============================================================
// 📌 INTERFAZ PARA MODAL DE CONFIRMACIÓN
// ============================================================
interface ModalConfirmacionState {
    isOpen: boolean;
    id: number | null;
    nombre: string;
}

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useGanado = () => {
    // Estados
    const [listaGanado, setListaGanado] = useState<Animal[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("VA");
    const [sugerenciaId, setSugerenciaId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');
    const [cargando, setCargando] = useState(false);
    
    // Estado para edición
    const [animalAEditar, setAnimalAEditar] = useState<any | null>(null);
    
    // 🆕 Estado para modal de confirmación
    const [modalConfirmacion, setModalConfirmacion] = useState<ModalConfirmacionState>({
        isOpen: false,
        id: null,
        nombre: ''
    });
    const [eliminando, setEliminando] = useState(false);
    
    // Catálogos
    const [especies, setEspecies] = useState<CatalogoEspecie[]>([]);
    const [ubicaciones, setUbicaciones] = useState<CatalogoUbicacion[]>([]);
    const [estados, setEstados] = useState<CatalogoEstado[]>([]);

    // ============================================================
    // CARGAR ANIMALES DEL BACKEND AL INICIAR
    // ============================================================
    const cargarAnimales = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/ganaderia');
            console.log('✅ Animales cargados:', respuesta.data.length);
            setListaGanado(respuesta.data);
        } catch (error) {
            console.error('❌ Error al cargar animales:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarAnimales();
    }, []);

    // ============================================================
    // CARGAR CATÁLOGOS
    // ============================================================
    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const respuesta = await apiClient.get('/ganaderia/catalogos');
                const datos = respuesta.data;
                setEspecies(datos.especies || []);
                setUbicaciones(datos.ubicaciones || []);
                setEstados(datos.estados || []);
                console.log('✅ Catálogos cargados');
            } catch (error) {
                console.error('❌ Error al cargar catálogos:', error);
            }
        };

        cargarCatalogos();
    }, []);

    // ============================================================
    // CALCULAR STATS PARA LA CARD
    // ============================================================
    const stats = useMemo((): GanadoStats => {
        const vacas = listaGanado.filter(a => 
            a.local?.startsWith('VA') && a.sexo === 'HEMBRA'
        ).length;
        
        const toros = listaGanado.filter(a => 
            a.local?.startsWith('TO') && a.sexo === 'MACHO'
        ).length;
        
        const novillos = listaGanado.filter(a => 
            a.local?.startsWith('NO')
        ).length;
        
        const terneros = listaGanado.filter(a => 
            a.local?.startsWith('TE')
        ).length;

        return {
            tipo1: "VACAS",
            cantidad1: vacas,
            tipo2: "TOROS",
            cantidad2: toros,
            tipo3: "NOVILLOS",
            cantidad3: novillos,
            tipo4: "TERNEROS",
            cantidad4: terneros
        };
    }, [listaGanado]);

    // ============================================================
    // GENERAR SUGERENCIA DE ID LOCAL
    // ============================================================
    useEffect(() => {
        const registrosMismoTipo = listaGanado.filter(a => 
            a.local?.startsWith(categoriaSeleccionada)
        );

        const ultimoNumero = registrosMismoTipo.reduce((max, curr) => {
            const partes = curr.local?.split('-') || [];
            const num = partes.length > 1 ? parseInt(partes[1]) : 0;
            return !isNaN(num) && num > max ? num : max;
        }, 0);

        const nuevoId = `${categoriaSeleccionada}-${String(ultimoNumero + 1).padStart(2, '0')}`;
        setSugerenciaId(nuevoId);
    }, [categoriaSeleccionada, listaGanado]);

    // ============================================================
    // ABRIR / CERRAR MODAL
    // ============================================================
    const abrirModal = () => {
        setAnimalAEditar(null);
        cargarAnimales();
        setIsModalOpen(true);
    };
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
        setAnimalAEditar(null);
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => {
        setVista(nuevaVista);
        if (nuevaVista === 'lista') {
            setAnimalAEditar(null);
        }
    };

    // ============================================================
    // EDICIÓN
    // ============================================================
    const abrirEdicion = (animal: any) => {
        setAnimalAEditar(animal);
        const categoria = animal.local?.substring(0, 2) || "VA";
        setCategoriaSeleccionada(categoria);
        setVista('formulario');
    };

    const cancelarEdicion = () => {
        setAnimalAEditar(null);
        setVista('lista');
    };

    // ============================================================
    // 🆕 MODAL DE CONFIRMACIÓN PARA ELIMINAR
    // ============================================================
    const abrirModalEliminar = (id: number, nombre: string) => {
        setModalConfirmacion({
            isOpen: true,
            id: id,
            nombre: nombre
        });
    };

    const cerrarModalConfirmacion = () => {
        setModalConfirmacion({
            isOpen: false,
            id: null,
            nombre: ''
        });
        setEliminando(false);
    };

    const confirmarEliminar = async () => {
        if (!modalConfirmacion.id) return;
        
        setEliminando(true);
        try {
            await apiClient.delete(`/ganaderia/${modalConfirmacion.id}`);
            await cargarAnimales();
            console.log('✅ Animal eliminado');
            cerrarModalConfirmacion();
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
            alert('Error al eliminar el animal');
        } finally {
            setEliminando(false);
        }
    };

    // ============================================================
    // GUARDAR ANIMAL (CREAR O EDITAR)
    // ============================================================
    const guardarAnimal = async (nuevoAnimal: any, cerrar: boolean) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                codigo_local: nuevoAnimal.local || sugerenciaId,
                num_ica_chapeta: nuevoAnimal.oficial || null,
                sexo: nuevoAnimal.sexo || (categoriaSeleccionada === 'TO' ? 'MACHO' : 'HEMBRA'),
                raza: nuevoAnimal.raza || 'Criollo',
                fecha_nacimiento: nuevoAnimal.nacimiento || null,
                peso_actual: parseFloat(nuevoAnimal.peso) || 0,
                origen: nuevoAnimal.origen || 'Registro inicial',
                foto_url: null
            };

            if (animalAEditar) {
                console.log('✏️ Editando animal:', animalAEditar.id, datosParaBackend);
                await apiClient.put(`/ganaderia/${animalAEditar.id}`, datosParaBackend);
                console.log('✅ Animal actualizado');
            } else {
                console.log('📤 Creando nuevo animal:', datosParaBackend);
                await apiClient.post('/ganaderia', datosParaBackend);
                console.log('✅ Animal creado');
            }

            await cargarAnimales();
            setAnimalAEditar(null);

            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
        } catch (error: any) {
            console.error('❌ Error al guardar:', error);
            alert(error.response?.data?.mensaje || 'Error al guardar el animal');
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // ACTUALIZAR ANIMAL (COMPATIBILIDAD)
    // ============================================================
    const actualizarAnimal = async (id: number, datos: Partial<Animal>) => {
        try {
            const respuesta = await apiClient.put(`/ganaderia/${id}`, datos);
            await cargarAnimales();
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar:', error);
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        // Datos
        listaGanado,
        cargando,
        especies,
        ubicaciones,
        estados,
        
        // Stats
        stats,
        
        // Modal principal
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        sugerenciaId,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        
        // Acciones CRUD
        guardarAnimal,
        actualizarAnimal,
        recargarLista: cargarAnimales,
        
        // Edición
        animalAEditar,
        abrirEdicion,
        cancelarEdicion,
        
        // 🆕 Modal de confirmación
        modalConfirmacion,
        eliminando,
        abrirModalEliminar,
        cerrarModalConfirmacion,
        confirmarEliminar,
    };
};