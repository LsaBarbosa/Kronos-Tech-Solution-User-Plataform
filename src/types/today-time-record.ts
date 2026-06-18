export interface TodayTimeRecordItemResponse {
  id: number;
  actionType: string;
  recordedAt: string;
  status: string;
  source: string;
}

export interface TodayTimeRecordStatusResponse {
  date: string;
  status: string;
  nextAction: string;
  lastRecordAt: string | null;
  lastRecordType: string | null;
  records: TodayTimeRecordItemResponse[];
  source: string;
  timezone: string;
}
