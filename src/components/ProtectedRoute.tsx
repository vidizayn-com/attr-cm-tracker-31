import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { currentUser, isLoading } = useUser();
    const location = useLocation();

    // While checking auth status, show a loading spinner
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] to-[#1a2d4a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
                    <p className="text-white/60 text-sm">Verifying session...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login with the attempted URL saved
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
};

export default ProtectedRoute;
