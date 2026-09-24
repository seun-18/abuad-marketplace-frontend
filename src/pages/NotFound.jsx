import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center bg-white px-6">
    <section className="surface-card w-full max-w-xl px-8 py-16 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="page-heading mt-3">This page is not here</h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-7" style={{ color: 'var(--text-muted)' }}>
        The address may have changed, or the page may no longer be available.
      </p>
      <Link to="/" className="btn btn-primary mt-8">
        <ArrowLeft size={16} aria-hidden="true" />
        Return to ABUAD Market Place
      </Link>
    </section>
  </main>
);

export default NotFound;
