import { api } from "@/config/api";
import { API_ROUTES, SCHEDULE_EXCEPTION_PATHS, buildRoute } from "@/config/api-routes";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";

export type ScheduleExceptionResponse = {
  id: string;
  exceptionDate: string;
  workStartTime: string | null;
  workEndTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
  isDayOff: boolean;
  description: string | null;
};

export type CreateScheduleExceptionRequest = {
  exceptionDate: string;
  workStartTime?: string | null;
  workEndTime?: string | null;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  isDayOff: boolean;
  description?: string | null;
};

export const listScheduleExceptions = async (
  employeeId: string,
  year: number,
  month: number
): Promise<ScheduleExceptionResponse[]> => {
  try {
    const response = await api.get<ScheduleExceptionResponse[]>(
      buildRoute(API_ROUTES.EMPLOYEE, SCHEDULE_EXCEPTION_PATHS.LIST(employeeId)),
      { params: { year, month } }
    );
    return response.data;
  } catch (error) {
    throw normalizeServiceError(error);
  }
};

export const createScheduleException = async (
  employeeId: string,
  req: CreateScheduleExceptionRequest
): Promise<ScheduleExceptionResponse> => {
  try {
    const response = await api.post<ScheduleExceptionResponse>(
      buildRoute(API_ROUTES.EMPLOYEE, SCHEDULE_EXCEPTION_PATHS.CREATE(employeeId)),
      req
    );
    return response.data;
  } catch (error) {
    throw normalizeServiceError(error);
  }
};

export const deleteScheduleException = async (
  employeeId: string,
  date: string
): Promise<void> => {
  try {
    await api.delete(
      buildRoute(API_ROUTES.EMPLOYEE, SCHEDULE_EXCEPTION_PATHS.DELETE(employeeId, date))
    );
  } catch (error) {
    throw normalizeServiceError(error);
  }
};
