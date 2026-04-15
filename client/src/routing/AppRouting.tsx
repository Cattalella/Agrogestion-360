import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "../layouts/Fondo"; 
import { Home } from "../pages/Home";
import { Star } from "../pages/Star";
import { Informacion } from "../pages/Informacion";
import { Admin } from "../pages/Admin";
import { Boss } from "../pages/Boss";
import { Contrasena } from "../pages/Contrasena";
import { ConfirmarReset } from "../pages/ConfirmarReset";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const AppRouting = () => {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/star" element={<Star />} />
                <Route path="/contrasena" element={<Contrasena />} />
                <Route path="/confirmar-reset" element={<ConfirmarReset />} />
            </Route>

            {/* Rutas Protegidas (General para Admin y Dueño) */}
            <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Dueño']} />}>
                <Route path="/info" element={<Informacion />} />
                <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Rutas Exclusivas del Dueño */}
            <Route element={<ProtectedRoute allowedRoles={['Dueño']} />}>
                <Route path="/boss" element={<Boss />} />
            </Route>
        </Routes>
    );
};