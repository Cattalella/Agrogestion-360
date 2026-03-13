import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "../layouts/Fondo"; // Importas tu nuevo "escenario"
import { Home } from "../pages/Home";
import { Star } from "../pages/Star";
import { Informacion } from "../pages/Informacion";
import { Admin } from "../pages/Admin";

export const AppRouting = () => {
    return (
        <Routes>
            {/* 1. Envolvemos Home y Star en el PublicLayout */}
            {/* Todo lo que esté aquí adentro compartirá el fondo de 4.5MB sin recargarse */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/star" element={<Star />} />
            </Route>

            {/* 2. Las rutas que NO llevan ese fondo van por fuera */}
            <Route path="/info" element={<Informacion />} />
            <Route path="/admin" element={<Admin />} />
        </Routes>
    );
};