
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  CreditCard,
  Menu,
  X,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/transactions', label: 'Transactions', icon: <Receipt className="w-5 h-5" /> },
    { path: '/budgets', label: 'Budgets', icon: <PieChart className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-screen gradient-bg text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/20 bg-black/20 glass-effect transition-all duration-300 relative z-20">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2 relative z-30 pointer-events-auto">
            <CreditCard className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-glow">Budget Sage</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                currentPath === item.path
                  ? "bg-primary/20 text-white font-medium border border-white/20 shadow-glow-sm pointer-events-auto relative z-30"
                  : "text-white/80 hover:bg-secondary/20 hover:text-white hover:border hover:border-white/10 pointer-events-auto relative z-30"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {currentPath === item.path && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-lg bg-primary/10 glass-effect border border-white/20 space-y-3">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Monthly Summary</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Income</span>
                <span className="font-medium text-white">$3,450.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expenses</span>
                <span className="font-medium text-white">$2,135.75</span>
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-sm">Savings</span>
              <span className="font-medium text-primary text-glow">$1,314.25</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed md:hidden inset-x-0 top-0 z-50 h-16 border-b border-white/20 bg-black/20 glass-effect">
        <div className="flex items-center justify-between h-full px-4">
          <Link to="/" className="flex items-center space-x-2 relative z-30 pointer-events-auto">
            <CreditCard className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-white text-glow">Budget Sage</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white hover:bg-primary/20 border border-white/20 relative z-50 pointer-events-auto"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-background/50 backdrop-blur-md">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-black/20 glass-effect shadow-xl animate-slide-down">
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <Link to="/" className="flex items-center space-x-2 relative z-30 pointer-events-auto">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <span className="text-lg font-bold text-white text-glow">Budget Sage</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative z-50 pointer-events-auto"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                      currentPath === item.path
                        ? "bg-primary/20 text-white font-medium border border-white/20 shadow-glow-sm pointer-events-auto relative z-30"
                        : "text-white/80 hover:bg-secondary/20 hover:text-white hover:border hover:border-white/10 pointer-events-auto relative z-30"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 mt-auto">
                <div className="p-4 rounded-lg bg-primary/10 glass-effect border border-white/20 space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Last Update</span>
                  </div>
                  <div className="text-sm text-white/80">
                    Today at 2:34 PM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
