import { useState } from "react";
import { Bienvenida } from "../components/Bienvenida";
import { Entrar } from "../components/Entrar";
import fondo from '../assets/imgs/fondo.webp';

export const Home = () => {
    const [loginActivo, setLoginActivo] = useState(false);

    const toggleLogin = () => {
        setLoginActivo(!loginActivo);
    };
    
    return (
    <main style={{ backgroundImage: `url(${fondo})` }} 
    className="
    bg-cover bg-no-repeat
    bg-center
    flex min-h-screen w-full
    items-center justify-center
    ">
        

        <div className="">
            <Bienvenida modoLogin={loginActivo} /> {/* pasar el estado */}
        </div>

        <div className=""> 
            <Entrar modoLogin={loginActivo} alHacerClic={toggleLogin} /> {/* pasar el estado */}
        </div>

    </main>
    );
};