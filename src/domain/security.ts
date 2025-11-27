/**
 * Módulo de seguridad básica.
 * 
 * IMPORTANTE: Esta es una capa de seguridad DEMOSTRATIVA, NO es seguridad real.
 * La clave está hardcodeada y visible en el código fuente.
 * En producción se requeriría autenticación real en el backend.
 */

// ===========================
// Configuración de acceso
// ===========================

/**
 * Clave de acceso hardcodeada (solo para demo).
 */
export const ACCESS_KEY = "CLIENTE-DEMO-2025";

/**
 * Clave para guardar el estado de acceso en sessionStorage.
 */
export const ACCESS_STORAGE_KEY = "dashboard_access_ok";

// ===========================
// Funciones de autenticación
// ===========================

/**
 * Verifica si la clave ingresada es correcta.
 * 
 * @param inputKey Clave ingresada por el usuario
 * @returns true si la clave es correcta
 */
export function validateAccessKey(inputKey: string): boolean {
  return inputKey.trim() === ACCESS_KEY;
}

/**
 * Guarda el estado de acceso autorizado en sessionStorage.
 */
export function grantAccess(): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.setItem(ACCESS_STORAGE_KEY, "1");
  }
}

/**
 * Verifica si el usuario tiene acceso autorizado.
 * 
 * @returns true si el usuario está autorizado
 */
export function hasAccess(): boolean {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return sessionStorage.getItem(ACCESS_STORAGE_KEY) === "1";
  }
  return false;
}

/**
 * Revoca el acceso del usuario (cierra sesión).
 */
export function revokeAccess(): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.removeItem(ACCESS_STORAGE_KEY);
  }
}
