import { useNavigate } from "react-router-dom";
import { Botones } from "./Botones";
import iso from '../assets/imgs/isoACM.svg'
import { motion } from "framer-motion";

interface NavProps {
    estilos?: string;
    texto?: string;
};

export const Navbar = ({ estilos, texto }: NavProps) => {
    const navigate = useNavigate();
    return (
        <>
        <nav className={`bg-black w-full max-w-[80rem] flex 
        justify-between items-center h-[2.8rem] 
        pr-[3rem] mx-auto rounded-[10rem]
        ${estilos}`}
        >
        
        <div className="flex items-center gap-[2rem]">

            <div className="bg-white w-[2.8rem] h-[2.8rem] flex justify-center
            rounded-[10rem]">
                <motion.img 
                src={iso} 
                alt="Dibujo de AgroGestión 360"
                className="
                w-[1.4rem] h-auto object-contain
                "
                animate={{
                scale: [1, 1.2, 1], 
                }}
                transition={{
                duration: 2,        
                repeat: Infinity,   
                ease: "easeInOut"   
                }}
                />
            </div>

            <h2 className="font-[yusei]">
                {texto || "INFORMACIÓN"} </h2>
        </div>

            <div className="flex items-center gap-[1rem]">
                <Botones texto="REGRESAR"
                    onClick={() => navigate("/") }
                    estilo="rounded-tl-[0] !rounded-r-[10rem]
                    rounded-bl-[20rem] border-l-[0.5rem] !border-r-1
                    border-1 text-[0.9rem] w-[12rem] 
                    hover:bg-white hover:text-black
                    transition-colors duration-300"
                    />

                <Botones 
                texto="INICIAR SESION" 
                onClick={() => navigate("/star")}
                estilo=""
                />
            </div>
        </nav>
        </>
    )
}