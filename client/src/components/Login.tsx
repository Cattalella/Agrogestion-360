import { useState } from 'react';
import apiClient from '../api/apiClient';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import vaca from '../assets/imgs/rvaca.jpg';
import { Animacion } from './animations/Animacion';

export const Login = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState('');
    const [clave, setClave] = useState('');
    const [error, setError] = useState<string | null>(null);    
    const [cargando, setCargando] = useState(false);

    // 🔧 Función para limpiar automáticamente si hay exceso
    const limpiarStorageSiExcede = () => {
        let tamaño = 0;
        const itemsABorrar = ['foto_perfil', 'userAvatar', 'wallpaper_url'];
        
        // Calcular tamaño actual
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && localStorage[key]) {
                tamaño += localStorage[key].length || 0;
            }
        }
        
        console.log(`📦 Tamaño localStorage: ${(tamaño / 1024 / 1024).toFixed(2)} MB`);
        
        // Si excede 2MB, limpiar imágenes
        if (tamaño > 2000000) {
            console.log('⚠️ Exceso detectado, limpiando imágenes...');
            itemsABorrar.forEach(item => {
                if (localStorage.getItem(item)) {
                    localStorage.removeItem(item);
                    console.log(`🗑️ Eliminado: ${item}`);
                }
            });
            console.log('✅ Storage limpiado automáticamente');
        }
    };

    const handleLogin = async () => {
        setCargando(true);
        setError(null);

        // 🆕 Limpiar storage antes de guardar nuevos datos
        limpiarStorageSiExcede();

        try {
            const respuesta = await apiClient.post('/autenticacion/iniciar-sesion', {
                nombre_usuario: usuario,
                contrasena: clave
            });

            // Guardar solo lo esencial
            localStorage.setItem('token', respuesta.data.token);
            localStorage.setItem('usuario', JSON.stringify({
                id: respuesta.data.usuario.id_persona,
                nombre: respuesta.data.usuario.nombre,
                rol: respuesta.data.usuario.rol
            }));
            
            console.log("✅ Login exitoso:", respuesta.data.usuario.nombre);
            
            // Redirigir según rol
            setTimeout(() => {
                const rol = respuesta.data.usuario.rol;
                if (rol === 'Dueño') {
                    navigate('/boss', { replace: true });
                } else if (rol === 'Administrador') {
                    navigate('/admin', { replace: true });
                } else {
                    navigate('/boss', { replace: true });
                }
            }, 100);

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
            
            <Animacion>
                <img 
                src={vaca} 
                alt="Logo" 
                className='shadow-[0px_0px_150px_5px_rgba(255,255,255,0.5)] w-[7rem] h-[7rem] object-cover rounded-full mb-[1rem]' 
            />
            </Animacion>
            

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
                        className={`w-[12rem] !border-[var(--color-amarilloBorde)] border-1 hover:!border-[var(--color-verdeBorde)] flex items-center justify-center gap-2 cursor-pointer rounded-tl-[3rem] rounded-br-[3rem] transition-all border-r-8 border-l-8
                        ${cargando ? 'cursor-not-allowed' : 'hover:scale-105 transition-all'}`}
                    >
                        <div className='text-white flex gap-4 text-[0.8rem] items-center'> 
                            {cargando ? 'VALIDANDO...' : 'INGRESAR'} 
                            {!cargando && <LogIn className='text-white w-4' />} 
                        </div>
                    </button>
                </div>

                <div className="text-white p-3 -mt-4 cursor-pointer hover:text-[var(--color-amarilloBorde)] tracking-[1px] transition-all">
                    <p 
                        onClick={() => navigate("/contrasena")}
                        className="text-[0.8rem]"
                    >
                        ¿Olvidaste tu contraseña?
                    </p>
                </div>
            </form>
        </section>
    );
};