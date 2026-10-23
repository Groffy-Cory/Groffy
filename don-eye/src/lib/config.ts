export const APP_NAME = "The DON Eye";
export const APP_TAGLINE = "From Bedside to Boardroom";
export const APP_INTERNAL_NAME = "Donnie";

export function getRofAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ROF_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3000";
}
