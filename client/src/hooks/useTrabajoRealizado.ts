import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";
import { createClient } from "@supabase/supabase-js";
import { sincronizarFotosDesdeBackend } from "../utils/useFotosStorage";

// ============================================================
// 📌 CONFIGURACIÓN SUPABASE
// ============================================================
const supabaseUrl = "https://xqxbqmalxinmqyjmrvmk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxeGJxbWFseGlubXF5am1ydm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjcyODEsImV4cCI6MjA5MTQwMzI4MX0.up2DjRg-wqDd9E5UWW-VBVIkheyHHUwLT0mXEpHlvac";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// 📌 INTERFACES
// ============================================================
export interface TrabajoRealizado {
    id_trabajo: number;
    id_trabajador: number;
    categoria_trabajo: string;
    tipo_actividad: string;
    fecha_inicio: string;
    fecha_fin: string;
    duracion_horas: number;
    evidencia_url: string;
    observaciones?: string;
    Trabajador?: { nombre_completo: string };
    Pago?: {
        id_pago: number;
        estado_pago: string;
    };
}

export interface TrabajoStats {
    tipo1: string;
    cantidad1: number;
    tipo2: string;
    cantidad2: number;
    pendientesFirma: number;
}

type Vista = 'lista' | 'formulario';

// ============================================================
// 📌 FUNCIONES AUXILIARES (STORAGE)
// ============================================================
const subirFotoEvidencia = async (fileSource: string) => {
    try {
        const blob = await fetch(fileSource).then(res => res.blob());
        const nombreArchivo = `evidencia_${Date.now()}.png`;
        const rutaArchivo = `trabajos/${nombreArchivo}`;

        const { error } = await supabase.storage
            .from('evidencias')
            .upload(rutaArchivo, blob);

        if (error) throw error;

        const { data: urlData } = supabase.storage
            .from('evidencias')
            .getPublicUrl(rutaArchivo);

        return urlData.publicUrl;
    } catch (err) {
        console.error("❌ Error en Storage:", err);
        return null;
    }
};

// Guardar también en la tabla evidencias del backend
const guardarEnEvidencias = async (url: string, idReferencia: number) => {
    try {
        await apiClient.post('/evidencias', {
            url: url,
            origen: 'trabajo',
            idReferencia: idReferencia
        });
        console.log("✅ Foto guardada en tabla evidencias");
    } catch (err) {
        console.error("❌ Error al guardar en evidencias:", err);
    }
};

