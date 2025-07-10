
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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Home, Users, BookOpen, FileText, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Patients', url: '/patients', icon: Users },
  { title: 'Resources', url: '/resources', icon: BookOpen },
  { title: 'Report Tracker', url: '/report-tracker', icon: FileText },
];

function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };
  
  return (
    <Sidebar className="border-r border-gray-200 bg-[#089bab] w-[200px]">
      <SidebarHeader className="p-4 border-b border-white/20">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-[160px] h-12 flex items-center justify-center">
            <img 
              src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png" 
              alt="ATTR-CM Tracker Logo" 
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>
          <span className="text-white font-bold text-sm text-center">ATTR-CM Tracker</span>
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
                      className={`flex items-center space-x-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 transition-colors text-lg ${
                        location.pathname === item.url || location.pathname.includes(item.url) 
                          ? 'text-white bg-white/20 border-r-2 border-white' 
                          : ''
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-white/20">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-white/20 text-white font-bold text-xs">
              MS
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-xs truncate">Dr. Michael Scofield</div>
            <div className="text-white/70 text-xs italic">Cardiologist</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-white/80 hover:text-white p-1">
                <User className="w-4 h-4" />
              </button>
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
      </SidebarFooter>
    </Sidebar>
  );
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
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
        
        <div className="flex-1">
          {/* Main Content */}
          <main className="bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
