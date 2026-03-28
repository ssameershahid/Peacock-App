import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@peacockdrivers.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://peacockdrivers.com";

const BRAND_GREEN = "#2D6A4F";
const BRAND_AMBER = "#E9C46A";

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; background: #F8F5F0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: ${BRAND_GREEN}; padding: 32px 40px; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; letter-spacing: 0.05em; }
    .header p { color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 40px; color: #1a1a1a; line-height: 1.6; }
    .body h2 { color: ${BRAND_GREEN}; font-size: 20px; margin-top: 0; }
    .box { background: #F8F5F0; border-radius: 6px; padding: 20px 24px; margin: 20px 0; }
    .box strong { color: ${BRAND_GREEN}; }
    .button { display: inline-block; background: ${BRAND_GREEN}; color: #fff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; margin: 20px 0; }
    .footer { background: #F0EDE8; padding: 24px 40px; font-size: 12px; color: #888; text-align: center; }
    .divider { border: none; border-top: 1px solid #E8E3DC; margin: 24px 0; }
    table.items { width: 100%; border-collapse: collapse; }
    table.items td { padding: 8px 0; border-bottom: 1px solid #E8E3DC; font-size: 14px; }
    table.items td:last-child { text-align: right; }
    .total-row td { font-weight: bold; border-bottom: none; font-size: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PEACOCK DRIVERS</h1>
      <p>Sri Lanka's Premium Chauffeur Service</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>Peacock Drivers · Colombo, Sri Lanka · <a href="mailto:hello@peacockdrivers.com">hello@peacockdrivers.com</a></p>
      <p style="margin-top:8px">© ${new Date().getFullYear()} Peacock Drivers. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Welcome to Peacock Drivers 🦚",
    html: baseTemplate(`
      <h2>Welcome, ${firstName}!</h2>
      <p>Your account has been created. We're excited to help you discover Sri Lanka with a trusted chauffeur by your side.</p>
      <p>Browse our curated tours, arrange airport transfers, or design your own custom itinerary.</p>
      <a class="button" href="${FRONTEND_URL}/tours">Explore Tours</a>
      <hr class="divider">
      <p style="font-size:13px;color:#666">Questions? Reply to this email or visit our <a href="${FRONTEND_URL}">website</a>.</p>
    `),
  });
}

export async function sendBookingConfirmation(params: {
  to: string;
  firstName: string;
  referenceCode: string;
  tourOrService: string;
  startDate: string;
  vehicleType: string;
  passengers: number;
  totalGBP: number;
  pdfAttachment?: { content: Buffer; filename: string };
}) {
  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `Booking Confirmed — ${params.referenceCode}`,
    html: baseTemplate(`
      <h2>Your booking is confirmed!</h2>
      <p>Hi ${params.firstName}, we've received your payment and your trip is booked.</p>
      <div class="box">
        <p><strong>Reference:</strong> ${params.referenceCode}</p>
        <p><strong>Service:</strong> ${params.tourOrService}</p>
        <p><strong>Date:</strong> ${params.startDate}</p>
        <p><strong>Vehicle:</strong> ${params.vehicleType}</p>
        <p><strong>Passengers:</strong> ${params.passengers}</p>
        <p><strong>Total:</strong> £${params.totalGBP.toFixed(2)} GBP</p>
      </div>
      <p>Your invoice is attached to this email. We'll notify you once a driver has been assigned.</p>
      <a class="button" href="${FRONTEND_URL}/account/trips">View My Trips</a>
    `),
    attachments: params.pdfAttachment
      ? [
          {
            filename: params.pdfAttachment.filename,
            content: params.pdfAttachment.content,
          },
        ]
      : undefined,
  });
}

export async function sendCYORequestReceived(params: {
  to: string;
  firstName: string;
  referenceCode: string;
  locations: string[];
  durationDays?: number;
}) {
  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `Custom Tour Request Received — ${params.referenceCode}`,
    html: baseTemplate(`
      <h2>We've received your custom tour request</h2>
      <p>Hi ${params.firstName}, thanks for getting in touch! Our team will review your request and get back to you within 24 hours.</p>
      <div class="box">
        <p><strong>Reference:</strong> ${params.referenceCode}</p>
        <p><strong>Destinations:</strong> ${params.locations.join(", ")}</p>
        ${params.durationDays ? `<p><strong>Duration:</strong> ${params.durationDays} days</p>` : ""}
      </div>
      <p>We'll send you a personalised quote once we've reviewed your requirements.</p>
      <a class="button" href="${FRONTEND_URL}/account/trips">Track Your Request</a>
    `),
  });
}

