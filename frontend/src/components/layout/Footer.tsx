import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Instagram, Twitter } from 'lucide-react';
import { toast } from 'sonner';

export const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("You're on the list. We'll be in touch.");
    setEmail('');
  };

  return (
    <footer className="mt-24 bg-ink-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_3fr] lg:gap-16">
          {/* Brand + newsletter */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink-900 font-black text-lg">
                S
              </span>
              <span className="text-lg font-bold tracking-tight text-white">Sportify</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              Find a court. Book your slot. Play your game. Built for players and the venues that
              love them.
            </p>
            <form onSubmit={handleSubscribe} className="mt-6 flex max-w-md gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-full border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-400"
              />
              <button
                type="submit"
                className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-ink-900 transition hover:bg-brand-400"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterCol title="Product">
              <FooterLink to="/venues">Browse venues</FooterLink>
              <FooterLink to="/signup">Become a player</FooterLink>
              <FooterLink to="/signup">List your venue</FooterLink>
            </FooterCol>
            <FooterCol title="Sports">
              <FooterLink to="/venues?sport=Football">Football</FooterLink>
              <FooterLink to="/venues?sport=Cricket">Cricket</FooterLink>
              <FooterLink to="/venues?sport=Badminton">Badminton</FooterLink>
              <FooterLink to="/venues?sport=Tennis">Tennis</FooterLink>
            </FooterCol>
            <FooterCol title="Company">
              <span className="text-slate-400">About</span>
              <span className="text-slate-400">Careers</span>
              <span className="text-slate-400">Press</span>
            </FooterCol>
            <FooterCol title="Legal">
              <span className="text-slate-400">Terms</span>
              <span className="text-slate-400">Privacy</span>
              <span className="text-slate-400">Cookies</span>
            </FooterCol>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-700 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Sportify. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <SocialIcon label="Twitter">
              <Twitter className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon label="Instagram">
              <Instagram className="h-4 w-4" />
            </SocialIcon>
            <SocialIcon label="GitHub">
              <Github className="h-4 w-4" />
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h4>
    <ul className="mt-4 space-y-2.5 text-sm">
      {Array.isArray(children)
        ? children.map((c, i) => <li key={i}>{c}</li>)
        : <li>{children}</li>}
    </ul>
  </div>
);

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link to={to} className="text-slate-300 transition hover:text-brand-400">
    {children}
  </Link>
);

const SocialIcon = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <button
    type="button"
    aria-label={label}
    className="grid h-8 w-8 place-items-center rounded-full border border-ink-700 text-slate-400 transition hover:border-brand-400 hover:text-brand-400"
  >
    {children}
  </button>
);
