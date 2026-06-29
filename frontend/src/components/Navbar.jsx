import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Menu, User, Settings, LogOut, MessageSquare, CalendarCheck, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/enquiries')) return 'Enquiries & Leads';
    if (path.startsWith('/bookings')) return 'Bookings & Contracts';
    if (path.startsWith('/customers')) return 'Customer Directory';
    if (path.startsWith('/calendar')) return 'Event Calendar';
    if (path.startsWith('/employees')) return 'Employee Directory';
    if (path.startsWith('/settings')) return 'Settings & Profile';
    return 'Event CRM';
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <CalendarCheck className="w-4 h-4 text-emerald-400" />;
      case 'enquiry':
        return <FileText className="w-4 h-4 text-brand-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <header className="h-16 bg-dark-900/50 border-b border-dark-800/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-dark-400 hover:text-dark-200 rounded-lg hover:bg-dark-800/50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white tracking-tight lg:text-xl">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 text-dark-400 hover:text-dark-200 rounded-xl hover:bg-dark-800/50 border border-transparent hover:border-dark-800/80 transition-all ${
              showNotifications ? 'bg-dark-800/50 border-dark-800/85 text-dark-200' : ''
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-dark-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-dark-900 border border-dark-800/80 rounded-2xl shadow-xl shadow-black/40 overflow-hidden z-50 animate-slide-down">
              <div className="px-4 py-3 bg-dark-950/60 border-b border-dark-800/60 flex items-center justify-between">
                <span className="text-xs font-bold text-dark-300 uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-dark-800/40">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-dark-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id || notif._id}
                      onClick={() => markAsRead(notif.id || notif._id)}
                      className={`p-4 hover:bg-dark-850/40 transition-colors cursor-pointer flex gap-3 ${
                        !notif.isRead ? 'bg-brand-500/5' : ''
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 bg-dark-800 border border-dark-750 rounded-lg h-fit">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className={`text-xs font-semibold text-dark-100 ${!notif.isRead ? 'text-white' : ''}`}>
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-dark-400 mt-1 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-dark-500 mt-1 block font-medium">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-dark-800/40 border border-transparent hover:border-dark-800/80 rounded-xl transition-all"
          >
            <img
              src={user?.avatar ? `http://localhost:5000${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=8b5cf6&color=fff`}
              alt={user?.name}
              className="w-8 h-8 rounded-xl object-cover border border-dark-850"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-dark-900 border border-dark-800/80 rounded-2xl shadow-xl shadow-black/40 overflow-hidden z-50 animate-slide-down">
              <div className="px-4 py-3 bg-dark-950/40 border-b border-dark-800/60">
                <p className="text-xs text-dark-400 font-medium">Signed in as</p>
                <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="p-1.5 border-t border-dark-800/40 bg-dark-950/10">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
