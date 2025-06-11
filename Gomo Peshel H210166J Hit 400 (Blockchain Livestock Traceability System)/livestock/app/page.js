"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="p-6 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              alt="Platform Logo"
              className="rounded-lg"
            />
            <span className="ml-3 text-xl font-bold text-gray-800">
              National Livestock Traceability
            </span>
          </div>
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-t from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to the National Livestock Traceability System
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            A secure and efficient platform for managing livestock health, ownership, and compliance.
          </p>
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-4">Livestock Tracking</h3>
              <p className="text-gray-600">
                Track livestock movements and health status in real-time.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-4">Health Certificates</h3>
              <p className="text-gray-600">
                Generate and verify health certificates for livestock.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-4">Compliance Management</h3>
              <p className="text-gray-600">
                Ensure compliance with national livestock regulations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">
                This platform has revolutionized how we manage livestock. Its efficient, secure, and easy to use.
              </p>
              <p className="text-gray-800 font-semibold">— John Doe, Farmer</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">
                The health certificate feature is a game-changer. It saves us so much time and effort.
              </p>
              <p className="text-gray-800 font-semibold">— Jane Smith, Veterinarian</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} National Livestock Traceability System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;