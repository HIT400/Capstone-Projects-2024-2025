import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Users,
  Search,
  ChevronDown,
  Bell,
  X,
  User,
  LogOut,
  Menu,
  Plus,
  Settings,
  Flag,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const RegulatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("irregularities");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case "approvals":
        return <CategoryApprovals />;
      case "monitoring":
        return <TenderMonitoring />;
      case "reports":
        return <AuditReports />;
      case "settings":
        return <RegulatorSettings />;
      case "audits":
        return <TenderManagement />;
      default:
        return <IrregularitiesManagement />;
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/auth/logout",
        {},
        { withCredentials: true }
      );
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/auth/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <nav
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block md:flex-shrink-0 bg-white border-r w-64 flex flex-col h-screen fixed z-20`}
      >
        <div className="px-4 py-4 border-b border-gray-200 shadow-sm">
          <Link to="#" className="text-2xl font-bold flex items-center">
            <img
              src="/CoatOfArms.png"
              alt="icon"
              className="w-[1em] h-[1em] mr-2"
            />
            t<span className="text-primary">3</span>ndeko
          </Link>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveTab("irregularities");
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 h-12 rounded-lg text-left ${
                activeTab === "irregularities"
                  ? "bg-blue-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <AlertTriangle className="mr-3 h-5 w-5" />
              <span className="font-medium">Irregularities</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("approvals");
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 h-12 rounded-lg text-left ${
                activeTab === "approvals"
                  ? "bg-blue-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <CheckCircle className="mr-3 h-5 w-5" />
              <span className="font-medium">Category Approvals</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("monitoring");
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 h-12 rounded-lg text-left ${
                activeTab === "monitoring"
                  ? "bg-blue-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Eye className="mr-3 h-5 w-5" />
              <span className="font-medium">Tender Monitoring</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("reports");
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 h-12 rounded-lg text-left ${
                activeTab === "reports"
                  ? "bg-blue-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FileText className="mr-3 h-5 w-5" />
              <span className="font-medium">Audit Reports</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("audits");
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 h-12 rounded-lg text-left ${
                activeTab === "audits"
                  ? "bg-blue-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FileText className="mr-3 h-5 w-5" />
              <span className="font-medium">Contracts Monitoring</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("settings");
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 h-12 rounded-lg text-left ${
                activeTab === "settings"
                  ? "bg-blue-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Settings className="mr-3 h-5 w-5" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Sticky Header */}
        <header className="bg-white shadow-sm h-16 z-40 sticky top-0 border-b border-gray-200">
          <div className="px-6 h-full">
            <div className="flex justify-between items-center h-full">
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              <div className="hidden md:block flex-1 mx-4">
                <div className="relative w-full max-w-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Search tenders..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsNotificationMenuOpen(!isNotificationMenuOpen)
                    }
                    className="p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      3
                    </span>
                    <Bell className="h-6 w-6" />
                  </button>
                  {isNotificationMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-2 px-4 border-b">
                        <h3 className="text-sm font-medium">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {/* Notification items */}
                      </div>
                      <div className="py-2 px-4 border-t">
                        <a
                          href="#"
                          className="text-xs text-primary font-medium"
                        >
                          View all notifications
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-sm focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden md:flex md:items-center">
                      <span className="text-gray-700">munashen@praz.gov</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </div>
                  </button>
                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Your Profile
                        </a>
                        <a
                          href="#"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 ">{renderContent()}</main>
      </div>
    </div>
  );
};

const IrregularitiesManagement = () => {
  // State management
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [irregularities, setIrregularities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get authentication headers
  const getAuthHeader = () => {
    const token = Cookies.get("p_at");
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/violations",
          getAuthHeader()
        );
        setIrregularities(response.data);
        setError(null);
      } catch (err) {
        handleApiError(err, "Error fetching irregularities");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // API error handler
  const handleApiError = (error, defaultMessage) => {
    const message = error.response?.data?.detail || defaultMessage;
    setError(message);
    console.error(message, error);
  };

  // Fetch tender details
  const fetchTenderDetails = async (tenderId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/tenders/${tenderId}`,
        getAuthHeader()
      );
      setSelectedTender(response.data);
    } catch (err) {
      handleApiError(err, "Error fetching tender details");
      setSelectedTender(null); // Reset tender data on error
    }
  };

  // Update violation status
  const updateResolutionStatus = async (violationId, status) => {
    try {
      await axios.put(
        `http://localhost:8000/violations/${violationId}`,
        { resolution_status: status },
        getAuthHeader()
      );
      // Refresh data after update
      const response = await axios.get(
        "http://localhost:8000/violations",
        getAuthHeader()
      );
      setIrregularities(response.data);
    } catch (err) {
      handleApiError(err, "Error updating resolution status");
    }
  };

  // Delete violation
  const deleteViolation = async (violationId) => {
    try {
      await axios.delete(
        `http://localhost:8000/violations/${violationId}`,
        getAuthHeader()
      );
      // Filter out deleted violation
      setIrregularities((prev) =>
        prev.filter((item) => item.id !== violationId)
      );
    } catch (err) {
      handleApiError(err, "Error deleting violation");
    }
  };

  // Modal handlers
  const openInvestigationModal = async (tenderId) => {
    try {
      await fetchTenderDetails(tenderId);
      setIsModalOpen(true);
    } catch (error) {
      handleApiError(error, "Failed to open investigation");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTender(null);
  };

  // Filter irregularities
  const filteredIrregularities =
    filterStatus === "all"
      ? irregularities
      : irregularities.filter((item) => item.status === filterStatus);

  // Loading state
  if (loading) {
    return <div className="p-6 text-gray-500">Loading irregularities...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error: {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Irregularities Management
        </h1>

        {/* Filters */}
        <div className="flex space-x-2">
          <div className="relative">
            <select
              className="appearance-none px-4 py-2 pr-8 border rounded-lg bg-white text-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <button className="px-4 py-2 inline-flex items-center border rounded-lg bg-white text-sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
          <h2 className="text-base font-medium text-gray-700">
            Active Irregularities
          </h2>
          <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800">
            {filteredIrregularities.length} issues
          </span>
        </div>

        {/* Irregularities List */}
        <div className="divide-y divide-gray-200">
          {filteredIrregularities.map((irregularity) => (
            <div key={irregularity.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        irregularity.status === "high"
                          ? "bg-red-500"
                          : irregularity.status === "medium"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <span className="font-medium text-gray-900">
                      {irregularity.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      Tender: {irregularity.tender_id}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {irregularity.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <div className="text-gray-500">
                      <span className="font-medium">Reported:</span>
                      {new Date(irregularity.reported_at).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">Status:</span>
                      <span
                        className={`px-2 py-1 rounded ${
                          irregularity.resolution_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {irregularity.resolution_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      openInvestigationModal(irregularity.tender_id)
                    }
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Investigate
                  </button>
                  <button
                    onClick={() =>
                      updateResolutionStatus(irregularity.id, "resolved")
                    }
                    className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-green-700"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => deleteViolation(irregularity.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investigation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Tender Investigation - {selectedTender.tender.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Value</label>
                      <p className="font-medium">
                        {selectedTender.tender.value_currency}{" "}
                        {selectedTender.tender.value_amount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Closing Date
                      </label>
                      <p className="font-medium">
                        {new Date(
                          selectedTender.tender.closing_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <p className="font-medium">
                        {selectedTender.tender.status}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Procurement Method
                      </label>
                      <p className="font-medium">
                        {selectedTender.tender.procurement_method}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Category</label>
                      <p className="font-medium">
                        {selectedTender.tender.category.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Subcategory
                      </label>
                      <p className="font-medium">
                        {selectedTender.tender.subcategory.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        VAT Included
                      </label>
                      <p className="font-medium">
                        {selectedTender.tender.value_added_tax_included
                          ? "Yes"
                          : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Procuring Entity */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Procuring Entity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm">
                        <span className="text-gray-600">Name:</span>{" "}
                        {selectedTender.tender.procuring_entity.user.name}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Contact:</span>{" "}
                        {selectedTender.tender.procuring_entity.contact_name}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Email:</span>{" "}
                        {selectedTender.tender.procuring_entity.contact_email}
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Phone:</span>{" "}
                        {
                          selectedTender.tender.procuring_entity
                            .contact_telephone
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="text-gray-600">Address:</span>{" "}
                        {
                          selectedTender.tender.procuring_entity.user
                            .address_street
                        }
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Region:</span>{" "}
                        {
                          selectedTender.tender.procuring_entity.user
                            .address_region
                        }
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Country:</span>{" "}
                        {
                          selectedTender.tender.procuring_entity.user
                            .address_country
                        }
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Postal Code:</span>{" "}
                        {
                          selectedTender.tender.procuring_entity.user
                            .address_postal_code
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Items List</h3>
                  <div className="divide-y divide-gray-200">
                    {selectedTender.tender.items.map((item) => (
                      <div key={item.id} className="py-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.classification_description}
                            </p>
                          </div>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {item.classification_scheme}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Quantity:</span>{" "}
                            {item.quantity.toLocaleString()} {item.unit_name}
                          </div>
                          <div>
                            <span className="text-gray-600">Unit Code:</span>{" "}
                            {item.unit_code}
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Delivery Date:
                            </span>{" "}
                            {new Date(
                              item.delivery_date_end
                            ).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>{" "}
                            {item.delivery_address_street},{" "}
                            {item.delivery_address_region}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Add flagging logic here
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Flag for Further Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// const IrregularitiesManagement = () => {
//   const [filterStatus, setFilterStatus] = useState("all");

//   const irregularities = [
//     {
//       id: "IRR-2025-001",
//       tender: "TN-2025-0423",
//       title: "Potential bid rigging detected",
//       description: "Multiple bids from companies with same registered address",
//       status: "high",
//       date: "2025-05-06",
//       assignedTo: "munashen@praz.gov",
//     },
//     {
//       id: "IRR-2025-002",
//       tender: "TN-2025-0419",
//       title: "Unusual pricing patterns",
//       description: "Identical pricing across multiple bidders",
//       status: "high",
//       date: "2025-05-05",
//       assignedTo: "munashen@praz.gov",
//     },
//     {
//       id: "IRR-2025-003",
//       tender: "TN-2025-0411",
//       title: "Missing documentation",
//       description: "Required certifications not provided by winning bidder",
//       status: "medium",
//       date: "2025-05-03",
//       assignedTo: "munashen@praz.gov",
//     },
//     {
//       id: "IRR-2025-004",
//       tender: "TN-2025-0407",
//       title: "Conflict of interest concern",
//       description: "Bidder has family connection with procurement officer",
//       status: "medium",
//       date: "2025-05-02",
//       assignedTo: "Maya Patel",
//     },
//     {
//       id: "IRR-2025-005",
//       tender: "TN-2025-0402",
//       title: "Technical compliance issue",
//       description: "Product specifications don't match requirements",
//       status: "low",
//       date: "2025-04-30",
//       assignedTo: "munashen@praz.gov",
//     },
//   ];

//   const filteredIrregularities =
//     filterStatus === "all"
//       ? irregularities
//       : irregularities.filter((item) => item.status === filterStatus);

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-semibold text-gray-900">
//           Irregularities Management
//         </h1>

//         <div className="flex space-x-2">
//           <div className="relative">
//             <select
//               className="appearance-none px-4 py-2 pr-8 border rounded-lg bg-white text-sm focus:outline-none focus:ring-primary focus:border-primary"
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//             >
//               <option value="all">All Priorities</option>
//               <option value="high">High Priority</option>
//               <option value="medium">Medium Priority</option>
//               <option value="low">Low Priority</option>
//             </select>
//             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
//               <ChevronDown className="h-4 w-4" />
//             </div>
//           </div>

//           <button className="px-4 py-2 inline-flex items-center border rounded-lg bg-white text-sm">
//             <Filter className="h-4 w-4 mr-2" />
//             More Filters
//           </button>
//         </div>
//       </div>

//       <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//         <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
//           <h2 className="text-base font-medium text-gray-700">
//             Active Irregularities
//           </h2>
//           <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800">
//             {filteredIrregularities.length} issues
//           </span>
//         </div>

//         <div className="divide-y divide-gray-200">
//           {filteredIrregularities.map((irregularity) => (
//             <div key={irregularity.id} className="px-6 py-4 hover:bg-gray-50">
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center space-x-3">
//                     <div
//                       className={`w-2 h-2 rounded-full ${
//                         irregularity.status === "high"
//                           ? "bg-red-500"
//                           : irregularity.status === "medium"
//                           ? "bg-yellow-500"
//                           : "bg-blue-500"
//                       }`}
//                     ></div>
//                     <span className="font-medium text-gray-900">
//                       {irregularity.id}
//                     </span>
//                     <span className="text-sm text-gray-500">
//                       Tender: {irregularity.tender}
//                     </span>
//                   </div>
//                   <h3 className="mt-1 font-medium">{irregularity.title}</h3>
//                   <p className="mt-1 text-sm text-gray-600">
//                     {irregularity.description}
//                   </p>
//                   <div className="mt-2 flex items-center space-x-4 text-sm">
//                     <div className="text-gray-500">
//                       <span className="font-medium">Reported:</span>{" "}
//                       {irregularity.date}
//                     </div>
//                     <div className="text-gray-500">
//                       <span className="font-medium">Assigned to:</span>{" "}
//                       {irregularity.assignedTo}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex space-x-2">
//                   <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
//                     Investigate
//                   </button>
//                   <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-tertiary">
//                     Take Action
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// Category Approvals Component
const CategoryApprovals = () => {
  const pendingApprovals = [
    {
      id: "APP-2025-001",
      company: "TechSolutions Ltd",
      category: "IT Services",
      subcategories: ["Hardware", "Software Development", "Cloud Services"],
      documents: 5,
      submitted: "2025-05-01",
      status: "pending",
    },
    {
      id: "APP-2025-002",
      company: "Global Construction Co",
      category: "Construction",
      subcategories: ["Commercial Buildings", "Infrastructure"],
      documents: 8,
      submitted: "2025-04-29",
      status: "pending",
    },
    {
      id: "APP-2025-003",
      company: "MediSupply Inc",
      category: "Medical Supplies",
      subcategories: ["Equipment", "Consumables", "Pharmaceuticals"],
      documents: 7,
      submitted: "2025-04-28",
      status: "in_review",
    },
    {
      id: "APP-2025-004",
      company: "EcoFriendly Solutions",
      category: "Environmental Services",
      subcategories: ["Waste Management", "Environmental Consulting"],
      documents: 6,
      submitted: "2025-04-25",
      status: "in_review",
    },
  ];

  const recentlyApproved = [
    {
      id: "APP-2025-000",
      company: "TransGlobal Logistics",
      category: "Logistics & Transport",
      subcategories: ["Freight", "Warehousing"],
      approved: "2025-05-05",
      approvedBy: "munashen@praz.gov",
    },
    {
      id: "APP-2025-001",
      company: "Office Solutions Pro",
      category: "Office Supplies",
      subcategories: ["Furniture", "Stationery", "Equipment"],
      approved: "2025-05-04",
      approvedBy: "munashen@praz.gov",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Category Approvals
        </h1>
        <p className="mt-2 text-gray-600">
          Review and approve supplier category bidding applications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Pending Review</h3>
            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
              {pendingApprovals.filter((a) => a.status === "pending").length}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Awaiting first review
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">In-Process</h3>
            <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {pendingApprovals.filter((a) => a.status === "in_review").length}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Under detailed evaluation
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Approved This Week</h3>
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
              {recentlyApproved.length}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Successfully processed
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            Pending Approvals
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {pendingApprovals.map((approval) => (
            <div key={approval.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {approval.company}
                    </span>
                    <span
                      className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        approval.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {approval.status === "pending" ? "Pending" : "In Review"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Category:</span>{" "}
                    {approval.category}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Subcategories:</span>{" "}
                    {approval.subcategories.join(", ")}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <div className="text-gray-500">
                      <span className="font-medium">Submitted:</span>{" "}
                      {approval.submitted}
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">Documents:</span>{" "}
                      {approval.documents}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Review Docs
                  </button>
                  <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-tertiary">
                    Process
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            Recently Approved
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {recentlyApproved.map((approval) => (
            <div key={approval.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {approval.company}
                    </span>
                    <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Approved
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Category:</span>{" "}
                    {approval.category}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Subcategories:</span>{" "}
                    {approval.subcategories.join(", ")}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <div className="text-gray-500">
                      <span className="font-medium">Approved:</span>{" "}
                      {approval.approved}
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium">By:</span>{" "}
                      {approval.approvedBy}
                    </div>
                  </div>
                </div>

                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TenderMonitoring = () => {
  // State management
  const [viewMode, setViewMode] = useState("active");
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);

  // Get authentication headers
  const getAuthHeader = () => {
    const token = Cookies.get("p_at");
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch tenders from API
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/tenders",
          getAuthHeader()
        );

        // Process the data to match our needs
        const processedData = response.data.map((tender) => ({
          id: tender.id,
          title: tender.title,
          department: tender.category.name,
          value: `${
            tender.value_currency
          } ${tender.value_amount.toLocaleString()}`,
          bids: tender.bids.length,
          published: new Date(tender.date_created).toISOString().split("T")[0],
          deadline: new Date(tender.closing_date).toISOString().split("T")[0],
          status: tender.status,
          risk: calculateRisk(tender),
          rawData: tender, // Keep the raw data for the modal
        }));

        setTenders(processedData);
        setError(null);
      } catch (err) {
        handleApiError(err, "Error fetching tenders");
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  // Calculate risk based on tender data
  const calculateRisk = (tender) => {
    // Example risk calculation logic - customize this based on business rules
    const daysToDeadline = Math.ceil(
      (new Date(tender.closing_date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    const valueAmount = tender.value_amount;

    if (daysToDeadline < 7 && valueAmount > 100000) return "high";
    if (daysToDeadline < 14 || valueAmount > 75000) return "medium";
    return "low";
  };

  // API error handler
  const handleApiError = (error, defaultMessage) => {
    const message = error.response?.data?.detail || defaultMessage;
    setError(message);
    console.error(message, error);
  };

  // Modal handlers
  const openTenderModal = (tender) => {
    setSelectedTender(tender);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTender(null);
  };

  // Filter tenders based on viewMode
  const filteredTenders =
    viewMode === "active"
      ? tenders.filter((t) => t.status === "active" || t.status === "awarded")
      : tenders.filter(
          (t) => t.status === "awarded" || t.status === "completed"
        );

  // Count for the summary cards
  const activeTendersCount = tenders.filter(
    (t) => t.status === "active"
  ).length;
  const evaluationTendersCount = tenders.filter(
    (t) => t.status === "awarded"
  ).length;
  const highRiskTendersCount = tenders.filter((t) => t.risk === "high").length;

  // Loading state
  if (loading) {
    return <div className="p-6 text-gray-500">Loading tenders...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error: {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Tender Monitoring
        </h1>

        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm ${
              viewMode === "active"
                ? "bg-primary text-white"
                : "bg-white border text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setViewMode("active")}
          >
            Active Tenders
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm ${
              viewMode === "completed"
                ? "bg-primary text-white"
                : "bg-white border text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setViewMode("completed")}
          >
            Awarded Tenders
          </button>
        </div>
      </div>

      {viewMode === "active" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Active Tenders</h3>
              <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {activeTendersCount}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500">Open for bidding</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Awarded</h3>
              <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                {evaluationTendersCount}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500">Bids under review</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Completed</h3>
              <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                0
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500">Bids under review</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">High Risk Tenders</h3>
              <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800">
                {highRiskTendersCount}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Requiring close monitoring
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {viewMode === "active"
              ? "Active Tenders Monitoring"
              : "Completed Tenders"}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {viewMode === "active"
              ? "Monitor ongoing procurement processes"
              : "Review completed tender awards"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tender ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Department
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Value
                </th>
                {viewMode === "active" ? (
                  <>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Bids
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Deadline
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Risk
                    </th>
                  </>
                ) : (
                  <>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Bids
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Completed
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Winner
                    </th>
                  </>
                )}
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenders.map((tender) => (
                <tr key={tender.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tender.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tender.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tender.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tender.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tender.bids}
                  </td>
                  {viewMode === "active" ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tender.deadline}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tender.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {tender.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tender.risk === "high"
                              ? "bg-red-100 text-red-800"
                              : tender.risk === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {tender.risk === "high"
                            ? "High"
                            : tender.risk === "medium"
                            ? "Medium"
                            : "Low"}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tender.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tender.winner || "N/A"}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-primary hover:text-tertiary"
                      onClick={() => openTenderModal(tender)}
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tender Details Modal */}
      {isModalOpen && selectedTender && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Tender Details - {selectedTender.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* ... (keep existing basic info fields) */}
                    <div>
                      <label className="text-sm text-gray-600">
                        Evaluation Status
                      </label>
                      <p className="font-medium">
                        {selectedTender.rawData.evaluated
                          ? "Completed"
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Bids Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Bid Evaluations</h3>
                  {selectedTender.rawData.bids?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Supplier
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Awarded
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedTender.rawData.bids.map((bid) => {
                            const award = selectedTender.rawData.awards?.find(
                              (a) => a.bid_id === bid.id
                            );
                            return (
                              <tr key={bid.id}>
                                <td className="px-4 py-2 text-sm">
                                  {award?.supplier?.legal_name || "N/A"}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {selectedTender.rawData.value_currency}{" "}
                                  {bid.bid_amount?.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      award
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {award ? "Awarded" : "Under Review"}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {award?.award_date
                                    ? new Date(
                                        award.award_date
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No bids submitted</p>
                  )}
                </div>

                {/* Enhanced Contracts Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Contract Details</h3>
                  {selectedTender.rawData.contracts?.map((contract) => {
                    const contractText = JSON.parse(contract.contract_text);
                    return (
                      <div key={contract.id} className="mb-6 last:mb-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm">
                              <span className="text-gray-600">Status:</span>{" "}
                              <span className="capitalize">
                                {contract.status}
                              </span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Value:</span>{" "}
                              {selectedTender.rawData.value_currency}{" "}
                              {contract.contract_value?.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="text-gray-600">Signed:</span>{" "}
                              {new Date(
                                contract.contract_date
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Supplier:</span>{" "}
                              {contract.supplier?.legal_name}
                            </p>
                          </div>
                        </div>

                        {contractText && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Contract Terms
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    Effective Date:
                                  </span>{" "}
                                  {contractText.contract_details.effective_date}
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Version:
                                  </span>{" "}
                                  {contractText.contract_details.version}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Scope of Work
                              </h4>
                              <ul className="list-disc pl-5 text-sm">
                                {contractText.scope_of_work?.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Payment Terms
                              </h4>
                              <ul className="list-disc pl-5 text-sm">
                                {contractText.terms_and_conditions
                                  ?.filter((t) => t.clause === "Payment Terms")
                                  ?.map((term, i) => (
                                    <li key={i}>{term.details}</li>
                                  ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Signatories
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Buyer:</span>{" "}
                                  {contractText.signatures?.buyer}
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Supplier:
                                  </span>{" "}
                                  {contractText.signatures?.supplier}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {contract.payments?.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-medium text-sm mb-2">
                              Payment History
                            </h4>
                            <div className="space-y-2">
                              {contract.payments.map((payment) => (
                                <div
                                  key={payment.id}
                                  className="bg-white p-3 rounded border text-sm"
                                >
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <span className="text-gray-600">
                                        Amount:
                                      </span>{" "}
                                      {payment.amount} {payment.currency}
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Status:
                                      </span>{" "}
                                      <span className="capitalize">
                                        {payment.status}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">
                                        Date:
                                      </span>{" "}
                                      {new Date(
                                        payment.created_at
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  {payment.description && (
                                    <div className="mt-1 text-gray-600">
                                      {payment.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90">
                    Export Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Audit Reports Component
const AuditReports = () => {
  const reports = [
    {
      id: "AR-2025-042",
      title: "Q1 Procurement Process Audit",
      type: "Quarterly",
      date: "2025-04-15",
      status: "Final",
      findings: 7,
      recommendations: 5,
      highs: 2,
    },
    {
      id: "AR-2025-035",
      title: "Supplier Verification Analysis",
      type: "Special",
      date: "2025-03-25",
      status: "Final",
      findings: 4,
      recommendations: 4,
      highs: 1,
    },
    {
      id: "AR-2025-023",
      title: "Technology Procurement Review",
      type: "Special",
      date: "2025-02-28",
      status: "Final",
      findings: 9,
      recommendations: 6,
      highs: 3,
    },
    {
      id: "AR-2025-012",
      title: "Emergency Procurement Audit",
      type: "Special",
      date: "2025-01-30",
      status: "Draft",
      findings: 5,
      recommendations: 3,
      highs: 1,
    },
    {
      id: "AR-2025-008",
      title: "Annual Procurement Compliance",
      type: "Annual",
      date: "2025-01-15",
      status: "Final",
      findings: 12,
      recommendations: 8,
      highs: 4,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Audit Reports</h1>

        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-tertiary inline-flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            New Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">5</div>
              <div className="text-sm text-gray-500">Reports this year</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-yellow-100 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">37</div>
              <div className="text-sm text-gray-500">Total findings</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-red-100 p-3">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">11</div>
              <div className="text-sm text-gray-500">High-priority issues</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Audit Reports
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Review and analyze findings from procurement audits
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Report ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Findings
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === "Final"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <span>{report.findings} findings</span>
                      {report.highs > 0 && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {report.highs} high
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-tertiary mr-4">
                      Download
                    </button>
                    <button className="text-primary hover:text-tertiary">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TenderManagement = () => {
  const tenders = [
    {
      value_amount: 156000.0,
      title: "Construction Materials",
      value_currency: "USD",
      closing_date: "2025-06-12T08:53:00",
      status: "active",
      date_modified: "2025-04-29T09:17:14",
      id: "081ac042-ab70-4638-bcb7-a6e9f3705432",
      verified: true,
      cause: "Documentation Verification",
    },
    {
      value_amount: 156000.0,
      title: "Building Construction Materials",
      value_currency: "USD",
      closing_date: "2025-04-30T10:53:00",
      status: "active",
      date_modified: "2025-04-29T11:28:41",
      id: "16e3f1da-f6a9-4624-a99d-6533ebdaf472",
      verified: false,
      cause: "Pending Supplier Verification",
    },
    {
      value_amount: 156000.0,
      title: "Construction Materials",
      value_currency: "USD",
      closing_date: "2025-04-30T10:52:00",
      status: "active",
      date_modified: "2025-04-29T10:53:18",
      id: "220baddc-ed12-43ff-bc0b-d5e848607ed2",
      verified: true,
      cause: "Budget Approved",
    },
    {
      value_amount: 156000.0,
      title: "Construction Materials",
      value_currency: "USD",
      closing_date: "2025-06-12T08:53:00",
      status: "active",
      date_modified: "2025-04-29T09:48:26",
      id: "3f35abc1-9be6-44d7-87ea-7bfbb23bcde5",
      verified: false,
      cause: "Potential Temper",
    },
    {
      value_amount: 156000.0,
      title: "Construction Materials",
      value_currency: "USD",
      closing_date: "2025-06-12T08:53:00",
      status: "active",
      date_modified: "2025-04-29T09:51:07",
      id: "5e6d59e9-b252-49ad-89f5-770afb05afa9",
      verified: true,
      cause: "Compliance Check Passed",
    },
    {
      value_amount: 156000.0,
      title: "Construction Materials",
      value_currency: "USD",
      closing_date: "2025-06-12T08:53:00",
      status: "active",
      date_modified: "2025-04-29T09:47:15",
      id: "be0eda42-d9b9-4747-bb28-3db13e05411e",
      verified: false,
      cause: "Financial Audit Pending",
    },
    {
      value_amount: 156000.0,
      title: "Construction Materials",
      value_currency: "USD",
      closing_date: "2025-03-12T08:53:00",
      status: "active",
      date_modified: "2025-04-29T09:49:15",
      id: "c125cbe9-30fa-48b8-b236-9753c751fa21",
      verified: true,
      cause: "Emergency Approval Granted",
    },
  ];

  // Statistics calculations
  const totalTenders = tenders.length;
  const verifiedCount = tenders.filter((t) => t.verified).length;
  const pendingCount = totalTenders - verifiedCount;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Tender Management
        </h1>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-tertiary inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Tender
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{totalTenders}</div>
              <div className="text-sm text-gray-500">Total Tenders</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{verifiedCount}</div>
              <div className="text-sm text-gray-500">Verified Tenders</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-yellow-100 p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{pendingCount}</div>
              <div className="text-sm text-gray-500">Pending Verification</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Active Tenders
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Tender verification status and management
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Closing Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cause
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenders.map((tender) => (
                <tr key={tender.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tender.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tender.value_currency}{" "}
                    {tender.value_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(tender.closing_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {tender.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tender.verified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tender.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tender.cause}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-tertiary mr-4">
                      Edit
                    </button>
                    <button className="text-primary hover:text-tertiary">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Regulator Settings Component
const RegulatorSettings = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Regulator Settings
        </h1>
        <p className="mt-2 text-gray-600">
          Configure platform regulations and auditing parameters
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Risk Detection Parameters
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure threshold values for automated detection of procurement
            risks
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bid Price Variation Threshold (%)
              </label>
              <input
                type="number"
                className="w-full md:w-1/3 p-2 border rounded-lg"
                placeholder="Enter percentage"
                defaultValue="15"
              />
              <p className="mt-1 text-sm text-gray-500">
                Flag bids with prices varying more than this percentage from
                average
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Required Bidders
              </label>
              <input
                type="number"
                className="w-full md:w-1/3 p-2 border rounded-lg"
                placeholder="Enter number"
                defaultValue="3"
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum number of bidders for a valid tender process
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Blacklist Duration (months)
              </label>
              <input
                type="number"
                className="w-full md:w-1/3 p-2 border rounded-lg"
                placeholder="Enter number"
                defaultValue="24"
              />
              <p className="mt-1 text-sm text-gray-500">
                Duration a supplier remains blacklisted after violations
              </p>
            </div>

            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-tertiary inline-flex items-center">
              Save Parameters
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Compliance Requirements
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure document requirements for supplier approvals
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Tax Compliance Certificate</h4>
                <p className="text-sm text-gray-500">
                  Require valid tax compliance certificates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Business Registration</h4>
                <p className="text-sm text-gray-500">
                  Require valid company registration
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Financial Statements</h4>
                <p className="text-sm text-gray-500">
                  Require audited financial statements
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Anti-Corruption Declaration</h4>
                <p className="text-sm text-gray-500">
                  Require signed anti-corruption declaration
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium">Supplier Code of Conduct</h4>
                <p className="text-sm text-gray-500">
                  Require acceptance of code of conduct
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-tertiary inline-flex items-center">
              Save Requirements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulatorDashboard;
