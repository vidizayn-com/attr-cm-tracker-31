
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PatientProvider } from "@/contexts/PatientContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Verification from "./pages/Verification";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import PatientDetails from "./pages/PatientDetails";
import PatientAssignment from "./pages/PatientAssignment";
import PatientRegistration from "./pages/PatientRegistration";
import PatientPool from "./pages/PatientPool";
import Calendar from "./pages/Calendar";
import Resources from "./pages/Resources";
import ProfileEdit from "./pages/ProfileEdit";
import ReportTracker from "./pages/ReportTracker";
import ReportDetails from "./pages/ReportDetails";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import { UserProvider } from "@/contexts/UserContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <PatientProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Protected routes – require login */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
              <Route path="/patients/register" element={<ProtectedRoute><PatientRegistration /></ProtectedRoute>} />
              <Route path="/patients/pool" element={<ProtectedRoute><PatientPool /></ProtectedRoute>} />
              <Route path="/patients/:id" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
              <Route path="/patients/:id/assign" element={<ProtectedRoute><PatientAssignment /></ProtectedRoute>} />
              <Route path="/patients/:id/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
              <Route path="/report-tracker" element={<ProtectedRoute><ReportTracker /></ProtectedRoute>} />
              <Route path="/report-details" element={<ProtectedRoute><ReportDetails /></ProtectedRoute>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PatientProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
