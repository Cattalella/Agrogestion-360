import { Routes, Route,} from "react-router-dom"
import { Home } from "../pages/Home"
import { Informacion } from "../pages/Informacion"

export const AppRouting = () => {
    return (
    <Routes>
        <Route path="/" element={ <Home />} />
        <Route path="/info" element={ <Informacion />} />
    </Routes>
    )
};