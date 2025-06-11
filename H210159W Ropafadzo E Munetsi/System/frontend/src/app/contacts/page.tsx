'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa'

export default function Contacts() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    }, 1500)
  }
  
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
            <Link href="/learn-more" className="hover:text-gray-300 transition">LEARN MORE</Link>
            <div className="border-l border-white h-6 mx-2"></div>
            <Link href="/auth/login" className="hover:text-gray-300 transition">LOGIN</Link>
          </div>
          <button className="md:hidden">☰</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-[#224057] mb-6">Contact Us</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#224057] mb-4">Get in Touch</h2>
                <p className="text-gray-600 mb-6">
                  Have questions about the building plan approval process? Our team is here to help.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="text-[#224057] mt-1 mr-3">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#224057]">Main Office</h3>
                      <p className="text-gray-600">
                        Ministry of Local Government Building<br />
                        Samora Machel Avenue<br />
                        Harare, Zimbabwe
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-[#224057] mt-1 mr-3">
                      <FaPhone />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#224057]">Phone</h3>
                      <p className="text-gray-600">
                        +263 242 123 4567<br />
                        +263 242 765 4321
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-[#224057] mt-1 mr-3">
                      <FaEnvelope />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#224057]">Email</h3>
                      <p className="text-gray-600">
                        info@zimbuilds.gov.zw<br />
                        support@zimbuilds.gov.zw
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-[#224057] mt-1 mr-3">
                      <FaClock />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#224057]">Working Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 8:00 AM - 4:30 PM<br />
                        Saturday & Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-medium text-[#224057] mb-2">Regional Offices</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>Bulawayo: +263 292 123 4567</li>
                    <li>Mutare: +263 202 123 4567</li>
                    <li>Gweru: +263 252 123 4567</li>
                    <li>Masvingo: +263 232 123 4567</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#224057] mb-4">Send Us a Message</h2>
                
                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                    Thank you for your message! We will get back to you as soon as possible.
                  </div>
                ) : null}
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-1">Your Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-gray-700 mb-1">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="Application Process">Application Process</option>
                      <option value="Document Verification">Document Verification</option>
                      <option value="Payment Issues">Payment Issues</option>
                      <option value="Inspection Scheduling">Inspection Scheduling</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-gray-700 mb-1">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-[#224057] text-white px-6 py-2 rounded-md hover:bg-[#1a344d] transition-colors disabled:bg-gray-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
              
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#224057] mb-4">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-[#224057]">How can I check the status of my application?</h3>
                    <p className="text-gray-600">
                      You can log in to your account and view the status of your application on your dashboard.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-[#224057]">What if I need to make changes to my submitted application?</h3>
                    <p className="text-gray-600">
                      Please contact our support team with your application ID and details of the changes required.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-[#224057]">How long does the approval process take?</h3>
                    <p className="text-gray-600">
                      The typical approval process takes 2-4 weeks, depending on the complexity of your building plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
