import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("usuario");
    
    // 1. Si no hay token, al login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // 2. Si hay requerimiento de roles, verificar el rol del usuario
    if (allowedRoles) {
        if (!userJson) {
            return <Navigate to="/" replace />;
        }

        try {
            const user = JSON.parse(userJson);
            if (!allowedRoles.includes(user.rol)) {
                console.warn("Acceso denegado: Rol insuficiente");
                return <Navigate to="/" replace />;
            }
        } catch (e) {
            console.error("Error al verificar roles en ProtectedRoute", e);
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};
