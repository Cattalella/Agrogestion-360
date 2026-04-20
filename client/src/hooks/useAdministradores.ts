// client/src/hooks/useAdministradores.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

interface Admin {
    id: number;
    nombre: string;
    rol?: string;
}

export const useAdministradores = () => {
    const [adminsActivos, setAdminsActivos] = useState<Admin[]>([]);
    const [adminsRevocados, setAdminsRevocados] = useState<Admin[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargarAdmins = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const [activosRes, revocadosRes] = await Promise.all([
                apiClient.get('/administradores/activos'),
                apiClient.get('/administradores/revocados')
            ]);
            setAdminsActivos(activosRes.data);
            setAdminsRevocados(revocadosRes.data);
        } catch (err) {
            setError('Error al cargar administradores');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarAdmins();
    }, [cargarAdmins]);

    const registrarAdmin = async (datos: {
        nombre_completo: string;
        tipo_documento: string;
        num_documento: string;
        email: string;
        telefono: string;
        nombre_usuario: string;
        contrasena: string;
        rol: string;
    }) => {
        await apiClient.post('/administradores/registrar', datos);
        await cargarAdmins();
    };

    const inhabilitarAdmin = async (id: number) => {
        await apiClient.patch(`/administradores/${id}/inhabilitar`);
        await cargarAdmins();
    };

    const habilitarAdmin = async (id: number) => {
        await apiClient.patch(`/administradores/${id}/habilitar`);
        await cargarAdmins();
    };

    return {
        adminsActivos,
        adminsRevocados,
        cargando,
        error,
        registrarAdmin,
        inhabilitarAdmin,
        habilitarAdmin,
        cargarAdmins
    };
};