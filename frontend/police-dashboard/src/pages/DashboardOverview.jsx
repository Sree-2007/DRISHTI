import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { LineChart, Line, XAxis as LineXAxis, YAxis as LineYAxis, CartesianGrid as LineCartesianGrid, Tooltip as LineTooltip, Legend as LineLegend } from 'recharts';

// Mock data for demonstration
const mockSummaryStats = {
  totalIncidents: 124,
  activeOfficers: 45,
  zonesCovered: 12,
  avgResponseTime: '4.2 min'
};

const mockIncidentsByZone = [
  { zone: 'North', incidents: 28 },
  { zone: 'South', incidents: 22 },
  { zone: 'East', incidents: 19 },
  { zone: 'West', incidents: 15 },
  { zone: 'Central', incidents: 18 },
  { zone: 'Airport', incidents: 12 },
];

const mockIncidentTypes = [
  { name: 'Traffic Violations', value: 45 },
  { name: 'Accidents', value: 25 },
  { name: 'Theft Reports', value: 18 },
  { name: 'Public Disturbance', value: 12 },
  { name: 'Medical Emergencies', value: 10 },
  { name: 'Other', value: 14 },
];

const mockIncidentsOverTime = [
  { name: 'Jan', incidents: 30 },
  { name: 'Feb', incidents: 35 },
  { name: 'Mar', incidents: 28 },
  { name: 'Apr', incidents: 40 },
  { name: 'May', incidents: 38 },
  { name: 'Jun', incidents: 42 },
  { name: 'Jul', incidents: 45 },
];

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-gray-600">Total Incidents</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{mockSummaryStats.totalIncidents}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-gray-600">Active Officers</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{mockSummaryStats.activeOfficers}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-gray-600">Zones Covered</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{mockSummaryStats.zonesCovered}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-gray-600">Avg Response Time</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{mockSummaryStats.avgResponseTime}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Incidents by Zone</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockIncidentsByZone}>
            <XAxis dataKey="zone" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Bar dataKey="incidents" fill="#4299e1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Incident Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={mockIncidentTypes} cx="50%" cy="50%" labelLine={false} label>
                {mockIncidentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#f56565', '#48bb78', '#ed8936', '#667eea', '#38b2ac', '#dd6b20'][index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Incidents Over Time (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockIncidentsOverTime}>
              <LineXAxis dataKey="name" />
              <LineYAxis />
              <LineCartesianGrid strokeDasharray="3 3" />
              <LineTooltip />
              <LineLegend />
              <Line type="monotone" dataKey="incidents" stroke="#38b2ac" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;