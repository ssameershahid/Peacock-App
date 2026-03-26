import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // role is available on the auth context after login via the updated user state
      // We read the token payload to determine the role for redirect
      const token = localStorage.getItem('peacock_token');
      let role = 'TOURIST';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          role = payload.role;
        } catch { /* ignore */ }
      }
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      if (redirect) {
        setLocation(redirect);
      } else if (role === 'DRIVER') {
        setLocation('/driver');
      } else if (role === 'ADMIN') {
        setLocation('/admin');
      } else {
        setLocation('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-[440px]">
        <div className="bg-white rounded-[32px] shadow-sm border border-warm-100 p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-forest-600 mb-2">Welcome back</h1>
            <p className="font-body text-warm-500 text-sm">Sign in to manage your bookings and trip details.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="font-body text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-4 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-forest-600 mb-2 font-body">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-warm-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border border-warm-200 rounded-xl py-3 pl-10 pr-10 font-body text-sm focus:ring-2 focus:ring-forest-500 outline-none"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-warm-400 hover:text-warm-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="font-body text-sm text-forest-500 hover:text-amber-200 transition-colors">Forgot password?</a>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-body">
              {loading ? 'Signing in…' : 'Log in'}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-warm-200" />
            <span className="font-body text-xs text-warm-400">or</span>
            <div className="flex-1 h-px bg-warm-200" />
          </div>

          <button className="w-full flex items-center justify-center gap-3 h-12 bg-white border border-warm-200 rounded-full font-body text-sm font-medium text-warm-600 hover:bg-warm-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <p className="text-center mt-6 font-body text-sm text-warm-500">
            Don't have an account? <Link href="/register" className="text-forest-500 font-medium hover:text-amber-200 transition-colors">Register →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
