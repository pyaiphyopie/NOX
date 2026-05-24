import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const bucket = Deno.env.get("AI_STUDIO_BUCKET") ?? "ai-studio-assets";

export async function uploadAsset(params: {
  path: string;
  contentType: string;
  body: ArrayBuffer | Uint8Array;
}): Promise<string> {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabase.storage
    .from(bucket)
    .upload(params.path, params.body, {
      contentType: params.contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(params.path);
  return data.publicUrl;
}

export function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
