export const userFixture = {
  ownProfile: {
    userId: "user-1",
    username: "maria.silva",
    role: "MANAGER",
    active: true,
    employeeId: "emp-1",
  },
  searchResults: {
    users: [
      {
        userId: "user-1",
        username: "maria.silva",
        role: "MANAGER",
        active: true,
        employeeId: "emp-1",
        biometricConsentAccepted: true,
      },
      {
        userId: "user-2",
        username: "joao.souza",
        role: "PARTNER",
        active: true,
        employeeId: "emp-2",
        biometricConsentAccepted: false,
      },
    ],
  },
};
