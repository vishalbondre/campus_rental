import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (err) {
      // error toast handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-stone-900 text-white p-12">
        <div>
          <span className="bg-amber-400 text-stone-900 font-display font-black text-xl w-10 h-10 rounded-xl grid place-items-center">C</span>
        </div>
        <div>
          <h2 className="font-display font-black text-4xl leading-tight mb-4">
            Borrow anything,<br />
            <span className="text-amber-400">on campus.</span>
          </h2>
          <p className="text-stone-400 text-lg mb-8">
            The campus rental marketplace trusted by thousands of students.
          </p>
          <div className="space-y-3">
            {[
              '🔒 Verified campus emails only',
              '📍 See items on the campus map',
              '⭐ Ratings and reviews system',
              '🛡️ Deposit protection built-in',
            ].map(f => (
              <div key={f} className="text-stone-300 text-sm">{f}</div>
            ))}
          </div>
        </div>
        <p className="text-stone-600 text-xs">© {new Date().getFullYear()} CampusRent</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="font-display font-black text-3xl text-stone-900 mb-1">Welcome back</h1>
          <p className="text-stone-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-600 font-medium hover:underline">Sign up free</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Campus Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@university.edu"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="Your password"
                  className="w-full px-4 py-3 pr-11 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400" />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-stone-400 hover:text-amber-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}