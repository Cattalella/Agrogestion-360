import { useState, useEffect } from 'react';
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
// 📌 HOOK PRINCIPAL
// ============================================================
export const useGanado = (listaInicial: Animal[] = []) => {
    // Estados
    const [listaGanado, setListaGanado] = useState<Animal[]>(listaInicial);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("VA");
    const [sugerenciaId, setSugerenciaId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<'lista' | 'formulario'>('lista');
    const [cargando, setCargando] = useState(false);
    
    // Catálogos
    const [especies, setEspecies] = useState<CatalogoEspecie[]>([]);
    const [ubicaciones, setUbicaciones] = useState<CatalogoUbicacion[]>([]);
    const [estados, setEstados] = useState<CatalogoEstado[]>([]);

    // ============================================================
    // CARGAR ANIMALES DEL BACKEND AL INICIAR
    // ============================================================
    useEffect(() => {
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
                console.log('✅ Catálogos cargados:', {
                    especies: datos.especies?.length,
                    ubicaciones: datos.ubicaciones?.length,
                    estados: datos.estados?.length
                });
            } catch (error) {
                console.error('❌ Error al cargar catálogos:', error);
            }
        };

        cargarCatalogos();
    }, []);

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
    const abrirModal = () => setIsModalOpen(true);
    
    const cerrarModal = () => {
        setIsModalOpen(false);
        setVista('lista');
    };

    const cambiarVista = (nuevaVista: 'lista' | 'formulario') => setVista(nuevaVista);

    // ============================================================
    // GUARDAR ANIMAL (BACKEND)
    // ============================================================
    const guardarAnimal = async (nuevoAnimal: any, cerrar: boolean) => {
        setCargando(true);
        try {
            // Construir datos para el backend
            const datosParaBackend = {
                codigo_local: nuevoAnimal.local || sugerenciaId,
                num_ica_chapeta: nuevoAnimal.oficial || null,
                sexo: nuevoAnimal.sexo || 'HEMBRA',
                raza: nuevoAnimal.raza || 'Criollo',
                fecha_nacimiento: nuevoAnimal.nacimiento || new Date().toISOString().split('T')[0],
                peso_actual: parseFloat(nuevoAnimal.peso) || 0,
                origen: nuevoAnimal.origen || 'Registro inicial',
                foto_url: nuevoAnimal.foto || null,
                id_ubicacion: parseInt(nuevoAnimal.ubicacion || "1"),
                id_estado_ani: parseInt(nuevoAnimal.estado || "1")
            };

            console.log('📤 Enviando a backend:', datosParaBackend);

            const respuesta = await apiClient.post('/ganaderia', datosParaBackend);
            const animalCreado = respuesta.data;
            console.log('✅ Animal creado:', animalCreado);

            // Actualizar lista local
            setListaGanado(prev => [...prev, {
                id: animalCreado.id,
                oficial: animalCreado.oficial,
                local: animalCreado.local,
                sexo: animalCreado.sexo,
                estado: animalCreado.estado,
                raza: animalCreado.raza,
            }]);

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
    // ACTUALIZAR ANIMAL
    // ============================================================
    const actualizarAnimal = async (id: number, datos: Partial<Animal>) => {
        try {
            const respuesta = await apiClient.put(`/ganaderia/${id}`, datos);
            setListaGanado(prev => prev.map(a => 
                a.id === id ? { ...a, ...datos } : a
            ));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar:', error);
        }
    };

    // ============================================================
    // ELIMINAR ANIMAL
    // ============================================================
    const eliminarAnimal = async (id: number) => {
        try {
            const respuesta = await apiClient.delete(`/ganaderia/${id}`);
            setListaGanado(prev => prev.filter(a => a.id !== id));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al eliminar:', error);
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
        
        // Modal
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        sugerenciaId,
        isModalOpen,
        vista,
        abrirModal,
        cerrarModal,
        cambiarVista,
        
        // Acciones
        guardarAnimal,
        actualizarAnimal,
        eliminarAnimal,
    };
};