import { useNavigate } from 'react-router-dom';
import vaca from '../assets/imgs/rvaca.jpg';
import { Botones } from '../components/Botones';


export const Login = () => {
    const navigate = useNavigate();

    return (
        <section className='flex flex-col bg-black 
        border-4 border-white backdrop-blur-[2px] 
        items-center h-[35rem] justify-center w-[22rem]'>
            
            <img
                src={vaca} 
                alt="Logo AgroGestión" 
                className='shadow-[0px_0px_150px_5px_rgba(255,255,255,0.5)] 
                w-[7rem] h-[7rem] object-cover rounded-full mb-[4rem]'
            />

            <div className='flex flex-col items-center gap-8 w-full px-8'>
                {/* Input de Usuario */}
                <input 
                    type="email" required
                    placeholder="NOMBRE DE USUARIO"
                    className='w-full bg-transparent border-b-2 border-white text-white 
                    py-2 outline-none placeholder:text-gray-500 focus:border-[var(--color-verdeBorde)] 
                    transition-colors'
                />

                {/* Input de Contraseña */}
                <input 
                    type="password" 
                    placeholder="CONTRASEÑA"
                    className='w-full bg-transparent border-b-2 border-white text-white 
                    py-2 outline-none placeholder:text-gray-500 focus:border-[var(--color-amarilloBorde)] 
                    transition-colors'
                />
                
                {/* Botón de Ingreso (Opcional, pero recomendado para procesar los inputs) */}
                <div className='mt-4'>
                    <Botones
                        texto='INGRESAR'
                        onClick={() => navigate("")} 
                        estilo='!rounded-[0] 
                        border-2
                        !rounded-tl-[20rem]
                        !rounded-bl-[1rem]
                        !rounded-br-[20rem]
                        border-[var(--color-verdeBorde)] 
                        !border-l-[0.5rem]
                        w-[10rem] 
                        text-white 
                        hover:bg-white
                        hover:text-black
                        transition-colors 
                        duration-300'
                    />
                </div>
            </div>
        </section>
    )
}
