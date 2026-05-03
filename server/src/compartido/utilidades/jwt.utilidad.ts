// src/compartido/utilidades/jwt.utilidad.ts

export interface DatosToken {
  id_persona: number;
  email: string
  nombre_usuario: string;
  nombre_completo: string;
  id_rol: number;
  nombre_rol: string;
}

export const generarPayloadToken = (persona: any): DatosToken => {
  return {
    id_persona: persona.id_persona,
    email: persona.email,
    nombre_usuario: persona.nombre_usuario,
    nombre_completo: persona.nombre_completo,
    id_rol: persona.id_rol,
    nombre_rol: persona.rol.nombre_rol,
  };
};