import { authHandlers } from "./auth.handlers";
import { companyHandlers } from "./company.handlers";
import { demoHandlers } from "./demo.handlers";
import { documentHandlers } from "./document.handlers";
import { employeeHandlers } from "./employee.handlers";
import { geolocationHandlers } from "./geolocation.handlers";
import { legalHandlers } from "./legal.handlers";
import { messageHandlers } from "./message.handlers";
import { recordsHandlers } from "./records.handlers";
import { termsHandlers } from "./terms.handlers";
import { userHandlers } from "./user.handlers";

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...employeeHandlers,
  ...companyHandlers,
  ...demoHandlers,
  ...geolocationHandlers,
  ...documentHandlers,
  ...messageHandlers,
  ...recordsHandlers,
  ...legalHandlers,
  ...termsHandlers,
];
