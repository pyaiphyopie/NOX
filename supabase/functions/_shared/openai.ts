const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

export async function createTextResponse(params: {
  instructions: string;
  input: string;
  model?: string;
}): Promise<string> {
  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model ?? Deno.env.get("OPENAI_TEXT_MODEL") ?? "gpt-5",
      instructions: params.instructions,
      input: params.input,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? "OpenAI text generation failed.");
  }

  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  const chunks = data?.output?.flatMap((item: Record<string, unknown>) => {
    const content = item.content;
    return Array.isArray(content) ? content : [];
  }) ?? [];

  const text = chunks
    .map((item: Record<string, unknown>) => item.text)
    .filter((value: unknown) => typeof value === "string")
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("OpenAI response did not include text.");
  }

  return text;
}

export async function createImageBase64(params: {
  prompt: string;
  model?: string;
}): Promise<string> {
  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model ?? Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-5",
      input: params.prompt,
      tools: [{ type: "image_generation" }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? "OpenAI image generation failed.");
  }

  for (const output of data.output ?? []) {
    if (output.type === "image_generation_call" && output.result) {
      return output.result;
    }
  }

  throw new Error("OpenAI response did not include an image.");
}

export async function createSpeech(params: {
  input: string;
  voice: string;
  instructions?: string;
}): Promise<ArrayBuffer> {
  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_TTS_MODEL") ?? "gpt-4o-mini-tts",
      input: params.input,
      voice: params.voice,
      instructions: params.instructions,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "OpenAI speech generation failed.");
  }

  return await response.arrayBuffer();
}
