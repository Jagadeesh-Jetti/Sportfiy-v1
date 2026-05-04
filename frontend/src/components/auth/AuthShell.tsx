import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

type Props = {
  title: string;
  subtitle: string;
  side: { eyebrow: string; quote: string; attribution: string };
  children: React.ReactNode;
};

export const AuthShell = ({ title, subtitle, side, children }: Props) => {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] md:grid-cols-2">
      {/* Left — form */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      {/* Right — dark panel */}
      <aside className="relative hidden overflow-hidden bg-ink-900 text-white md:flex md:flex-col md:justify-between md:px-12 md:py-16">
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-brand-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-30" />

        <div className="relative flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-ink-900 font-black text-lg">
              S
            </span>
            <span className="text-lg font-bold">Sportify</span>
          </Link>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300">
            <Sparkles className="h-3 w-3" />
            {side.eyebrow}
          </div>
          <blockquote className="mt-5 text-2xl font-bold leading-snug tracking-tight text-white md:text-3xl">
            "{side.quote}"
          </blockquote>
          <p className="mt-4 text-sm text-slate-400">— {side.attribution}</p>
        </div>

        <div className="relative flex items-center gap-6 text-xs uppercase tracking-[0.2em] text-slate-500">
          <span><strong className="text-white">10K+</strong> players</span>
          <span aria-hidden>·</span>
          <span><strong className="text-white">200+</strong> venues</span>
          <span aria-hidden>·</span>
          <span><strong className="text-white">8</strong> sports</span>
        </div>
      </aside>
    </div>
  );
};
