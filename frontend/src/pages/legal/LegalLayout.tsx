import { Outlet } from 'react-router-dom';

export const LegalLayout = () => (
  <article className="prose prose-slate mx-auto max-w-3xl px-4 py-12 prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-lg prose-a:text-brand-700 hover:prose-a:underline">
    <Outlet />
  </article>
);
