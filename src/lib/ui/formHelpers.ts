/** Shared helpers for comma-separated <-> string[] form fields (tags, skills…). */

export const csvToArray = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const arrayToCsv = (value: string[]): string => value.join(', ');
