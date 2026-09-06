import React, { useState, useEffect } from 'react';

const ReportVerificationQueue = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected

  // Mock data for reports
  useEffect(() => {
    setTimeout(() => {
      setReports([
        { id: 1, title: 'Traffic Accident on Main St', description: 'Minor collision, no injuries', location: 'Main St & 5th Ave', timestamp: '2024-01-15 14:30', status: 'pending', reporter: 'Citizen' },
        { id: 2, title: 'Suspicious Activity Near Park', description: 'Individual loitering for extended period', location: 'Central Park', timestamp: '2024-01-15 13:45', status: 'pending', reporter: 'Patrol Officer' },
        { id: 3, title: 'Theft Report - Electronics Store', description: 'Shoplifting incident, suspect fled on foot', location: 'Downtown Mall', timestamp: '2024-01-15 12:20', status: 'approved', reporter: 'Store Manager' },
        { id: 4, title: 'Noise Complaint - Residential Area', description: 'Loud music past midnight', location: 'Oak Street Apartments', timestamp: '2024-01-15 02:15', status: 'rejected', reporter: 'Resident' },
        { id: 5, title: 'Vehicle Break-in', description: 'Car window smashed, items stolen', location: 'City Parking Garage', timestamp: '2024-01-14 22:00', status: 'pending', reporter: 'Vehicle Owner' },
        { id: 6, title: 'Public Intoxication', description: 'Individual causing disturbance', location: 'Entertainment District', timestamp: '2024-01-14 20:30', status: 'pending', reporter: 'Bar Staff' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => {
    if (filterStatus === 'all') return true;
    return report.status === filterStatus;
  });

  const handleApprove = (reportId) => {
    // Simulate approving a report
    setReports(reports.map(report =>
      report.id === reportId ? {...report, status: 'approved'} : report
    ));
    alert(`Report #${reportId} approved`);
  };

  const handleReject = (reportId) => {
    // Simulate rejecting a report
    setReports(reports.map(report =>
      report.id === reportId ? {...report, status: 'rejected'} : report
    ));
    alert(`Report #${reportId} rejected`);
  };

  if (loading) {
    return <div className="p-6">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Report Verification Queue</h2>
        <p className="text-gray-600 mb-4">Review and verify incoming reports from citizens and officers.</p>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Filter by status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Showing {filteredReports.length} of {reports.length} reports</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredReports.map(report => (
            <div key={report.id} className="border rounded-lg overflow-hidden shadow">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{report.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full
                    ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{report.description}</p>
                <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                  <span><strong>Location:</strong> {report.location}</span>
                  <span><strong>Time:</strong> {report.timestamp}</span>
                  <span><strong>Reporter:</strong> {report.reporter}</span>
                </div>
                {report.status === 'pending' && (
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(report.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredReports.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No reports match the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportVerificationQueue;