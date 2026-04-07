import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { Search, Filter, Calendar, User, FileText, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { strapiGet } from '@/lib/strapiClient';
import { toast } from 'sonner';

type PatientData = {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  statu: string;
  lastReportDate: string | null;
  reportDeadline: string | null;
  primary_cardiologist: { fullName: string } | null;
};

const ReportTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await strapiGet<any>('/api/auth/doctor/my-patients');
        const primary = res.primaryPatients || [];
        const consulting = res.consultingPatients || [];
        
        // Remove duplicates and combine
        const map = new Map<number, PatientData>();
        [...primary, ...consulting].forEach((p: any) => {
          if (p.statu === 'Follow Up') {
            map.set(p.id, p);
          }
        });

        setPatients(Array.from(map.values()));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch patients.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reports = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return patients.map(p => {
      let status = "Completed";
      let priority = "Low";
      
      const lastReport = p.lastReportDate ? new Date(p.lastReportDate) : null;
      const deadline = p.reportDeadline ? new Date(p.reportDeadline) : null;

      let diffDays = 999;
      if (deadline) {
        const diffMs = deadline.getTime() - today.getTime();
        diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }

      if (!deadline || !lastReport) {
        status = "Pending";
        priority = "High";
      } else if (diffDays < 0) {
        status = "Overdue";
        priority = "High";
      } else if (diffDays <= 20) {
        status = "Pending";
        priority = "Medium";
      }

      return {
        id: p.documentId,
        patientName: `${p.firstName} ${p.lastName}`,
        reportType: 'Diagnosis Report',
        status,
        assignedTo: p.primary_cardiologist?.fullName || 'Atanmamış (HATA)',
        dueDate: p.reportDeadline ? new Date(p.reportDeadline).toLocaleDateString('tr-TR') : 'Not Set',
        createdDate: p.lastReportDate ? new Date(p.lastReportDate).toLocaleDateString('tr-TR') : 'None',
        priority,
        diffDays
      };
    });
  }, [patients]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (statusFilter !== 'All Statuses' && r.status !== statusFilter) return false;
      if (searchTerm && !r.patientName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [reports, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Completed': 'bg-emerald-100 text-emerald-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-amber-100 text-amber-800',
      'Overdue': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      'High': 'bg-red-100 text-red-800 border-red-200',
      'Medium': 'bg-amber-100 text-amber-800 border-amber-200',
      'Low': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return styles[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const stats = useMemo(() => ({
    total: reports.length,
    completed: reports.filter(r => r.status === 'Completed').length,
    pending: reports.filter(r => r.status === 'Pending').length,
    overdue: reports.filter(r => r.status === 'Overdue').length,
  }), [reports]);

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: '#29a8b6' }}>Report Tracker</h1>
            <p className="text-gray-500 mt-2">Follow up patients requiring diagnosis report renewal every 3 months.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-gray-600 text-sm mt-1">Total Follow Up</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
              <p className="text-gray-600 text-sm mt-1">Up to Date</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
              <p className="text-gray-600 text-sm mt-1">Renewal Soon (&lt;20 Days)</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-gray-600 text-sm mt-1">Overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="relative w-full lg:w-96">
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 bg-white/90 border-none rounded-xl shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 px-4 bg-white/90 border-none shadow-sm rounded-xl w-full sm:w-auto outline-none"
            >
              <option>All Statuses</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
            <p className="text-gray-500">No follow up patients match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-none hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                      {report.patientName}
                    </CardTitle>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(report.priority)}`}>
                        {report.priority} Priority
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-blue-700">{report.reportType}</h3>
                    {report.diffDays <= 20 && report.diffDays >= 0 && (
                      <span className="flex items-center text-xs text-amber-600 font-medium">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Due in {report.diffDays} Days
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium min-w-[100px]">Assigned to:</span>
                    <span>{report.assignedTo}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium min-w-[100px]">Last Report:</span>
                    <span>{report.createdDate}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium min-w-[100px]">Next Due:</span>
                    <span className={report.diffDays < 0 ? "text-red-600 font-semibold" : ""}>{report.dueDate}</span>
                  </div>
                  
                  <div className="pt-3">
                    <Button 
                      onClick={() => navigate(`/patients/${report.id}`)}
                      variant="outline"
                      className="w-full bg-white hover:bg-cyan-50 text-gray-700 hover:text-cyan-700 border border-gray-200 rounded-xl"
                    >
                      Update Report in Patient Details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReportTracker;
