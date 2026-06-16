/**
 * Presets de seleção de datas para o relatório detalhado.
 *
 * Considera feriados nacionais brasileiros fixos + móveis (baseados na Páscoa).
 */

const computeEasterSunday = (year: number): Date => {
  // Algoritmo de Meeus / Jones / Butcher (Gregoriano).
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

const sameDate = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export interface BrazilianHoliday {
  date: Date;
  name: string;
}

/**
 * Lista feriados nacionais brasileiros (fixos + móveis baseados na Páscoa).
 */
const getBrazilianHolidays = (year: number): BrazilianHoliday[] => {
  const easter = computeEasterSunday(year);
  return [
    { date: new Date(year, 0, 1), name: "Confraternização Universal" },
    { date: addDays(easter, -48), name: "Carnaval (segunda)" },
    { date: addDays(easter, -47), name: "Carnaval (terça)" },
    { date: addDays(easter, -2), name: "Sexta-feira Santa" },
    { date: new Date(year, 3, 21), name: "Tiradentes" },
    { date: new Date(year, 4, 1), name: "Dia do Trabalhador" },
    { date: addDays(easter, 60), name: "Corpus Christi" },
    { date: new Date(year, 8, 7), name: "Independência" },
    { date: new Date(year, 9, 12), name: "Nossa Senhora Aparecida" },
    { date: new Date(year, 10, 2), name: "Finados" },
    { date: new Date(year, 10, 15), name: "Proclamação da República" },
    { date: new Date(year, 10, 20), name: "Consciência Negra" },
    { date: new Date(year, 11, 25), name: "Natal" },
  ];
};

const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const last = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= last; day += 1) {
    days.push(new Date(year, month, day));
  }
  return days;
};

/**
 * Determina o mês de referência a partir do estado atual:
 * - se já existirem datas selecionadas, usa o mês da data mais recente;
 * - caso contrário, usa o mês atual.
 */
export const resolveReferenceMonth = (
  currentDates: Date[],
  now: Date = new Date()
): { year: number; month: number } => {
  if (currentDates.length === 0) {
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  const latest = currentDates.reduce(
    (max, date) => (date.getTime() > max.getTime() ? date : max),
    currentDates[0]
  );
  return { year: latest.getFullYear(), month: latest.getMonth() };
};

export const getFullMonthDates = (year: number, month: number): Date[] =>
  getDaysInMonth(year, month);

export const getWeekendDatesOfMonth = (year: number, month: number): Date[] =>
  getDaysInMonth(year, month).filter(isWeekend);

export const getWeekdayDatesOfMonth = (year: number, month: number): Date[] =>
  getDaysInMonth(year, month).filter((date) => !isWeekend(date));

export const getHolidayDatesOfMonth = (year: number, month: number): Date[] =>
  getBrazilianHolidays(year)
    .filter((holiday) => holiday.date.getMonth() === month && holiday.date.getFullYear() === year)
    .map((holiday) => holiday.date);

export const countHolidaysInMonth = (year: number, month: number): number =>
  getHolidayDatesOfMonth(year, month).length;

export const isHolidayDate = (date: Date): boolean => {
  const holidays = getBrazilianHolidays(date.getFullYear());
  return holidays.some((holiday) => sameDate(holiday.date, date));
};
