'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with email:', email);

      // Use the login function from AuthContext
      await login(email, password);

      console.log('Login successful, cookies should be set');

      // The login function in AuthContext will handle:
      // 1. Authentication with the server
      // 2. Storing the token and user role
      // 3. Setting the user state
      // 4. Redirecting to the appropriate dashboard

      // Manually redirect after a short delay to ensure cookies are set
      setTimeout(() => {
        const userRole = localStorage.getItem('userRole');
        console.log('Redirecting based on role:', userRole);

        if (userRole === 'admin' || userRole === 'superadmin') {
          router.push('/admin');
        } else if (userRole === 'inspector') {
          router.push('/inspector');
        } else {
          router.push('/applicant');
        }
      }, 500);

    } catch (err: any) {
      console.error('Login error:', err);

      // Handle connection errors
      if (err.message === 'Failed to fetch' ||
          err.code === 'ERR_CONNECTION_REFUSED' ||
          err.name === 'TypeError') {
        setError('Cannot connect to server. Please try again later or check if the server is running.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center bg-[#224057] relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-pattern">
        {/* Using a CSS background pattern instead of inline SVG to avoid hydration issues */}
      </div>

      {/* Building silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-black bg-opacity-20 overflow-hidden">
        <div className="w-full h-full bg-contain bg-bottom bg-no-repeat"
             style={{ backgroundImage: "url('/city-silhouette.png')" }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Logo header */}
          <div className="bg-[#224057] p-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 relative">
                <img src="/logo.png" alt="ZIMBUILDS Logo" className="h-full w-full object-contain" />
              </div>
              <div className="text-2xl font-bold text-white">ZIMBUILDS</div>
            </div>
            <Link
              href="/"
              className="text-white hover:text-gray-200 text-sm flex items-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Welcome
            </Link>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#224057] mb-6 text-center">Welcome Back</h2>
            <p className="text-gray-600 text-center mb-8">Sign in to continue to your dashboard</p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224057] focus:border-[#224057] outline-none transition-all"
                  placeholder="your@email.com"
                  required
              />
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#224057] focus:border-[#224057] outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#224057] focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-[#224057] focus:ring-[#224057]"/>
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#224057] hover:text-[#1a344d]">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#224057] hover:bg-[#1a344d] text-white font-medium py-3 rounded-lg transition-colors transform hover:scale-[1.02] ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-[#224057] hover:text-[#1a344d] font-medium ml-1">
                Sign up
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              &copy; 2024 Building Plan Approval System
            </p>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-6 text-center text-white text-sm">
          <p>Need help? Contact support at <a href="mailto:support@zimbuilds.gov.zw" className="underline">support@zimbuilds.gov.zw</a></p>
        </div>
      </div>
    </div>
  );
}