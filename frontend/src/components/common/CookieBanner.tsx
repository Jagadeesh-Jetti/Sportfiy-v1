import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

const KEY = 'sportify-cookies-ack-v1';

export const CookieBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  if (!show) return null;

  const accept = () => {
    localStorage.setItem(KEY, '1');
    setShow(false);
  };

  return (
    <div className="fixed inset-x-2 bottom-24 z-30 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 md:bottom-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
          <Cookie className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">A quick note about cookies</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            We use one essential cookie to keep you logged in. We don't track you for ads. See our{' '}
            <Link to="/privacy" className="font-semibold text-brand-700 hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={accept}
          className="rounded-full bg-ink-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-ink-800"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
