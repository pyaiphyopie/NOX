import { corsHeaders } from "../_shared/cors.ts";
import {
  jsonResponse,
  optionalString,
  readJson,
  requireString,
} from "../_shared/http.ts";
import { createTextResponse } from "../_shared/openai.ts";

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await readJson<Record<string, unknown>>(request);
    const brief = requireString(body, "brief");
    const tone = optionalString(body, "tone", "High energy");
    const channel = optionalString(body, "channel", "Instagram caption");

    const copy = await createTextResponse({
      instructions:
        "You are the NOX nightlife copywriter. Write concise, premium event marketing copy with a neon nightlife tone. Return only the final copy.",
      input:
        `Channel: ${channel}\nTone: ${tone}\nEvent brief: ${brief}\nKeep it punchy and ready to publish.`,
    });

    return jsonResponse({ copy });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: message }, 400);
  }
});
