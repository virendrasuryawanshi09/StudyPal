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
        error?.message || 'Failed to login. Please check your credentials.';
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

          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Welcome back!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
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
                className="w-full pl-11 pr-4 py-2.5 rounded-lg
                  bg-white dark:bg-[#1f2430]
                  border border-slate-300 dark:border-slate-600
                  text-slate-900 dark:text-slate-100
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-2
                  focus:ring-slate-400 dark:focus:ring-indigo-500
                  transition-colors"
                required
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
                className="w-full pl-11 pr-4 py-2.5 rounded-lg
                  bg-white dark:bg-[#1f2430]
                  border border-slate-300 dark:border-slate-600
                  text-slate-900 dark:text-slate-100
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-2
                  focus:ring-slate-400 dark:focus:ring-indigo-500
                  transition-colors"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
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
              flex items-center justify-center gap-2
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Signing in…'
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
            className="text-slate-700 dark:text-indigo-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
