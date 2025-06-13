import React, { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Key,
  Mail,
  Building,
  DollarSign,
  FileText,
  Save,
  Menu,
  X,
} from "lucide-react";
import Header from "../../components/both/Header";
import Footer from "../../components/public/Footer";

const ProfileSettings = () => {
  return (
    <div className="flex-1">
      <h3 className="text-xl font-semibold mb-6">Profile Settings</h3>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={32} className="text-gray-400" />
          </div>
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Change Photo
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-tertiary inline-flex items-center">
          <Save size={18} className="mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

const NotificationSettings = () => {
  return (
    <div className="flex-1">
      <h3 className="text-xl font-semibold mb-6">Notification Settings</h3>
      <div className="space-y-6">
        <div className="border rounded-lg divide-y">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500">
                  Receive notifications about procurement updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-gray-500">
                  Receive important updates via SMS
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-tertiary inline-flex items-center">
          <Save size={18} className="mr-2" />
          Save Preferences
        </button>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  return (
    <div className="flex-1">
      <h3 className="text-xl font-semibold mb-6">Security Settings</h3>
      <div className="space-y-6">
        <div className="border rounded-lg divide-y">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="text-gray-400" size={24} />
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-500">
                    Last changed 3 months ago
                  </p>
                </div>
              </div>
              <button className="text-primary hover:underline">Change</button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="text-gray-400" size={24} />
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security
                  </p>
                </div>
              </div>
              <button className="text-primary hover:underline">Enable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrganizationSettings = () => {
  return (
    <div className="flex-1">
      <h3 className="text-xl font-semibold mb-6">Organization Settings</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="Enter organization name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization ID
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg bg-gray-50"
            value="ORG-123456"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Address
          </label>
          <textarea
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Enter business address"
          />
        </div>

        <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-tertiary inline-flex items-center">
          <Save size={18} className="mr-2" />
          Save Organization
        </button>
      </div>
    </div>
  );
};

const SettingsNavigation = ({
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const tabs = [
    { id: "profile", label: "Profile Settings", icon: <User size={20} /> },
    { id: "company", label: "Company Details", icon: <Building size={20} /> },
    { id: "documents", label: "Legal Documents", icon: <FileText size={20} /> },
    {
      id: "financial",
      label: "Financial Details",
      icon: <DollarSign size={20} />,
    },
    { id: "notifications", label: "Notifications", icon: <Bell size={20} /> },
    { id: "security", label: "Security", icon: <Shield size={20} /> },
  ];

  // Mobile menu toggle
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden w-full border-b pb-4 mb-4">
        <button
          onClick={toggleMenu}
          className="flex items-center gap-2 text-gray-600 p-2"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          <span>Settings Menu</span>
        </button>
      </div>

      {/* Navigation sidebar - hidden on mobile unless menu is open */}
      <nav
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 border-r pr-6 mb-6 md:mb-0`}
      >
        <h2 className="text-xl font-semibold mb-6">Supplier Settings</h2>
        <div className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center p-3 rounded-lg text-left w-full ${
                activeTab === tab.id
                  ? "bg-blue-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="mr-3">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

const CompanyDetails = () => {
  return (
    <div className="flex-1">
      <h3 className="text-xl font-semibold mb-6">Company Details</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trading Name (if different)
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter trading name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate of Incorporation Number
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter incorporation number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Number
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter vendor number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Clearance Number
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter tax clearance number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Clearance Expiry Date
            </label>
            <input type="date" className="w-full p-2 border rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registered Business Address
          </label>
          <textarea
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Enter registered address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter city"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter state/province"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter postal code"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const LegalDocuments = () => {
  return (
    <div className="flex-1">
      <h3 className="text-xl font-semibold mb-6">Legal Documents</h3>
      <div className="space-y-6">
        <div className="border rounded-lg divide-y">
          <div className="p-4">
            <h4 className="font-medium mb-2">Certificate of Incorporation</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  Upload your certificate of incorporation
                </p>
                <input type="file" className="mt-2" />
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-tertiary">
                Upload
              </button>
            </div>
          </div>

          <div className="p-4">
            <h4 className="font-medium mb-2">Tax Clearance Certificate</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  Upload your current tax clearance certificate
                </p>
                <input type="file" className="mt-2" />
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-tertiary">
                Upload
              </button>
            </div>
          </div>

          <div className="p-4">
            <h4 className="font-medium mb-2">Business Registration</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  Upload your business registration certificate
                </p>
                <input type="file" className="mt-2" />
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-tertiary">
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancialDetails = () => {
  return (
    <div className="flex-1">
      <h3 className="text-xl font-semibold mb-6">Financial Details</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter bank name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter account number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Code
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter branch code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Swift Code
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter SWIFT code"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Turnover
          </label>
          <select className="w-full p-2 border rounded-lg">
            <option>Select annual turnover range</option>
            <option>Less than $100,000</option>
            <option>$100,000 - $500,000</option>
            <option>$500,000 - $1,000,000</option>
            <option>More than $1,000,000</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const ProcurerSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "company":
        return <CompanyDetails />;
      case "documents":
        return <LegalDocuments />;
      case "financial":
        return <FinancialDetails />;
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {" "}
      <Header user_type="procurer" />
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <SettingsNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            {/* Content area - hidden on mobile when menu is open */}
            <div
              className={`${
                isMobileMenuOpen ? "hidden" : "block"
              } md:block flex-1`}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const ProcurerProfilePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">John Doe</h1>
                <p className="text-gray-600">Organization Administrator</p>
              </div>
            </div>

            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 inline-flex items-center">
              <Settings size={18} className="mr-2" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border rounded-lg p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={20} />
                  <span>john.doe@example.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="text-gray-400" size={20} />
                  <span>Example Organization</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-white">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Updated profile settings
                  </span>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Changed password</span>
                  <span className="text-sm text-gray-500">1 week ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Enabled 2FA</span>
                  <span className="text-sm text-gray-500">2 weeks ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export { ProcurerSettingsPage, ProcurerProfilePage };
