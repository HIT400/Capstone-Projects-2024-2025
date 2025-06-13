import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, Bell, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

const NotificationsComponent = ({ user_type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotification, setNewNotification] = useState({
    id: "1",
    title: "New Tender",
    message: "A new tender matching your profile has been posted.",
    read: false,
    timestamp: "2025-05-05T10:30:00Z",
    user_id: "user",
  });
  const socketRef = useRef(null);

  useEffect(() => {
    if (user_type !== "None") {
      fetchNotifications();
      initializeWebSocket();
    }

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [user_type]);

  const initializeWebSocket = () => {
    if (socketRef.current) socketRef.current.close();

    const token = Cookies.get("p_at");
    if (!token) return;

    const socket = new WebSocket(`ws://localhost:8000/nots`);
    socket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      handleNewNotification(notification);
    };

    socketRef.current = socket;
  };

  const fetchNotifications = async () => {
    try {
      const token = Cookies.get("p_at");
      const response = await axios.get(`http://localhost:8000/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(response.data);
      setUnreadCount(response.data.filter((notif) => !notif.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    setNewNotification(notification);
    setTimeout(() => setNewNotification(null), 5000);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(
        `http://localhost:8000/notifications/${notificationId}/read`
      );
      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`http://localhost:8000/notifications/mark-all-read`);
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-600 hover:text-gray-900"
      >
        <Bell size={30} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg py-2 z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-2 text-gray-500 text-center">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-2 border-b hover:bg-gray-50 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t text-center">
            <Link
              to={`/${user_type.toLowerCase()}s/notifications`}
              className="text-xs text-primary hover:underline"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}

      {newNotification && (
        <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50 animate-fade-in">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{newNotification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {newNotification.message}
              </p>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setNewNotification(null)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Header = ({ user_type = "None" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getUserLink = (user_type) => {
    const routes = {
      supplier: "/suppliers",
      procurer: "/procurers",
    };
    return routes[user_type] || "/public";
  };

  const logout = async () => {
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
    <header className="border-b border-gray-200 py-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link
              to={getUserLink(user_type)}
              className="text-2xl font-bold flex items-center"
            >
              <img
                src="/CoatOfArms.png"
                alt="icon"
                className="w-[1em] h-[1em] ml-1"
              />
              t<span className="text-primary">3</span>ndeko
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden ml-auto p-2 text-gray-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className="hidden md:flex space-x-8 ml-12">
            {user_type === "supplier" ? (
              <>
                <Link
                  to="/suppliers/bids"
                  className="text-gray-600 hover:text-gray-900"
                >
                  My Bids
                </Link>
                <Link
                  to="/suppliers/contracts"
                  className="text-gray-600 hover:text-gray-900"
                >
                  My Contracts
                </Link>
              </>
            ) : user_type === "procurer" ? (
              <>
                <Link
                  to="/procurers/create/tender"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Create Tender
                </Link>
                <Link
                  to="/procurer/me/tenders"
                  className="text-gray-600 hover:text-gray-900"
                >
                  My Tenders
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/public/news"
                  className="text-gray-600 hover:text-gray-900"
                >
                  News
                </Link>
                <Link
                  to="/public/market"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Market
                </Link>
              </>
            )}
            <Link
              to="/public/infobox"
              className="text-gray-600 hover:text-gray-900"
            >
              Infobox
            </Link>
            <Link to="/exam" className="text-gray-600 hover:text-gray-900">
              Exam
            </Link>
            <Link
              to="/localisation"
              className="text-gray-600 hover:text-gray-900"
            >
              Localisation
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-6">
            {user_type !== "None" && (
              <NotificationsComponent user_type={user_type} />
            )}

            <div className="text-right">
              <div className="text-sm text-gray-600">Customer support:</div>
              <div className="font-medium">0-800-503-400</div>
            </div>

            <div className="relative">
              {user_type === "None" ? (
                <button
                  onClick={() => navigate("/auth/login")}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm focus:outline-none"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden md:flex md:items-center">
                    <span className="text-gray-700">
                      {user_type}@example.com
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </div>
                </button>
              )}

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg py-2 z-50">
                  <Link
                    to={`/${user_type}s/settings`}
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <Link
                    to={`/${user_type}s/profile`}
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/help"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    Help
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              {user_type === "supplier" ? (
                <>
                  <Link
                    to="/suppliers/bids"
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    My Bids
                  </Link>
                  <Link
                    to="/suppliers/contracts"
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    My Contracts
                  </Link>
                </>
              ) : user_type === "procurer" ? (
                <>
                  <Link
                    to="/procurers/create/tender"
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    Create Tender
                  </Link>
                  <Link
                    to="/procurer/me/tenders"
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    My Tenders
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/public/news"
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    News
                  </Link>
                  <Link
                    to="/public/market"
                    className="block text-gray-600 hover:text-gray-900"
                  >
                    Market
                  </Link>
                </>
              )}
              <Link
                to="/public/infobox"
                className="block text-gray-600 hover:text-gray-900"
              >
                Infobox
              </Link>
              <Link
                to="/exam"
                className="block text-gray-600 hover:text-gray-900"
              >
                Exam
              </Link>
              <Link
                to="/localisation"
                className="block text-gray-600 hover:text-gray-900"
              >
                Localisation
              </Link>
            </nav>

            <div className="flex justify-between items-center">
              <div className="text-right">
                <div className="text-sm text-gray-600">Customer support:</div>
                <div className="font-medium">0-800-503-400</div>
              </div>

              {user_type === "None" ? (
                <button
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-tertiary"
                  onClick={() => navigate("/auth/register")}
                >
                  Sign up
                </button>
              ) : (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
                >
                  Account
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
