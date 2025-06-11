'use client';

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react";
import {
  FaUserCircle
} from 'react-icons/fa';

const Navbar = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('Guest');
  const [userRole, setUserRole] = useState<string>('');

  // Update local state whenever user changes
  useEffect(() => {
    if (user) {
      setUserName(`${user.firstName} ${user.lastName}`);

      // Format role for display
      let formattedRole = '';
      if (user.role) {
        // Special case for superadmin
        if (user.role === 'superadmin') {
          formattedRole = 'Super Admin';
        } else {
          // Capitalize the first letter of other roles
          formattedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }
      }
      setUserRole(formattedRole);
    } else {
      setUserName('Guest');
      setUserRole('');
    }
  }, [user]);

  return (
    <div className='flex items-center justify-end p-4 bg-[#224057] rounded-t-xl'>
      {/* USER INFO */}
      <div className='flex items-center gap-4'>
        <div className='flex flex-col'>
          <span className="text-xs leading-3 font-medium text-white">{userName}</span>
          <span className="text-[10px] text-gray-300 text-right">{userRole}</span>
        </div>
        <div className="text-white">
          <FaUserCircle size={36} />
        </div>
      </div>
    </div>
  )
}

export default Navbar