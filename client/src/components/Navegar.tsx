import { useState, useEffect, useRef } from "react";
import apiClient from "../api/apiClient";

const comprimirImagen = (file: File, maxW: number, maxH: number, calidad: number): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;

            if (w > maxW || h > maxH) {
                if (w / h > maxW / maxH) {
                    h = Math.round((h * maxW) / w);
                    w = maxW;
                } else {
                    w = Math.round((w * maxH) / h);
                    h = maxH;
                }
            }

            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', calidad));
        };
        img.src = url;
    });
};

export const Navegar = () => {
    const [nombre, setNombre] = useState(() => {
        const u = localStorage.getItem('usuario');
        return u ? JSON.parse(u).nombre || "" : "";
    });

    const [rol, setRol] = useState(() => {
        const u = localStorage.getItem('usuario');
        return u ? JSON.parse(u).rol || "" : "";
    });

    const [avatar, setAvatar] = useState<string | null>(() => {
        return localStorage.getItem('userAvatar') || localStorage.getItem('foto_perfil') || null;
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const usuarioGuardado = localStorage.getItem('usuario');
                if (usuarioGuardado) {
                    const usuario = JSON.parse(usuarioGuardado);
                    setRol(usuario.rol || "");
                }

                const respuesta = await apiClient.get('/encabezado/perfil');

                if (respuesta.status === 200) {
                    const datos = respuesta.data;

                    setNombre(datos.nombre || "Usuario");

                    if (datos.rol) {
                        setRol(datos.rol);
                    }

                    if (datos.foto_perfil) {
                        setAvatar(datos.foto_perfil);
                        localStorage.setItem('userAvatar', datos.foto_perfil);
                        localStorage.setItem('foto_perfil', datos.foto_perfil);
                    } else {
                        const avatarLocal = localStorage.getItem('userAvatar') || localStorage.getItem('foto_perfil') || null;
                        if (avatarLocal) setAvatar(avatarLocal);
                    }
                }
            } catch (error) {
                console.error('Error al cargar perfil:', error);
            }
        };

        cargarPerfil();
    }, []);

    // Escuchar cuando se actualiza la foto desde ModalPerfil
    useEffect(() => {
        const handleFotoActualizada = () => {
            const nuevaFoto = localStorage.getItem('foto_perfil');
            if (nuevaFoto) {
                setAvatar(nuevaFoto);
                localStorage.setItem('userAvatar', nuevaFoto);
            }
        };

        window.addEventListener('fotoPerfilActualizada', handleFotoActualizada);
        return () => window.removeEventListener('fotoPerfilActualizada', handleFotoActualizada);
    }, []);

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

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            try {
                const comprimida = await comprimirImagen(file, 200, 200, 0.7);
                setAvatar(comprimida);
                localStorage.setItem('userAvatar', comprimida);
                localStorage.setItem('foto_perfil', comprimida);
                window.dispatchEvent(new Event('fotoPerfilActualizada'));

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

    const obtenerInicial = (): string => {
        return nombre ? nombre.charAt(0).toUpperCase() : "U";
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

            {/* Avatar */}
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

            {/* Nombre y rol */}
            <div className="flex flex-col text-right min-w-[80px]">
                <span className="text-[12px] font-black uppercase leading-tight text-slate-800">
                    {nombre || "Usuario"}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    {formatearRol(rol)}
                </span>
            </div>

            {/* Status online */}
            <div className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>

        </nav>
    );
};