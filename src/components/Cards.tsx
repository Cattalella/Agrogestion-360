interface CardsProps {
    titulo: string;
    parrafos: string;
    estilosT?: string;
    estilosP?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

export const Cards = ({ children, titulo, parrafos, estilosT, estilosP, onClick }: CardsProps) => {
    return (
        <section 
        className={
            `flex flex-col border-2 border-solid rounded-[2rem] p-7
            w-full max-w-[30rem] h-[33rem] justify-center`
            } 
            onClick={onClick}>
            {children}
            <h1 className={`${estilosT}`}> {titulo} </h1>
            <p className={estilosP}> {parrafos} </p>
        </section>
    )
};