import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090F] flex flex-col items-center justify-center p-6 text-white text-center">
      <h2 className="text-3xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-sm text-[#7B88A6] mb-6">The requested page could not be found.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5B4DF9] to-[#9C38FE] text-white text-xs font-semibold"
      >
        Return Home
      </Link>
    </div>
  );
}

