interface InfoTextProps {
    texto?: string;
    texto2?:string;
    icons?: string;
}

export const InfoText = ({ texto, texto2, icons }: InfoTextProps) => {
    return (
        <>
        <h1 className={` font-[yusei] ${icons}`}>
            <span className="font-semibold"> { texto } </span> 
        </h1>
        <p className={` font-[yusei] ${icons}`} >
            { texto2 }
        </p>
        </>
    );
};