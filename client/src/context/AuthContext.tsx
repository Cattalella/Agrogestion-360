import { createContext, useState } from 'react';

export interface Usuario {
    nombre: string;
    apellido: string;
    rol: 'admin' | 'dueño';
}

interface AuthContextType {
    user: Usuario | null;
    setUser: (user: Usuario | null) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: any }) => {
    const [user, setUser] = useState<Usuario | null>(null);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};