import "jsr:@supabase/functions-js/edge-runtime.d.ts"

interface FormData {
  email: string
  name?: string
  message?: string
  _next?: string
  booking_card?: string
  booking_type?: string
  booking_hours?: string
  topic?: string
  scope?: string
  timeline?: string
  budget?: string
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const raw = await req.text()
    const params = new URLSearchParams(raw)
    const data: FormData = Object.fromEntries(params) as unknown as FormData

    if (!data.email) {
      return new Response("Email is required", { status: 400 })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!
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
    return new Response(String(err), { status: 500 })
  }
})
