'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  // Get role from localStorage (since we can't use useAuth here)
  const getUserRole = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole') || '';
    }
    return '';
  };

  const handleRedirect = () => {
    const role = getUserRole();
    if (role === 'superadmin') {
      router.push('/admin');
    } else if (role) {
      router.push(`/${role.toLowerCase()}`);
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <button
          onClick={handleRedirect}
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}



