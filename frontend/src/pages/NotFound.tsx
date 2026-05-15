import { Link } from 'react-router-dom';

export const NotFound = () => (
  <div className="mx-auto max-w-md px-4 py-24 text-center">
    <p className="text-7xl font-black tracking-tight text-brand-400">404</p>
    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Out of bounds.</h1>
    <p className="mt-3 text-slate-600">
      This page doesn't exist. Either the URL is off, or the page never quite got built.
    </p>
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <Link
        to="/"
        className="inline-block rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-5 py-2.5 text-sm font-bold text-ink-900 shadow-md shadow-brand-500/30"
      >
        Back to home
      </Link>
      <Link
        to="/venues"
        className="inline-block rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700"
      >
        Browse venues
      </Link>
    </div>
  </div>
);
