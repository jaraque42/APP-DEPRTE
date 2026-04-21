/**
 * Utilidades para exportar entrenamientos a calendarios externos
 */

const DAY_MAP: { [key: string]: string } = {
    'Lunes': 'MO',
    'Martes': 'TU',
    'Miércoles': 'WE',
    'Jueves': 'TH',
    'Viernes': 'FR',
    'Sábado': 'SA',
    'Domingo': 'SU'
};

/**
 * Genera un enlace de Google Calendar para una rutina recurrente
 */
export const generateGoogleCalendarLink = (routineName: string, days: string[], weeks = 4) => {
    const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
    const text = encodeURIComponent(`🏋️ Entreno: ${routineName}`);
    const details = encodeURIComponent(`Sesión de entrenamiento programada desde EOLCAIMFIT.\nRutina: ${routineName}`);
    
    // Convertir días a formato RRULE (MO,TU,WE...)
    const rruleDays = days.map(d => DAY_MAP[d]).filter(Boolean).join(",");
    const recur = encodeURIComponent(`RRULE:FREQ=WEEKLY;BYDAY=${rruleDays};COUNT=${days.length * weeks}`);
    
    // Fechas: Hoy a la misma hora + 1 hora
    const now = new Date();
    const start = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
    now.setHours(now.getHours() + 1);
    const end = now.toISOString().replace(/-|:|\.\d\d\d/g, "");

    return `${baseUrl}&text=${text}&details=${details}&dates=${start}/${end}&recur=${recur}`;
};

/**
 * Genera el contenido de un archivo .ics para calendarios universales (Apple, Outlook)
 */
export const generateICSContent = (routineName: string, days: string[], weeks = 4) => {
    const rruleDays = days.map(d => DAY_MAP[d]).filter(Boolean).join(",");
    const now = new Date();
    const start = now.toISOString().replace(/-|:|\.\d\d\d/g, "").split("Z")[0] + "Z";
    now.setHours(now.getHours() + 1);
    const end = now.toISOString().replace(/-|:|\.\d\d\d/g, "").split("Z")[0] + "Z";

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EOLCAIMFIT//Workout Planner//ES
BEGIN:VEVENT
UID:${Date.now()}@eolcaimfit.com
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:🏋️ Entreno: ${routineName}
DESCRIPTION:Sesión de entrenamiento programada desde EOLCAIMFIT.
RRULE:FREQ=WEEKLY;BYDAY=${rruleDays};COUNT=${days.length * weeks}
END:VEVENT
END:VCALENDAR`;
};

/**
 * Dispara la descarga de un archivo .ics
 */
export const downloadICS = (routineName: string, days: string[], weeks = 4) => {
    const content = generateICSContent(routineName, days, weeks);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `entreno-${routineName.toLowerCase().replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
