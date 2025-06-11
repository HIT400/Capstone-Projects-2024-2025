'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={onClose}>
      <div 
        className="bg-white h-full w-4/5 max-w-sm p-5 transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-[#224057]">Menu</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex flex-col space-y-4">
          <Link 
            href="/" 
            className="py-2 px-4 hover:bg-gray-100 rounded-md text-[#224057]"
            onClick={onClose}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className="py-2 px-4 hover:bg-gray-100 rounded-md text-[#224057]"
            onClick={onClose}
          >
            About
          </Link>
          <Link 
            href="/communities" 
            className="py-2 px-4 hover:bg-gray-100 rounded-md text-[#224057]"
            onClick={onClose}
          >
            Communities
          </Link>
          <Link 
            href="/contacts" 
            className="py-2 px-4 hover:bg-gray-100 rounded-md text-[#224057]"
            onClick={onClose}
          >
            Contacts
          </Link>
          <div className="border-t border-gray-200 my-2"></div>
          <Link 
            href="/auth/login" 
            className="py-2 px-4 bg-[#224057] text-white rounded-md text-center"
            onClick={onClose}
          >
            Login
          </Link>
          <Link 
            href="/auth/register" 
            className="py-2 px-4 border border-[#224057] text-[#224057] rounded-md text-center"
            onClick={onClose}
          >
            Register
          </Link>
        </nav>
      </div>
    </div>
  )
}
