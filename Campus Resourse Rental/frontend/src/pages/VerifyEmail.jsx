// src/pages/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center px-4">
      <div className="text-center max-w-sm">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-600 font-medium">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="font-display font-black text-2xl text-stone-900 mb-2">Email verified!</h2>
            <p className="text-stone-500 text-sm mb-6">Your campus account is now active. Start browsing rentals!</p>
            <Link to="/login" className="bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold px-6 py-3 rounded-xl text-sm transition-all">
              Sign In Now
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="font-display font-black text-2xl text-stone-900 mb-2">Verification failed</h2>
            <p className="text-stone-500 text-sm mb-6">The link may have expired. Try registering again.</p>
            <Link to="/register" className="text-amber-600 font-medium hover:underline text-sm">
              Back to registration →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
