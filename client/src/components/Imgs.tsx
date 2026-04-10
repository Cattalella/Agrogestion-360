interface ImgsProps {
    estilos?: string;
    url: string;
    alt: string;
}

export const Imgs = ({ estilos, url, alt }: ImgsProps) => {
    return (
        <img src={url} 
        alt={alt}
        className={`w-full h-full object-cover ${estilos}`}
        />
    );
};
