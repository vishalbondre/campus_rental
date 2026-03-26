import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ emailId: '', password: '', fullName: '', campusName: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const handle = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const eduRegex = /\.(edu|ac\.in|ac\.uk)$/i;
    // if (!eduRegex.test(form.emailId)) {
    //   setError('Please use a campus email address (.edu, .ac.in, .ac.uk)');
    //   return;
    // }
    setLoading(true);
    setError('');
    try {
      await doRegister(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">📬</div>
        <h2 className="font-display font-black text-2xl text-stone-900 mb-2">Check your inbox!</h2>
        <p className="text-stone-500 text-sm leading-relaxed mb-6">
          We sent a verification link to <strong>{form.emailId}</strong>.
          Click it to activate your CampusRent account.
        </p>
        <Link to="/login" className="text-amber-600 font-medium hover:underline text-sm">
          Back to sign in →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-stone-900 text-white p-12">
        <span className="bg-amber-400 text-stone-900 font-display font-black text-xl w-10 h-10 rounded-xl grid place-items-center">C</span>
        <div>
          <h2 className="font-display font-black text-4xl leading-tight mb-4">
            Join thousands of<br /><span className="text-amber-400">campus renters.</span>
          </h2>
          <p className="text-stone-400">List what you have. Borrow what you need.</p>
        </div>
        <p className="text-stone-600 text-xs">Only campus emails accepted — keeps our community safe.</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="font-display font-black text-3xl text-stone-900 mb-1">Create account</h1>
          <p className="text-stone-500 text-sm mb-8">
            Already have one?{' '}
            <Link to="/login" className="text-amber-600 font-medium hover:underline">Sign in</Link>
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name</label>
              <input type="text" value={form.fullName} onChange={handle('fullName')} required
                placeholder="Alex Johnson"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Campus Email</label>
              <input type="email" value={form.emailId} onChange={handle('emailId')} required
                placeholder="alex@university.edu"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400" />
              <p className="text-xs text-stone-400 mt-1">Enter any valid email</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">University / College Name</label>
              <input type="text" value={form.campusName} onChange={handle('campusName')} required
                placeholder="MIT, Stanford, IIT Delhi…"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={form.password}
                  onChange={handle('password')} required minLength={8}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-3 pr-11 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400" />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60">
              {loading
                ? <span className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                : 'Create My Account 🎓'
              }
            </button>

            <p className="text-xs text-stone-400 text-center">
              By registering, you agree to use CampusRent responsibly and only with a valid campus email.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}