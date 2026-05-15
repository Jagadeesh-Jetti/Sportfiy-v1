import { Link } from 'react-router-dom';

export const About = () => (
  <>
    <h1>About Sportify</h1>

    <p>
      Sportify exists because finding a court shouldn't be harder than playing on it. We're a
      small team in Bengaluru and Hyderabad building the booking platform that we wished existed
      when we were trying to round up friends for a Sunday match.
    </p>

    <h2>What we do</h2>
    <p>
      We connect players with sports venues — turfs, courts, pools and clubs — and let you book a
      slot in under a minute. Real availability, no double-booking (we guarantee that at the
      database level), no awkward phone calls.
    </p>

    <h2>How we make money</h2>
    <p>
      We charge venues a small platform fee on each booking. Players never pay extra for the
      service. We don't sell ads, we don't sell your data, and we don't take cuts from
      activities you host with friends.
    </p>

    <h2>The team</h2>
    <p>
      Founded in 2026 by a team of engineers and athletes who wanted Indian sports infrastructure
      to be more discoverable. We're a remote-first team currently 4 people strong.
    </p>

    <h2>How we work</h2>
    <ul>
      <li><strong>Player-first.</strong> If something is worse for players to make it easier for us, we don't do it.</li>
      <li><strong>Merchants succeed when players are happy.</strong> Reviews, ratings and verification are baked in.</li>
      <li><strong>Open about what we are.</strong> We're a young product. Things will break. When they do, tell us — we'll fix them publicly.</li>
    </ul>

    <h2>Want in?</h2>
    <p>
      Players: <Link to="/signup">sign up free</Link>. Venue owners: <Link to="/signup">list your courts</Link>.
      Press, partnerships, investors: <a href="mailto:hello@sportify.app">hello@sportify.app</a>.
    </p>
  </>
);
