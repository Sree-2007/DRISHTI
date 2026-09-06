import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardOverview from './pages/DashboardOverview';
import ZoneManagement from './pages/ZoneManagement';
import ReportVerificationQueue from './pages/ReportVerificationQueue';
import TrafficSignalControl from './pages/TrafficSignalControl';
import PredictionMonitor from './pages/PredictionMonitor';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Show login page if not authenticated */}
        {!user && (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Login />
          </div>
        )}

        {/* Show main app if authenticated */}
        {user && (
          <>
            <header className="bg-white shadow-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <img className="h-8 w-auto" src="https://via.placeholder.com/120x40" alt="DRISHTI" />
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Dashboard Overview</a>
                        <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Zone Management</a>
                        <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Report Verification</a>
                        <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Traffic Signal</a>
                        <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Prediction Monitor</a>
                        <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Settings</a>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      <button type="button" className="bg-white rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200">
                        <span className="sr-only">View notifications</span>
                        {/* Heroicon name: outline/bell */}
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 006.893-4.604l1.396-.698a4 4 0 001.105-4.599l1.194-2.248A5.988 5.988 0 0013.025 9a5.988 5.988 0 00-2.23-.827l-.342-.171A2.988 2.988 0 007.873 8H6a2 2 0 110 4h1.873a2.988 2.988 0 00.873 2.127l.342.171a5.988 5.988 0 002.23.827v.072a5.973 5.973 0 00-.477 2.697A3.994 3.994 0 008.005 15a3.994 3.994 0 00-3.192 2.57l-.684.342a2 2 0 101.728-.864l.684-.342a3.994 3.994 0 003.191-2.57A3.973 3.973 0 009.177 13.393a8 8 0 00.823 4.607z" clipRule="evenodd" />
                        </svg>
                      </button>

                        {/* Profile dropdown */}
                      <div className="ml-3 relative">
                        <div>
                          <button type="button" className="max-w-xs bg-white rounded-md flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                            <span className="sr-only">Open user menu</span>
                            <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/30" alt="" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                        {/* Mobile menu button */}
                    <button type="button" className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-inset" aria-controls="mobile-menu" aria-expanded="false">
                      <span className="sr-only">Open main menu</span>
                      {/* Heroicon name: outline/menu */}
                      <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Mobile menu, show/hide based on menu state. */}
            <nav className="md:hidden" id="mobile-menu">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Dashboard Overview</a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Zone Management</a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Report Verification</a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Traffic Signal</a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Prediction Monitor</a>
                <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Settings</a>
              </div>
            </nav>

            <main className="mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Routes>
                  <Route path="/" element={<DashboardOverview />} />
                  <Route path="/dashboard" element={<DashboardOverview />} />
                  <Route path="/zones" element={<ZoneManagement />} />
                  <Route path="/reports" element={<ReportVerificationQueue />} />
                  <Route path="/traffic" element={<TrafficSignalControl />} />
                  <Route path="/predictions" element={<PredictionMonitor />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;