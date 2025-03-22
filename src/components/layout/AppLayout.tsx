import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useMobile } from '@/hooks/use-mobile';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  TrendingUp,
  Clock,
  ChevronRight,
  FileText,
  LogOut,
  PieChart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const isMobile = useMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account'
      });
    } catch (error: any) {
      toast({
        title: 'Error logging out',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: <Receipt className="h-5 w-5" />
    },
    {
      name: 'Bills',
      path: '/bills',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Budgets',
      path: '/budgets',
      icon: <PieChart className="h-5 w-5" />
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  const renderMobile = () => (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <header className="w-full gradient-bg py-4 px-6 flex items-center justify-between shadow-lg shadow-black/20 z-10">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => setMenuOpen(true)}>
            <Menu className="h-6 w-6 text-white" />
          </Button>
          <Link to="/dashboard" className="text-2xl font-bold text-white ml-4">
            Budget Sage
          </Link>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-4/5 gradient-bg z-50 transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out shadow-2xl shadow-black/30`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-white">Navigation</span>
            <Button variant="ghost" onClick={() => setMenuOpen(false)}>
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
          <nav className="flex-grow flex flex-col space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-md text-white hover:bg-accent hover:text-accent-foreground ${pathname === item.path ? 'bg-accent text-accent-foreground' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto pb-4">
            <Button variant="ghost" className="justify-start text-white hover:bg-accent hover:text-accent-foreground w-full" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-grow w-full bg-background p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );

  const renderDesktop = () => (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 gradient-bg py-8 px-4 flex flex-col h-screen shadow-2xl shadow-black/30 relative z-10">
        <Link to="/dashboard" className="text-3xl font-bold text-white mb-8">
          Budget Sage
        </Link>
        <nav className="flex-grow flex flex-col space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-md text-white hover:bg-accent hover:text-accent-foreground ${pathname === item.path ? 'bg-accent text-accent-foreground' : ''}`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pb-4">
          <Button variant="ghost" className="justify-start text-white hover:bg-accent hover:text-accent-foreground w-full" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-grow bg-background p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );

  return isMobile ? renderMobile() : renderDesktop();
};

export default AppLayout;
