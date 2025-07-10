import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  // Check if we're on the patients page to apply darker header
  const isPatientsPage = location.pathname.includes('/patients');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300 relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {showNavigation && (
        <nav className={`relative z-10 backdrop-blur-sm border-b border-white/20 ${
          isPatientsPage ? 'bg-black/30' : 'bg-white/10'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/32822704-12b5-48ad-90b7-701f244d2a02.png" 
                    alt="ATTR-CM Tracker Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>
                <span className="text-white font-bold text-lg sm:text-xl">ATTR-CM Tracker</span>
              </div>

              {/* Navigation Links - Hidden on mobile, shown on tablet+ */}
              <div className="hidden md:flex space-x-4 lg:space-x-8">
                <Link 
                  to="/dashboard" 
                  className={`text-white hover:text-blue-300 transition-colors text-sm lg:text-base ${
                    location.pathname === '/dashboard' ? 'text-blue-300 font-semibold' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/patients" 
                  className={`text-white hover:text-blue-300 transition-colors text-sm lg:text-base ${
                    location.pathname.includes('/patients') ? 'text-blue-300 font-semibold' : ''
                  }`}
                >
                  Patients
                </Link>
                <Link 
                  to="/resources" 
                  className={`text-white hover:text-blue-300 transition-colors text-sm lg:text-base ${
                    location.pathname === '/resources' ? 'text-blue-300 font-semibold' : ''
                  }`}
                >
                  Resources
                </Link>
              </div>

              {/* Doctor Profile */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-white font-semibold text-sm sm:text-base">Dr. Michael Scofield</div>
                  <div className="text-white/80 text-xs sm:text-sm italic">Cardiologist</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-sm sm:text-base">
                        MS
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={handleEditProfile}
                    >
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-100">
                      Invite New Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Mobile Navigation - Shown only on mobile */}
            <div className="md:hidden pb-3">
              <div className="flex space-x-4 overflow-x-auto">
                <Link 
                  to="/dashboard" 
                  className={`text-white hover:text-blue-300 transition-colors text-sm whitespace-nowrap ${
                    location.pathname === '/dashboard' ? 'text-blue-300 font-semibold' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/patients" 
                  className={`text-white hover:text-blue-300 transition-colors text-sm whitespace-nowrap ${
                    location.pathname.includes('/patients') ? 'text-blue-300 font-semibold' : ''
                  }`}
                >
                  Patients
                </Link>
                <Link 
                  to="/resources" 
                  className={`text-white hover:text-blue-300 transition-colors text-sm whitespace-nowrap ${
                    location.pathname === '/resources' ? 'text-blue-300 font-semibold' : ''
                  }`}
                >
                  Resources
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;
