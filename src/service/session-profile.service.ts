import { fetchAccountData, fetchUserData } from "@/service/user.service";
import type { SessionUserData, UserOwnProfileData, UserData } from "@/types/user";

export type SessionProfileData = SessionUserData;

export const composeSessionProfile = (
  accountData: UserOwnProfileData,
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
