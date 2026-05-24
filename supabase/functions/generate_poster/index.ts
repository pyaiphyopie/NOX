import { corsHeaders } from "../_shared/cors.ts";
import {
  jsonResponse,
  optionalString,
  readJson,
  requireString,
} from "../_shared/http.ts";
import { createImageBase64 } from "../_shared/openai.ts";
import { decodeBase64, uploadAsset } from "../_shared/storage.ts";

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await readJson<Record<string, unknown>>(request);
    const prompt = requireString(body, "prompt");
    const style = optionalString(body, "style", "Neon club");
    const size = optionalString(body, "size", "1080x1350");

    const imageBase64 = await createImageBase64({
      prompt:
        `Create a ${size} NOX nightlife event poster. Style: ${style}. ` +
        `Use bold contrast, premium club energy, and readable space for lineup text. Brief: ${prompt}`,
    });

    const path = `posters/${crypto.randomUUID()}.png`;
    const url = await uploadAsset({
      path,
      contentType: "image/png",
      body: decodeBase64(imageBase64),
    });

    return jsonResponse({ url, style, size });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: message }, 400);
  }
});
