export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const message = typeof (error as any).message === "string" ? (error as any).message : "";
  const code = typeof (error as any).code === "string" ? (error as any).code : "";

  return /network|offline|failed to fetch|fetch failed|network request failed/i.test(message) || /network|offline/i.test(code);
}
