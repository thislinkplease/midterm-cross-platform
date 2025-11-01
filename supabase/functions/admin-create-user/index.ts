// @ts-nocheck

/// <reference types="@supabase/functions-js/edge-runtime.d.ts" />

import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get('MY_SUPABASE_URL')!;
  const serviceKey  = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY')!;
  const client = createClient(supabaseUrl, serviceKey);

  const authHeader = req.headers.get('Authorization') ?? '';
  const anonClient = createClient(
    supabaseUrl,
    Deno.env.get('MY_SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await anonClient.auth.getUser();
  if (user?.email?.toLowerCase() !== 'admin@gmail.com') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { email, password, username, image } = await req.json();

  const { data: created, error: authErr } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, image },
  });
  if (authErr) return new Response(JSON.stringify({ error: authErr.message }), { status: 400 });

  const { error: dbErr } = await client.from('users').upsert(
    { email, username, password, image },
    { onConflict: 'email' }
  );
  if (dbErr) return new Response(JSON.stringify({ error: dbErr.message }), { status: 400 });

  return new Response(JSON.stringify({ ok: true, uid: created.user?.id }), { status: 200 });
});
