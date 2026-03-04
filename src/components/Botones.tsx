//datos que recibe el componente
interface BotonProps {
    texto: string;
    estilo: string;
    onClick?: () => void;
}

export const Botones = ({ texto, estilo, onClick }: BotonProps) => {
    return (
    <button className= {
        `rounded-[10rem] rounded-br-[0]
        rounded-tr-[20rem] border-r-[0.5rem] 
        border-1 w-[12rem]
        hover:bg-white hover:text-black
        text-[0.9rem] transition-colors duration-300
        ${estilo}`}
        onClick={onClick} //Era error tener el onClick como un dato dentro del "claseName"
        >
        {texto}
    </button>
    );
};