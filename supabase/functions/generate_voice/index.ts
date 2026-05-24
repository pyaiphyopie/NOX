import { corsHeaders } from "../_shared/cors.ts";
import {
  jsonResponse,
  optionalString,
  readJson,
  requireString,
} from "../_shared/http.ts";
import { createSpeech } from "../_shared/openai.ts";
import { uploadAsset } from "../_shared/storage.ts";

const voiceMap: Record<string, string> = {
  Guy: "onyx",
  Jenny: "nova",
  NeonHost: "verse",
  DeepClub: "ash",
};

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await readJson<Record<string, unknown>>(request);
    const script = requireString(body, "script");
    const voiceName = optionalString(body, "voice", "NeonHost");
    const voice = voiceMap[voiceName] ?? "verse";

    const audio = await createSpeech({
      input: script,
      voice,
      instructions:
        "Sound like a polished nightlife host. Energetic, premium, and clear. The listener must understand this is AI-generated audio.",
    });

    const path = `voice/${crypto.randomUUID()}.mp3`;
    const url = await uploadAsset({
      path,
      contentType: "audio/mpeg",
      body: audio,
    });

    return jsonResponse({ url, voice });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: message }, 400);
  }
});
