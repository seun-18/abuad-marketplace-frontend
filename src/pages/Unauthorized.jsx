import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
    <p className="eyebrow">Access</p>
    <h1 className="page-heading mt-2" style={{ color: 'var(--primary)' }}>
      403
    </h1>
    <h2 className="mt-2 text-xl font-bold" style={{ color: 'var(--text)' }}>
      Access denied
    </h2>
    <p className="mt-3 max-w-md" style={{ color: 'var(--text-muted)' }}>
      You do not have permission to view this page. Sign in with the correct account, or return
      home.
    </p>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Link to="/login" className="btn btn-primary">
        Sign in
      </Link>
      <Link to="/" className="btn btn-outline">
        Go home
      </Link>
    </div>
  </main>
);

export default Unauthorized;
