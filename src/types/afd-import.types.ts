export interface AfdImportPreviewResponse {
  companyName: string;
  cnpj: string;
  razaoSocial: string;
  periodoInicio: string;
  periodoFim: string;
  totalMarks: number;
  alreadyImported: number;
  toImport: number;
  employeesFound: number;
  employeesNotFound: number;
  notFoundPisList: string[];
  openRecords: number;
  skippedLines: number;
}

export interface AfdImportConfirmResponse {
  timeRecordsCreated: number;
  timeRecordsDuplicated: number;
  afdEntriesSaved: number;
  afdEntriesDuplicated: number;
  employeesNotLinked: number;
  notLinkedPisList: string[];
}
