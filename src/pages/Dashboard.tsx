import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Zap, Loader2, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { strapiGet } from '@/lib/strapiClient';
import { useUser } from '@/contexts/UserContext';

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
  const { currentUser } = useUser();
  const isCardiologist = currentUser?.role === 'Cardiology';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendsData>(emptyTrends);
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await strapiGet<DashboardStats>("/api/doctors/dashboard-stats");
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setStats({ totalPatients: 0, newPatients: 0, assignedPatients: 0 });
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

    fetchStats();
    fetchTrends();
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
                <div className="glass-card kpi-card" onClick={() => window.location.href='/patients'}>
                    <div className="kpi-icon blue">
                        <Users className="w-7 h-7" />
                    </div>
                    <div className="kpi-info">
                        <h4>Total Assigned</h4>
                        <div className="value flex items-baseline">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : stats?.totalPatients ?? 0}
                            <span className="trend ml-2 text-[#10b981] font-semibold text-xs">↑ 12%</span>
                        </div>
                    </div>
                </div>

                {/* 2. Diagnostic Process */}
                <div className="glass-card kpi-card" onClick={() => window.location.href='/patients'}>
                    <div className="kpi-icon teal">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="kpi-info">
                        <h4>Diagnostic Process</h4>
                        <div className="value flex items-baseline">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : stats?.assignedPatients ?? 0}
                            <span className="trend ml-2 text-slate-500 font-semibold text-xs">- 2%</span>
                        </div>
                    </div>
                </div>

                {/* 3. Follow Up Tracking */}
                <div className="glass-card kpi-card" onClick={() => window.location.href='/patients'}>
                    <div className="kpi-icon amber">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div className="kpi-info">
                        <h4>Follow Up Tracking</h4>
                        <div className="value flex items-baseline">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : stats?.totalPatients ?? 0}
                            <span className="trend ml-2 text-[#10b981] font-semibold text-xs">↑ 8%</span>
                        </div>
                    </div>
                </div>

                {/* 4. Reports Overdue */}
                <div className="glass-card kpi-card" onClick={() => window.location.href='/reports'}>
                    <div className="kpi-icon rose">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div className="kpi-info">
                        <h4>Reports Overdue</h4>
                        <div className="value flex items-baseline text-red-500">
                            3
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
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">Patient: John Smith</span>
                    <span className="text-xs text-red-600">3 days</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">Patient: Sarah Wilson</span>
                    <span className="text-xs text-red-600">5 days</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">Patient: Mike Johnson</span>
                    <span className="text-xs text-red-600">7 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl text-yellow-600">Data Entry Assignment Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium">Patient: Emma Davis</span>
                    <span className="text-xs text-yellow-600">Pending</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium">Patient: Robert Brown</span>
                    <span className="text-xs text-yellow-600">Pending</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium">Patient: Lisa Garcia</span>
                    <span className="text-xs text-yellow-600">Pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl text-green-600">Recently Created Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Patient: Alex Turner</span>
                    <span className="text-xs text-green-600">Today</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Patient: Maria Lopez</span>
                    <span className="text-xs text-green-600">Yesterday</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Patient: David Lee</span>
                    <span className="text-xs text-green-600">2 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
