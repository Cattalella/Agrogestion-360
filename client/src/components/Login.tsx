import { useState } from 'react';
import axios from 'axios';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import vaca from '../assets/imgs/rvaca.jpg';

export const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [clave, setClave] = useState('');
    const [error, setError] = useState<string | null>(null);    
    const [cargando, setCargando] = useState(false);

    const handleLogin = async () => {
        setCargando(true);
        setError(null);

        try {
            // INTENTO DE CONEXIÓN REAL CON EL BACKEND
            const respuesta = await axios.post('http://127.0.0.1:3000/auth/login', {
                email: email,
                contrasena: clave 
            });

            localStorage.setItem('token', respuesta.data.access_token);
            localStorage.setItem('nombreUsuario', respuesta.data.user.nombre);
            
            console.log("Login exitoso para:", respuesta.data.user.nombre);
            navigate('/boss', { replace: true }); 

        } catch (err: any) {

            // ==========================================================
            //       LA OVEJA NEGRA: BYPASS SI EL SERVER NO ESTÁ
            // ==========================================================
            
            if (err.code === "ERR_NETWORK") {
                
                console.warn("⚠️ MODO EMERGENCIA: Servidor no detectado.");
                console.log("Accediendo con credenciales quemadas para diseño...");

                // Si ella escribe estos datos específicos, entra aunque no haya server
                if (email === 'boss@agro.com' && clave === 'clave123') {
                    
                    localStorage.setItem('token', 'token-falso-desarrollo');
                    localStorage.setItem('nombreUsuario', 'Invitada (Modo Diseño)');
                    
                    navigate('/boss', { replace: true });
                    return; // Fin de la oveja negra
                } else {
                    setError("MODO OFFLINE: USA LAS CLAVES DE DISEÑO");
                    return;
                }
            }

            // ==========================================================

            // MANEJO DE ERRORES NORMAL (CUANDO EL SERVER SÍ RESPONDE)
            if (err.response?.status === 401) {
                setError("CREDENCIALES INCORRECTAS");
            } else {
                const mensajeError = err.response?.data?.message || "Error inesperado";
                setError(Array.isArray(mensajeError) ? mensajeError[0] : mensajeError);
            }

        } finally {
            setCargando(false);
        }
    };

    return (
        <section className='flex flex-col bg-black border-4 border-white backdrop-blur-[2px] items-center h-[35rem] justify-center w-[22rem]'>
            
            <img 
                src={vaca} 
                alt="Logo" 
                className='shadow-[0px_0px_150px_5px_rgba(255,255,255,0.5)] w-[7rem] h-[7rem] object-cover rounded-full mb-[4rem]' 
            />

            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!cargando) handleLogin();
                }} 
                className='flex flex-col items-center gap-8 w-full px-8'
            >
                <div className="h-4 flex items-center justify-center">
                    {error && (
                        <span className="text-red-500 text-[0.7rem] uppercase tracking-widest animate-pulse">
                            {error}
                        </span>
                    )}
                </div>
                
                <input 
                    type="email"
                    required
                    placeholder="NOMBRE DE USUARIO"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='w-full bg-transparent border-b-2 border-white text-white py-2 outline-none placeholder:text-gray-500 focus:border-[var(--color-verdeBorde)] transition-colors'
                />

                <input 
                    type="password" 
                    required
                    placeholder="CONTRASEÑA"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    className='w-full bg-transparent border-b-2 border-white text-white py-2 outline-none placeholder:text-gray-500 focus:border-[var(--color-amarilloBorde)] transition-colors'
                />
                
                <div className='mt-4 w-full flex justify-center'>
                    <button 
                        type='submit' 
                        disabled={cargando} 
                        className={`hover:bg-green-700 w-[12rem] !border-[var(--color-verdeBorde)] px-4 border-white border-1 flex items-center justify-center gap-2 cursor-pointer rounded-tl-[3rem] rounded-br-[3rem] transition-all
                        ${cargando ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                        <div className='text-white px-4 py-2 flex gap-4 text-[0.8rem] items-center'> 
                            {cargando ? 'VALIDANDO...' : 'INGRESAR'} 
                            {!cargando && <LogIn className='text-white w-4' />} 
                        </div>
                    </button>
                </div>

                <div className="text-white">
                    <p 
                        onClick={() => navigate("/contrasena")}
                        className="cursor-pointer hover:text-[var(--color-amarilloBorde)] text-[0.8rem] transition-colors duration-300"
                    >
                        ¿Olvidaste tu contraseña?
                    </p>
                </div>
            </form>
        </section>
    );
};