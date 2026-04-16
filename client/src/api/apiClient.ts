import axios from 'axios';

// ============================================================
// 📌 CONFIGURACIÓN DE LA API
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================================
// 📌 INTERCEPTOR PARA EL TOKEN JWT
// ============================================================
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================================
// 📌 INTERCEPTOR PARA MANEJO DE ERRORES GLOBALES
// ============================================================
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 🆕 Verificar que existe response antes de acceder a status
        if (error.response?.status === 401) {
            // Limpiar datos de sesión inválidos
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

            // Redirigir al login en caso del error de datos inválidos
            const enLogin = window.location.pathname === '/start';
            if (!enLogin) {
                console.warn('🔐 Sesión inválida, redirigiendo al login...');
                window.location.href = '/start';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;