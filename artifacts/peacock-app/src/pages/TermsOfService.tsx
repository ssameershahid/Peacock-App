import { LegalPage, LegalP, LegalUL, LegalLI, LegalNote, LegalHighlight, LegalEmail } from '@/components/shared/LegalPage';

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="Please read these terms carefully before booking with us."
      effectiveDate="1 January 2025"
      lastUpdated="21 March 2026"
      contactNote={
        <>
          Questions about these terms? Contact us at{' '}
          <LegalEmail address="hello@peacockdrivers.com" /> or call +94 77 123 4567.
        </>
      }
      sections={[
        {
          id: 'agreement',
          title: 'Agreement to Terms',
          content: (
            <>
              <LegalP>
                By accessing peacockdrivers.com or completing a booking, you agree to be bound by
                these Terms of Service and our Privacy Policy. If you do not agree, do not use our
                services.
              </LegalP>
              <LegalP>
                These terms constitute a legally binding agreement between you and Peacock Drivers
                (Pvt) Ltd, a company registered in Sri Lanka.
              </LegalP>
            </>
          ),
        },
        {
          id: 'services',
          title: 'Our Services',
          content: (
            <>
              <LegalP>
                Peacock Drivers provides chauffeured vehicle hire, guided tours, and island-transfer
                services within Sri Lanka. All services are subject to availability and driver
                assignment at our discretion.
              </LegalP>
              <LegalUL>
                <LegalLI>
                  <strong>Ready-to-Go Tours</strong> — fixed-itinerary day or multi-day tours
                  departing from agreed pick-up points.
                </LegalLI>
                <LegalLI>
                  <strong>Trip Wizard (Custom Tours)</strong> — personalised itineraries built
                  around your preferences and confirmed by our team.
                </LegalLI>
                <LegalLI>
                  <strong>Island Transfers</strong> — point-to-point chauffeured transfers between
                  airports, hotels, cities, or ports.
                </LegalLI>
              </LegalUL>
            </>
          ),
        },
        {
          id: 'bookings',
          title: 'Bookings & Confirmation',
          content: (
            <>
              <LegalP>
                A booking is only confirmed once you receive a written confirmation email from
                Peacock Drivers. Provisional bookings made verbally or via WhatsApp are not
                guaranteed until confirmed in writing.
              </LegalP>
              <LegalUL>
                <LegalLI>You must be at least 18 years old to make a booking.</LegalLI>
                <LegalLI>Booking details (dates, pick-up points, passenger count) must be accurate at the time of booking.</LegalLI>
                <LegalLI>Any changes to confirmed bookings must be requested at least 48 hours in advance and are subject to availability.</LegalLI>
              </LegalUL>
              <LegalNote>
                For group bookings of 10 or more passengers, please contact us directly rather
                than booking online — custom pricing and vehicle configurations apply.
              </LegalNote>
            </>
          ),
        },
        {
          id: 'payments',
          title: 'Payments',
          content: (
            <>
              <LegalP>
                All prices are quoted in USD unless otherwise stated. We accept major credit and
                debit cards via Stripe. Payment is taken in full at the time of booking unless a
                deposit arrangement has been agreed in writing.
              </LegalP>
              <LegalUL>
                <LegalLI>Prices include driver, fuel, vehicle, and tolls unless explicitly stated otherwise.</LegalLI>
                <LegalLI>Entrance fees to national parks, temples, or attractions are payable by the guest directly on-site.</LegalLI>
                <LegalLI>Gratuities for drivers are not included and are always at your discretion.</LegalLI>
              </LegalUL>
            </>
          ),
        },
        {
          id: 'conduct',
          title: 'Passenger Conduct',
          content: (
            <>
              <LegalP>
                Guests are expected to behave in a respectful manner towards drivers and other road
                users. We reserve the right to terminate a service without refund if a passenger:
              </LegalP>
              <LegalUL>
                <LegalLI>Engages in abusive, threatening, or discriminatory behaviour.</LegalLI>
                <LegalLI>Causes damage to the vehicle.</LegalLI>
                <LegalLI>Is under the influence of alcohol or illegal substances in a way that endangers safety.</LegalLI>
              </LegalUL>
            </>
          ),
        },
        {
          id: 'liability',
          title: 'Limitation of Liability',
          content: (
            <>
              <LegalHighlight>
                Peacock Drivers maintains comprehensive vehicle and passenger liability insurance
                in accordance with Sri Lankan law.
              </LegalHighlight>
              <LegalP>
                To the maximum extent permitted by law, Peacock Drivers shall not be liable for:
              </LegalP>
              <LegalUL>
                <LegalLI>Delays caused by road conditions, weather, road closures, or other circumstances beyond our control.</LegalLI>
                <LegalLI>Loss or damage to luggage or personal belongings carried in our vehicles.</LegalLI>
                <LegalLI>Third-party services (hotels, attractions) recommended or arranged on your behalf.</LegalLI>
                <LegalLI>Indirect or consequential losses, including missed flights or connecting services.</LegalLI>
              </LegalUL>
            </>
          ),
        },
        {
          id: 'governing-law',
          title: 'Governing Law',
          content: (
            <LegalP>
              These terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka.
              Any disputes shall be subject to the exclusive jurisdiction of the courts of Colombo,
              Sri Lanka. If you are a consumer in the European Union, you may also benefit from
              mandatory consumer-protection provisions in your country of residence.
            </LegalP>
          ),
        },
        {
          id: 'changes',
          title: 'Changes to These Terms',
          content: (
            <LegalP>
              We reserve the right to update these terms at any time. The version in effect at the
              time of your booking governs that booking. We will post any updated terms on this
              page with a revised "Last updated" date.
            </LegalP>
          ),
        },
      ]}
    />
  );
}
