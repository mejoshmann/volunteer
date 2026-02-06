import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { signupId } = await req.json()

    // Initialize Supabase Client with Service Role Key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch signup details including volunteer and opportunity info
    const { data: signup, error: fetchError } = await supabaseClient
      .from('signups')
      .select(`
        id,
        volunteer:volunteers (first_name, last_name, email),
        opportunity:opportunities (title, date, time, location)
      `)
      .eq('id', signupId)
      .single()

    if (fetchError || !signup) {
      throw new Error('Signup not found or error fetching details')
    }

    const { volunteer, opportunity } = signup

    // Send Email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Volunteer App <reminders@freestylevancouver.app>',
        to: [volunteer.email],
        subject: `Reminder: ${opportunity.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Volunteer Reminder</h2>
            <p>Hi ${volunteer.first_name},</p>
            <p>This is a reminder for your upcoming volunteer task:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Task:</strong> ${opportunity.title}</p>
              <p><strong>Date:</strong> ${new Date(opportunity.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> ${opportunity.time}</p>
              <p><strong>Location:</strong> ${opportunity.location}</p>
            </div>
            <p>We look forward to seeing you there!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280;">This is an automated reminder from the Volunteer Portal.</p>
          </div>
        `,
      }),
    })

    const resData = await res.json()

    if (!res.ok) {
      throw new Error(resData.message || 'Failed to send email via Resend')
    }

    return new Response(JSON.stringify({ success: true, data: resData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
