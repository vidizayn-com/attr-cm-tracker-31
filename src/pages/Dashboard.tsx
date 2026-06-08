import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Zap, Loader2, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { strapiGet } from '@/lib/strapiClient';
import { useUser } from '@/contexts/UserContext';
import { formatDistanceToNow, parseISO } from 'date-fns';

// Chart configuration
const chartConfig = {
  count: {
    label: "Count",
    color: "#3b82f6",
  },
};

interface DashboardStats {
  totalPatients: number;
  newPatients: number;
  assignedPatients: number;
  overdueReports: number;
}

interface ChartDataPoint {
  month: string;
  count: number;
}

interface TrendsData {
  patientRegistrations: ChartDataPoint[];
  reportCreations: ChartDataPoint[];
}

const emptyTrends: TrendsData = {
  patientRegistrations: [],
  reportCreations: [],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const isCardiologist = currentUser?.role === 'Cardiology';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendsData>(emptyTrends);
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);

  // New dynamic sections state
  const EXPIRING_DAYS = 7; // configurable threshold
  const [expiringPatients, setExpiringPatients] = useState<any[]>([]);
  const [diagnosisPatients, setDiagnosisPatients] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await strapiGet<DashboardStats>("/api/doctors/dashboard-stats");
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setStats({ totalPatients: 0, newPatients: 0, assignedPatients: 0, overdueReports: 0 });
      } finally {
        setLoading(false);
      }
    };

    const fetchTrends = async () => {
      try {
        const data = await strapiGet<TrendsData>("/api/doctors/dashboard-trends");
        setTrends(data);
      } catch (err) {
        console.error("Failed to fetch dashboard trends:", err);
        setTrends(emptyTrends);
      } finally {
        setTrendsLoading(false);
      }
    };

    const fetchSections = async () => {
      try {
        const [exp, diag, recent] = await Promise.all([
          strapiGet<any[]>("/dashboard/expiring-medication"),
          strapiGet<any[]>("/dashboard/diagnosis-patients"),
          strapiGet<any[]>("/dashboard/recent-reports"),
        ]);
        setExpiringPatients(exp);
        setDiagnosisPatients(diag);
        setRecentReports(recent);
      } catch (e) {
        console.error("Failed to fetch dashboard sections:", e);
      } finally {
        setSectionsLoading(false);
      }
    };

    fetchStats();
    fetchTrends();
    fetchSections();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6" style={{zIndex:10, position:'relative'}}>
        <div className="flex justify-between items-center mb-8">
            <div className="page-title">
                <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#056a75' }}>Overview Dashboard</h2>
                <p className="text-slate-500 mt-1">Welcome back, {currentUser?.name || 'Doctor'}. Here's what's happening with your patients today.</p>
            </div>
        </div>

        <section className="dashboard-grid">
            <div className="kpi-row">
                {/* 1. Total Assigned */}
                <div className="glass-card kpi-card" onClick={() => navigate('/patients')}>
                    <div className="kpi-icon blue">
                        <Users className="w-7 h-7" />
                    </div>
                    <div className="kpi-info">
                        <h4>Total Assigned</h4>
                        <div className="value flex items-baseline">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : stats?.totalPatients ?? 0}
                        </div>
                    </div>
                </div>

                {/* 2. Diagnostic Process */}
                <div className="glass-card kpi-card" onClick={() => navigate('/patients')}>
                    <div className="kpi-icon teal">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="kpi-info">
                        <h4>Diagnostic Process</h4>
                        <div className="value flex items-baseline">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : stats?.assignedPatients ?? 0}
                        </div>
                    </div>
                </div>

                {/* 3. Follow Up Tracking */}
                <div className="glass-card kpi-card" onClick={() => navigate('/patients')}>
                    <div className="kpi-icon amber">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div className="kpi-info">
                        <h4>Follow Up Tracking</h4>
                        <div className="value flex items-baseline">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : stats?.totalPatients ?? 0}
                        </div>
                    </div>
                </div>

                {/* 4. Reports Overdue */}
                <div className="glass-card kpi-card" onClick={() => navigate('/report-tracker')}>
                    <div className="kpi-icon rose">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div className="kpi-info">
                        <h4>Reports Overdue</h4>
                        <div className="value flex items-baseline text-red-500">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : stats?.overdueReports ?? 0}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div className="mt-6 sm:mt-8">
          <Card className="glass-card border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-slate-800">
                <Zap className="w-5 h-5" style={{ color: '#29a8b6' }} />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {isCardiologist ? (
                  <>
                    <Link
                      to="/patients/register"
                      className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <div className="text-lg sm:text-xl font-semibold text-blue-700">Register New Patient</div>
                      <p className="text-blue-600 text-sm sm:text-base">Add a new patient to the system</p>
                    </Link>
                    <Link
                      to="/patients/pool"
                      className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                    >
                      <div className="text-lg sm:text-xl font-semibold text-amber-700">Patient Pool</div>
                      <p className="text-amber-600 text-sm sm:text-base">View patients waiting for specialist assignment</p>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/patients"
                      className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <div className="text-lg sm:text-xl font-semibold text-purple-700">View Referred Patients</div>
                      <p className="text-purple-600 text-sm sm:text-base">Patients awaiting your specialist review</p>
                    </Link>
                    <Link
                      to="/patients/pool"
                      className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
                    >
                      <div className="text-lg sm:text-xl font-semibold text-amber-700">Patient Pool</div>
                      <p className="text-amber-600 text-sm sm:text-base">Pick up patients from your hospital's pool</p>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Trends Section */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#29a8b6' }}>Data Trends</h2>

          {/* Side-by-side Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Monthly Patient Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-48 sm:h-56 lg:h-64 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trends.patientRegistrations} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis
                          dataKey="month"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          width={25}
                          allowDecimals={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#3b82f6" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Monthly Report Creations</CardTitle>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-48 sm:h-56 lg:h-64 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trends.reportCreations} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <XAxis
                          dataKey="month"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          width={25}
                          allowDecimals={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="#10b981" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl text-red-600">Medication Report Period Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                {sectionsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : expiringPatients.length ? (
                  <div className="space-y-2">
                    {expiringPatients.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium">Patient: {p.name}</span>
                        <span className="text-xs text-red-600">{p.medicationReport?.daysLeft ?? '—'} days</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center">No medication reports expiring soon.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl text-yellow-600">Data Entry Assignment Needed</CardTitle>
              </CardHeader>
              <CardContent>
                {sectionsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : diagnosisPatients.length ? (
                  <div className="space-y-2">
                    {diagnosisPatients.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                        <span className="text-sm font-medium">Patient: {p.name}</span>
                        <span className="text-xs text-yellow-600">{p.missingSpecialties?.length ? `Missing: ${p.missingSpecialties.join(', ')}` : 'Pending'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center">No patients need diagnostic data entry right now.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl text-green-600">Recently Created Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {sectionsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : recentReports.length ? (
                  <div className="space-y-2">
                    {recentReports.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">Patient: {p.patient?.name || p.name}</span>
                        <span className="text-xs text-green-600">{p.createdAt ? formatDistanceToNow(new Date(p.createdAt), {addSuffix: true}) : 'Recently'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center">No recently created reports.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
