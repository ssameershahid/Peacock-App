import { LegalPage, LegalP, LegalUL, LegalLI, LegalNote, LegalEmail } from '@/components/shared/LegalPage';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information."
      effectiveDate="1 January 2025"
      lastUpdated="21 March 2026"
      contactNote={
        <>
          Questions about this policy? Reach our Privacy team at{' '}
          <LegalEmail address="privacy@peacockdrivers.com" /> or write to us at Peacock Drivers,
          45 Galle Road, Colombo 03, Sri Lanka.
        </>
      }
      sections={[
        {
          id: 'introduction',
          title: 'Introduction',
          content: (
            <>
              <LegalP>
                Peacock Drivers (Pvt) Ltd ("Peacock Drivers", "we", "our", or "us") operates the
                website peacockdrivers.com and our booking platform. This Privacy Policy explains
                what personal data we collect, why we collect it, how we use it, and the choices
                you have.
              </LegalP>
              <LegalP>
                By using our services you agree to the practices described in this policy. If you
                do not agree, please do not use our platform.
              </LegalP>
            </>
          ),
        },
        {
          id: 'data-collected',
          title: 'Data We Collect',
          content: (
            <>
              <LegalP>We collect information in three ways:</LegalP>
              <LegalUL>
                <LegalLI>
                  <strong>Information you give us</strong> — name, email address, phone number,
                  passport or NIC number (for immigration-required tours), payment details, and
                  any preferences or requests you enter during booking.
                </LegalLI>
                <LegalLI>
                  <strong>Information collected automatically</strong> — IP address, browser type,
                  pages visited, time spent on pages, and referring URL, collected via cookies and
                  similar technologies.
                </LegalLI>
                <LegalLI>
                  <strong>Information from third parties</strong> — if you book through a partner
                  agency or sign in with Google, we may receive basic profile data from those
                  platforms subject to their own privacy policies.
                </LegalLI>
              </LegalUL>
              <LegalNote>
                We do not store raw card numbers. Payment data is processed by Stripe, Inc. and
                subject to their PCI-DSS-compliant environment.
              </LegalNote>
            </>
          ),
        },
        {
          id: 'how-we-use',
          title: 'How We Use Your Data',
          content: (
            <>
              <LegalP>We use your data to:</LegalP>
              <LegalUL>
                <LegalLI>Confirm and manage your bookings and send itinerary details.</LegalLI>
                <LegalLI>Process payments and issue invoices or receipts.</LegalLI>
                <LegalLI>Communicate booking updates, driver assignments, and pick-up reminders.</LegalLI>
                <LegalLI>Respond to enquiries submitted via our contact form or WhatsApp.</LegalLI>
                <LegalLI>Improve our website, services, and route planning using aggregated analytics.</LegalLI>
                <LegalLI>Send occasional promotional emails — only if you opted in (you can unsubscribe at any time).</LegalLI>
                <LegalLI>Comply with legal obligations (e.g. tax records, Sri Lanka Tourism Authority reporting).</LegalLI>
              </LegalUL>
            </>
          ),
        },
        {
          id: 'sharing',
          title: 'Sharing Your Data',
          content: (
            <>
              <LegalP>
                We do not sell your personal data. We share it only in the following limited
                circumstances:
              </LegalP>
              <LegalUL>
                <LegalLI>
                  <strong>Assigned drivers</strong> — your name and contact number are shared with
                  your driver ahead of the trip so they can coordinate pick-up.
                </LegalLI>
                <LegalLI>
                  <strong>Service providers</strong> — Stripe (payments), AWS (hosting), and
                  analytics providers operating under data processing agreements.
                </LegalLI>
                <LegalLI>
                  <strong>Legal requirements</strong> — if required by Sri Lankan law, court order,
                  or to protect the rights, property, or safety of our guests, drivers, or staff.
                </LegalLI>
              </LegalUL>
            </>
          ),
        },
        {
          id: 'cookies',
          title: 'Cookies',
          content: (
            <>
              <LegalP>
                We use essential cookies to keep you logged in and remember your currency
                preference, and analytics cookies (Google Analytics) to understand how visitors
                use our site. You can disable non-essential cookies in your browser settings at
                any time.
              </LegalP>
            </>
          ),
        },
        {
          id: 'retention',
          title: 'Data Retention',
          content: (
            <>
              <LegalP>
                We retain booking records for seven years to comply with Sri Lanka tax law. Account
                and profile data is kept until you request deletion. Analytics data is retained for
                26 months then automatically deleted.
              </LegalP>
            </>
          ),
        },
        {
          id: 'your-rights',
          title: 'Your Rights',
          content: (
            <>
              <LegalP>You have the right to:</LegalP>
              <LegalUL>
                <LegalLI>Access a copy of the personal data we hold about you.</LegalLI>
                <LegalLI>Correct inaccurate or incomplete data.</LegalLI>
                <LegalLI>Request deletion of your account and associated data (subject to legal retention obligations).</LegalLI>
                <LegalLI>Withdraw marketing consent at any time via the unsubscribe link in any email.</LegalLI>
                <LegalLI>Lodge a complaint with the relevant data-protection authority in your country of residence.</LegalLI>
              </LegalUL>
              <LegalP>
                To exercise any of these rights, email <LegalEmail address="privacy@peacockdrivers.com" />.
                We will respond within 30 days.
              </LegalP>
            </>
          ),
        },
        {
          id: 'changes',
          title: 'Changes to This Policy',
          content: (
            <LegalP>
              We may update this policy from time to time. Material changes will be notified by
              email to registered users and by a notice on our website. Continued use of our
              services after the effective date constitutes acceptance of the revised policy.
            </LegalP>
          ),
        },
      ]}
    />
  );
}
