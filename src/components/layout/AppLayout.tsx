// Keep imports at the top
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard,
  Receipt,
  BarChart3,
  PiggyBank,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Transactions', path: '/transactions', icon: <Receipt className="h-5 w-5" /> },
    { name: 'Scan Receipt', path: '/scan-receipt', icon: <Camera className="h-5 w-5" /> },
    { name: 'Bills', path: '/bills', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
    { name: 'Budgets', path: '/budgets', icon: <PiggyBank className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  // If still loading or not authenticated, show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-background to-background/80">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="h-full flex items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background to-background/80">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-white/10 bg-background/50 backdrop-blur-md">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <span className="text-2xl font-bold text-white">Budget Sage</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all",
                    location.pathname === item.path
                      ? "bg-primary/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="mr-3">{item.icon}</div>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-white/10 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center w-full text-left">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user?.user_metadata?.full_name || user?.email || 'User'}
                      </p>
                      <p className="text-xs text-white/70 truncate max-w-[140px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <span className="text-xl font-bold text-white">Budget Sage</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px] bg-background/95 backdrop-blur-md border-r border-white/10">
              <div className="flex flex-col h-full">
                <div className="flex-1 py-6">
                  <div className="px-2 mb-6">
                    <span className="text-xl font-bold text-white">Budget Sage</span>
                  </div>
                  <nav className="space-y-1 px-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all",
                          location.pathname === item.path
                            ? "bg-primary/20 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="mr-3">{item.icon}</div>
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="border-t border-white/10 p-4">
                  <Button variant="ghost" className="flex items-center w-full text-left" onClick={handleLogout}>
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Log out</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 w-full overflow-hidden">
        {/* Mobile spacing for fixed header */}
        <div className="md:hidden h-16" />
        <main className="h-[calc(100vh-16px)] overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
