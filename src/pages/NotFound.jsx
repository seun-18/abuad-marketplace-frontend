import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-6">
    <section className="surface-card w-full max-w-xl px-8 py-16 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[#1d1d1f]">
        This page is not here.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#6e6e73]">
        The address may have changed, or the page may no longer be available.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Return to ABUAD Market Place
      </Link>
    </section>
  </main>
);

export default NotFound;
