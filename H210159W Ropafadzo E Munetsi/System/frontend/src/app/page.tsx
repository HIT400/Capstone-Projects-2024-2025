import Link from "next/link";
import { FaBuilding, FaUsers, FaFileAlt, FaCalendarCheck } from "react-icons/fa";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Background image */}
      <div className="fixed inset-0 -z-10 opacity-10">
        <Image
          src="/background.jpeg" // Replace with your actual background image path
          alt="Background pattern"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>

      {/* Navigation Bar */}
      <nav className="bg-[#224057] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <div className="h-10 w-10 relative">
              <Image
                src="/logo.png" // Replace with your actual logo path
                alt="ZIMBUILDS Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className="text-2xl font-bold">ZIMBUILDS</div>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="/about" className="hover:text-gray-300 transition">ABOUT</Link>
            <Link href="/communities" className="hover:text-gray-300 transition">COMMUNITIES</Link>
            <Link href="/contacts" className="hover:text-gray-300 transition">CONTACTS</Link>
            <Link href="/learn-more" className="hover:text-gray-300 transition">LEARN MORE</Link>
            <div className="border-l border-white h-6 mx-2"></div>
            <Link href="/auth/login" className="hover:text-gray-300 transition">LOGIN</Link>
          </div>
          <button className="md:hidden">☰</button>
        </div>
      </nav>

      {/* Hero Section with background image */}
      <div
        className="text-white py-20 px-4 relative"
        style={{
          backgroundImage: "linear-gradient(rgba(34, 64, 87, 0.9), rgba(34, 64, 87, 0.9)), url('/background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Building Plan Approval</h1>
          <h2 className="text-2xl md:text-3xl font-light mb-8">City Council Portal</h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl mb-12">
            Streamlining construction approvals in Zimbabwe. Submit, track, and manage your building plans through our digital platform.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              href="/auth/login"
              className="bg-white text-[#224057] px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
            >
              START APPLICATION
            </Link>
            <Link
              href="/learn-more"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-[#224057] transition"
            >
              LEARN MORE
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-gray-50 relative">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#224057] mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-[#224057] text-4xl mb-4 flex justify-center">
                <FaBuilding />
              </div>
              <h3 className="text-xl font-bold mb-2">Plan Submission</h3>
              <p className="text-gray-600">Submit your building plans digitally with all required documents</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-[#224057] text-4xl mb-4 flex justify-center">
                <FaFileAlt />
              </div>
              <h3 className="text-xl font-bold mb-2">Document Review</h3>
              <p className="text-gray-600">Our team reviews your submitted documents efficiently</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-[#224057] text-4xl mb-4 flex justify-center">
                <FaCalendarCheck />
              </div>
              <h3 className="text-xl font-bold mb-2">Inspection Scheduling</h3>
              <p className="text-gray-600">Schedule and manage site inspections online</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
              <div className="text-[#224057] text-4xl mb-4 flex justify-center">
                <FaUsers />
              </div>
              <h3 className="text-xl font-bold mb-2">Public Portal</h3>
              <p className="text-gray-600">Transparent process accessible to all stakeholders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#224057] text-white py-8 px-4 relative">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center space-x-2">
              <div className="h-8 w-8 relative">
                <Image
                  src="/logo.png" // Replace with your actual logo path
                  alt="ZIMBUILDS Logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div>
                <h3 className="font-bold">ZimBuilds</h3>
                <p className="text-sm">Government Building Plan Approval Portal</p>
              </div>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="hover:text-gray-300 transition">About</Link>
              <Link href="/contacts" className="hover:text-gray-300 transition">Contact</Link>
              <Link href="/terms" className="hover:text-gray-300 transition">Terms & Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-600 text-center text-sm">
            <p>© {new Date().getFullYear()} Zimbabwe Ministry of Local Government. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}