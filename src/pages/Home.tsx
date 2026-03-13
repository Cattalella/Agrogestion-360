import { Bienvenida } from "../components/Bienvenida";
import { Entrar } from "../components/Entrar";

export const Home = () => {
    return (
        // Quitamos la imagen, el estilo y las clases de fondo (bg-cover, etc.)
        // Solo dejamos un contenedor (Fragment o un div simple) para tus componentes
        <div className="flex w-full items-center justify-center">
            <Bienvenida />
            <Entrar />
        </div>
    )
};