import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Users,
  Briefcase,
  FileText,
  Truck,
  DollarSign,
  Archive,
  LogOut,
  UserCheck,
} from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/services', label: 'Services', icon: DollarSign },
  { to: '/expenses', label: 'Expenses', icon: Archive },
  { to: '/users', label: 'Users', icon: UserCheck },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const { user, logout } = useAuth();
  const loc = useLocation();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <div className="flex h-full">
        <aside className="w-64 bg-white border-r h-full fixed left-0 top-0 flex flex-col z-30">
          <div className="p-5 border-b">
            <div className="flex flex-col items-start">
              <img
                src="/logo.jpeg"
                alt="AAL Logo"
                className="w-24 h-24 object-contain mb-3"
              />
              <div className="text-xl font-bold text-sky-700">AAL Invoice</div>
              <div className="text-sm text-slate-500">Operations Dashboard</div>
            </div>
          </div>
          <nav className="p-4 flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active =
                  loc.pathname === item.to ||
                  (item.to !== '/' && loc.pathname.startsWith(item.to));
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center gap-3 px-3 py-2 rounded ${
                        active
                          ? 'bg-sky-50 text-sky-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-slate-600 hover:text-red-600 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 ml-64 flex flex-col h-full">
          <header className="bg-white border-b fixed top-0 right-0 left-64 z-20">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
              <div />
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">
                  Signed in as{' '}
                  <span className="font-medium">
                    {user?.email || 'admin@example.com'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pt-16 p-6 max-w-6xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
