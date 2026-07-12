import { DEFAULT_COMPANION_NAME } from "@/lib/constants";

export type UserProfile = {
  id: string;
  displayName: string;
  companionName: string;
  email: string | null;
};

export const PROFILE_STORAGE_KEY = "rof-user-profile-v1";
export const GUEST_SESSION_KEY = "rof-guest-session-v1";

export const DEFAULT_PROFILE: UserProfile = {
  id: "local-guest",
  displayName: "Friend",
  companionName: DEFAULT_COMPANION_NAME,
  email: null,
};

export function sanitizeCompanionName(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return DEFAULT_COMPANION_NAME;
  return cleaned.slice(0, 40);
}

export function sanitizeDisplayName(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Friend";
  return cleaned.slice(0, 40);
}
