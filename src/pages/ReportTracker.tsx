
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { Search, Filter, Calendar, User, FileText, Clock } from 'lucide-react';

const ReportTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mock data for reports
  const reports = [
    {
      id: 'RPT-001',
      patientName: 'John Smith',
      reportType: 'Medication Report',
      status: 'In Progress',
      assignedTo: 'Dr. Michael Scofield',
      dueDate: '2024-07-15',
      createdDate: '2024-07-10',
      priority: 'High'
    },
    {
      id: 'RPT-002',
      patientName: 'Sarah Wilson',
      reportType: 'Follow-up Report',
      status: 'Completed',
      assignedTo: 'Dr. Emily Johnson',
      dueDate: '2024-07-12',
      createdDate: '2024-07-08',
      priority: 'Medium'
    },
    {
      id: 'RPT-003',
      patientName: 'Mike Johnson',
      reportType: 'Initial Assessment',
      status: 'Pending',
      assignedTo: 'Dr. Michael Scofield',
      dueDate: '2024-07-18',
      createdDate: '2024-07-11',
      priority: 'Low'
    },
    {
      id: 'RPT-004',
      patientName: 'Emma Davis',
      reportType: 'Medication Report',
      status: 'Overdue',
      assignedTo: 'Dr. Sarah Chen',
      dueDate: '2024-07-08',
      createdDate: '2024-07-05',
      priority: 'High'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      'Completed': 'bg-green-500 text-white',
      'In Progress': 'bg-blue-500 text-white',
      'Pending': 'bg-yellow-500 text-white',
      'Overdue': 'bg-red-500 text-white'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500 text-white';
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold" style={{ color: '#29a8b6' }}>Report Tracker</h1>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <FileText className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="relative w-full lg:w-80">
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 bg-white/90 border-none rounded-xl"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 px-4 bg-white/90 border-none rounded-xl w-full sm:w-auto"
            >
              <option>All Statuses</option>
              <option>Completed</option>
              <option>In Progress</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
            
            <Button variant="outline" className="h-12 bg-white/90 text-gray-700 border-none rounded-xl px-6">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-none hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                    {report.id}
                  </CardTitle>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(report.priority)}`}>
                      {report.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-blue-700">{report.reportType}</h3>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">Patient:</span>
                  <span className="ml-2">{report.patientName}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">Assigned to:</span>
                  <span className="ml-2">{report.assignedTo}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">Due Date:</span>
                  <span className="ml-2">{report.dueDate}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">{report.createdDate}</span>
                </div>
                
                <div className="pt-3">
                  <Button 
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-600 border border-gray-200 rounded-xl"
                  >
                    View Details →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-gray-600 text-sm">Total Reports</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <p className="text-gray-600 text-sm">Completed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">3</div>
              <p className="text-gray-600 text-sm">In Progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm rounded-3xl border-none shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">1</div>
              <p className="text-gray-600 text-sm">Overdue</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ReportTracker;
