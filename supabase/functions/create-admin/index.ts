import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // ===== CORS PREFLIGHT =====
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: "Email & role wajib diisi" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 🔑 SERVICE ROLE CLIENT
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // 📩 INVITE USER
    const { data: invite, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (inviteError) throw inviteError;

    // 🧾 INSERT ROLE
    const { error: profileError } = await supabaseAdmin
      .from("admin_profiles")
      .insert({
        id: invite.user.id,
        email,
        role,
      });

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
