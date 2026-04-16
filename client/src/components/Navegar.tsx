import { useState, useEffect, useRef } from "react";
import apiClient from "../api/apiClient";

export const Navegar = () => {
    // 1. Estados para los datos del usuario
    const [nombre, setNombre] = useState("");
    const [rol, setRol] = useState("");
    const [avatar, setAvatar] = useState<string | null>(() => {
        return localStorage.getItem('userAvatar') || null;
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 2. Cargar datos del backend
    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                // Obtener rol del localStorage (guardado en el login)
                const usuarioGuardado = localStorage.getItem('usuario');
                if (usuarioGuardado) {
                    const usuario = JSON.parse(usuarioGuardado);
                    setRol(usuario.rol || "");
                }
                
                const respuesta = await apiClient.get('/encabezado/perfil');
                
                if (respuesta.status === 200) {
                    const datos = respuesta.data;
                    console.log('📋 Datos del perfil:', datos);
                    
                    setNombre(datos.nombre || "Usuario");
                    
                    // Si el backend devuelve rol, lo usamos
                    if (datos.rol) {
                        setRol(datos.rol);
                    }
                    
                    // Si hay foto de perfil en el backend, usarla
                    if (datos.foto_perfil) {
                        setAvatar(datos.foto_perfil);
                        localStorage.setItem('userAvatar', datos.foto_perfil);
                        localStorage.setItem('foto_perfil', datos.foto_perfil); // 🆕 Sincronizar
                    }
                }
            } catch (error) {
                console.error('Error al cargar perfil:', error);
            }
        };
        
        cargarPerfil();
    }, []);

    // 3. Guardar avatar en localStorage cuando cambie
    useEffect(() => {
        if (avatar) {
            localStorage.setItem('userAvatar', avatar);
        }
    }, [avatar]);

    // 4. Formatear el rol para mostrar
    const formatearRol = (rolTexto: string): string => {
        if (!rolTexto) return "ADMINISTRADOR";
        
        const roles: Record<string, string> = {
            'Administrador': 'ADMINISTRADOR',
            'administrador': 'ADMINISTRADOR',
            'Dueño': 'PROPIETARIO',
            'dueño': 'PROPIETARIO',
            'Boss': 'PROPIETARIO',
            'boss': 'PROPIETARIO'
        };
        return roles[rolTexto] || rolTexto.toUpperCase();
    };

    // 5. Handlers para la foto
    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            // Mostrar preview inmediato
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setAvatar(base64String);
                
                // 🆕 Guardar en localStorage y disparar evento de sincronización
                localStorage.setItem('userAvatar', base64String);
                localStorage.setItem('foto_perfil', base64String);
                window.dispatchEvent(new Event('fotoPerfilActualizada'));
            };
            reader.readAsDataURL(file);
            
            // Subir al backend
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const formData = new FormData();
                    formData.append('foto', file);
                    
                    await apiClient.post('/encabezado/perfil/foto', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    
                    console.log('✅ Foto de perfil actualizada en el backend');
                }
            } catch (error) {
                console.error('Error al subir foto:', error);
            }
        }
    };

    // 6. Obtener inicial para el avatar
    const obtenerInicial = (): string => {
        if (nombre && nombre !== "Usuario" && nombre !== "Cargando...") {
            return nombre.charAt(0).toUpperCase();
        }
        return "U";
    };

    return (
        <nav className="z-50 flex items-center gap-3 bg-white rounded-full pr-5 p-1 shadow-sm border border-slate-100">
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />

            {/* Avatar Interactivo */}
            <div 
                onClick={handleAvatarClick}
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden cursor-pointer group relative border border-black/10 hover:border-emerald-500 transition-all shadow-inner"
            >
                {avatar ? (
                    <img src={avatar} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-emerald-700 font-black text-lg">
                        {obtenerInicial()}
                    </span>
                )}
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[7px] font-bold uppercase">Editar</span>
                </div>
            </div>

            {/* Información del Usuario */}
            <div className="flex flex-col text-right min-w-[80px]">
                <span className="text-[12px] font-black uppercase leading-tight text-slate-800">
                    {nombre || "Cargando..."}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    {formatearRol(rol) || "ADMINISTRADOR"}
                </span>
            </div>

            {/* Status Online */}
            <div className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>

        </nav>
    );
};