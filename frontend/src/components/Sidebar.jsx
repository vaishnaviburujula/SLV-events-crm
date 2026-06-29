import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  Users,
  Calendar,
  UserCheck,
  Settings,
  LogOut,
  X,
  Crown
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Enquiries', path: '/enquiries', icon: FileText },
    { name: 'Bookings', path: '/bookings', icon: CalendarCheck },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
  ];

  links.push({ name: 'Employees', path: '/employees', icon: UserCheck });

  links.push({ name: 'Profile & Settings', path: '/settings', icon: Settings });

  const activeStyle = 'bg-brand-600/20 border-brand-500 text-brand-400 shadow-md shadow-brand-500/5';
  const inactiveStyle = 'border-transparent text-dark-400 hover:text-dark-200 hover:bg-dark-800/30';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-dark-900 border-r border-dark-800/60 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-dark-800/60 bg-dark-950/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-lg shadow-lg shadow-brand-500/20">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">
                SLV<span className="text-brand-500">EVENTS</span>
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-dark-400 hover:text-dark-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 mx-4 my-3 bg-dark-950/50 border border-dark-850 rounded-2xl flex items-center gap-3">
            <div className="relative">
              <img
                src={user?.avatar ? `http://localhost:5000${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=8b5cf6&color=fff`}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border border-dark-800"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-dark-900 rounded-full"></span>
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-dark-100 truncate">{user?.name}</h4>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">
                {user?.role}
              </span>
            </div>
          </div>

          <nav className="px-4 py-2 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl border-l-2 text-sm font-medium transition-all ${
                    isActive ? activeStyle : inactiveStyle
                  }`
                }
                end={link.path === '/'}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-dark-800/60 bg-dark-950/20">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
