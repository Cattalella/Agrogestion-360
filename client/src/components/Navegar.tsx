import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

export const Navegar = () => {
    const context = useContext(AuthContext);
    const user = context?.user;
    
    // 1. Gestión de Avatar
    const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('userAvatar'));
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (avatar) localStorage.setItem('userAvatar', avatar);
    }, [avatar]);

    // 2. Mapeo de Roles (Para mostrar nombres elegantes según la DB)
    const displayRole = () => {
        if (!user?.rol) return "ADMINISTRADOR"; // Valor por defecto
        const roles: Record<string, string> = {
            admin: "ADMINISTRADOR",
            owner: "PROPIETARIO"
        };
        return roles[user.rol.toLowerCase()] || user.rol.toUpperCase();
    };

    // 3. Handlers
    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
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
                    <img src={avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-emerald-700 font-black text-lg">
                        {user?.nombre?.charAt(0) || "U"}
                    </span>
                )}
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[7px] font-bold uppercase">Editar</span>
                </div>
            </div>

            {/* Información del Usuario */}
            <div className="flex flex-col text-right min-w-[80px]">
                <span className="text-[12px] font-black uppercase leading-tight text-slate-800">
                    {user?.nombre || "Usuario"} {user?.apellido || ""}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    {displayRole()}
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