import { corsHeaders } from "../_shared/cors.ts";
import {
  jsonResponse,
  optionalNumber,
  optionalString,
  readJson,
} from "../_shared/http.ts";

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await readJson<Record<string, unknown>>(request);
    const genre = optionalString(body, "genre", "EDM");
    const bpm = Math.round(optionalNumber(body, "bpm", 120));
    const durationSeconds = Math.round(optionalNumber(body, "durationSeconds", 30));
    const endpoint = Deno.env.get("AI_MUSIC_API_URL");
    const apiKey = Deno.env.get("AI_MUSIC_API_KEY");

    if (!endpoint) {
      throw new Error("AI_MUSIC_API_URL is not configured.");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        genre,
        bpm,
        durationSeconds,
        brand: "NOX",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error ?? "Music generation failed.");
    }

    if (typeof data.url !== "string") {
      throw new Error("Music provider did not return a url.");
    }

    return jsonResponse({
      url: data.url,
      genre,
      bpm,
      durationSeconds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: message }, 400);
  }
});
