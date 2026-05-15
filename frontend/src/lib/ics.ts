// Tiny .ics generator — enough for "add to calendar" exports.
// No external lib needed; the spec is forgiving for personal use.

type IcsInput = {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
};

const fmt = (d: Date): string =>
  d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

const escapeText = (s: string): string =>
  s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

export const buildIcs = (input: IcsInput): string => {
  const now = fmt(new Date());
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sportify//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${input.uid}@sportify.app`,
    `DTSTAMP:${now}`,
    `DTSTART:${fmt(input.start)}`,
    `DTEND:${fmt(input.end)}`,
    `SUMMARY:${escapeText(input.title)}`,
    input.description ? `DESCRIPTION:${escapeText(input.description)}` : '',
    input.location ? `LOCATION:${escapeText(input.location)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
};

export const downloadIcs = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