// ============================================================
// 📌 HOOK PRINCIPAL
// ============================================================
export const useTrabajoRealizado = () => {
    const [trabajos, setTrabajos] = useState<TrabajoRealizado[]>([]);
    const [cargando, setCargando] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vista, setVista] = useState<Vista>('lista');
    const [trabajoAEditar, setTrabajoAEditar] = useState<TrabajoRealizado | null>(null);
    const [trabajadores, setTrabajadores] = useState<any[]>([]);

    const cargarTrabajos = useCallback(async () => {
        setCargando(true);
        try {
            const response = await apiClient.get('/trabajadores/trabajos');
            const data = response.data;
            setTrabajos(data);
            
            // Sincronizamos las fotos del backend con el carrusel global (useFotosStorage)
            sincronizarFotosDesdeBackend(data);
            
        } catch (error) {
            console.error("❌ Error al cargar trabajos:", error);
        } finally {
            setCargando(false);
        }
    }, []);

    const cargarTrabajadores = async () => {
        try {
            const response = await apiClient.get('/trabajadores');
            const activos = response.data.filter((t: any) => t.estado?.toLowerCase() === 'activo');
            setTrabajadores(activos);
        } catch (error) {
            console.error("❌ Error al cargar trabajadores:", error);
        }
    };

    useEffect(() => {
        cargarTrabajos();
        cargarTrabajadores();
    }, [cargarTrabajos]);

    // 🆕 Escuchar evento de recarga desde el carrusel (cuando el boss da like)
    useEffect(() => {
        const handleRecargar = () => {
            console.log('🔄 [useTrabajoRealizado] Evento recargar-trabajos recibido');
            cargarTrabajos();
        };
        window.addEventListener('recargar-trabajos', handleRecargar);
        return () => window.removeEventListener('recargar-trabajos', handleRecargar);
    }, []);

    const calcularStats = (): TrabajoStats => {
        const horasTotales = trabajos.reduce((total, t) => total + (Number(t.duracion_horas) || 0), 0);
        const pendientesFirma = trabajos.filter(t => t.Pago?.estado_pago !== 'Pagado con firma').length;

        return {
            tipo1: "HORAS TOTALES",
            cantidad1: Math.round(horasTotales),
            tipo2: "TRABAJOS REGISTRADOS",
            cantidad2: trabajos.length,
            pendientesFirma
        };
    };

    const abrirModal = () => {
        setVista('lista');
        setTrabajoAEditar(null);
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setTrabajoAEditar(null);
        setVista('lista');
    };

    const cambiarVista = (v: Vista) => setVista(v);

    const abrirEdicion = (trabajo: TrabajoRealizado) => {
        setTrabajoAEditar(trabajo);
        setVista('formulario');
    };

    // ============================================================
    // 📌 REGISTRAR TRABAJO
    // ============================================================
    const registrarTrabajo = async (datos: any, cerrar: boolean = true) => {
        setCargando(true);
        try {
            let urlFinal = datos.evidencia_url;

            // 1. Subida a Supabase Storage
            if (datos.evidencia_url?.startsWith('data:image') || datos.evidencia_url?.startsWith('blob:')) {
                const urlSubida = await subirFotoEvidencia(datos.evidencia_url);
                if (urlSubida) {
                    urlFinal = urlSubida;
                    
                    // Sincronizar con carrusel global (useFotosStorage)
                    sincronizarFotosDesdeBackend([{ 
                        evidencia_url: urlFinal, 
                        fecha_inicio: datos.fecha_inicio 
                    }]);
                }
            }

            const datosParaBackend = {
                id_trabajador: parseInt(datos.id_trabajador),
                categoria_trabajo: datos.categoria_trabajo,
                tipo_actividad: datos.tipo_actividad,
                fecha_inicio: datos.fecha_inicio,
                fecha_fin: datos.fecha_fin,
                duracion_horas: datos.duracion_horas,
                evidencia_url: urlFinal, 
                observaciones: datos.observaciones || null,
            };

            let nuevoId: number | null = null;

            // 2. Guardar en Base de Datos (tabla trabajos)
            if (trabajoAEditar) {
                await apiClient.put(`/trabajadores/trabajos/${trabajoAEditar.id_trabajo}`, datosParaBackend);
                nuevoId = trabajoAEditar.id_trabajo;
            } else {
                const response = await apiClient.post('/trabajadores/trabajos', datosParaBackend);
                nuevoId = response.data?.id_trabajo;
            }

            // 3. Guardar también en tabla evidencias para que aparezca en el carrusel
            if (urlFinal && urlFinal.startsWith('http')) {
                await guardarEnEvidencias(urlFinal, nuevoId || 0);
            }

            // 4. Recargar listas
            await cargarTrabajos();
            
            if (cerrar) {
                cerrarModal();
            } else {
                setVista('lista');
                setTrabajoAEditar(null);
            }
            return true;
        } catch (error: any) {
            console.error("Error al registrar:", error);
            alert(error.response?.data?.mensaje || "Error al registrar trabajo");
            return false;
        } finally {
            setCargando(false);
        }
    };

    const eliminarTrabajo = async (id: number, justificacion?: string) => {
        if (!justificacion?.trim()) {
            const j = prompt("Justificación para eliminar este trabajo:");
            if (!j?.trim()) return alert("La justificación es obligatoria.");
            justificacion = j;
        }

        try {
            await apiClient.delete(`/trabajadores/trabajos/${id}`, { data: { justificacion } });
            await cargarTrabajos();
            return true;
        } catch (error) {
            alert("Error al eliminar el trabajo");
            return false;
        }
    };

    return {
        trabajos,
        listaTrabajos: trabajos,
        trabajadores,
        cargando,
        loading: cargando,
        isModalOpen,
        vista,
        trabajoAEditar,
        setTrabajoAEditar,
        setVista,
        cambiarVista,
        stats: calcularStats(),
        abrirModal,
        cerrarModal,
        abrirEdicion,
        registrarTrabajo,
        guardarTrabajo: registrarTrabajo,
        eliminarTrabajo,
        recargarLista: cargarTrabajos,
    };
};