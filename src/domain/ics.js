import { addDays, format } from 'date-fns';

function escapeText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/**
 * Builds an .ics file with one all-day event and a reminder the evening before.
 * @param {{title:string, date:Date|number, description?:string, uid?:string}} event
 */
export function buildIcs({ title, date, description = '', uid }) {
  const day = format(date, 'yyyyMMdd');
  const next = format(addDays(date, 1), 'yyyyMMdd');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lens Log//EN',
    'BEGIN:VEVENT',
    `UID:${uid ?? `${day}-${Math.random().toString(36).slice(2)}@lenslog`}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${next}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(title)}`,
    'TRIGGER:-PT6H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** Downloads an .ics file so the user can add it to their calendar. */
export function downloadIcs(event, filename = 'lenslog-reminder.ics') {
  const blob = new Blob([buildIcs(event)], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
