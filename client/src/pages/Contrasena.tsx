import pajaro from "../assets/imgs/PAJARO.png";
import { Botones } from "../components/Botones";

export const Contrasena = () => {
    return (
        <div className="flex">

            <div className="absolute -top-50 left-10 w-[50rem]">
                <img src={pajaro} alt="Pajaro" />
            </div>

            <div className="bg-black/80 mx-auto p-20 py-40 rounded-lg rounded-tl-[15rem] rounded-br-[15rem] flex flex-col justify-center border-3 border-white border">
                <p className="text-white text-center uppercase"> Restablecer Contraseña </p>
                <input type="email" placeholder="Ingresa tu correo electrónico" className="w-full p-2 text-white rounded border-b-2 outline-none focus:border-amber-200 transition-all" />
                <Botones estilo="!bg-green-400 cursor-pointer hover:scale-101 !text-[0.8rem] border-none !transition-all uppercase" texto="Actualizar"/>
            </div>
            

        </div>
    )
}