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
    const { volunteerId, subject, message } = await req.json()

    if (!volunteerId || !subject || !message) {
      throw new Error('Missing required fields: volunteerId, subject, or message')
    }

    // Initialize Supabase Client with Service Role Key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch volunteer details
    const { data: volunteer, error: fetchError } = await supabaseClient
      .from('volunteers')
      .select('first_name, last_name, email')
      .eq('id', volunteerId)
      .single()

    if (fetchError || !volunteer) {
      throw new Error('Volunteer not found or error fetching details')
    }

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
        subject: subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Message from Volunteer Coordinator</h2>
            <p>Hi ${volunteer.first_name},</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p>Best regards,<br>Freestyle Vancouver Volunteer Team</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280;">This message was sent via the Volunteer Portal.</p>
            <p style="font-size: 12px; color: #6b7280; margin-top: 10px;"><strong>Do not respond to this email.</strong> Contact us at: <a href="mailto:volunteer.coordinator@freestylevancouver.ski">volunteer.coordinator@freestylevancouver.ski</a></p>
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
