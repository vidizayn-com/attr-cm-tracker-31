
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
import { Home, Users, BookOpen, FileText, User, Bell, UserCheck, AlertTriangle, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import ConsentDialog from '@/components/ConsentDialog';
import InviteDialog from '@/components/InviteDialog';
import ReportReminderDialog from '@/components/ReportReminderDialog';
import { strapiGet, strapiPost } from '@/lib/strapiClient';

type DeadlineNotification = {
  patientId: number;
  documentId: string;
  fullName: string;
  reportDeadline: string;
  daysLeft: number;
  isOverdue: boolean;
};

type RejectionNotification = {
  id: number;
  patientId: number;
  patientDocumentId: string;
  patientIdentifier: string;
  rejectingPhysicianName: string;
  rejectionTime: string;
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
  { title: 'Report Tracker', url: '/report-tracker', icon: FileText, roles: 'Cardiology' },
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
  const [rejectionNotifications, setRejectionNotifications] = useState<RejectionNotification[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('doctor_token');
    if (!token) return;

    (async () => {
      try {
        const data = await strapiGet<any>('/api/auth/doctor/my-patients');
        const primary = Array.isArray(data?.primaryPatients) ? data.primaryPatients : [];
        const consulting = Array.isArray(data?.consultingPatients) ? data.consultingPatients : [];
        const allPatients = [...primary, ...consulting];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deadlines: DeadlineNotification[] = [];
        const seenIds = new Set<number>();

        for (const p of allPatients) {
          if (!p || !p.reportDeadline || p.statu !== 'Follow Up' || seenIds.has(p.id)) continue;
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
        setRejectionNotifications(Array.isArray(data?.rejectionNotifications) ? data.rejectionNotifications : []);
      } catch (e) {
        console.warn('Failed to load deadline notifications:', e);
      }
    })();
  }, []);

  const handleNotificationClick = async (notifId: number, documentId: string) => {
    try {
      await strapiPost('/api/auth/doctor/notifications/mark-read', { notificationId: notifId });
      setRejectionNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.warn("Failed to mark notification as read", err);
    }
    navigate(`/patients/${documentId}`);
  };

  const [showReportReminder, setShowReportReminder] = useState(false);

  useEffect(() => {
    const isCardio = currentUser?.role === 'Cardiology' || currentUser?.role === 'Cardiologist';
    if (currentUser && isCardio && currentUser.consentAsked) {
      if (deadlineNotifications.length > 0 && !sessionStorage.getItem('reportReminderShown')) {
          setShowReportReminder(true);
          sessionStorage.setItem('reportReminderShown', 'true');
      }
    }
  }, [currentUser, deadlineNotifications]);

  const totalNotifications = deadlineNotifications.length + rejectionNotifications.length;

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const isCollapsed = state === 'collapsed';

  return (
    <>
    <Sidebar
      className={`glass-sidebar shadow-lg z-20 transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-[280px]'
        }`}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-slate-200/50">
          <div className="flex w-full items-center gap-3">
            <div className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'} flex items-center justify-center transition-all duration-300 flex-shrink-0`}>
              <img
                src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png"
                alt="ATTR Navigator Logo"
                className={`${isCollapsed ? 'w-6 h-6' : 'w-full h-full'} object-contain transition-all duration-300 drop-shadow-sm`}
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-slate-800 font-bold text-[1.1rem] leading-tight">ATTR Navigator</span>
              </div>
            )}
          </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url || (item.url !== '/' && location.pathname.includes(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-medium transition-all duration-300 ${isCollapsed ? 'justify-center px-2 text-sm' : 'text-[15px]'
                        } ${isActive
                          ? 'text-[#056a75] bg-gradient-to-r from-[#089bab]/10 to-transparent border-l-[4px] border-[#089bab]'
                          : 'text-slate-500 hover:bg-white/50 hover:text-[#056a75] hover:translate-x-1'
                        }`}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} flex-shrink-0 transition-all ${isActive ? 'stroke-[#089bab] text-[#089bab] opacity-100' : 'opacity-70 text-slate-500 hover:opacity-100 hover:stroke-[#089bab]'}`} />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 sm:p-4 mb-2 mt-auto">
        {!isCollapsed ? (
          <div className="flex flex-wrap sm:flex-nowrap items-center w-full gap-2 sm:gap-3 bg-white/50 border border-slate-200/50 p-2 sm:p-3 rounded-[12px] shadow-sm transition-all hover:bg-white hover:shadow-md relative cursor-pointer">
            <Avatar className="w-10 h-10 flex-shrink-0 bg-[#4f46e5] text-white font-bold flex items-center justify-center rounded-full text-sm">
              <AvatarFallback className="bg-[#4f46e5] text-white font-bold text-sm">
                {currentUser?.avatarFallback || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-slate-800 font-bold text-xs sm:text-sm truncate">{currentUser?.name || 'User'}</div>
              <div className="text-slate-500 text-[10px] sm:text-[11px] truncate">{currentUser?.role || ''}</div>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative text-slate-400 hover:text-slate-600 p-1 mr-1 flex-shrink-0 transition-colors">
                  <Bell className="w-4 h-4" />
                  {totalNotifications > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] bg-red-500 hover:bg-red-500 text-white border-0 rounded-full flex items-center justify-center animate-pulse"
                    >
                      {totalNotifications > 9 ? '9+' : totalNotifications}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border border-border shadow-lg max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-border sticky top-0 bg-card z-10">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                </div>

                {totalNotifications > 0 ? (
                  <div className="divide-y divide-border">
                    {rejectionNotifications.map((n) => (
                      <DropdownMenuItem
                        key={`rejection-${n.id}`}
                        className="cursor-pointer hover:bg-muted p-3 focus:bg-muted"
                        onClick={() => handleNotificationClick(n.id, n.patientDocumentId)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-red-500"></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs text-red-700">
                              Reassignment Alert: Patient #{n.patientId} ({n.patientIdentifier})
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5 whitespace-normal">
                              Rejected by Dr. {n.rejectingPhysicianName} on {new Date(n.rejectionTime).toLocaleString('tr-TR')}
                            </div>
                            <div className="text-[10px] text-[#056a75] font-semibold mt-1">
                              Action: Review and reassign if necessary.
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {deadlineNotifications.map((n) => (
                      <DropdownMenuItem
                        key={`deadline-${n.patientId}`}
                        className="cursor-pointer hover:bg-muted p-3 focus:bg-muted"
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
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0 transition-colors ml-auto mr-1">
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
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted" onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
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
          <div className="flex flex-col items-center space-y-2 mt-2">
            <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
              <AvatarFallback className="bg-[#4f46e5] text-white font-bold text-xs">
                {currentUser?.avatarFallback || '?'}
              </AvatarFallback>
            </Avatar>

            {/* Collapsed notifications and user menu */}
            <div className="flex flex-col items-center space-y-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative text-slate-400 hover:text-slate-600 p-1 transition-colors">
                    <Bell className="w-4 h-4" />
                    {totalNotifications > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 h-3 w-3 p-0 text-[10px] bg-red-500 hover:bg-red-500 text-white border-0 rounded-full flex items-center justify-center animate-pulse"
                      >
                      </Badge>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 bg-card border border-border shadow-lg max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-border">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>

                  {totalNotifications > 0 ? (
                    <div className="divide-y divide-border">
                      {rejectionNotifications.map((n) => (
                        <DropdownMenuItem
                          key={`rejection-collapsed-${n.id}`}
                          className="cursor-pointer hover:bg-muted p-3 focus:bg-muted"
                          onClick={() => handleNotificationClick(n.id, n.patientDocumentId)}
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-red-500"></div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs text-red-700">
                                Reassignment Alert: Patient #{n.patientId} ({n.patientIdentifier})
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5 whitespace-normal">
                                Rejected by Dr. {n.rejectingPhysicianName} on {new Date(n.rejectionTime).toLocaleString('tr-TR')}
                              </div>
                              <div className="text-[10px] text-[#056a75] font-semibold mt-1">
                                Action: Review and reassign if necessary.
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {deadlineNotifications.map((n) => (
                        <DropdownMenuItem
                          key={`deadline-collapsed-${n.patientId}`}
                          className="cursor-pointer hover:bg-muted p-3 focus:bg-muted"
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
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      No notifications
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-slate-400 hover:text-slate-600 p-1 transition-colors">
                    <User className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-white border border-slate-200 shadow-lg">
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </DropdownMenuItem>
                  {currentUser?.canInvite && (
                    <DropdownMenuItem className="cursor-pointer hover:bg-muted" onClick={() => setShowInviteDialog(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
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
    <InviteDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />
    <ReportReminderDialog open={showReportReminder} onOpenChange={setShowReportReminder} notifications={deadlineNotifications} />
    </>
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
      <div className="ambient-shape shape-1"></div>
      <div className="ambient-shape shape-2"></div>
      <div className="min-h-screen flex w-full relative z-10 bg-transparent">
        <AppSidebar />

        <div className="flex-1 min-w-0 bg-transparent relative z-10">
          {/* Mobile header with trigger */}
          {isMobile && (
            <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <SidebarTrigger className="text-foreground" />
                <div className="flex items-center space-x-2">
                  <img
                    src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png"
                    alt="ATTR Navigator Logo"
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-primary font-bold text-sm">ATTR Navigator</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="bg-transparent relative z-10 p-6 md:p-8 lg:p-12 w-full max-w-full overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
      <ConsentDialog />
    </SidebarProvider>
  );
};

export default Layout;
