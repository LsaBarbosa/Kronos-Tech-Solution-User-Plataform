export type ManagerMonthlyAlertFilter =
  | "PENDING_EXIT"
  | "OVERTIME"
  | "NEGATIVE_BALANCE"
  | "LATE"
  | "SHORT_BREAK"
  | "ABSENCE";

export interface ManagerMonthlyAlertItem {
  employeeId: string;
  employeeName: string;
  date: string;
  value: string;
}

export interface ManagerMonthlyAlertResponse {
  month: string;
  filter: ManagerMonthlyAlertFilter;
  items: ManagerMonthlyAlertItem[];
}
