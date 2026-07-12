export function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthDay(date = new Date()): { month: number; day: number } {
  return { month: date.getMonth() + 1, day: date.getDate() };
}

export function formatSpecialsDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function secondsUntilNextLocalMidnight(date = new Date()): number {
  const next = new Date(date);
  next.setHours(24, 0, 0, 0);
  return Math.max(60, Math.ceil((next.getTime() - date.getTime()) / 1000));
}
