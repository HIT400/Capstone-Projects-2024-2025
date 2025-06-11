import { useState, useEffect } from 'react';
import {
  FaMoneyBillWave,
  FaUsers,
  FaUserPlus,
  FaFileAlt,
  FaClipboardCheck,
  FaCalendarCheck,
  FaEllipsisH
} from 'react-icons/fa';

interface UserCardProps {
  type: string;
  count?: number;
  loading?: boolean;
  cardType?: string;
}

// Function to get the appropriate icon and background color based on card type
const getCardProperties = (type: string, cardType?: string) => {
  // If cardType is provided, use it for specific styling
  if (cardType) {
    switch (cardType) {
      case 'total-applications':
        return {
          icon: <FaFileAlt className="text-white" size={24} />,
          iconBg: 'bg-blue-500',
          textColor: 'text-blue-600'
        };
      case 'pending-applications':
        return {
          icon: <FaFileAlt className="text-white" size={24} />,
          iconBg: 'bg-amber-500',
          textColor: 'text-amber-600'
        };
      case 'approved-documents':
        return {
          icon: <FaFileAlt className="text-white" size={24} />,
          iconBg: 'bg-green-500',
          textColor: 'text-green-600'
        };
      case 'completed-inspections':
        return {
          icon: <FaClipboardCheck className="text-white" size={24} />,
          iconBg: 'bg-teal-500',
          textColor: 'text-teal-600'
        };
      case 'pending-inspections':
        return {
          icon: <FaClipboardCheck className="text-white" size={24} />,
          iconBg: 'bg-orange-500',
          textColor: 'text-orange-600'
        };
    }
  }

  // Fall back to type-based styling if cardType is not provided or not matched
  switch (type) {
    case 'application':
    case 'Total Applications':
      return {
        icon: <FaFileAlt className="text-white" size={24} />,
        iconBg: 'bg-indigo-500',
        textColor: 'text-green-600'
      };
    case 'inspection':
      return {
        icon: <FaClipboardCheck className="text-white" size={24} />,
        iconBg: 'bg-red-500',
        textColor: 'text-green-600'
      };
    case 'payment':
      return {
        icon: <FaMoneyBillWave className="text-white" size={24} />,
        iconBg: 'bg-green-500',
        textColor: 'text-green-600'
      };
    case 'document-verification':
    case 'Approved Documents':
      return {
        icon: <FaFileAlt className="text-white" size={24} />,
        iconBg: 'bg-teal-500',
        textColor: 'text-green-600'
      };
    case 'Todays Inspection':
      return {
        icon: <FaCalendarCheck className="text-white" size={24} />,
        iconBg: 'bg-indigo-500',
        textColor: 'text-green-600'
      };
    case 'Pending review':
    case 'Pending Applications':
    case 'Pending Inspections':
    case 'Upcoming Inspections':
      return {
        icon: <FaClipboardCheck className="text-white" size={24} />,
        iconBg: 'bg-orange-500',
        textColor: 'text-green-600'
      };
    case 'Completed this Week':
    case 'Completed Inspections':
      return {
        icon: <FaCalendarCheck className="text-white" size={24} />,
        iconBg: 'bg-amber-500',
        textColor: 'text-green-600'
      };
    default:
      return {
        icon: <FaUsers className="text-white" size={24} />,
        iconBg: 'bg-indigo-500',
        textColor: 'text-green-600'
      };
  }
};

const UserCard = ({ type, count, loading = false, cardType }: UserCardProps) => {
  const [displayCount, setDisplayCount] = useState<number>(0);
  const { icon, iconBg, textColor } = getCardProperties(type, cardType);

  // Format the type for display
  const formatType = (type: string) => {
    // Handle special cases
    if (type === 'document-verification') return 'Verifications';
    if (type === 'Todays Inspection' ||
        type === 'Pending review' ||
        type === 'Completed this Week' ||
        type === 'Upcoming Inspections' ||
        type === 'Completed Inspections')
      return type;

    // Add 's' to the end of the type if it doesn't already end with 's'
    return type.endsWith('s') ? type : `${type}s`;
  };

  // Animate count when it changes
  useEffect(() => {
    if (loading) return;

    // If count is undefined, use 0
    const targetCount = count ?? 0;

    // If the count is small, don't animate
    if (targetCount <= 5) {
      setDisplayCount(targetCount);
      return;
    }

    // Animate the count
    let start = 0;
    const increment = Math.ceil(targetCount / 20);
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetCount) {
        setDisplayCount(targetCount);
        clearInterval(timer);
      } else {
        setDisplayCount(start);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [count, loading]);

  return (
    <div className="rounded-xl shadow-sm p-4 flex-1 min-w-[130px] bg-white">
      <div className="flex justify-between items-center">
        <div className={`${iconBg} p-3 rounded-full`}>
          {icon}
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
          <FaEllipsisH size={16} />
        </button>
      </div>
      <h1 className={`text-2xl font-bold my-4 text-gray-800`}>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          displayCount
        )}
      </h1>
      <div className="flex justify-between items-center">
        <h2 className="capitalize text-sm font-medium text-gray-600">{formatType(type)}</h2>
        <div className={`text-xs ${textColor} font-medium`}>
          {cardType === 'total-applications' ? '+12%' :
           cardType === 'pending-applications' ? '-5%' :
           cardType === 'approved-documents' ? '+8%' :
           cardType === 'completed-inspections' ? '+15%' :
           cardType === 'pending-inspections' ? '-3%' :
           type === 'payment' ? '+6%' :
           type === 'application' ? '+55%' :
           type === 'inspection' ? '+3%' :
           type === 'document-verification' ? '-2%' : ''}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
