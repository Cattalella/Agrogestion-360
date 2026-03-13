import { Bienvenida } from "../components/Bienvenida";
import { Login } from "../components/Login";

export const Star = () => {
    return (
        <div className="flex">
            <Bienvenida 
            />
            <Login />
        </div>
    )
}