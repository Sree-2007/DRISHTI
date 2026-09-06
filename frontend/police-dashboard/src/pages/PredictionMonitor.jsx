import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis as LineXAxis, YAxis as LineYAxis, CartesianGrid as LineCartesianGrid, Tooltip as LineTooltip, Legend as LineLegend } from 'recharts';

const PredictionMonitor = () => {
  const [predictions, setPredictions] = useState([]);
  const [hazardTypes, setHazardTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for predictions
  useEffect(() => {
    setTimeout(() => {
      setPredictions([
        { id: 1, type: 'Accident', location: 'MG Road & Brigade Road', severity: 'High', probability: 0.85, timeframe: 'Next 15 mins', status: 'Active' },
        { id: 2, type: 'Traffic Jam', location: 'Outer Ring Road', severity: 'Medium', probability: 0.72, timeframe: 'Next 30 mins', status: 'Active' },
        { id: 3, type: 'Public Disturbance', location: 'Commercial Street', severity: 'Low', probability: 0.65, timeframe: 'Next 1 hour', status: 'Monitoring' },
        { id: 4, type: 'Theft Hotspot', location: 'Jay Nagar Market', severity: 'Medium', probability: 0.58, timeframe: 'Next 2 hours', status: 'Active' },
        { id: 5, type: 'Accident', location: 'Electronic City Flyover', severity: 'High', probability: 0.91, timeframe: 'Next 10 mins', status: 'Active' },
      ]);
      setHazardTypes([
        { type: 'Accident', count: 2 },
        { type: 'Traffic Jam', count: 1 },
        { type: 'Public Disturbance', count: 1 },
        { type: 'Theft Hotspot', count: 1 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-6">Loading predictions...</div>;
  }

  const severityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Prediction Monitor</h2>
        <p className="text-gray-600 mb-4">AI-powered hazard predictions and early warning system</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-gray-600">High Risk Predictions</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {predictions.filter(p => p.severity === 'High').length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-gray-600">Medium Risk Predictions</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {predictions.filter(p => p.severity === 'Medium').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-gray-600">Low Risk Predictions</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {predictions.filter(p => p.severity === 'Low').length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <h3 className="text-lg font-medium text-gray-600">Active Alerts</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {predictions.filter(p => p.status === 'Active').length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictions Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Active Predictions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeframe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {predictions.map(prediction => (
                  <tr key={prediction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prediction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prediction.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full
                        ${prediction.severity === 'High' ? 'bg-red-100 text-red-800' :
                          prediction.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                        {prediction.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(prediction.probability * 100).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prediction.timeframe}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full
                        ${prediction.status === 'Active' ? 'bg-red-100 text-red-800' :
                          prediction.status === 'Monitoring' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                        {prediction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Prediction Analytics</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-3">Hazard Type Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hazardTypes}>
                  <XAxis dataKey="type" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-3">Risk Levels Over Time</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  { name: 'High Risk', value: 2 },
                  { name: 'Medium Risk', value: 2 },
                  { name: 'Low Risk', value: 1 }
                ]}>
                  <LineXAxis dataKey="name" />
                  <LineYAxis />
                  <LineCartesianGrid strokeDasharray="3 3" />
                  <LineTooltip />
                  <LineLegend />
                  <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionMonitor;