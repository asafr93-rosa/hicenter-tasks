import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Logo } from '../components/Logo';

type Tab = 'signin' | 'signup';

export function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  const [tab, setTab] = useState<Tab>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'signin') {
        const ok = await login(username.trim(), password);
        if (ok) {
          navigate('/board');
        } else {
          setError('Invalid username or password.');
        }
      } else {
        const result = await register(username.trim(), password);
        if (result.success) {
          navigate('/board');
        } else {
          setError(result.error ?? 'Registration failed.');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #e8f4f8 0%, #f4f7fa 50%, #e8f0f8 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => { setTab('signin'); setError(''); }}
              className="flex-1 py-4 text-sm font-600 transition-colors cursor-pointer"
              style={{
                fontWeight: 600,
                color: tab === 'signin' ? '#00B5AD' : '#6B7280',
                borderBottom: tab === 'signin' ? '2px solid #00B5AD' : '2px solid #E5E7EB',
                background: 'none',
                border: 'none',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); }}
              className="flex-1 py-4 text-sm transition-colors cursor-pointer"
              style={{
                fontWeight: 600,
                color: tab === 'signup' ? '#00B5AD' : '#6B7280',
                borderBottom: tab === 'signup' ? '2px solid #00B5AD' : '2px solid #E5E7EB',
                background: 'none',
                border: 'none',
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A2B4A' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid #E5E7EB',
                  color: '#1A2B4A',
                  background: '#FAFAFA',
                }}
                onFocus={e => (e.target.style.borderColor = '#00B5AD')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#1A2B4A' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid #E5E7EB',
                  color: '#1A2B4A',
                  background: '#FAFAFA',
                }}
                onFocus={e => (e.target.style.borderColor = '#00B5AD')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#DC2626', background: '#FEF2F2' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors mt-1 cursor-pointer"
              style={{
                background: loading ? '#99D6D3' : '#00B5AD',
              }}
            >
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#9CA3AF' }}>
          {tab === 'signin'
            ? "Don't have an account? Click Sign Up above."
            : 'Already have an account? Click Sign In above.'}
        </p>
      </div>
    </div>
  );
}
