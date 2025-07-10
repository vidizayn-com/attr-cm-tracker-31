
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Home, Users, BookOpen, Calendar } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Patients', url: '/patients', icon: Users },
  { title: 'Resources', url: '/resources', icon: BookOpen },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
];

function AppSidebar() {
  const location = useLocation();
  
  return (
    <Sidebar className="border-r border-gray-200 bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border/20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png" 
              alt="ATTR-CM Tracker Logo" 
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>
          <span className="text-sidebar-foreground font-bold text-sm">ATTR-CM Tracker</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url}
                      className={`flex items-center space-x-3 px-4 py-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors ${
                        location.pathname === item.url || location.pathname.includes(item.url) 
                          ? 'text-sidebar-foreground bg-sidebar-accent/30 border-r-2 border-primary' 
                          : ''
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  if (!showNavigation) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
                <h1 className="text-xl font-semibold text-primary">
                  ATTR-CM Patient Management
                </h1>
              </div>
              
              {/* Doctor Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-primary font-semibold text-sm">Dr. Michael Scofield</div>
                  <div className="text-muted-foreground text-xs italic">Cardiologist</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        MS
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg">
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-muted"
                      onClick={handleEditProfile}
                    >
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                      Invite New Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
