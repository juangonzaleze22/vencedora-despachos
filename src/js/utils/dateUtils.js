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
    if (!fecha || !hora) {
        // Si no hay datos, devolvemos la fecha actual formateada "limpia"
        const now = new Date();
        const iso = now.toLocaleString('sv-SE').replace(' ', 'T');
        return iso;
    }

    // 1. Aseguramos que los componentes tengan ceros iniciales si es necesario
    const [year, month, day] = fecha.split('-');
    const [hours, minutes] = hora.split(':');

    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');

    // 2. Construimos el string manualmente en formato ISO sin la 'Z'
    // Resultado: "2026-01-06T21:27:00"
    return `${year}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}:00`;
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
    const venezuelaDate = new Date(now.getTime());

    // 3. Extraemos los componentes usando getUTC para evitar que el 
    // navegador local vuelva a aplicar su propia zona horaria
    const year = venezuelaDate.getFullYear();
    const month = String(venezuelaDate.getMonth() + 1).padStart(2, '0');
    const day = String(venezuelaDate.getDate()).padStart(2, '0');
    const hours = String(venezuelaDate.getHours()).padStart(2, '0');
    const minutes = String(venezuelaDate.getMinutes()).padStart(2, '0');

    const fecha = `${year}-${month}-${day}`;
    const hora = `${hours}:${minutes}`;

    return { fecha, hora };
}

export function formatTime12h(dateInput) {
    // Convertimos a objeto Date si nos pasan un string
    const date = new Date(dateInput);
    // Validar si la fecha es correcta
    if (isNaN(date.getTime())) return "Fecha inválida";

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Lógica de conversión 12h
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
}


export function formatDate(dateInput) {

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Fecha inválida";

    const day = date.getDate();
    const month = (date.getMonth() + 1);
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;

}