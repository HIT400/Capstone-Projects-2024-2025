'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]">
      {/* Header */}
      <header className="bg-[#224057] text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 relative">
              <Image
                src="/logo.png"
                alt="ZIMBUILDS Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className="text-2xl font-bold">ZIMBUILDS</div>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-gray-300 transition">HOME</Link>
            <Link href="/communities" className="hover:text-gray-300 transition">COMMUNITIES</Link>
            <Link href="/contacts" className="hover:text-gray-300 transition">CONTACTS</Link>
            <Link href="/learn-more" className="hover:text-gray-300 transition">LEARN MORE</Link>
            <div className="border-l border-white h-6 mx-2"></div>
            <Link href="/auth/login" className="hover:text-gray-300 transition">LOGIN</Link>
          </div>
          <button className="md:hidden">☰</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#224057] mb-6">About ZimBuilds</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-[#224057] mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              ZimBuilds is dedicated to streamlining the building plan approval process in Zimbabwe. 
              Our mission is to create a transparent, efficient, and accessible system that benefits 
              all stakeholders in the construction industry, from individual homeowners to large-scale 
              developers, while ensuring compliance with building standards and regulations.
            </p>
            
            <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
              <Image
                src="/building-construction.jpg"
                alt="Building Construction"
                layout="fill"
                objectFit="cover"
              />
            </div>
            
            <h2 className="text-2xl font-semibold text-[#224057] mb-4">Who We Are</h2>
            <p className="text-gray-700 mb-4">
              ZimBuilds is a collaborative initiative between the Ministry of Local Government and 
              Public Works and the City Councils across Zimbabwe. Our platform represents a significant 
              step forward in the digitization of government services, making the building approval 
              process more accessible to all citizens.
            </p>
            <p className="text-gray-700 mb-6">
              Our team consists of experienced urban planners, architects, engineers, and digital 
              technology experts who are committed to improving the building approval process while 
              maintaining the highest standards of construction safety and quality.
            </p>
            
            <h2 className="text-2xl font-semibold text-[#224057] mb-4">Our Vision</h2>
            <p className="text-gray-700 mb-4">
              We envision a future where the building plan approval process is fully digital, 
              transparent, and efficient. Our goal is to reduce approval times, eliminate unnecessary 
              bureaucracy, and provide a seamless experience for all users while ensuring that all 
              buildings meet the necessary safety and quality standards.
            </p>
            <p className="text-gray-700">
              By digitizing this critical government service, we aim to contribute to Zimbabwe's 
              broader goals of modernization, improved service delivery, and economic development 
              through a more efficient construction sector.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-[#224057] mb-4">Key Benefits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium text-[#224057] mb-2">For Applicants</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Streamlined application process</li>
                  <li>Real-time tracking of application status</li>
                  <li>Reduced processing times</li>
                  <li>Transparent fee structure</li>
                  <li>Convenient online payments</li>
                  <li>Digital document submission</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium text-[#224057] mb-2">For City Councils</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Improved workflow management</li>
                  <li>Enhanced record keeping</li>
                  <li>Better resource allocation</li>
                  <li>Increased transparency</li>
                  <li>Reduced paperwork</li>
                  <li>Improved compliance monitoring</li>
                </ul>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-[#224057] mb-4">Our Commitment</h2>
            <p className="text-gray-700">
              We are committed to continuous improvement of our platform based on user feedback 
              and technological advancements. We strive to provide excellent customer service 
              and support to all users of the ZimBuilds platform, ensuring that the building 
              plan approval process is as smooth and efficient as possible.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#224057] text-white py-8 px-4 mt-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center space-x-2">
              <div className="h-8 w-8 relative">
                <Image
                  src="/logo.png"
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
              <Link href="/terms" className="hover:text-gray-300 transition">Terms</Link>
              <Link href="/privacy" className="hover:text-gray-300 transition">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-600 text-center text-sm">
            <p>© {new Date().getFullYear()} Zimbabwe Ministry of Local Government. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
