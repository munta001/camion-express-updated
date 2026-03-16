import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TransportRequest {
  name: string;
  company: string;
  email: string;
  phone: string;
  material: string;
  quantity: string;
  pickup_location: string;
  delivery_location: string;
  preferred_date: string;
  notes: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: TransportRequest = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      // Still return success - the request was saved to DB, email just won't send
      return new Response(
        JSON.stringify({ success: true, emailSent: false, reason: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailHtml = `
      <h2>New Transport Request from Camion Express</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${request.name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Company</td><td style="padding:8px;border:1px solid #ddd;">${request.company || "N/A"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${request.email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border:1px solid #ddd;">${request.phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Material</td><td style="padding:8px;border:1px solid #ddd;">${request.material}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Quantity</td><td style="padding:8px;border:1px solid #ddd;">${request.quantity}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Pickup</td><td style="padding:8px;border:1px solid #ddd;">${request.pickup_location}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Delivery</td><td style="padding:8px;border:1px solid #ddd;">${request.delivery_location}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Preferred Date</td><td style="padding:8px;border:1px solid #ddd;">${request.preferred_date || "Not specified"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Notes</td><td style="padding:8px;border:1px solid #ddd;">${request.notes || "None"}</td></tr>
      </table>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Camion Express <onboarding@resend.dev>",
        to: ["muntasirb71@gmail.com"],
        subject: `New Transport Request - ${request.material} from ${request.name}`,
        html: emailHtml,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({ success: true, emailSent: false, reason: "Email send failed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
