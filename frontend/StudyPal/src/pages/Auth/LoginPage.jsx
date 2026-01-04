import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await authService.login(email, password);
      login(user, token);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      const message =
        error?.message || 'We couldn’t verify your credentials. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-slate-100 dark:bg-[#0f1115] transition-colors duration-300"
    >
      <div className="w-full max-w-md p-8 rounded-xl
        bg-white dark:bg-[#181b22]
        shadow-lg dark:shadow-2xl transition-colors duration-300"
      >

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full
            bg-slate-200 dark:bg-[#232734] transition-colors"
          >
            <BrainCircuit className="text-slate-700 dark:text-slate-300" strokeWidth={2} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Welcome back!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Sign in to continue your journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>

            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none translate-y-[1px] transition-colors ${
                  focusedField === 'email'
                    ? 'text-slate-700 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Mail size={18} />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="youremail@example.com"
                required
                aria-invalid={!!error}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg
                  bg-white dark:bg-[#1f2430]
                  border border-slate-300 dark:border-slate-600
                  text-slate-900 dark:text-slate-100
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-2
                  focus:ring-slate-400 dark:focus:ring-indigo-500
                  focus:ring-offset-1
                  transition-shadow"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>

            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none translate-y-[1px] transition-colors ${
                  focusedField === 'password'
                    ? 'text-slate-700 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Lock size={18} />
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="********"
                required
                aria-invalid={!!error}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg
                  bg-white dark:bg-[#1f2430]
                  border border-slate-300 dark:border-slate-600
                  text-slate-900 dark:text-slate-100
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-2
                  focus:ring-slate-400 dark:focus:ring-indigo-500
                  focus:ring-offset-1
                  transition-shadow"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20
              border border-red-200 dark:border-red-800
              rounded-md py-2 px-3 text-center">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-lg font-semibold text-white
              bg-gradient-to-r from-slate-700 to-slate-600
              hover:from-slate-600 hover:to-slate-700
              dark:bg-gradient-to-r dark:from-indigo-600 dark:to-indigo-500
              dark:hover:from-indigo-500 dark:hover:to-indigo-600
              transition-all duration-200 ease-out
              shadow-md hover:shadow-lg
              hover:-translate-y-[1px] active:translate-y-0
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
              flex items-center justify-center gap-2
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in…
              </div>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} className="relative top-[1px]" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-slate-700 dark:text-indigo-400 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
