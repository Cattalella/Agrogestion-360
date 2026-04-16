import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

// ============================================================
// 📌 INTERFACES
// ============================================================
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

type Vista = 'lista' | 'formulario';

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useCerdos = () => {
    const [cerdos, setCerdos] = useState<Cerdo[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [cargando, setCargando] = useState(false);

    const [categoriaCerdo, setCategoriaCerdo] = useState("C");
    const [sugerenciaId, setSugerenciaId] = useState("");

    // ============================================================
    // CARGAR CERDOS
    // ============================================================
    const cargarCerdos = async () => {
        setCargando(true);
        try {
            const respuesta = await apiClient.get('/porcicultura/cerdos');
            setCerdos(respuesta.data);
            console.log('✅ Cerdos cargados:', respuesta.data.length);
        } catch (error) {
            console.error("❌ Error al cargar cerdos:", error);
        } finally {
            setCargando(false);
        }
    };

    // Cargar al iniciar
    useEffect(() => {
        cargarCerdos();
    }, []);

    // Refrescar al abrir modal
    useEffect(() => {
        if (isModalOpen) cargarCerdos();
    }, [isModalOpen]);

    // ============================================================
    // 🆕 CALCULAR STATS PARA LA CARD
    // ============================================================
    const calcularStats = (): CerdosStats => {
        // Verracos (machos adultos con prefijo V)
        const verracos = cerdos.filter(c => 
            c.codigo_local?.startsWith('V')
        ).length;
        
        // Cerdas de cría (hembras adultas con prefijo C)
        const cerdasCria = cerdos.filter(c => 
            c.codigo_local?.startsWith('C')
        ).length;
        
        // Lechones (bebés con prefijo L)
        const lechones = cerdos.filter(c => 
            c.codigo_local?.startsWith('L')
        ).length;
        
        // Cerdos de ceba (engorde con prefijo E)
        const cerdosCeba = cerdos.filter(c => 
            c.codigo_local?.startsWith('E')
        ).length;

        return {
            tipo1: "VERRACOS",
            cantidad1: verracos,
            tipo2: "CERDAS DE CRÍA",
            cantidad2: cerdasCria,
            tipo3: "LECHONES",
            cantidad3: lechones,
            tipo4: "CERDOS DE CEBA",
            cantidad4: cerdosCeba
        };
    };

    // ============================================================
    // GENERAR SUGERENCIA DE ID LOCAL
    // ============================================================
    useEffect(() => {
        const registrosMismoTipo = cerdos.filter(c => 
            c.codigo_local?.startsWith(categoriaCerdo)
        );
        
        const ultimoNumero = registrosMismoTipo.reduce((max, curr) => {
            const partes = curr.codigo_local?.split('-') || [];
            const num = partes.length > 1 ? parseInt(partes[1]) : 0;
            return !isNaN(num) && num > max ? num : max;
        }, 0);
        
        setSugerenciaId(`${categoriaCerdo}-${String(ultimoNumero + 1).padStart(2, '0')}`);
    }, [categoriaCerdo, cerdos]);

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

    const cambiarVista = (v: Vista) => setVista(v);

    // ============================================================
    // GUARDAR CERDO
    // ============================================================
    const guardarCerdo = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            const datosParaBackend = {
                local: datos.local || sugerenciaId,
                oficial: datos.oficial || null,
                sexo: datos.sexo || 'HEMBRA',
                raza: datos.raza || 'Criollo',
                nacimiento: datos.nacimiento || null,
                ingreso: datos.ingreso || new Date().toISOString().split('T')[0],
                peso: parseFloat(datos.peso) || 0,
                origen: datos.origen || 'Registro inicial',
                id_madre: datos.id_madre || null,
                establo: datos.establo || '',
                salud: datos.salud || 'SANO',
                foto: datos.foto || null
            };

            console.log('📤 Enviando a backend (Cerdo):', datosParaBackend);
            
            const respuesta = await apiClient.post('/porcicultura/cerdos', datosParaBackend);
            console.log('✅ Cerdo creado:', respuesta.data);
            
            await cargarCerdos();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
            }
            return true;
        } catch (error: any) {
            console.error("❌ Error al guardar cerdo:", error);
            alert(error.response?.data?.mensaje || 'Error al guardar el cerdo');
            return false;
        } finally {
            setCargando(false);
        }
    };

    // ============================================================
    // 🆕 ACTUALIZAR CERDO
    // ============================================================
    const actualizarCerdo = async (id: number, datos: Partial<Cerdo>) => {
        try {
            const respuesta = await apiClient.put(`/porcicultura/cerdos/${id}`, datos);
            setCerdos(prev => prev.map(c => 
                c.id_animal === id ? { ...c, ...datos } : c
            ));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al actualizar cerdo:', error);
        }
    };

    // ============================================================
    // 🆕 ELIMINAR CERDO
    // ============================================================
    const eliminarCerdo = async (id: number) => {
        try {
            const respuesta = await apiClient.delete(`/porcicultura/cerdos/${id}`);
            setCerdos(prev => prev.filter(c => c.id_animal !== id));
            return respuesta.data;
        } catch (error) {
            console.error('❌ Error al eliminar cerdo:', error);
        }
    };

    // ============================================================
    // RETORNAR
    // ============================================================
    return {
        listaCerdos: cerdos,
        cargando,
        isModalOpen,
        vista,
        sugerenciaId,
        categoriaCerdo,
        setCategoriaCerdo,
        
        // 🆕 Stats para la card
        stats: calcularStats(),
        
        abrirModal,
        cerrarModal,
        cambiarVista,
        guardarCerdo,
        actualizarCerdo,
        eliminarCerdo,
        recargarLista: cargarCerdos,
    };
};