'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function TermsAndPrivacy() {
  const [activeTab, setActiveTab] = useState('terms')
  
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
            <Link href="/about" className="hover:text-gray-300 transition">ABOUT</Link>
            <Link href="/communities" className="hover:text-gray-300 transition">COMMUNITIES</Link>
            <Link href="/contacts" className="hover:text-gray-300 transition">CONTACTS</Link>
            <div className="border-l border-white h-6 mx-2"></div>
            <Link href="/auth/login" className="hover:text-gray-300 transition">LOGIN</Link>
          </div>
          <button className="md:hidden">☰</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#224057] mb-6">Terms and Privacy</h1>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'terms'
                  ? 'text-[#224057] border-b-2 border-[#224057]'
                  : 'text-gray-500 hover:text-[#224057]'
              }`}
              onClick={() => setActiveTab('terms')}
            >
              Terms of Service
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'privacy'
                  ? 'text-[#224057] border-b-2 border-[#224057]'
                  : 'text-gray-500 hover:text-[#224057]'
              }`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy Policy
            </button>
          </div>
          
          {/* Terms of Service Content */}
          {activeTab === 'terms' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-[#224057] mb-4">Terms of Service</h2>
              <p className="text-gray-600 mb-6">
                Last Updated: May 1, 2023
              </p>
              
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">1. Acceptance of Terms</h3>
                  <p className="text-gray-700">
                    By accessing or using the ZimBuilds platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                    The Service is operated by the Ministry of Local Government and Public Works of Zimbabwe ("Ministry"). 
                    If you do not agree to these Terms, please do not use the Service.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">2. Description of Service</h3>
                  <p className="text-gray-700">
                    ZimBuilds is a digital platform for submitting, reviewing, and approving building plans in Zimbabwe. 
                    The Service includes application submission, document verification, payment processing, inspection scheduling, 
                    and certificate issuance.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">3. User Accounts</h3>
                  <p className="text-gray-700 mb-2">
                    To use certain features of the Service, you must register for an account. You agree to provide accurate, 
                    current, and complete information during the registration process and to update such information to keep it 
                    accurate, current, and complete.
                  </p>
                  <p className="text-gray-700">
                    You are responsible for safeguarding your password and for all activities that occur under your account. 
                    You agree to notify us immediately of any unauthorized use of your account.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">4. User Responsibilities</h3>
                  <p className="text-gray-700 mb-2">
                    You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Use the Service in any way that violates any applicable laws or regulations</li>
                    <li>Submit false or misleading information</li>
                    <li>Attempt to deceive or defraud the Ministry or any other users</li>
                    <li>Interfere with the proper operation of the Service</li>
                    <li>Attempt to gain unauthorized access to the Service or any related systems</li>
                    <li>Use the Service for any purpose other than its intended use</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">5. Fees and Payments</h3>
                  <p className="text-gray-700">
                    Certain features of the Service may require payment of fees. All fees are non-refundable unless otherwise 
                    specified. The Ministry reserves the right to change the fees for any feature of the Service at any time.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">6. Intellectual Property</h3>
                  <p className="text-gray-700">
                    The Service and its original content, features, and functionality are owned by the Ministry and are protected 
                    by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">7. Limitation of Liability</h3>
                  <p className="text-gray-700">
                    In no event shall the Ministry, its officers, employees, or agents be liable for any indirect, incidental, 
                    special, consequential, or punitive damages, including without limitation, loss of profits, data, use, 
                    goodwill, or other intangible losses, resulting from your access to or use of or inability to access or 
                    use the Service.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">8. Changes to Terms</h3>
                  <p className="text-gray-700">
                    The Ministry reserves the right to modify or replace these Terms at any time. If a revision is material, 
                    we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material 
                    change will be determined at our sole discretion.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">9. Governing Law</h3>
                  <p className="text-gray-700">
                    These Terms shall be governed by and construed in accordance with the laws of Zimbabwe, without regard to 
                    its conflict of law provisions.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">10. Contact Us</h3>
                  <p className="text-gray-700">
                    If you have any questions about these Terms, please contact us at legal@zimbuilds.gov.zw.
                  </p>
                </section>
              </div>
            </div>
          )}
          
          {/* Privacy Policy Content */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-[#224057] mb-4">Privacy Policy</h2>
              <p className="text-gray-600 mb-6">
                Last Updated: May 1, 2023
              </p>
              
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">1. Introduction</h3>
                  <p className="text-gray-700">
                    The Ministry of Local Government and Public Works of Zimbabwe ("Ministry", "we", "us", or "our") is committed 
                    to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                    information when you use the ZimBuilds platform ("Service").
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">2. Information We Collect</h3>
                  <p className="text-gray-700 mb-2">
                    We collect information that you provide directly to us when you:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Register for an account</li>
                    <li>Submit a building plan application</li>
                    <li>Upload documents</li>
                    <li>Make payments</li>
                    <li>Schedule inspections</li>
                    <li>Communicate with us</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    This information may include your name, email address, phone number, physical address, identification 
                    numbers, payment information, and any other information you choose to provide.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">3. How We Use Your Information</h3>
                  <p className="text-gray-700 mb-2">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Provide, maintain, and improve the Service</li>
                    <li>Process and manage your building plan applications</li>
                    <li>Communicate with you about your account and applications</li>
                    <li>Send you technical notices, updates, security alerts, and administrative messages</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Monitor and analyze trends, usage, and activities in connection with the Service</li>
                    <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">4. Information Sharing and Disclosure</h3>
                  <p className="text-gray-700 mb-2">
                    We may share your information with:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Government agencies and departments involved in the building approval process</li>
                    <li>Service providers who perform services on our behalf</li>
                    <li>Professional advisors, such as lawyers, auditors, and insurers</li>
                    <li>Law enforcement or other government agencies, as required by law</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    We will not sell or rent your personal information to third parties.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">5. Data Security</h3>
                  <p className="text-gray-700">
                    We take reasonable measures to help protect your personal information from loss, theft, misuse, 
                    unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over 
                    the Internet or method of electronic storage is 100% secure.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">6. Data Retention</h3>
                  <p className="text-gray-700">
                    We will retain your information for as long as your account is active or as needed to provide you 
                    services, comply with our legal obligations, resolve disputes, and enforce our agreements.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">7. Your Rights</h3>
                  <p className="text-gray-700 mb-2">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate personal information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to processing of your personal information</li>
                    <li>Request restriction of processing of your personal information</li>
                    <li>Request transfer of your personal information</li>
                  </ul>
                  <p className="text-gray-700 mt-2">
                    To exercise these rights, please contact us at privacy@zimbuilds.gov.zw.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">8. Changes to This Privacy Policy</h3>
                  <p className="text-gray-700">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                    the new Privacy Policy on this page and updating the "Last Updated" date at the top of this page.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-medium text-[#224057] mb-2">9. Contact Us</h3>
                  <p className="text-gray-700">
                    If you have any questions about this Privacy Policy, please contact us at privacy@zimbuilds.gov.zw.
                  </p>
                </section>
              </div>
            </div>
          )}
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
