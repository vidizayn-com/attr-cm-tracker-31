
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PatientProvider } from "@/contexts/PatientContext";
import Login from "./pages/Login";
import Verification from "./pages/Verification";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import PatientDetails from "./pages/PatientDetails";
import PatientAssignment from "./pages/PatientAssignment";
import PatientRegistration from "./pages/PatientRegistration";
import PatientPool from "./pages/PatientPool";
import Calendar from "./pages/Calendar";

import ProfileEdit from "./pages/ProfileEdit";
import ReportTracker from "./pages/ReportTracker";
import ReportDetails from "./pages/ReportDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PatientProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/register" element={<PatientRegistration />} />
            <Route path="/patients/pool" element={<PatientPool />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/patients/:id/assign" element={<PatientAssignment />} />
            <Route path="/patients/:id/edit" element={<ProfileEdit />} />
            <Route path="/calendar" element={<Calendar />} />
            
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/report-tracker" element={<ReportTracker />} />
            <Route path="/report-details" element={<ReportDetails />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PatientProvider>
  </QueryClientProvider>
);

export default App;