export async function sendQuoteToCustomer(params: {
  to: string;
  firstName: string;
  referenceCode: string;
  quoteTotal: number;
  paymentLink: string;
  expiresAt?: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `Your Custom Tour Quote — ${params.referenceCode}`,
    html: baseTemplate(`
      <h2>Your personalised quote is ready</h2>
      <p>Hi ${params.firstName}, we've put together a quote for your custom Sri Lanka tour.</p>
      <div class="box">
        <p><strong>Reference:</strong> ${params.referenceCode}</p>
        <p><strong>Total:</strong> £${params.quoteTotal.toFixed(2)} GBP</p>
        ${params.expiresAt ? `<p><strong>Quote valid until:</strong> ${params.expiresAt}</p>` : ""}
      </div>
      <p>Click the button below to review and pay to confirm your trip.</p>
      <a class="button" href="${params.paymentLink}">Review & Pay</a>
      <hr class="divider">
      <p style="font-size:13px;color:#666">This link is unique to you. Do not share it with others.</p>
    `),
  });
}

export async function sendDriverAssigned(params: {
  to: string;
  firstName: string;
  referenceCode: string;
  driverName: string;
  driverPhone?: string;
  vehicleDetails: string;
  startDate: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `Driver Assigned — ${params.referenceCode}`,
    html: baseTemplate(`
      <h2>Your driver has been assigned!</h2>
      <p>Hi ${params.firstName}, great news — we've assigned a driver for your upcoming trip.</p>
      <div class="box">
        <p><strong>Driver:</strong> ${params.driverName}</p>
        ${params.driverPhone ? `<p><strong>Contact:</strong> ${params.driverPhone}</p>` : ""}
        <p><strong>Vehicle:</strong> ${params.vehicleDetails}</p>
        <p><strong>Trip date:</strong> ${params.startDate}</p>
        <p><strong>Reference:</strong> ${params.referenceCode}</p>
      </div>
      <a class="button" href="${FRONTEND_URL}/account/trips">View Trip Details</a>
    `),
  });
}

export async function sendTripAssignedToDriver(params: {
  to: string;
  driverName: string;
  referenceCode: string;
  tourOrService: string;
  startDate: string;
  pickupLocation?: string;
  passengers: number;
}) {
  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `New Trip Assigned — ${params.referenceCode}`,
    html: baseTemplate(`
      <h2>New trip assigned to you</h2>
      <p>Hi ${params.driverName}, a new trip has been assigned to you.</p>
      <div class="box">
        <p><strong>Reference:</strong> ${params.referenceCode}</p>
        <p><strong>Service:</strong> ${params.tourOrService}</p>
        <p><strong>Date:</strong> ${params.startDate}</p>
        ${params.pickupLocation ? `<p><strong>Pickup:</strong> ${params.pickupLocation}</p>` : ""}
        <p><strong>Passengers:</strong> ${params.passengers}</p>
      </div>
      <a class="button" href="${FRONTEND_URL}/driver/trips">View Trip</a>
    `),
  });
}

export async function sendPreTripReminder(params: {
  to: string;
  firstName: string;
  referenceCode: string;
  tourOrService: string;
  startDate: string;
  driverName?: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `Trip Reminder — 7 days to go! 🦚`,
    html: baseTemplate(`
      <h2>Your trip is coming up!</h2>
      <p>Hi ${params.firstName}, just a friendly reminder that your Sri Lanka adventure begins in 7 days.</p>
      <div class="box">
        <p><strong>Reference:</strong> ${params.referenceCode}</p>
        <p><strong>Service:</strong> ${params.tourOrService}</p>
        <p><strong>Date:</strong> ${params.startDate}</p>
        ${params.driverName ? `<p><strong>Driver:</strong> ${params.driverName}</p>` : ""}
      </div>
      <p>Make sure your passport is valid and you've packed for all weather. We look forward to seeing you!</p>
      <a class="button" href="${FRONTEND_URL}/account/trips">View Trip Details</a>
    `),
  });
}

