'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FlowDiagram from './FlowDiagram'
import MobileMenu from './MobileMenu'

export default function LearnMore() {
  const [activeSection, setActiveSection] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Define the application flow stages
  const stages = [
    {
      id: 'application',
      title: 'Application Submission',
      description: 'Submit your building plan application with all required details and documentation.',
      icon: '📝',
      details: [
        'Fill out the application form with personal and project details',
        'Upload architectural plans and required documents',
        'Review your submission before finalizing'
      ]
    },
    {
      id: 'document-verification',
      title: 'Approval Payments & Document Verification',
      description: 'Make approval payments and upload your documents for verification and compliance checking.',
      icon: '✅',
      details: [
        'Make initial approval payments',
        'Upload required documents for verification',
        'Documents are checked for completeness and compliance',
        'You\'ll be notified if any corrections are needed'
      ]
    },
    {
      id: 'stage-payments',
      title: 'Stage Payments',
      description: 'Pay the required stage fees to proceed with your application.',
      icon: '💳',
      details: [
        'View the calculated stage fees based on your project',
        'Make secure online payments',
        'Receive payment confirmation and receipt'
      ]
    },
    {
      id: 'inspection-scheduling',
      title: 'Inspection Scheduling',
      description: 'Schedule inspections at different stages of your construction project.',
      icon: '📅',
      details: [
        'View available inspection slots',
        'Select preferred dates and times',
        'Receive confirmation of scheduled inspections'
      ]
    },
    {
      id: 'inspections',
      title: 'Inspection Stages',
      description: 'Undergo various inspections during the construction process.',
      icon: '🔍',
      details: [
        'Siting and Foundations inspection',
        'DPC/Lintel/Wall plate Level inspection',
        'Roof Trusses inspection',
        'Drain Open Test',
        'Final Test'
      ]
    },
    {
      id: 'certificate',
      title: 'Certificate Issuance',
      description: 'Receive your completion certificate after all inspections are passed.',
      icon: '🏆',
      details: [
        'Final review of all inspection reports',
        'Certificate generation',
        'Download and print your official certificate'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]">
      {/* Header */}
      <header className="bg-[#224057] text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">Building Plan Approval System</div>
          </div>
          <div className="hidden md:block">
            <Link
              href="/"
              className="bg-white text-[#224057] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Back to Welcome
            </Link>
          </div>
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#224057] mb-2">Learn More About Our System</h1>
          <p className="text-gray-600 mb-8">
            Understand the complete process of building plan approval from application submission to certificate issuance.
          </p>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveSection('overview')}
              className={`px-4 py-2 font-medium text-sm rounded-t-md ${
                activeSection === 'overview'
                  ? 'bg-[#224057] text-white'
                  : 'text-gray-600 hover:text-[#224057]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection('flow')}
              className={`px-4 py-2 font-medium text-sm rounded-t-md ${
                activeSection === 'flow'
                  ? 'bg-[#224057] text-white'
                  : 'text-gray-600 hover:text-[#224057]'
              }`}
            >
              Application Flow
            </button>
            <button
              onClick={() => setActiveSection('faq')}
              className={`px-4 py-2 font-medium text-sm rounded-t-md ${
                activeSection === 'faq'
                  ? 'bg-[#224057] text-white'
                  : 'text-gray-600 hover:text-[#224057]'
              }`}
            >
              FAQs
            </button>
          </div>

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#224057] mb-4">System Overview</h2>
              <p className="mb-4">
                The Building Plan Approval System streamlines the process of submitting, reviewing, and approving building plans.
                It provides a transparent and efficient way to manage the entire lifecycle of building plan applications.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#224057] mb-2">For Applicants</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Submit building plan applications online</li>
                    <li>Track application status in real-time</li>
                    <li>Schedule inspections at your convenience</li>
                    <li>Make payments securely online</li>
                    <li>Receive notifications at each stage</li>
                    <li>Download certificates and approvals</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#224057] mb-2">For Inspectors</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>View assigned inspections</li>
                    <li>Manage inspection schedules</li>
                    <li>Record inspection results</li>
                    <li>Upload photos and documentation</li>
                    <li>Generate inspection reports</li>
                    <li>Approve or request corrections</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-[#224057] mb-3">Key Benefits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">⏱️</div>
                    <h4 className="font-medium text-[#224057]">Time Saving</h4>
                    <p className="text-sm text-gray-600">Reduce processing time with streamlined workflows</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">🔍</div>
                    <h4 className="font-medium text-[#224057]">Transparency</h4>
                    <p className="text-sm text-gray-600">Track your application status at every stage</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-3xl mb-2">📱</div>
                    <h4 className="font-medium text-[#224057]">Accessibility</h4>
                    <p className="text-sm text-gray-600">Access the system anytime, anywhere</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Application Flow Section */}
          {activeSection === 'flow' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#224057] mb-4">Application Flow</h2>
              <p className="mb-6">
                The building plan approval process follows a sequential workflow. Each stage must be completed before proceeding to the next.
              </p>

              {/* Flow Diagram */}
              <div className="mb-12">
                <FlowDiagram stages={stages} activeStage="application" />
              </div>

              {/* Detailed Stages */}
              <div className="space-y-6">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="bg-[#224057] text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#224057]">{stage.title}</h3>
                        <p className="text-gray-600 mb-3">{stage.description}</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          {stage.details.map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {activeSection === 'faq' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-[#224057] mb-4">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-[#224057] mb-2">How long does the approval process take?</h3>
                  <p className="text-gray-600">
                    The typical approval process takes 2-4 weeks, depending on the complexity of your building plan and how quickly you complete each stage. Document verification usually takes 3-5 business days, and inspection scheduling depends on inspector availability.
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-[#224057] mb-2">What documents do I need to submit?</h3>
                  <p className="text-gray-600">
                    Required documents include architectural plans (floor plans, elevations, sections), site plans, structural calculations, property ownership documents, and completed application forms. All plans must be properly scaled and include necessary measurements.
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-[#224057] mb-2">Can I make changes to my application after submission?</h3>
                  <p className="text-gray-600">
                    Minor changes can be made during the document verification stage. For significant changes, you may need to submit a revision request. Once your application moves to the payment stage, major changes will require a new application.
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-[#224057] mb-2">How are inspection dates scheduled?</h3>
                  <p className="text-gray-600">
                    After payment, you'll access the inspection scheduling page where you can select from available dates based on inspector availability. You'll receive confirmation and reminders before each scheduled inspection.
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-[#224057] mb-2">What happens if my inspection fails?</h3>
                  <p className="text-gray-600">
                    If an inspection fails, the inspector will provide detailed notes on required corrections. Once corrections are made, you can request a re-inspection through the system. Additional fees may apply for re-inspections.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#224057] mb-2">How do I receive my certificate?</h3>
                  <p className="text-gray-600">
                    After passing all required inspections, your certificate will be automatically generated and available for download in the system. You'll receive an email notification when it's ready. You can print the certificate or keep the digital copy for your records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/register"
              className="inline-block bg-[#224057] text-white px-6 py-3 rounded-md font-medium hover:bg-[#1a344d] transition-colors"
            >
              Register Now to Get Started
            </Link>
            <p className="mt-4 text-gray-600">
              Already have an account? <Link href="/auth/login" className="text-[#224057] hover:underline">Log in here</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#224057] text-white py-6 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">Building Plan Approval System</h3>
              <p className="text-sm text-gray-300">Streamlining the building approval process</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link href="/learn-more" className="text-gray-300 hover:text-white transition-colors">Learn More</Link>
              <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
              <Link href="/auth/register" className="text-gray-300 hover:text-white transition-colors">Register</Link>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-300">
            &copy; {new Date().getFullYear()} Building Plan Approval System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
