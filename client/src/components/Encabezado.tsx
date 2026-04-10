import React, { useState, useRef, useEffect } from "react";
import { Navegar } from "./Navegar"; 
import { useNavigate } from "react-router-dom"; // Hook para la redirección

interface EncabezadoProps {
    children: React.ReactNode; 
    estilos?: string;
    titulo?: string; 
    titulos?: string;
    subtitulo?: string;
    id: string; 
}

export const Nav2 = () => {
    const navigate = useNavigate();
    const estiloBoton = "backdrop-blur-md bg-white/60 px-4 py-2 rounded-full hover:bg-white transition-all cursor-pointer font-bold text-xs shadow-sm border border-white/80";

    const handleCerrarSesion = () => {
        // Limpieza de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('nombreUsuario');
        
        // Redirección con reemplazo de historial para evitar el botón atrás/adelante del mouse
        navigate('/', { replace: true });
        
        console.log("Sesión cerrada correctamente");
    };

    return (
        <nav className="flex gap-15">
            <p className={estiloBoton}> MI PERFIL </p>
            <p className={estiloBoton}> RECORDATORIO </p>
            {/* El botón de CERRAR ahora dispara la función */}
            <p className={estiloBoton} onClick={handleCerrarSesion}> CERRAR </p>
        </nav>
    )
}

export const Encabezado = ({ children, estilos, titulo, id, titulos, subtitulo }: EncabezadoProps) => {
    // LLAVES ÚNICAS PARA SEPARAR H1 DE H2
    const keyH1 = `colorH1_${id}`;
    const keyH2 = `colorH2_${id}`;

    // ESTADOS INDEPENDIENTES
    const [colorH1, setColorH1] = useState(() => localStorage.getItem(keyH1) || "#000000");
    const [colorH2, setColorH2] = useState(() => localStorage.getItem(keyH2) || "#000000");

    const inputH1Ref = useRef<HTMLInputElement>(null);
    const inputH2Ref = useRef<HTMLInputElement>(null);

    // GUARDADO INDEPENDIENTE
    useEffect(() => {
        localStorage.setItem(keyH1, colorH1);
        localStorage.setItem(keyH2, colorH2);
    }, [colorH1, colorH2, keyH1, keyH2]);

    return ( 
        <div className={`relative w-full flex justify-end overflow-hidden min-h-[45rem] ${estilos}`}>
            
            {/* DOS INPUTS: UNO PARA CADA TEXTO */}
            <input type="color" ref={inputH1Ref} value={colorH1} onChange={(e) => setColorH1(e.target.value)} className="hidden" />
            <input type="color" ref={inputH2Ref} value={colorH2} onChange={(e) => setColorH2(e.target.value)} className="hidden" />

            <div className="absolute inset-0 z-0 w-full h-full max-h-[200rem]">
                {children}
            </div>

            <div className="flex items-center absolute w-fit h-fit gap-100 left-10 top-10 z-30">
                <Navegar />
                <Nav2 />
            </div>

            {/* TU CONTENEDOR ORIGINAL CON EL BORDE QUE SIGUE AL H1 */}
            <div style={{ borderColor: colorH1 }} className="absolute inset-0 z-20 flex flex-col w-fit h-fit top-60 left-10 border-b-3 pb-3">
                <h1 
                    onClick={() => inputH1Ref.current?.click()}
                    style={{ color: colorH1 }}
                    className="text-[6rem] leading-[1.2] cursor-pointer select-none pointer-events-auto w-fit transition-colors duration-200 font-black"
                >
                    BIENVENIDO<br /> 
                    <span>
                        {titulo ? titulo : "ESTE ES EL"}
                    </span>
                    <br />
                    <span>
                        {titulos ? titulos : ""}
                    </span>
                </h1>

                {/* H2 CON SU PROPIO COLOR Y ESTILO ORIGINAL */}
                <div className="absolute top-68 ">
                    <h2 
                        onClick={() => inputH2Ref.current?.click()}
                        style={{ color: colorH2 }}
                        className="text-[2.5rem] leading-[1.2] cursor-pointer select-none pointer-events-auto w-fit transition-colors duration-200 font-black"
                    >
                        <span>
                            {subtitulo ? subtitulo : ""}
                        </span>
                    </h2>
                </div>
            </div>
        </div>
    );
}