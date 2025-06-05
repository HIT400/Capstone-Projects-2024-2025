import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Trash2,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  Calendar,
  FileText,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import Header from "../../components/both/Header";
import Footer from "../../components/public/Footer";

const NotificationsPage = ({ user_type = "supplier" }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    types: [],
    read: null,
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10;

  // Notification types with icons
  const notificationTypes = [
    { value: "tender", label: "Tenders", icon: <FileText size={16} /> },
    { value: "bid", label: "Bids", icon: <DollarSign size={16} /> },
    { value: "contract", label: "Contracts", icon: <FileText size={16} /> },
    { value: "system", label: "System", icon: <Info size={16} /> },
    { value: "alert", label: "Alerts", icon: <AlertCircle size={16} /> },
    { value: "reminder", label: "Reminders", icon: <Calendar size={16} /> },
  ];

  // Get notification type icon
  const getNotificationIcon = (type) => {
    const typeObj = notificationTypes.find((t) => t.value === type);
    return typeObj ? typeObj.icon : <Bell size={16} />;
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await axios.get("http://localhost:8000/notifications", { withCredentials: true });

      // Mock data
      const mockData = Array(30)
        .fill()
        .map((_, i) => {
          const types = [
            "tender",
            "bid",
            "contract",
            "system",
            "alert",
            "reminder",
          ];
          const randomType = types[Math.floor(Math.random() * types.length)];
          const randomRead = Math.random() > 0.3;
          const randomDate = new Date();
          randomDate.setDate(
            randomDate.getDate() - Math.floor(Math.random() * 30)
          );

          let title, message;

          switch (randomType) {
            case "tender":
              title = "New Tender Available";
              message = `A new tender matching your profile has been posted: Tender #${
                10000 + i
              }`;
              break;
            case "bid":
              title = "Bid Status Update";
              message = `Your bid on Tender #${
                10000 + Math.floor(Math.random() * 100)
              } has been ${Math.random() > 0.5 ? "accepted" : "updated"}`;
              break;
            case "contract":
              title = "Contract Update";
              message = `Contract #${
                2000 + Math.floor(Math.random() * 100)
              } has been ${Math.random() > 0.5 ? "signed" : "updated"}`;
              break;
            case "system":
              title = "System Notification";
              message =
                "The t3ndeko platform will undergo maintenance this weekend";
              break;
            case "alert":
              title = "Important Alert";
              message = `Deadline approaching for Tender #${
                10000 + Math.floor(Math.random() * 100)
              }`;
              break;
            case "reminder":
              title = "Reminder";
              message = `Don't forget to complete your profile to improve your tender matches`;
              break;
            default:
              title = "Notification";
              message = "You have a new notification";
          }

          return {
            id: i + 1,
            title,
            message,
            type: randomType,
            read: randomRead,
            timestamp: randomDate.toISOString(),
            details: {
              sender:
                randomType === "system"
                  ? "t3ndeko System"
                  : "Procurement Office",
              reference:
                randomType === "tender"
                  ? `Tender #${10000 + i}`
                  : randomType === "bid"
                  ? `Bid #${5000 + i}`
                  : randomType === "contract"
                  ? `Contract #${2000 + i}`
                  : null,
              deadline:
                randomType === "tender" || randomType === "bid"
                  ? new Date(
                      new Date().setDate(new Date().getDate() + 14)
                    ).toISOString()
                  : null,
              link:
                randomType === "tender"
                  ? `/public/tender/${10000 + i}`
                  : randomType === "bid"
                  ? `/suppliers/bids/${5000 + i}`
                  : randomType === "contract"
                  ? `/suppliers/contracts/${2000 + i}`
                  : null,
            },
          };
        });

      setNotifications(mockData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Failed to load notifications. Please try again later.");
      setLoading(false);
    }
  };

  const handleSelectTab = (tab) => {
    setSelectedTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const toggleFilter = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = () => {
    setShowFilters(false);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      types: [],
      read: null,
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleTypeFilterToggle = (type) => {
    if (filters.types.includes(type)) {
      setFilters({
        ...filters,
        types: filters.types.filter((t) => t !== type),
      });
    } else {
      setFilters({ ...filters, types: [...filters.types, type] });
    }
  };

  const handleReadFilterChange = (value) => {
    setFilters({ ...filters, read: value });
  };

  const markAsRead = async (notificationId) => {
    try {
      // In a real app, update on the server
      // await axios.post(`http://localhost:8000/notifications/${notificationId}/read`, {}, { withCredentials: true });

      // Update local state
      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      if (selectedNotification?.id === notificationId) {
        setSelectedNotification({ ...selectedNotification, read: true });
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real app, update on the server
      // await axios.post('http://localhost:8000/notifications/mark-all-read', {}, { withCredentials: true });

      // Update local state
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );

      if (selectedNotification) {
        setSelectedNotification({ ...selectedNotification, read: true });
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // In a real app, delete on the server
      // await axios.delete(`http://localhost:8000/notifications/${notificationId}`, { withCredentials: true });

      // Update local state
      setNotifications(
        notifications.filter((notif) => notif.id !== notificationId)
      );

      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      // In a real app, delete on the server
      // await axios.delete('http://localhost:8000/notifications', { withCredentials: true });

      // Update local state
      setNotifications([]);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const closeNotificationDetail = () => {
    setSelectedNotification(null);
  };

  // Filter notifications based on all criteria
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by tab
    if (selectedTab === "unread" && notification.read) return false;

    // Filter by search
    if (
      searchQuery &&
      !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by date range
    if (
      filters.fromDate &&
      new Date(notification.timestamp) < new Date(filters.fromDate)
    )
      return false;
    if (
      filters.toDate &&
      new Date(notification.timestamp) > new Date(filters.toDate)
    )
      return false;

    // Filter by type
    if (filters.types.length > 0 && !filters.types.includes(notification.type))
      return false;

    // Filter by read status
    if (filters.read !== null) {
      if (filters.read && !notification.read) return false;
      if (!filters.read && notification.read) return false;
    }

    return true;
  });

  // Pagination
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );
  const totalPages = Math.ceil(
    filteredNotifications.length / notificationsPerPage
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return (
        date.toLocaleDateString([], {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
        ` at ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    }
  };

  return (
    <>
      <Header user_type={user_type} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Left Column - Notification List */}
          <div
            className={`w-full ${
              selectedNotification
                ? "hidden md:block md:w-1/2 lg:w-3/5"
                : "md:w-full"
            }`}
          >
            {/* Tabs and Actions */}
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div className="flex space-x-4 mb-4 md:mb-0">
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedTab === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => handleSelectTab("all")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    selectedTab === "unread"
                      ? "bg-primary text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => handleSelectTab("unread")}
                >
                  Unread
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                  disabled={!filteredNotifications.some((n) => !n.read)}
                >
                  <Check size={14} className="mr-1" />
                  Mark all as read
                </button>
                <button
                  onClick={deleteAllNotifications}
                  className="flex items-center px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                  disabled={filteredNotifications.length === 0}
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete all
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="relative flex-grow">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search notifications"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <button
                  onClick={toggleFilter}
                  className={`ml-2 p-2 rounded-lg border ${
                    showFilters ? "bg-primary text-white" : "border-gray-200"
                  }`}
                >
                  <Filter size={16} />
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                  <h3 className="font-medium mb-3">Filter Notifications</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) =>
                          handleFilterChange("fromDate", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) =>
                          handleFilterChange("toDate", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1">
                      Notification Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {notificationTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleTypeFilterToggle(type.value)}
                          className={`flex items-center px-3 py-1 rounded-full text-sm ${
                            filters.types.includes(type.value)
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {type.icon}
                          <span className="ml-1">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1">
                      Read Status
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReadFilterChange(null)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          filters.read === null
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => handleReadFilterChange(false)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          filters.read === false
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Unread
                      </button>
                      <button
                        onClick={() => handleReadFilterChange(true)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          filters.read === true
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Read
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Reset
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">
                  No notifications found
                </h3>
                <p className="text-gray-500 mt-2">
                  {selectedTab === "unread"
                    ? "You've read all your notifications"
                    : searchQuery ||
                      filters.fromDate ||
                      filters.toDate ||
                      filters.types.length > 0 ||
                      filters.read !== null
                    ? "Try changing your filters"
                    : "You don't have any notifications yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white border border-gray-200 rounded-lg divide-y">
                  {currentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 flex items-start hover:bg-gray-50 cursor-pointer ${
                        !notification.read ? "bg-blue-50" : ""
                      } ${
                        selectedNotification?.id === notification.id
                          ? "border-l-4 border-primary"
                          : ""
                      }`}
                      onClick={() => handleViewNotification(notification)}
                    >
                      <div
                        className={`mr-3 p-2 rounded-full ${
                          notification.type === "alert"
                            ? "bg-red-100 text-red-500"
                            : notification.type === "system"
                            ? "bg-gray-100 text-gray-500"
                            : notification.type === "tender"
                            ? "bg-green-100 text-green-500"
                            : notification.type === "bid"
                            ? "bg-blue-100 text-blue-500"
                            : notification.type === "contract"
                            ? "bg-purple-100 text-purple-500"
                            : "bg-yellow-100 text-yellow-500"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h3
                            className={`font-medium ${
                              !notification.read
                                ? "text-black"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-2">
                              {formatDate(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstNotification + 1}-
                      {Math.min(
                        indexOfLastNotification,
                        filteredNotifications.length
                      )}{" "}
                      of {filteredNotifications.length}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className={`p-2 rounded-full ${
                          currentPage === 1
                            ? "text-gray-300"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-full ${
                                currentPage === page
                                  ? "bg-primary text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-full ${
                          currentPage === totalPages
                            ? "text-gray-300"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Notification Detail */}
          {selectedNotification && (
            <div className="w-full md:w-1/2 lg:w-2/5 bg-white border border-gray-200 rounded-lg h-fit sticky top-6">
              <div className="p-4 border-b flex justify-between items-center">
                <button
                  onClick={closeNotificationDetail}
                  className="md:hidden flex items-center text-gray-600"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back
                </button>
                <h2 className="font-medium hidden md:block">
                  Notification Details
                </h2>
                <div className="flex space-x-2">
                  {!selectedNotification.read && (
                    <button
                      onClick={() => markAsRead(selectedNotification.id)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(selectedNotification.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={closeNotificationDetail}
                    className="p-2 text-gray-500 hover:bg-gray-50 rounded-full md:hidden"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm mb-4 ${
                    selectedNotification.type === "alert"
                      ? "bg-red-100 text-red-500"
                      : selectedNotification.type === "system"
                      ? "bg-gray-100 text-gray-500"
                      : selectedNotification.type === "tender"
                      ? "bg-green-100 text-green-500"
                      : selectedNotification.type === "bid"
                      ? "bg-blue-100 text-blue-500"
                      : selectedNotification.type === "contract"
                      ? "bg-purple-100 text-purple-500"
                      : "bg-yellow-100 text-yellow-500"
                  }`}
                >
                  {getNotificationIcon(selectedNotification.type)}
                  <span className="ml-1 capitalize">
                    {selectedNotification.type}
                  </span>
                </div>

                <h3 className="text-xl font-medium mb-2">
                  {selectedNotification.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedNotification.message}
                </p>

                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Received:</span>
                    <span>{formatDate(selectedNotification.timestamp)}</span>
                  </div>

                  {selectedNotification.details.sender && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">From:</span>
                      <span>{selectedNotification.details.sender}</span>
                    </div>
                  )}

                  {selectedNotification.details.reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reference:</span>
                      <span>{selectedNotification.details.reference}</span>
                    </div>
                  )}

                  {selectedNotification.details.deadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deadline:</span>
                      <span>
                        {formatDate(selectedNotification.details.deadline)}
                      </span>
                    </div>
                  )}
                </div>

                {selectedNotification.details.link && (
                  <div className="mt-6">
                    <Link
                      to={selectedNotification.details.link}
                      className="block w-full bg-primary text-white py-2 px-4 rounded text-center hover:bg-secondary"
                    >
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotificationsPage;
