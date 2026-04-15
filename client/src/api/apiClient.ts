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
        if (error.response?.status === 401) {
            const token = localStorage.getItem('token');
            const enLogin = window.location.pathname === '/';
            // Solo redirigir si NO hay token Y no estamos ya en el login
            // Esto evita el loop: Boss llama API → 401 → redirect → loop
            if (!token && !enLogin) {
                console.warn('⚠️ Sesión no válida. Redirigiendo al login...');
                window.location.href = '/';
            } else {
                console.warn('⚠️ API retornó 401. Continuando con datos locales.');
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
