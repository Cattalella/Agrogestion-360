// ============================================================
// PASO 1: Solicitar recuperación (solo email)
// ============================================================
export class SolicitarRecuperacionDto {
  email: string;
}

// ============================================================
// PASO 2: Restablecer contraseña (email + token + nueva contraseña)
// ============================================================
export class RestablecerContrasenaDto {
  email: string;
  token: string;
  nueva_contrasena: string;
}

// ============================================================
// (MANTENIDO PARA COMPATIBILIDAD CON VERSIONES ANTERIORES)
// ============================================================
export class RecuperarContrasenaDto {
  email: string;
  nueva_contrasena: string;
}