export interface PendingExitItem {
  timeRecordId: number;
  workDate: string;
  startHour: string;
  companyName: string;
}

export interface PendingExitResponse {
  items: PendingExitItem[];
  source: string;
}
