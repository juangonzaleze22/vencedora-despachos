/**
 * Utilidades para manejo de fechas con zona horaria de Venezuela (UTC-4)
 * Venezuela Time (VET) = UTC-4
 */

/**
 * Convierte una fecha y hora de Venezuela a ISO string (UTC)
 * @param {string} fecha - Fecha en formato YYYY-MM-DD (hora de Venezuela)
 * @param {string} hora - Hora en formato HH:MM (hora de Venezuela)
 * @returns {string} ISO string en UTC que representa la hora correcta de Venezuela
 */
export function toVenezuelaISOString(fecha, hora) {
    if (!fecha || !hora) return new Date().toISOString();

    // 1. Separamos los valores
    const [year, month, day] = fecha.split('-').map(Number);
    const [hours, minutes] = hora.split(':').map(Number);

    // 2. Creamos la fecha usando Date.UTC. 
    // Si queremos que el resultado final represente la hora de Venezuela (UTC-4),
    // debemos SUMAR 4 horas a la hora local para llegar al estándar UTC.
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    
    // Ajuste: Venezuela está 4 horas detrás de UTC, 
    // así que sumamos 4 para "volver" al tiempo universal.
    utcDate.setUTCHours(utcDate.getUTCHours() + 4);

    return utcDate.toISOString();
}
/**
 * Obtiene la fecha y hora actual en zona horaria de Venezuela
 * @returns {Object} Objeto con fecha (YYYY-MM-DD) y hora (HH:MM)
 */
export function getVenezuelaDateTime() {
    // 1. Obtenemos la fecha actual del sistema
    const now = new Date();
    
    // 2. Calculamos el tiempo en Venezuela:
    // Restamos 4 horas (4 * 60 * 60 * 1000 milisegundos)
    const VZLA_OFFSET = 4 * 60 * 60 * 1000;
    const venezuelaDate = new Date(now.getTime() - VZLA_OFFSET);
    
    // 3. Extraemos los componentes usando getUTC para evitar que el 
    // navegador local vuelva a aplicar su propia zona horaria
    const year = venezuelaDate.getUTCFullYear();
    const month = String(venezuelaDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(venezuelaDate.getUTCDate()).padStart(2, '0');
    const hours = String(venezuelaDate.getUTCHours()).padStart(2, '0');
    const minutes = String(venezuelaDate.getUTCMinutes()).padStart(2, '0');
    
    const fecha = `${year}-${month}-${day}`;
    const hora = `${hours}:${minutes}`;
    
    return { fecha, hora };
}

/**
 * Formatea una fecha ISO a hora local de Venezuela
 * @param {string} isoString - Fecha en formato ISO (UTC)
 * @returns {string} Hora en formato HH:MM en zona horaria de Venezuela
 */
export function formatVenezuelaTime(isoString) {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    
    // Convertir de UTC a hora de Venezuela (UTC-4)
    // Si la fecha UTC es 13:37, en Venezuela (UTC-4) son las 09:37
    // Entonces restamos 4 horas: 13:37 - 4 = 09:37
    const venezuelaOffsetHours = -4; // UTC-4 significa 4 horas menos que UTC
    
    // Obtener componentes UTC y ajustar restando el offset
    let hours = date.getUTCHours() + venezuelaOffsetHours;
    const minutes = date.getUTCMinutes();
    
    // Manejar cambio de día si las horas son negativas
    if (hours < 0) {
        hours += 24;
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Formatea una fecha ISO a fecha local de Venezuela
 * @param {string} isoString - Fecha en formato ISO (UTC)
 * @returns {string} Fecha en formato YYYY-MM-DD en zona horaria de Venezuela
 */
export function formatVenezuelaDate(isoString) {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    
    // Convertir de UTC a fecha de Venezuela (UTC-4)
    // Restamos 4 horas para obtener la hora de Venezuela
    const venezuelaOffsetHours = -4;
    
    // Obtener componentes UTC y ajustar
    let hours = date.getUTCHours() + venezuelaOffsetHours;
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth();
    let day = date.getUTCDate();
    
    // Manejar cambio de día si las horas son negativas
    if (hours < 0) {
        hours += 24;
        day -= 1;
        if (day < 1) {
            month -= 1;
            if (month < 0) {
                month = 11;
                year -= 1;
            }
            // Obtener último día del mes anterior
            const lastDay = new Date(year, month + 1, 0).getDate();
            day = lastDay;
        }
    }
    
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

