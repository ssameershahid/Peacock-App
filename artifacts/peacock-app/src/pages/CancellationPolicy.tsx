import { LegalPage, LegalP, LegalUL, LegalLI, LegalNote, LegalHighlight, LegalEmail } from '@/components/shared/LegalPage';

const REFUND_TABLE = [
  { window: 'More than 14 days before departure', refund: '100%', fee: 'None' },
  { window: '8–14 days before departure', refund: '75%', fee: '25% of booking total' },
  { window: '3–7 days before departure', refund: '50%', fee: '50% of booking total' },
  { window: '24–72 hours before departure', refund: '25%', fee: '75% of booking total' },
  { window: 'Less than 24 hours / no-show', refund: '0%', fee: 'Full booking total' },
];

export default function CancellationPolicy() {
  return (
    <LegalPage
      title="Cancellation Policy"
      subtitle="Clear, fair rules for changes and cancellations — no fine print."
      effectiveDate="1 January 2025"
      lastUpdated="21 March 2026"
      contactNote={
        <>
          Need to cancel or modify a booking? Email <LegalEmail address="bookings@peacockdrivers.com" /> or
          WhatsApp us on +94 77 123 4567 — we're available daily 07:00–21:00 Sri Lanka time.
        </>
      }
      sections={[
        {
          id: 'overview',
          title: 'Overview',
          content: (
            <>
              <LegalP>
                We understand that travel plans change. Our cancellation policy is designed to be
                transparent and fair — earlier cancellations receive more generous refunds because
                we have more time to re-fill the booking.
              </LegalP>
              <LegalHighlight>
                All cancellations must be submitted in writing by email to{' '}
                <LegalEmail address="bookings@peacockdrivers.com" />. Verbal or WhatsApp
                cancellations are not accepted as formal notice.
              </LegalHighlight>
            </>
          ),
        },
        {
          id: 'refund-schedule',
          title: 'Refund Schedule',
          content: (
            <>
              <LegalP>
                Refunds are calculated based on the time remaining between your written
                cancellation notice and the scheduled departure time.
              </LegalP>

              {/* Refund table */}
              <div className="mt-4 mb-6 rounded-xl border border-warm-100 overflow-hidden text-sm font-body">
                <div className="grid grid-cols-3 bg-forest-600 text-white/80 text-[12px] font-semibold uppercase tracking-wider">
                  <div className="px-4 py-3">Cancellation window</div>
                  <div className="px-4 py-3 text-center">Refund</div>
                  <div className="px-4 py-3 text-right">Cancellation fee</div>
                </div>
                {REFUND_TABLE.map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-3 border-t border-warm-100 ${i % 2 === 0 ? 'bg-white' : 'bg-warm-50'}`}
                  >
                    <div className="px-4 py-3 text-warm-600">{row.window}</div>
                    <div className={`px-4 py-3 text-center font-semibold ${row.refund === '100%' ? 'text-forest-500' : row.refund === '0%' ? 'text-red-500' : 'text-amber-200'}`}>
                      {row.refund}
                    </div>
                    <div className="px-4 py-3 text-right text-warm-500">{row.fee}</div>
                  </div>
                ))}
              </div>

              <LegalNote>
                Deposit-only bookings: the cancellation fee is applied to the full booking value,
                not only the deposit paid.
              </LegalNote>
            </>
          ),
        },
        {
          id: 'how-to-cancel',
          title: 'How to Cancel',
          content: (
            <>
              <LegalP>To cancel a booking:</LegalP>
              <LegalUL>
                <LegalLI>Email <LegalEmail address="bookings@peacockdrivers.com" /> with your booking reference number.</LegalLI>
                <LegalLI>We will send a written acknowledgement within 4 business hours confirming the cancellation and the applicable refund amount.</LegalLI>
                <LegalLI>Refunds are returned to the original payment method within 5–10 business days, subject to your bank's processing times.</LegalLI>
              </LegalUL>
            </>
          ),
        },
        {
          id: 'modifications',
          title: 'Booking Modifications',
          content: (
            <>
              <LegalP>
                Changes to dates, pick-up points, or passenger count are treated as modifications,
                not cancellations, provided they are requested at least 48 hours before departure.
              </LegalP>
              <LegalUL>
                <LegalLI>Date changes are subject to availability and may result in a price difference.</LegalLI>
                <LegalLI>Upgrades (e.g., vehicle type) can be made at any time and are charged at the price difference.</LegalLI>
                <LegalLI>Modifications requested less than 48 hours before departure may be treated as a cancellation of the original booking and a new booking.</LegalLI>
              </LegalUL>
            </>
          ),
        },
        {
          id: 'force-majeure',
          title: 'Cancellations by Peacock Drivers',
          content: (
            <>
              <LegalP>
                In rare cases we may need to cancel your booking due to circumstances beyond our
                control — such as severe weather, government-declared emergencies, road closures,
                or vehicle breakdown with no available replacement.
              </LegalP>
              <LegalUL>
                <LegalLI>We will notify you as soon as possible and offer a full refund or rebooking at no extra charge.</LegalLI>
                <LegalLI>We are not liable for consequential losses (e.g., non-refundable hotel bookings) resulting from our cancellation in force-majeure circumstances.</LegalLI>
              </LegalUL>
              <LegalHighlight>
                We strongly recommend travel insurance that covers trip cancellation, including
                acts of nature, for all international visitors to Sri Lanka.
              </LegalHighlight>
            </>
          ),
        },
        {
          id: 'no-show',
          title: 'No-Shows',
          content: (
            <LegalP>
              If you do not arrive at the agreed pick-up point within 30 minutes of the scheduled
              departure time and have not notified us, the booking is treated as a no-show and no
              refund is issued. Our driver will wait up to 30 minutes before departing.
            </LegalP>
          ),
        },
      ]}
    />
  );
}
