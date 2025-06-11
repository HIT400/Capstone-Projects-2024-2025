// layout.tsx
'use client';

import React, { ReactNode, useEffect, useState } from "react";
import Navbar from "@/components/NavBar";
import SideMenu from "@/components/SideMenu";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FaBuilding, FaChevronRight, FaChevronLeft } from "react-icons/fa";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "admin" | "applicant" | "inspector" | "superadmin";
  showSidebar?: boolean; // New prop to control sidebar visibility
  showNavbar?: boolean; // New prop to control navbar visibility
}

export default function DashboardLayout({
  children,
  userRole,
  showSidebar = true, // Default to true if not specified
  showNavbar = true, // Default to true if not specified
}: DashboardLayoutProps) {
  const { user } = useAuth();

  // Initialize menu state from localStorage or default to true (expanded)
  const [isMenuExpanded, setIsMenuExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sideMenuExpanded');
      return savedState !== null ? savedState === 'true' : true;
    }
    return true;
  });

  // Save menu state to localStorage when it changes
  const toggleMenu = () => {
    const newState = !isMenuExpanded;
    setIsMenuExpanded(newState);
    localStorage.setItem('sideMenuExpanded', String(newState));
  };

  // Force refresh user data when dashboard loads
  // We're using a different approach to avoid the dependency array issue
  useEffect(() => {
    // Define the function inside useEffect to avoid dependency issues
    const loadUserData = async () => {
      try {
        // Try to refresh the token to ensure we have the latest user data
        const token = localStorage.getItem('token');
        if (token) {
          // Instead of using the refreshToken function from context,
          // we'll implement the token refresh logic directly here
          try {
            const response = await fetch('http://localhost:5001/api/auth/refresh-token', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.token) {
                localStorage.setItem('token', data.token);
                document.cookie = `token=${data.token}; path=/;`;
              }
            }
          } catch (error) {
            console.error('Error refreshing token:', error);
          }
        }
      } catch (error) {
        console.error('Error in token refresh:', error);
      }
    };

    // Call the function
    loadUserData();
  }, []);
  return (
    <div className="h-screen flex bg-[#224057] p-3 overflow-hidden">
      {/* LEFT - Side Menu */}
      {showSidebar && (
        <div className={`${isMenuExpanded ? 'w-[20%] md:w-[18%] lg:w-[20%] xl:w-[18%]' : 'w-[80px]'} bg-white rounded-xl shadow-sm flex flex-col overflow-hidden h-full transition-all duration-300`}>
          {/* Logo container with white background and rounded edges */}
          <div className="bg-white p-5 flex justify-center">
            <div className="bg-white rounded-xl p-3 flex items-center justify-center shadow-sm w-full border border-gray-100 hover:shadow-md transition-all duration-300">
              <Link href="/" className="flex flex-col items-center gap-2 w-full">
                <div className="text-[#224057] transition-transform hover:scale-110 duration-300">
                  <FaBuilding size={36} />
                </div>
                {isMenuExpanded && <span className="font-bold text-[#224057] text-lg">ZimBuilds</span>}
              </Link>
            </div>
          </div>

          {/* Toggle button */}
          <div className="relative h-0">
            <button
              onClick={toggleMenu}
              className="absolute -right-3 top-2 p-1.5 rounded-full bg-white shadow-md hover:shadow-lg text-gray-600 transition-all duration-200 border border-gray-100 z-10"
              title={isMenuExpanded ? "Collapse menu" : "Expand menu"}
              aria-label={isMenuExpanded ? "Collapse menu" : "Expand menu"}
            >
              {isMenuExpanded ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
            </button>
          </div>

          <div className="p-4 flex-1 overflow-hidden">
            <SideMenu role={userRole === "superadmin" ? "admin" : userRole} isExpanded={isMenuExpanded} />
          </div>
        </div>
      )}
      {/* RIGHT - Main Content */}
      <div className={`flex-1 bg-[#F7F8FA] rounded-xl ml-3 overflow-hidden flex flex-col ${showSidebar ? (isMenuExpanded ? 'w-[80%]' : 'w-[calc(100%-80px-0.75rem)]') : 'w-full'} transition-all duration-300`}>
        {showNavbar && <Navbar />}
        <div className="p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

