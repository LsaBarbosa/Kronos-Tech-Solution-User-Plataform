import { apiFetch, parseApiResponse } from '@/config/api';
import { DetailedReportItem } from '@/utils/report-utils';

export interface ReportFiltersPayload {
  reference: string;
  active: boolean;
  dates: string[];
  statuses?: string[];
}

export const fetchDetailedReport = async (
  payload: ReportFiltersPayload,
  employeeId?: string,
): Promise<DetailedReportItem[]> => {
  const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : '';
  const response = await apiFetch(`records/report${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  return parseApiResponse<DetailedReportItem[]>(response);
};

export const updateTimeRecord = async (timeRecordId: string, payload: Record<string, unknown>): Promise<void> => {
  const response = await apiFetch(`records/update/time-record/${timeRecordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  await parseApiResponse(response);
};

export const updateTimeRecordStatus = async (
  employeeId: string,
  timeRecordId: string,
  statusRecord: string,
): Promise<void> => {
  const response = await apiFetch(`records/update/status/${employeeId}/${timeRecordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ statusRecord }),
  });

  await parseApiResponse(response);
};

export const toggleRecordActivation = async (
  employeeId: string,
  timeRecordId: string,
): Promise<void> => {
  const response = await apiFetch(`records/toggle-activate/${employeeId}/${timeRecordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  await parseApiResponse(response);
};
