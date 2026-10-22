/**
 * Formats API errors for admin dashboard operations with precise status codes and messages.
 * Prevents generic, misleading "Network error" messages.
 */
export function formatAdminErrorMessage(
  res?: Response | null,
  data?: { error?: string } | null,
  err?: unknown,
  fallbackAction = "save"
): string {
  if (res && !res.ok) {
    const errorDetail = data?.error ? `: ${data.error}` : "";
    if (res.status === 403) {
      return `Save failed (403 origin check)${errorDetail}`;
    }
    if (res.status === 401) {
      return `Save failed (401 unauthorized / session expired)${errorDetail}`;
    }
    if (res.status === 400) {
      return `Save failed (400 validation error)${errorDetail}`;
    }
    if (res.status === 404) {
      return `Save failed (404 not found)${errorDetail}`;
    }
    if (res.status === 429) {
      return `Save failed (429 rate limit exceeded)${errorDetail}`;
    }
    return `Save failed (${res.status})${errorDetail}`;
  }

  if (err) {
    const name = err instanceof Error ? err.name : "RequestError";
    const msg = err instanceof Error ? err.message : String(err);
    return `Failed to ${fallbackAction} (${name}): ${msg}`;
  }

  return `Failed to ${fallbackAction}: Unknown error occurred`;
}
