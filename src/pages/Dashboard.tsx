
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// Sample data for Monthly Patient Registrations
const patientRegistrationData = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 8 },
  { month: 'Mar', count: 15 },
  { month: 'Apr', count: 10 },
  { month: 'May', count: 18 },
  { month: 'Jun', count: 14 },
];

// Sample data for Monthly Report Creations
const reportCreationData = [
  { month: 'Jan', count: 25 },
  { month: 'Feb', count: 18 },
  { month: 'Mar', count: 32 },
  { month: 'Apr', count: 22 },
  { month: 'May', count: 35 },
  { month: 'Jun', count: 28 },
];

// Chart configuration
const chartConfig = {
  count: {
    label: "Count",
    color: "#3b82f6",
  },
};

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">24</div>
              <p className="text-gray-600 text-sm sm:text-base">Active patients in system</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">New Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">6</div>
              <p className="text-gray-600 text-sm sm:text-base">Pending assignment</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">12</div>
              <p className="text-gray-600 text-sm sm:text-base">Active assignments</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 sm:mt-8">
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Link 
                  to="/patients/register"
                  className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="text-lg sm:text-xl font-semibold text-blue-700">Register New Patient</div>
                  <p className="text-blue-600 text-sm sm:text-base">Add a new patient to the system</p>
                </Link>
                <Link 
                  to="/patients"
                  className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <div className="text-lg sm:text-xl font-semibold text-green-700">View All Patients</div>
                  <p className="text-green-600 text-sm sm:text-base">Browse and manage patient records</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Trends Section */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Data Trends</h2>
          
          {/* Side-by-side Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Monthly Patient Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <BarChart data={patientRegistrationData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#3b82f6" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Monthly Report Creations</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <BarChart data={reportCreationData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#10b981" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl text-red-600">Report Period Expiring Soon</CardTitle>
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
