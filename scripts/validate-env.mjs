const required = ["APP_ORIGIN", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
}

const origin = new URL(process.env.APP_ORIGIN);
if (origin.protocol !== "https:" && origin.hostname !== "localhost") {
  throw new Error("APP_ORIGIN must use HTTPS outside localhost.");
}

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
if (supabaseUrl.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL must use HTTPS.");
}

if (process.env.ENABLE_AI_ANALYSIS === "true") {
  const aiRequired = ["OPENAI_API_KEY", "OPENAI_BASE_URL"];
  const missingAi = aiRequired.filter((name) => !process.env[name]?.trim());
  if (missingAi.length > 0) {
    throw new Error(`AI analysis is enabled, but configuration is missing: ${missingAi.join(", ")}`);
  }
}
