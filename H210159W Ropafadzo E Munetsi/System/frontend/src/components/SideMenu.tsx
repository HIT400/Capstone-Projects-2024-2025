// components/SideMenu.tsx
'use client'
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import {
  FaChevronDown,
  FaChevronRight,
  FaHome,
  FaUserTie,
  FaUsers,
  FaFileAlt,
  FaMoneyBillWave,
  FaChartBar,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaClipboardList,
  FaFileInvoice,
  FaCalendarAlt,
  FaClipboardCheck,
  FaCertificate,
  FaFile
} from 'react-icons/fa';
import { IconType } from 'react-icons';

interface MenuItem {
  icon: IconType;
  label: string;
  href: string;
  visible?: ("admin" | "applicant" | "inspector")[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuData: Record<string, MenuSection[]> = {
  admin: [
    {
      title: "MENU",
      items: [
        {
          icon: FaHome,
          label: "Home",
          href: "/admin",
        },
        {
          icon: FaUserTie,
          label: "Add Inspector",
          href: "/admin/add-inspector",
        },
        {
          icon: FaUserTie,
          label: "Inspectors",
          href: "/admin/inspectors",
        },
        {
          icon: FaUsers,
          label: "Applicants",
          href: "/admin/applicants",
        },
        {
          icon: FaFileAlt,
          label: "Applications",
          href: "/admin/applications",
        },
        {
          icon: FaFile,
          label: "Documents",
          href: "/admin/documents",
        },
        {
          icon: FaMoneyBillWave,
          label: "Payments",
          href: "/admin/payments",
        },
        {
          icon: FaMoneyBillWave,
          label: "Payment Settings",
          href: "/admin/payment-settings",
        },
        {
          icon: FaChartBar,
          label: "Reports",
          href: "/admin/reports",
        },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          icon: FaUserCircle,
          label: "Profile",
          href: "/profile",
        },
        {
          icon: FaCog,
          label: "Settings",
          href: "/settings",
        },
        {
          icon: FaSignOutAlt,
          label: "Logout",
          href: "/logout",
        },
      ],
    },
  ],
  applicant: [
    {
      title: "MENU",
      items: [
        {
          icon: FaHome,
          label: "Home",
          href: "/applicant",
        },
        {
          icon: FaClipboardList,
          label: "Application Form",
          href: "/applicant/application-form",
          visible: ["applicant"],
        },
        {
          icon: FaFileInvoice,
          label: "Document Verification",
          href: "/applicant/document-verification",
        },
        {
          icon: FaMoneyBillWave,
          label: "Stage Payments",
          href: "/applicant/stage-payments",
        },
        {
          icon: FaCalendarAlt,
          label: "Schedule Inspection",
          href: "/applicant/inspection-scheduling",
        },
        {
          icon: FaClipboardCheck,
          label: "Inspection Stages",
          href: "/applicant/inspection-stages",
        },
        {
          icon: FaCertificate,
          label: "Certificate Of Occupation",
          href: "/applicant/certificate",
        },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          icon: FaUserCircle,
          label: "Profile",
          href: "/profile",
        },
        {
          icon: FaCog,
          label: "Settings",
          href: "/settings",
        },
        {
          icon: FaSignOutAlt,
          label: "Logout",
          href: "/logout",
        },
      ],
    },
  ],
  inspector: [
    {
      title: "MENU",
      items: [
        {
          icon: FaHome,
          label: "Home",
          href: "/inspector",
        },
        {
          icon: FaUsers,
          label: "Applicants",
          href: "/inspector/applicants",
        },
        // {
        //   icon: FaClipboardCheck,
        //   label: "Inspections",
        //   href: "/inspector/inspections",
        // },
        //  {
        //   icon: FaCalendarAlt,
        //   label: "Schedules",
        //   href: "/inspector/schedules",
        // },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          icon: FaUserCircle,
          label: "Profile",
          href: "/profile",
        },
        {
          icon: FaCog,
          label: "Settings",
          href: "/settings",
        },
        {
          icon: FaSignOutAlt,
          label: "Logout",
          href: "/logout",
        },
      ],
    },
  ],
};

interface SideMenuProps {
  role: "admin" | "applicant" | "inspector";
  isExpanded?: boolean;
}

const SideMenu = ({ role, isExpanded = true }: SideMenuProps) => {
  const menuItems = menuData[role] || [];
  const { logout } = useAuth();
  const pathname = usePathname();

  // Function to check if a menu item is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Initialize all sections as expanded
    return menuItems.reduce((acc, section) => {
      // Set all sections to expanded by default
      acc[section.title] = true;
      return acc;
    }, {} as Record<string, boolean>);
  });

  // Toggle section expansion
  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleItemClick = (item: MenuItem, e: React.MouseEvent) => {
    // Handle logout specially
    if (item.label === 'Logout') {
      e.preventDefault();
      logout();
    }
  };

  return (
    <div className="text-base h-full overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          {isExpanded && (
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between text-gray-600 uppercase text-sm font-bold my-3 ml-2 hover:text-[#224057] transition-colors w-full text-left px-2 py-1 rounded hover:bg-gray-50"
            >
              <span>{section.title}</span>
              <div className="transition-transform duration-200">
                {expandedSections[section.title] ?
                  <FaChevronDown size={12} className="mr-2 transform transition-transform duration-200" /> :
                  <FaChevronRight size={12} className="mr-2 transform transition-transform duration-200" />
                }
              </div>
            </button>
          )}

          {/* Only render items if section is expanded or if menu is collapsed */}
          <div className={`overflow-hidden transition-all duration-300 ${(!isExpanded || expandedSections[section.title]) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {section.items.map((item) => {
            if (item.visible && !item.visible.includes(role)) {
              return null;
            }
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.label}
                onClick={(e) => handleItemClick(item, e)}
                className={`group flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 ${isActive(item.href) ? 'bg-gray-100 text-[#224057] font-semibold shadow-sm border-l-4 border-[#224057]' : 'text-gray-700 border-l-4 border-transparent'} py-3 px-4 rounded-lg hover:bg-gray-100 hover:text-[#224057] hover:shadow-sm font-medium transition-all duration-200`}
                title={!isExpanded ? item.label : undefined}
              >
                <div className="flex items-center justify-center w-7">
                  <Icon size={22} className={`${isActive(item.href) ? 'text-[#224057]' : 'text-gray-700'} group-hover:text-[#224057]`} />
                </div>
                {isExpanded && <span className="text-base font-semibold">{item.label}</span>}
              </Link>
            );
          })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SideMenu;