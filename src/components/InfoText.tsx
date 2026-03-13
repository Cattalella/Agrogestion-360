interface InfoTextProps {
    texto?: string;
    estiloT?: string;
    texto2?:string;
    estiloP?: string;
    icons?: string;
}

export const InfoText = ({ texto, estiloT, texto2, estiloP, icons }: InfoTextProps) => {
    return (
        <>
        <h1 className={` font-[yusei] ${icons} ${estiloT}`}>
            <span className="font-semibold"> { texto } </span> 
        </h1>
        <p className={` font-[yusei] ${icons} ${estiloP}`} >
            { texto2 }
        </p>
        </>
    );
};