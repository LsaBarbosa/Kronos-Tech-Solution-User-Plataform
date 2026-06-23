export interface DemoOperationCounters {
  companies: number;
  users: number;
  employees: number;
  pointRecords: number;
  documents: number;
  requests: number;
  files: number;
  sessions: number;
  cacheKeys: number;
}

export interface DemoValidationIssue {
  type: string;
  description: string;
}

export interface DemoValidationResult {
  clean: boolean;
  issues: DemoValidationIssue[];
}

export interface DemoCreateResponse {
  operationId: string;
  status: string;
  companyName: string;
  username: string;
  initialPasswordAvailable: boolean;
  created: DemoOperationCounters;
  validation: DemoValidationResult;
}

export interface DemoPurgeResponse {
  operationId: string;
  status: string;
  removed: DemoOperationCounters;
  validation: DemoValidationResult;
}

export interface DemoLastOperation {
  operation: string;
  status: string;
  finishedAt: string | null;
}

export interface DemoStatusResponse {
  enabled: boolean;
  killSwitch: boolean;
  exists: boolean;
  companyName: string;
  username: string;
  sandboxKey: string;
  lastOperation: DemoLastOperation | null;
  validation: DemoValidationResult | null;
}
