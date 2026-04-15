import { useState } from 'react';
import apiClient from '../api/apiClient';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import vaca from '../assets/imgs/rvaca.jpg';

export const Login = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');
    const [error, setError] = useState<string | null>(null);    
    const [cargando, setCargando] = useState(false);

    const handleLogin = async () => {
        setCargando(true);
        setError(null);

        try {
            const respuesta = await apiClient.post('/autenticacion/iniciar-sesion', {
                nombre_usuario: usuario,
                contrasena: clave
            });

            // ✅ Guardar token y datos
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
            
            console.log("✅ Login exitoso:", respuesta.data.usuario.nombre);
            
            // 🆕 ESPERAR un momento antes de redirigir
            // Esto asegura que el token esté 100% disponible
            setTimeout(() => {
                const rol = respuesta.data.usuario.rol;
                if (rol === 'Dueño') {
                    navigate('/boss', { replace: true });
                } else if (rol === 'Administrador') {
                    navigate('/admin', { replace: true });
                } else {
                    navigate('/boss', { replace: true });
                }
            }, 100); // 100ms de delay

        } catch (err: any) {
            console.error('❌ Error en login:', err);
            
            if (err.code === "ERR_NETWORK") {
                setError("ERROR DE CONEXIÓN: El servidor no está disponible");
            } else if (err.response?.status === 401) {
                setError("CREDENCIALES INCORRECTAS");
            } else {
                setError(err.response?.data?.mensaje || "Error inesperado");
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
                    type="text"
                    required
                    placeholder="NOMBRE DE USUARIO"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
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