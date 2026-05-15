export const Privacy = () => (
  <>
    <h1>Privacy Policy</h1>
    <p className="text-sm text-slate-500">Last updated: 15 May 2026</p>

    <p>
      We collect the minimum data needed to run Sportify and treat it with care. This page
      describes what we collect, why, and what control you have.
    </p>

    <h2>1. What we collect</h2>
    <ul>
      <li><strong>Account data:</strong> name, email, password (hashed), optional phone, optional photo and bio.</li>
      <li><strong>Booking data:</strong> venues you've booked, slots, sport, amount and status.</li>
      <li><strong>Reviews:</strong> ratings and comments you publish.</li>
      <li><strong>Technical:</strong> IP address, user agent, server logs (kept 30 days for security and debugging).</li>
    </ul>
    <p>We don't collect bank account numbers — payment is handled by our payment processor.</p>

    <h2>2. Why we collect it</h2>
    <ul>
      <li>To create and run your account.</li>
      <li>To process bookings and refunds.</li>
      <li>To send booking confirmations, reminders, and important service updates.</li>
      <li>To prevent abuse, fraud and spam.</li>
      <li>To improve the product (aggregate analytics only — no individual tracking).</li>
    </ul>

    <h2>3. Who we share it with</h2>
    <ul>
      <li>The venue you booked, so they can host you (name, slot, contact only).</li>
      <li>Our payment processor (Razorpay) for processing payments.</li>
      <li>Email/SMS providers strictly for service messages — never for marketing without consent.</li>
      <li>Law enforcement when legally required.</li>
    </ul>
    <p>We never sell your data.</p>

    <h2>4. Your controls</h2>
    <ul>
      <li><strong>Export</strong> all your data as JSON from your profile.</li>
      <li><strong>Edit</strong> your profile fields anytime.</li>
      <li><strong>Delete</strong> your account from your profile (cancels upcoming bookings).</li>
      <li><strong>Unsubscribe</strong> from optional emails using the link in any email.</li>
    </ul>

    <h2>5. Retention</h2>
    <p>
      We keep account data as long as your account exists. After deletion, we keep anonymised
      booking records for 7 years for tax and audit (Indian law). Server logs are purged after
      30 days.
    </p>

    <h2>6. Cookies</h2>
    <p>
      We use a small number of cookies — the only essential one stores your login session. We
      don't use third-party advertising or tracking cookies.
    </p>

    <h2>7. Children</h2>
    <p>Sportify isn't for under-16s. If you believe a minor has signed up, tell us and we'll remove the account.</p>

    <h2>8. Changes</h2>
    <p>If we make a meaningful change, we'll tell you by email or banner at least 14 days before it takes effect.</p>

    <h2>Contact</h2>
    <p>Privacy questions or data requests: <a href="mailto:privacy@sportify.app">privacy@sportify.app</a></p>
  </>
);
