import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  User as UserIcon,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Zap,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { User } from '../types';
import { getEnhancedClientDeviceInfo } from '../utils/deviceInfo';

interface AuthScreenProps {
  onSuccess: (user: User, token: string) => void;
  onOpenAdmin: () => void;
  darkMode: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onOpenAdmin,
  darkMode
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      setMode('register');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim();
    const cleanPass = password;

    if (!cleanUser) {
      setError('Username enter karein.');
      return;
    }
    if (!cleanPass) {
      setError('Password enter karein.');
      return;
    }

    if (mode === 'register') {
      if (cleanUser.length < 3) {
        setError('Username kam az kam 3 characters ka hona chahiye.');
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
        setError('Username mein sirf letters, numbers aur underscore (_) allowed hain.');
        return;
      }
      if (cleanPass.length < 4) {
        setError('Password kam az kam 4 characters ka hona chahiye.');
        return;
      }
      if (cleanPass !== confirmPassword) {
        setError('Passwords match nahi kar rahe.');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Gather client mobile / device telemetry
      const deviceInfo = await getEnhancedClientDeviceInfo();

      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' 
        ? { username: cleanUser, name: name.trim() || cleanUser, password: cleanPass, deviceInfo, referralCode }
        : { username: cleanUser, password: cleanPass, deviceInfo };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let data: any = {};
      const responseText = await res.text();
      try {
        data = JSON.parse(responseText);
      } catch {
        // If not JSON, check if it's a known error or 404/500
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}: ${responseText.slice(0, 100) || 'Internal Error'}`);
        }
      }

      if (res.ok && data.success && data.user) {
        // Store in localStorage for persistent session
        localStorage.setItem('xrivet_token', data.token || data.user.id);
        localStorage.setItem('xrivet_user', JSON.stringify(data.user));
        onSuccess(data.user, data.token || data.user.id);
      } else {
        setError(data.error || (mode === 'register' ? 'Registration failed.' : 'Login failed.'));
      }
    } catch (err: any) {
      setError(err?.message || 'Server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-screen-container"
      className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-zinc-100 dark:bg-[#0c0d0e] text-zinc-900 dark:text-zinc-100 transition-colors relative overflow-hidden"
    >
      {/* Background ambient accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 text-emerald-400 shadow-xl shadow-emerald-500/10 border border-zinc-800 mb-2">
            <Terminal className="w-7 h-7" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Xrivet WormGPT
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Uncensored
            </span>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            Direct, unrestricted conversational intelligence. Please sign in or create an account to start.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Only Registered Users • Guest Mode Disabled</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-[#141517] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
            <button
              id="auth-mode-login-tab"
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Sign In (Login)
            </button>
            <button
              id="auth-mode-register-tab"
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Asad Ali"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 font-mono text-xs">
                  @
                </div>
                <input
                  id="auth-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username (e.g. asad_worm)"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  required
                />
              </div>
              {mode === 'register' && (
                <p className="text-[10px] text-zinc-400 mt-1">
                  Min 3 characters, letters, numbers and underscores.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                    required
                  />
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 mt-2"
            >
              {isLoading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Create Account & Start' : 'Sign In To Xrivet WormGPT'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch bottom toggle */}
          <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            {mode === 'login' ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                New user?{' '}
                <button
                  id="auth-switch-to-register-btn"
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Create an account now
                </button>
              </p>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Already registered?{' '}
                <button
                  id="auth-switch-to-login-btn"
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-center mt-4">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Sessions and interactions are securely isolated per user account.
          </span>
        </div>
      </div>
    </div>
  );
};
