export const Refund = () => (
  <>
    <h1>Cancellation &amp; Refund Policy</h1>
    <p className="text-sm text-slate-500">Last updated: 15 May 2026</p>

    <p>Plans change — we get it. Here's exactly what happens when you cancel.</p>

    <h2>Player cancellations</h2>
    <p>You can cancel any upcoming booking from <strong>My Bookings</strong>. The refund depends on how close to the slot you cancel:</p>

    <table>
      <thead>
        <tr><th>Time before the slot</th><th>Refund</th></tr>
      </thead>
      <tbody>
        <tr><td>More than 24 hours</td><td><strong>100%</strong> — full refund to your original payment method or as wallet credit (you pick).</td></tr>
        <tr><td>Between 2 and 24 hours</td><td><strong>50%</strong> — the venue has lost the chance to resell the slot.</td></tr>
        <tr><td>Less than 2 hours</td><td><strong>No refund.</strong></td></tr>
      </tbody>
    </table>

    <h2>Venue cancellations</h2>
    <p>If a venue cancels your booking (rain, maintenance, mistake) you get a <strong>100% refund + ₹100 wallet credit</strong> as an apology, regardless of timing.</p>

    <h2>Refund timing</h2>
    <ul>
      <li><strong>Wallet credit:</strong> instant.</li>
      <li><strong>UPI / cards:</strong> 5–7 business days. The credit appears on your bank statement as "RAZORPAY*SPORTIFY".</li>
    </ul>

    <h2>Activities (games you joined)</h2>
    <p>If you joined a public activity, you can leave any time before it starts at no charge. The host can cancel the activity, in which case any participants who paid are refunded in full.</p>

    <h2>Disputes</h2>
    <p>If you believe a refund was processed incorrectly, email <a href="mailto:support@sportify.app">support@sportify.app</a> within 30 days with your booking ID. We respond within 2 business days.</p>

    <h2>Force majeure</h2>
    <p>For booking cancellations caused by events outside anyone's control (severe weather, court orders, government action), full refunds are issued regardless of timing.</p>
  </>
);
