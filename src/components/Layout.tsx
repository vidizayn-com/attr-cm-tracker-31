
import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
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
import { Home, Users, BookOpen, FileText, User, Bell, UserCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import ConsentDialog from '@/components/ConsentDialog';
import { strapiGet } from '@/lib/strapiClient';

type DeadlineNotification = {
  patientId: number;
  documentId: string;
  fullName: string;
  reportDeadline: string;
  daysLeft: number;
  isOverdue: boolean;
};

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const allNavigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home, roles: 'all' },
  { title: 'Patients', url: '/patients', icon: Users, roles: 'all' },
  { title: 'Patient Pool', url: '/patients/pool', icon: UserCheck, roles: 'all' },
  { title: 'Resources', url: '/resources', icon: BookOpen, roles: 'all' },
  { title: 'Report Tracker', url: '/report-tracker', icon: FileText, roles: 'all' },
];

function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { currentUser, logout } = useUser();
  const isCardiologist = currentUser?.role === 'Cardiology';

  const navigationItems = allNavigationItems.filter(
    item => item.roles === 'all' || item.roles === currentUser?.role
  );

  // Report deadline notifications from API
  const [deadlineNotifications, setDeadlineNotifications] = useState<DeadlineNotification[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('doctor_token');
    if (!token) return;

    (async () => {
      try {
        const data = await strapiGet<any>('/api/auth/doctor/my-patients');
        const allPatients = [...(data.primaryPatients || []), ...(data.consultingPatients || [])];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deadlines: DeadlineNotification[] = [];
        const seenIds = new Set<number>();

        for (const p of allPatients) {
          if (!p.reportDeadline || p.statu !== 'Follow-up' || seenIds.has(p.id)) continue;
          seenIds.add(p.id);

          const deadline = new Date(p.reportDeadline);
          const diffMs = deadline.getTime() - today.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays <= 20) {
            deadlines.push({
              patientId: p.id,
              documentId: p.documentId,
              fullName: `${p.firstName || ''} ${p.lastName || ''}`.trim() || `Patient #${p.id}`,
              reportDeadline: p.reportDeadline,
              daysLeft: diffDays,
              isOverdue: diffDays < 0,
            });
          }
        }

        // Sort: overdue first, then by closest deadline
        deadlines.sort((a, b) => a.daysLeft - b.daysLeft);
        setDeadlineNotifications(deadlines);
      } catch (e) {
        console.warn('Failed to load deadline notifications:', e);
      }
    })();
  }, []);

  const totalNotifications = deadlineNotifications.length;

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      className={`border-r border-gray-200 bg-[#089bab] transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-[200px]'
        }`}
      collapsible="icon"
    >
      <SidebarHeader className="p-2 sm:p-4 border-b border-white/20">
        <div className="flex flex-col items-center space-y-1 sm:space-y-2">
          <div className={`${isCollapsed ? 'w-8 h-8' : 'w-[160px] h-12'} flex items-center justify-center transition-all duration-300`}>
            <img
              src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png"
              alt="ATTR-CM Tracker Logo"
              className={`${isCollapsed ? 'w-6 h-6' : 'w-full h-full'} object-contain filter brightness-0 invert transition-all duration-300`}
            />
          </div>
          {!isCollapsed && (
            <span className="text-white font-bold text-xs sm:text-sm text-center">ATTR-CM Tracker</span>
          )}
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
                      className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 ${isCollapsed ? 'text-sm' : 'text-base sm:text-lg'} ${location.pathname === item.url || location.pathname.includes(item.url)
                        ? 'text-white bg-white/20 border-r-2 border-white'
                        : ''
                        }`}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} flex-shrink-0`} />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 sm:p-3 border-t border-white/20">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
              <AvatarFallback className="bg-white/20 text-white font-bold text-xs">
                {currentUser?.avatarFallback || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-xs truncate">{currentUser?.name || 'User'}</div>
              <div className="text-white/70 text-xs italic">{currentUser?.role || ''}</div>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative text-white/80 hover:text-white p-1 mr-1 flex-shrink-0">
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

                {deadlineNotifications.length > 0 ? (
                  deadlineNotifications.map((n) => (
                    <DropdownMenuItem
                      key={n.patientId}
                      className="cursor-pointer hover:bg-muted p-3"
                      onClick={() => navigate(`/patients/${n.documentId || n.patientId}`)}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isOverdue ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{n.fullName}</div>
                          <div className={`text-xs ${n.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                            {n.isOverdue
                              ? `Report overdue by ${Math.abs(n.daysLeft)} day(s)`
                              : `Report due in ${n.daysLeft} day(s)`}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Deadline: {new Date(n.reportDeadline).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-1 ${n.isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No deadline notifications
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-white/80 hover:text-white p-1 flex-shrink-0">
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
                {currentUser?.canInvite && (
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                    Invite New Member
                  </DropdownMenuItem>
                )}

                <div className="border-t border-border my-1"></div>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-muted text-red-600"
                  onClick={logout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-white/20 text-white font-bold text-xs">
                {currentUser?.avatarFallback || '?'}
              </AvatarFallback>
            </Avatar>

            {/* Collapsed notifications and user menu */}
            <div className="flex flex-col items-center space-y-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative text-white/80 hover:text-white p-1">
                    <Bell className="w-4 h-4" />
                    {totalNotifications > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs bg-red-500 hover:bg-red-500 text-white border-0 rounded-full flex items-center justify-center"
                      >
                      </Badge>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-card border border-border shadow-lg">
                  <div className="p-3 border-b border-border">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>

                  {deadlineNotifications.length > 0 ? (
                    deadlineNotifications.map((n) => (
                      <DropdownMenuItem
                        key={n.patientId}
                        className="cursor-pointer hover:bg-muted p-3"
                        onClick={() => navigate(`/patients/${n.documentId || n.patientId}`)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isOverdue ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{n.fullName}</div>
                            <div className={`text-xs ${n.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                              {n.isOverdue
                                ? `Report overdue by ${Math.abs(n.daysLeft)} day(s)`
                                : `Report due in ${n.daysLeft} day(s)`}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Deadline: {new Date(n.reportDeadline).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                          <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-1 ${n.isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      No deadline notifications
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
                <DropdownMenuContent align="start" className="w-48 bg-card border border-border shadow-lg">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-muted"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  {currentUser?.canInvite && (
                    <DropdownMenuItem className="cursor-pointer hover:bg-muted">
                      Invite New Member
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  const isMobile = useIsMobile();

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

        <div className="flex-1 min-w-0">
          {/* Mobile header with trigger */}
          {isMobile && (
            <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <SidebarTrigger className="text-foreground" />
                <div className="flex items-center space-x-2">
                  <img
                    src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png"
                    alt="ATTR-CM Tracker Logo"
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-primary font-bold text-sm">ATTR-CM Tracker</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="bg-background">
            {children}
          </main>
        </div>
      </div>
      <ConsentDialog />
    </SidebarProvider>
  );
};

export default Layout;
