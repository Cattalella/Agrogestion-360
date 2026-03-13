import { useNavigate } from 'react-router-dom';
import vaca from '../assets/imgs/rvaca.jpg';
import { Botones } from '../components/Botones';

export const Entrar = () => {
    const navigate = useNavigate();

    return (
        <section className='flex flex-col bg-black 
        border-4 border-white backdrop-blur-[2px] 
        items-center h-[35rem] justify-center w-[22rem]'>
            <img
                src={vaca} 
                alt="Logo AgroGestión" 
                className='shadow-[0px_0px_150px_5px_rgba(255,255,255,0.5)] 
                w-[7rem] h-[7rem] object-cover rounded-full mb-[5rem]'
            />

            <div className='flex flex-col items-center gap-4'>
                <Botones 
                    texto='INICIAR SESIÓN'
                    onClick={() => navigate("/star")} // <--- Te manda a la ruta /login
                    estilo='rounded-[10rem] rounded-br-0 
                    rounded-tr-[20rem] border-r-[0.5rem] 
                    border-[var(--color-verdeBorde)] w-[12rem] 
                    text-white hover:bg-white hover:text-black 
                    transition-colors duration-300'
                />
                
                <Botones 
                    texto='INFORMACIÓN'     
                    onClick={() => navigate("/info")} // <--- manda a la ruta de información
                    estilo='rounded-tl-[0] !rounded-r-[10rem]
                    rounded-bl-[20rem] border-l-[0.5rem] !border-r-1
                    border-[var(--color-amarilloBorde)]
                    border-1 text-[0.9rem] w-[12rem] 
                    text-white
                    hover:bg-white hover:text-black
                    transition-colors duration-300'
                />
            </div>
        </section>
    );
};