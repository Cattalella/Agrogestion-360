import { Bienvenida } from "../components/Bienvenida";
import { Entrar } from "../components/Entrar";
import fondo from '../assets/imgs/fondo.webp';


export const Home = () => {
    return (
        <div 

        className="
        flex min-h-screen 
        items-center 
        justify-center 
        bg-cover 
        bg-no-repeat
        bg-center 
        overflow-hidden" 
        style={{ backgroundImage: `url(${fondo})` }}>
            <Bienvenida />
            <Entrar />
        </div>
    )
};
