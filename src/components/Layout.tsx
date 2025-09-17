
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
import { Home, Users, BookOpen, FileText, User, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  // Notification data - could be fetched from API
  const notifications = {
    patientPool: 5, // Havuzda bekleyen hasta sayısı
    upcomingReports: 3 // Rapor tarihi yaklaşan hasta sayısı
  };

  const totalNotifications = notifications.patientPool + notifications.upcomingReports;

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
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative text-white/80 hover:text-white p-1 mr-1">
                <Bell className="w-4 h-4" />
                {totalNotifications > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 hover:bg-red-500 text-white border-0 rounded-full flex items-center justify-center"
                  >
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                  </Badge>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-card border border-border shadow-lg">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              
              {notifications.patientPool > 0 && (
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-muted p-3"
                  onClick={() => navigate('/patients/pool')}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Patients in Pool</div>
                      <div className="text-xs text-muted-foreground">
                        {notifications.patientPool} patients waiting for specialist assignment
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {notifications.patientPool}
                    </Badge>
                  </div>
                </DropdownMenuItem>
              )}
              
              {notifications.upcomingReports > 0 && (
                <DropdownMenuItem className="cursor-pointer hover:bg-muted p-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Upcoming Reports</div>
                      <div className="text-xs text-muted-foreground">
                        {notifications.upcomingReports} patients with reports due soon
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {notifications.upcomingReports}
                    </Badge>
                  </div>
                </DropdownMenuItem>
              )}
              
              {totalNotifications === 0 && (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No new notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
