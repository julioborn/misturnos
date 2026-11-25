// Edge Function: toma notifications con pushed_at is null, busca los
// device_tokens de cada usuario y manda el push por FCM (HTTP v1 API).
// La credencial de la cuenta de servicio de Firebase vive en la tabla
// app_secrets (solo legible por el service_role), nunca en el código ni
// en variables de entorno del repo.
//
// Se invoca desde pg_cron vía pg_net cada pocos minutos.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: FCM_SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`No se pudo obtener access token: ${await res.text()}`);
  const data = await res.json();
  return data.access_token as string;
}

async function sendToToken(
  projectId: string,
  accessToken: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
) {
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        data,
      },
    }),
  });

  if (res.ok) return { ok: true as const };

  const errorBody = await res.json().catch(() => null);
  const status = errorBody?.error?.status;
  const invalid = status === "UNREGISTERED" || status === "NOT_FOUND" || status === "INVALID_ARGUMENT";
  return { ok: false as const, invalid, status };
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: secretRow, error: secretError } = await supabase
    .from("app_secrets")
    .select("value")
    .eq("id", "firebase_service_account")
    .single();

  if (secretError || !secretRow) {
    return new Response(JSON.stringify({ error: "Falta configurar firebase_service_account" }), { status: 500 });
  }

  const sa = secretRow.value as ServiceAccount;
  const accessToken = await getAccessToken(sa);

  const { data: notifications, error: notifError } = await supabase
    .from("notifications")
    .select("id,user_id,title,body,data")
    .is("pushed_at", null)
    .limit(100);

  if (notifError) {
    return new Response(JSON.stringify({ error: notifError.message }), { status: 500 });
  }

  let sent = 0;
  let noDevice = 0;
  let failed = 0;

  for (const n of notifications ?? []) {
    const { data: tokens } = await supabase
      .from("device_tokens")
      .select("id,token")
      .eq("user_id", n.user_id);

    if (!tokens || tokens.length === 0) {
      noDevice++;
    } else {
      for (const t of tokens) {
        const result = await sendToToken(
          sa.project_id,
          accessToken,
          t.token,
          n.title,
          n.body,
          { booking_id: String((n.data as Record<string, unknown> | null)?.booking_id ?? "") },
        );
        if (result.ok) {
          sent++;
        } else {
          failed++;
          if (result.invalid) {
            await supabase.from("device_tokens").delete().eq("id", t.id);
          }
        }
      }
    }

    await supabase.from("notifications").update({ pushed_at: new Date().toISOString() }).eq("id", n.id);
  }

  return new Response(
    JSON.stringify({ processed: notifications?.length ?? 0, sent, noDevice, failed }),
    { headers: { "Content-Type": "application/json" } },
  );
});