export async function sendCancellationConfirmation(params: {
  to: string;
  firstName: string;
  referenceCode: string;
  refundAmount?: number;
}) {
  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: `Booking Cancelled — ${params.referenceCode}`,
    html: baseTemplate(`
      <h2>Your booking has been cancelled</h2>
      <p>Hi ${params.firstName}, we've processed the cancellation for booking <strong>${params.referenceCode}</strong>.</p>
      ${
        params.refundAmount
          ? `<div class="box"><p><strong>Refund amount:</strong> £${params.refundAmount.toFixed(2)} GBP</p><p>Please allow 5–10 business days for the refund to appear.</p></div>`
          : ""
      }
      <p>We hope to welcome you back to Sri Lanka soon.</p>
      <a class="button" href="${FRONTEND_URL}/tours">Explore Tours</a>
    `),
  });
}

export async function sendTripPlanEmail(params: {
  to: string;
  name: string | null;
  tripData: any;
  leadId: string;
}) {
  const { tripData, leadId } = params;
  const greeting = params.name ? `Hi ${params.name}` : "Hi there";
  const destinations: string[] = (tripData.destinations || []).map((id: string) => {
    const nameMap: Record<string, string> = {
      colombo: "Colombo", sigiriya: "Sigiriya", kandy: "Kandy", ella: "Ella",
      galle: "Galle", yala: "Yala", trincomalee: "Trincomalee", negombo: "Negombo",
      "nuwara-eliya": "Nuwara Eliya", tangalle: "Tangalle", anuradhapura: "Anuradhapura", haputale: "Haputale",
    };
    return nameMap[id] || id;
  });
  const destList = destinations.length > 0 ? destinations.join(" &rarr; ") : "Not yet selected";
  const resumeUrl = `${FRONTEND_URL}/tours/custom?resume=${leadId}`;

  const tripTypeLabel = (tripData.tripType || "").charAt(0).toUpperCase() + (tripData.tripType || "").slice(1);
  const budgetLabel = (tripData.budget || "").charAt(0).toUpperCase() + (tripData.budget || "").slice(1);

  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: "Your Sri Lanka trip plan from Peacock Drivers",
    html: baseTemplate(`
      <h2>Your Sri Lanka Trip Plan</h2>
      <p>${greeting}, here's a summary of the trip you've been designing!</p>

      <div class="box">
        ${tripTypeLabel ? `<p><strong>Trip type:</strong> ${tripTypeLabel}</p>` : ""}
        <p><strong>Destinations:</strong> ${destList}</p>
        ${tripData.otherPlaces ? `<p><strong>Also visiting:</strong> ${tripData.otherPlaces}</p>` : ""}
        <p><strong>Duration:</strong> ${tripData.days || 7} days</p>
        <p><strong>Travellers:</strong> ${tripData.pax || 2}</p>
        ${tripData.vehicle ? `<p><strong>Vehicle preference:</strong> ${tripData.vehicle}</p>` : ""}
        ${budgetLabel ? `<p><strong>Budget:</strong> ${budgetLabel}</p>` : ""}
        ${(tripData.travelStyle || []).length > 0 ? `<p><strong>Travel style:</strong> ${tripData.travelStyle.join(", ")}</p>` : ""}
        ${(tripData.interests || []).length > 0 ? `<p><strong>Interests:</strong> ${tripData.interests.join(", ")}</p>` : ""}
        ${tripData.specialRequests ? `<p><strong>Special requests:</strong> ${tripData.specialRequests}</p>` : ""}
      </div>

      <h2 style="margin-top:32px">Ready to make this trip happen?</h2>
      <p>Our team will create a personalised quote with exact pricing, suggested itinerary, and driver assignment.</p>
      <a class="button" href="${resumeUrl}">Get a free quote &rarr;</a>

      <p style="margin-top:24px;font-size:13px;color:#666">Or simply reply to this email and we'll help you plan.</p>

      <hr class="divider">
      <p style="font-size:12px;color:#999">Questions? WhatsApp us or email <a href="mailto:hello@peacockdrivers.com">hello@peacockdrivers.com</a></p>
    `),
  });
}

export async function sendPasswordReset(params: {
  to: string;
  firstName: string;
  resetToken: string;
}) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${params.resetToken}`;
  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: "Reset your Peacock Drivers password",
    html: baseTemplate(`
      <h2>Password reset request</h2>
      <p>Hi ${params.firstName}, we received a request to reset your password.</p>
      <p>Click the button below to set a new password. This link expires in 1 hour.</p>
      <a class="button" href="${resetUrl}">Reset Password</a>
      <hr class="divider">
      <p style="font-size:13px;color:#666">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
    `),
  });
}
