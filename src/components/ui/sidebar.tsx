
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMobileDetect } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  PieChart, 
  BarChart4, 
  Settings,
  Receipt
} from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SidebarNavProps {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ className, setOpen, ...props }: SidebarProps) {
  return (
    <div className={cn('pb-12', className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <SidebarNav setOpen={setOpen} />
        </div>
      </div>
    </div>
  );
}

// Define navigation items
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: <ArrowRightLeft className="mr-2 h-4 w-4" />,
  },
  {
    title: 'Bills',
    href: '/bills',
    icon: <Receipt className="mr-2 h-4 w-4" />,
  },
  {
    title: 'Budgets',
    href: '/budgets',
    icon: <PieChart className="mr-2 h-4 w-4" />,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: <BarChart4 className="mr-2 h-4 w-4" />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
];

function SidebarNav({ setOpen }: SidebarNavProps) {
  const location = useLocation();
  const isMobile = useMobileDetect();

  // Handle mobile menu close when clicking a link
  const handleLinkClick = () => {
    if (isMobile && setOpen) {
      setOpen(false);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2">
        <h2 className="mb-6 px-4 text-lg font-semibold tracking-tight">
          Navigation
        </h2>
        {navItems.map((item) => (
          <Link key={item.href} to={item.href} onClick={handleLinkClick}>
            <Button
              variant={location.pathname === item.href ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              {item.icon}
              {item.title}
            </Button>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
}
