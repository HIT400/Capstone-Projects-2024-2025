'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';

// Define validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactNumber: z.string().min(10, 'Valid phone number is required'),
  physicalAddress: z.string().min(1, 'Physical address is required'),
  nationalIdNumber: z.string().min(6, 'National ID is required'),
});

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    physicalAddress: '',
    nationalIdNumber: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');

    try {
      // Validate form data
      const validationResult = registerSchema.safeParse(formData);
      if (!validationResult.success) {
        const formattedErrors = validationResult.error.flatten().fieldErrors;
        setErrors(Object.fromEntries(
          Object.entries(formattedErrors).map(([key, value]) => [key, value?.[0]])
        ) as Partial<FormData>);
        return;
      }

      const response = await fetch(`http://localhost:5001/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // Redirect to login with success state
      router.push('/auth/login?registered=true');

    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred');
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

          <div className="p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[#224057]">Create Account</h1>
              <p className="text-gray-600 mt-2">Get started with your building plan application</p>
            </div>

            {apiError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {apiError}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224057] focus:border-[#224057] outline-none transition-all ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224057] focus:border-[#224057] outline-none transition-all ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224057] focus:border-[#224057] outline-none transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224057] focus:border-[#224057] outline-none transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  required
                  minLength={8}
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224057] focus:border-[#224057] outline-none transition-all ${
                  errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+263 77 123 4567"
                required
              />
              {errors.contactNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
              )}
            </div>

            {/* Role selection removed - all new users are registered as applicants by default */}

            <div>
              <label htmlFor="physicalAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Physical Address *
              </label>
              <input
                id="physicalAddress"
                name="physicalAddress"
                type="text"
                value={formData.physicalAddress}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224057] focus:border-[#224057] outline-none transition-all ${
                  errors.physicalAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.physicalAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.physicalAddress}</p>
              )}
            </div>

            <div>
              <label htmlFor="nationalIdNumber" className="block text-sm font-medium text-gray-700 mb-1">
                National ID Number *
              </label>
              <input
                id="nationalIdNumber"
                name="nationalIdNumber"
                type="text"
                value={formData.nationalIdNumber}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#224057] focus:border-[#224057] outline-none transition-all ${
                  errors.nationalIdNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.nationalIdNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.nationalIdNumber}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#224057] hover:bg-[#1a344d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#224057] transition-all transform hover:scale-[1.02] ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-[#224057] hover:text-[#1a344d] transition-colors"
              >
                Sign in
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-8 px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
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
  </div>
  );
}