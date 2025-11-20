import { addDays, isAfter, isBefore, parseISO } from "date-fns";

export function getWindowBounds(reference = new Date()) {
  const start = reference;
  const end = addDays(reference, 7);
  return { start, end };
}

export function isWithinWindow(dateIso: string, start: Date, end: Date) {
  const date = parseISO(dateIso);
  return (
    (isAfter(date, start) || date.getTime() === start.getTime()) &&
    isBefore(date, end)
  );
}

