import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const raw = await req.text()
    const params = new URLSearchParams(raw)
    const data: Record<string, string> = {}
    for (const [k, v] of params) data[k] = v

    if (!data.email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing env vars", url: !!supabaseUrl, key: !!supabaseKey }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.49.1")
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase.from("contact_submissions").insert({
      name: data.name || null,
      email: data.email,
      message: data.message || null,
      page: data.booking_card || null,
      booking_card: data.booking_card || null,
      booking_type: data.booking_type || null,
      booking_hours: data.booking_hours || null,
      topic: data.topic || null,
      scope: data.scope || null,
      timeline: data.timeline || null,
      budget: data.budget || null,
    })

    if (error) throw error

    const redirectUrl = data._next || "https://www.kevinglock.de"
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), type: typeof err, keys: err && typeof err === "object" ? Object.keys(err as object) : [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
