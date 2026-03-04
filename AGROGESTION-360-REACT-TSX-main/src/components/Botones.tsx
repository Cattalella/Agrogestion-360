const Botones = ({ texto, estilo, onClick }: any) => {
    return (
    <button className={estilo} onClick={onClick}>
        {texto}
    </button>
    );
};

export default Botones;