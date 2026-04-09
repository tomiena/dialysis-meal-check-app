const PREMIUM_KEY = "isPremium";

export function getIsPremium(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PREMIUM_KEY) === "true";
}

export function setIsPremium(value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREMIUM_KEY, value ? "true" : "false");
}
