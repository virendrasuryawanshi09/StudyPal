import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('alex@timetoprogram.com');
  const [password, setPassword] = useState('Test@123');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#1e1b33] px-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#2e2752] rounded-xl shadow-lg p-8 transition-colors duration-300">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full
            bg-emerald-100 dark:bg-purple-900 transition-colors duration-300">
            <BrainCircuit className="text-emerald-600 dark:text-purple-400" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Welcome back!
          </h1>
          <p className="text-slate-500 dark:text-slate-300 mt-1">
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
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                  focusedField === 'email'
                    ? 'text-emerald-500 dark:text-purple-400'
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
                className="w-full pl-11 pr-4 py-2 border rounded-lg
                  focus:outline-none focus:ring-2
                  focus:ring-emerald-500 dark:focus:ring-purple-500
                  dark:bg-[#3a315d] dark:border-[#4d4880] dark:text-white
                  transition-colors duration-300"
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
                className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                  focusedField === 'password'
                    ? 'text-emerald-500 dark:text-purple-400'
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
                className="w-full pl-11 pr-4 py-2 border rounded-lg
                  focus:outline-none focus:ring-2
                  focus:ring-emerald-500 dark:focus:ring-purple-500
                  dark:bg-[#3a315d] dark:border-[#4d4880] dark:text-white
                  transition-colors duration-300"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 px-6 rounded-xl
              font-semibold text-white
              bg-gradient-to-r from-emerald-600 to-emerald-400
              dark:from-purple-600 dark:to-purple-400
              hover:from-emerald-400 hover:to-emerald-600
              dark:hover:from-purple-400 dark:hover:to-purple-600
              transition-all duration-300 ease-in-out
              shadow-md hover:shadow-xl
              hover:-translate-y-0.5
              active:translate-y-0
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-300 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-emerald-600 dark:text-purple-400 hover:underline transition-colors duration-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
