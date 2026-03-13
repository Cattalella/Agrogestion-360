import iso from '../assets/imgs/prueba2.webp';
import logo360 from '../assets/imgs/360.svg';
import { motion } from 'framer-motion';

const saludo = "BIENVENIDOS";
const logo = "AGROGESTIÓN";
let lema = "GESTIÓN INTEGRAL DE TU FINCA EN UN SOLO LUGAR";

export const Bienvenida = () => {
    return (
        <section className='
            bg-black/30
            border-4 border-l-8 
            border-r-0
            border-[var(--color-amarilloBorde)] 
            rounded-l-[60px]
            flex flex-col 
            pl-[4rem] h-[35rem]
            justify-center 
            w-[50rem] 
            backdrop-blur-[3px]
            '>

            <motion.img 
            src={ iso } 
            alt="Dibujo" 
            className='
            w-[4rem]
            '
            animate={{
            scale: [1, 1.2, 1], // Escala: crece y vuelve
            }}
            transition={{
            duration: 3,        // Segundos que dura una "respiración"
            repeat: Infinity,   // Bucle infinito
            ease: "easeInOut"   // Suavizado
            }}
            />

            <p className='
                font-[agro] 
                text-[3rem] 
                mt-[1.5rem]
                text-white'> {saludo} </p>

            <div className="flex gap-2">
                <p className='
                font-[agro] 
                text-[3rem] 
                text-white'> {logo} </p>

                <img 
                src={ logo360 } 
                alt="Dibujo" 
                className='
                w-[3.5rem] 
                right-[12rem]
                -translate-y-4
                '
                />
            </div>
                <p className='
                font-[texto] 
                text-white
                mt-[4rem]
                tracking-[0.2rem]
                text-[0.9rem]'
                >
                    {lema}
                </p>
        </section>
    );
};