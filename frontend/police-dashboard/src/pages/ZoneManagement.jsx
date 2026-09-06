import React, { useState, useEffect } from 'react';

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [assignedOfficers, setAssignedOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    // Simulate fetching zones and officers
    setTimeout(() => {
      setZones([
        { id: 1, name: 'North Zone', description: 'Northern part of the city' },
        { id: 2, name: 'South Zone', description: 'Southern part of the city' },
        { id: 3, name: 'East Zone', description: 'Eastern part of the city' },
        { id: 4, name: 'West Zone', description: 'Western part of the city' },
        { id: 5, name: 'Central Zone', description: 'City center' },
        { id: 6, name: 'Airport Zone', description: 'Airport and surrounding areas' },
      ]);
      setOfficers([
        { id: 1, name: 'Officer Smith', badge: 'PS1001', rank: 'Sergeant' },
        { id: 2, name: 'Officer Johnson', badge: 'PS1002', rank: 'Officer' },
        { id: 3, name: 'Officer Williams', badge: 'PS1003', rank: 'Officer' },
        { id: 4, name: 'Officer Brown', badge: 'PS1004', rank: 'Sergeant' },
        { id: 5, name: 'Officer Jones', badge: 'PS1005', rank: 'Officer' },
        { id: 6, name: 'Officer Garcia', badge: 'PS1006', rank: 'Officer' },
        { id: 7, name: 'Officer Miller', badge: 'PS1007', rank: 'Lieutenant' },
        { id: 8, name: 'Officer Davis', badge: 'PS1008', rank: 'Officer' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    // Simulate fetching assigned officers for the zone
    setAssignedOfficers(officers.filter(officer =>
      officer.id % zones.length === zone.id - 1 // Just for demo
    ));
  };

  const handleAssignOfficer = (officerId) => {
    // Simulate assigning officer to zone
    alert(`Assigned officer ${officers.find(o => o.id === officerId).name} to ${selectedZone.name}`);
    // In a real app, you would make an API call here
  };

  if (loading) {
    return <div className="p-6">Loading zones and officers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Zone Management</h2>
        <p className="text-gray-600 mb-4">View and manage police zones and officer assignments.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zones List */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Zones</h3>
              <div className="border rounded-lg overflow-hidden shadow">
                {zones.map(zone => (
                  <div
                    key={zone.id}
                    className={`${selectedZone && selectedZone.id === zone.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'} p-4 cursor-pointer transition-colors`}
                    onClick={() => handleZoneSelect(zone)}
                  >
                    <h4 className="font-medium text-gray-800">{zone.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{zone.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Officers List */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Available Officers</h3>
              <div className="border rounded-lg overflow-hidden shadow max-h-[400px] overflow-y-auto">
                {officers.map(officer => (
                  <div key={officer.id} className="p-4 border-b last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{officer.name}</h4>
                        <p className="text-sm text-gray-600">Badge: {officer.badge} | Rank: {officer.rank}</p>
                      </div>
                      {!selectedZone ? (
                        <span className="text-gray-400">Select a zone</span>
                      ) : (
                        <button
                          onClick={() => handleAssignOfficer(officer.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                          disabled={assignedOfficers.some(o => o.id === officer.id)}
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assigned Officers */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">
                Assigned to {selectedZone ? selectedZone.name : 'None Selected'}
              </h3>
              {selectedZone ? (
                <div className="border rounded-lg overflow-hidden shadow min-h-[400px] flex flex-col">
                  {assignedOfficers.length > 0 ? (
                    assignedOfficers.map(officer => (
                      <div key={officer.id} className="p-4 border-b last:border-b-0 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800">{officer.name}</h4>
                          <p className="text-sm text-gray-600">Badge: {officer.badge}</p>
                        </div>
                        <button
                          onClick={() => {
                            // Simulate removing officer from zone
                            alert(`Removed officer ${officer.name} from ${selectedZone.name}`);
                            setAssignedOfficers(assignedOfficers.filter(o => o.id !== officer.id));
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-gray-500">No officers assigned to this zone.</p>
                  )}
                </div>
              ) : (
                <p className="p-4 text-center text-gray-500">Select a zone to see assigned officers.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneManagement;