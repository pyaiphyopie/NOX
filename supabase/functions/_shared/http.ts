import { corsHeaders } from "./cors.ts";

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export async function readJson<T extends Record<string, unknown>>(
  request: Request,
): Promise<T> {
  try {
    return await request.json() as T;
  } catch (_) {
    throw new Error("Invalid JSON body.");
  }
}

export function requireString(
  body: Record<string, unknown>,
  key: string,
): string {
  const value = body[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required string field: ${key}.`);
  }
  return value.trim();
}

export function optionalString(
  body: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const value = body[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

export function optionalNumber(
  body: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const value = body[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
