import vaca from '../assets/imgs/rvaca.jpg';
import Botones from '../components/Botones';

// Recibimos "modoLogin" (el estado) y "alHacerClic" (la función)
export const Entrar = ({ modoLogin, alHacerClic }: any) => {
    return (
        <section className='
        flex flex-col bg-black 
        border-4 border-white
        backdrop-blur-[2px]
        items-center h-[35rem]
        justify-center w-[22rem]
        '>

            <img 
                src={ vaca } 
                alt="Dibujo" 
                className='
                shadow-[0px_0px_150px_5px_rgba(255,255,255,0.5)]
                w-[7rem] h-[7rem] object-cover
                rounded-[50%]
                mb-[5rem]
                '
            />

            <div className='flex flex-col items-center'>
                {/* SI modoLogin es FALSE, muestra los botones iniciales */}
                {!modoLogin ? (
                    <>
                        <Botones 
                            texto='INICIAR SESIÓN'
                            onClick={alHacerClic} // Al hacer clic, activamos el login
                            estilo='rounded-[10rem] rounded-br-[0] 
                            rounded-tr-[20rem] border-r-[0.5rem] 
                            border-[var(--color-verdeBorde)] mb-[1rem]
                            border-1 w-[12rem] text-white 
                            hover:shadow-[0px_0px_20px_0px_var(--color-verdeBorde)]
                            text-[0.9rem]'
                        />
                        <Botones 
                            texto='INFORMACIÓN'
                            estilo='rounded-[10rem] rounded-tl-[0] 
                            rounded-bl-[20rem] border-l-[0.5rem] text-white 
                            border-[var(--color-amarilloBorde)]
                            border-1 text-[0.9rem] w-[12rem] 
                            hover:shadow-[0px_0px_20px_0px_var(--color-amarilloBorde)]'
                        />
                    </>
                ) : (
                    /* SI modoLogin es TRUE, muestra el formulario */
                    <div className="flex flex-col gap-6 w-[15rem] animate-fade-in">
                        <input 
                            type="text" 
                            placeholder="USUARIO" 
                            className="bg-transparent border-b-2 
                            border-[var(--color-amarilloBorde)] 
                            text-white p-2 outline-none tracking-widest
                            text-[0.9rem]"
                        />
                        <input 
                            type="password" 
                            placeholder="CONTRASEÑA" 
                            className="bg-transparent border-b-2 
                            border-[var(--color-amarilloBorde)] 
                            text-white p-2 outline-none tracking-widest
                            text-[0.9rem]"
                        />
                        <Botones 
                            texto='ENTRAR' 
                            estilo='mt-1 border-2 border-[var(--color-verdeBorde)] 
                            rounded-full text-white text-[0.9rem] 
                            hover:bg-[var(--color-verdeBorde)]
                            hover:text-black' 
                        />
                        <button 
                            onClick={alHacerClic} 
                            className="text-white text-[0.7rem] underline 
                            opacity-50 hover:opacity-100"
                        >
                            VOLVER ATRÁS
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};