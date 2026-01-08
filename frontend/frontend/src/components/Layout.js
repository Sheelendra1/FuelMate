import React from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Fuel,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Users,
  Package,
  Settings,
  QrCode
} from 'lucide-react';
import { cn } from '../lib/utils';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  if (!user) {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const customerNavItems = [
    {
      section: 'MENU',
      items: [
        { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/app/orders', icon: Package, label: 'My Orders' },
        { to: '/app/transactions', icon: Fuel, label: 'Transactions' },

        { to: '/app/referral', icon: Users, label: 'Refer & Earn' },
        { to: '/app/support', icon: MessageSquare, label: 'Support' }
      ]
    }
  ];

  const adminNavItems = [
    {
      section: 'DASHBOARD',
      items: [
        { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' }
      ]
    },
    {
      section: 'MANAGEMENT',
      items: [
        { to: '/app/admin/orders', icon: Package, label: 'Orders' },
        { to: '/app/admin/scan-qr', icon: QrCode, label: 'Scan QR' },
        { to: '/app/admin/customers', icon: Users, label: 'Customers' },
        { to: '/app/admin/fuel-prices', icon: Fuel, label: 'Fuel Prices' },
        { to: '/app/admin/support', icon: MessageSquare, label: 'Support Tickets' }
      ]
    },
    {
      section: 'TRANSACTIONS',
      items: [
        { to: '/app/transactions', icon: Fuel, label: 'Transactions' },

      ]
    }
  ];

  const currentNavItems = user?.role === 'admin' ? adminNavItems : customerNavItems;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div
              onClick={() => navigate('/app/dashboard')}
              className="cursor-pointer flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Fuel className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold hidden sm:inline">FuelMate</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/app/notifications')}
              className="relative p-2 hover:bg-muted rounded-lg transition group"
            >
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition"
              >
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      navigate('/app/profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition flex items-center gap-2 text-sm text-foreground"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/app/support');
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition flex items-center gap-2 text-sm text-foreground"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Help & Support
                  </button>
                  <button
                    onClick={() => {
                      navigate('/app/settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition flex items-center gap-2 text-sm text-foreground"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="border-t border-border my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition flex items-center gap-2 text-sm text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:static lg:translate-x-0 top-16 lg:top-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="h-[calc(100vh-64px)] lg:h-[calc(100vh-73px)] overflow-y-auto px-3 py-6 space-y-6">
            {currentNavItems.map((group, idx) => (
              <div key={idx}>
                {group.section && (
                  <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    {group.section}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.to);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.to}
                        onClick={() => {
                          navigate(item.to);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 rounded-lg flex items-center gap-3 transition font-medium text-sm",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20 top-16"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;