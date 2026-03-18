import { useState } from 'react'; // Importamos para guardar los datos
import { useNavigate } from 'react-router-dom';
import vaca from '../assets/imgs/rvaca.jpg';
import { Botones } from '../components/Botones';

export const Login = () => {
    const navigate = useNavigate();

    // 1. CREAMOS LOS ESTADOS PARA CAPTURAR EL TEXTO
    const [email, setEmail] = useState('');
    const [clave, setClave] = useState('');

    // 2. FUNCIÓN PARA ENVIAR LOS DATOS A NESTJS
    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, clave }) // Enviamos lo que guardó el estado
            });

            const data = await response.json();

            if (response.ok) {
                // 3. LA LÓGICA DE ROLES QUE QUERÍAS
                if (data.rol === 'propietario') {
                    navigate('/'); // Cambia esto por tu ruta real
                } else if (data.rol === 'admin') {
                    navigate('/Admin');
                }
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            alert("No se pudo conectar con el servidor (¿Está prendido Nest?)");
        }
    };

    return (
        <section className='flex flex-col bg-black border-4 border-white backdrop-blur-[2px] items-center h-[35rem] justify-center w-[22rem]'>
            
            <img src={vaca} alt="Logo" className='shadow-[0px_0px_150px_5px_rgba(255,255,255,0.5)] w-[7rem] h-[7rem] object-cover rounded-full mb-[4rem]' />

            <div className='flex flex-col items-center gap-8 w-full px-8'>
                
                {/* 4. VINCULAMOS EL INPUT AL ESTADO */}
                <input 
                    type="email"
                    placeholder="NOMBRE DE USUARIO"
                    value={email} // Le decimos que su valor es el estado
                    onChange={(e) => setEmail(e.target.value)} // Cuando escribas, guarda el texto
                    className='w-full bg-transparent border-b-2 border-white text-white py-2 outline-none placeholder:text-gray-500 focus:border-[var(--color-verdeBorde)] transition-colors'
                />

                <input 
                    type="password" 
                    placeholder="CONTRASEÑA"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    className='w-full bg-transparent border-b-2 border-white text-white py-2 outline-none placeholder:text-gray-500 focus:border-[var(--color-amarilloBorde)] transition-colors'
                />
                
                <div className='mt-4'>
                    <Botones
                        texto='INGRESAR'
                        onClick={handleLogin} // LLAMAMOS A LA FUNCIÓN DE ARRIBA
                        estilo='!rounded-[0] border-2 !rounded-tl-[20rem] !rounded-bl-[1rem] !rounded-br-[20rem] border-[var(--color-verdeBorde)] !border-l-[0.5rem] w-[10rem] text-white hover:bg-white hover:text-black transition-colors duration-300'
                    />
                </div>
            </div>
        </section>
    );
}