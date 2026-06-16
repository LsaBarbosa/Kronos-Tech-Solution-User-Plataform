import { api } from "@/config/api";
import {
  API_ROUTES,
  TIMESHEET_SIGNATURE_PATHS,
  buildRoute,
} from "@/config/api-routes";
import type {
  PreviousMonthSignatureStatus,
  SignPreviousMonthRequest,
  SignPreviousMonthResponse,
} from "@/types/timesheet-signature";

const root = (path: string) => buildRoute(API_ROUTES.RECORDS, path);

export const TimesheetSignatureService = {
  async getPreviousMonthStatus(): Promise<PreviousMonthSignatureStatus> {
    const response = await api.get<PreviousMonthSignatureStatus>(
      root(TIMESHEET_SIGNATURE_PATHS.PREVIOUS_MONTH_STATUS)
    );
    return response.data;
  },

  async fetchPreviousMonthPreviewPdf(): Promise<{ blob: Blob }> {
    const response = await api.get<Blob>(
      root(TIMESHEET_SIGNATURE_PATHS.PREVIOUS_MONTH_PREVIEW),
      { responseType: "blob" }
    );
    return { blob: response.data };
  },

  async sign(request: SignPreviousMonthRequest): Promise<SignPreviousMonthResponse> {
    const response = await api.post<SignPreviousMonthResponse>(
      root(TIMESHEET_SIGNATURE_PATHS.PREVIOUS_MONTH_SIGN),
      request
    );
    return response.data;
  },

  async downloadSignedDocument(signatureId: string): Promise<{ blob: Blob; fileName: string }> {
    const response = await api.get<Blob>(
      root(TIMESHEET_SIGNATURE_PATHS.DOCUMENT(signatureId)),
      { responseType: "blob" }
    );
    const cd = response.headers["content-disposition"] ?? "";
    const match = /filename="?([^";]+)"?/.exec(cd);
    const fileName = match?.[1] ?? `assinatura-ponto-${signatureId}.pdf`;
    return { blob: response.data, fileName };
  },
};
