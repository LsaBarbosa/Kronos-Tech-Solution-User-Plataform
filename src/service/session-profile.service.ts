import { fetchAccountData, fetchUserData } from "@/service/user.service";
import type { UserAccountData, UserData } from "@/types/user";

export interface SessionProfileData {
  accountData: UserAccountData;
  profileData: UserData;
  userData: UserData & { role: string };
  role: string;
}

export const composeSessionProfile = (
  accountData: UserAccountData,
  profileData: UserData
): SessionProfileData => {
  const role = accountData.role || profileData.role || "";

  return {
    accountData,
    profileData,
    userData: {
      ...profileData,
      role,
    },
    role,
  };
};

export const loadSessionProfile = async (): Promise<SessionProfileData> => {
  const accountData = await fetchAccountData();
  const profileData = await fetchUserData();

  return composeSessionProfile(accountData, profileData);
};
