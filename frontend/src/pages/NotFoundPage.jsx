import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Page Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you are looking for does not exist.</p>
        <Link to="/admin" className="mt-5 inline-flex rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
