import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const TrafficSignalControl = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [trafficSignals, setTrafficSignals] = useState([]);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [ambulanceMode, setAmbulanceMode] = useState(false);

  // Mock traffic signals data
  useEffect(() => {
    // Initialize map
    if (mapContainerRef.current) {
      const newMap = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap contributors'
            }
          },
          layers: [{
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }]
        },
        center: [77.2090, 28.6139], // Delhi coordinates as example
        zoom: 12
      });

      setMap(newMap);

      // Add mock traffic signals
      const signals = [
        { id: 1, name: 'Signal A - Connaught Place', lng: 77.2198, lat: 28.6328, phase: 'RED', lastUpdated: '2024-01-15 10:30' },
        { id: 2, name: 'Signal B - India Gate', lng: 77.2300, lat: 28.6129, phase: 'GREEN', lastUpdated: '2024-01-15 10:31' },
        { id: 3, name: 'Signal C - Red Fort', lng: 77.2410, lat: 28.6562, phase: 'YELLOW', lastUpdated: '2024-01-15 10:29' },
        { id: 4, name: 'Signal D - Lotus Temple', lng: 77.2588, lat: 28.5535, phase: 'RED', lastUpdated: '2024-01-15 10:32' },
        { id: 5, name: 'Signal E - Qutub Minar', lng: 77.1895, lat: 28.5245, phase: 'GREEN', lastUpdated: '2024-01-15 10:28' }
      ];
      setTrafficSignals(signals);

      // Add markers to map
      signals.forEach(signal => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = signal.phase === 'RED' ? '#e53e3e' :
                               signal.phase === 'YELLOW' ? '#dd6b20' : '#38a169';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '2px white solid';
        el.style.cursor = 'pointer';

        new maplibregl.Marker(el)
          .setLngLat([signal.lng, signal.lat])
          .setPopup(new maplibregl.Popup({ offset: 25 }) // add popups
            .setHTML(`
              <h3>${signal.name}</h3>
              <p><strong>Phase:</strong> <span style="text-transform:capitalize">${signal.phase}</span></p>
              <p><strong>Last Updated:</strong> ${signal.lastUpdated}</p>
            `))
          .addTo(newMap);
      });

      // Cleanup on unmount
      return () => newMap.remove();
    }
  }, []);

  const handlePhaseChange = (signalId, newPhase) => {
    // Update signal phase
    setTrafficSignals(prev =>
      prev.map(signal =>
        signal.id === signalId ? { ...signal, phase: newPhase, lastUpdated: new Date().toLocaleString() } : signal
      )
    );

    // In a real app, you would send this to the backend via API or socket
    console.log(`Changed signal ${signalId} to ${newPhase}`);
  };

  const handleAmbulanceMode = () => {
    setAmbulanceMode(!ambulanceMode);
    if (ambulanceMode) {
      console.log('Ambulance mode activated - clearing path for emergency vehicle');
      // In a real app, you would send command to change all signals to green for ambulance route
    } else {
      console.log('Ambulance mode deactivated');
    }
  };

  if (!map) {
    return <div className="p-6">Loading map...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Map Container */}
      <div className="flex-1">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>

      {/* Control Panel */}
      <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Traffic Signal Control</h2>

        {/* Ambulance Mode Button */}
        <div className="mb-6 p-4 rounded-lg shadow">
          <button
            onClick={handleAmbulanceMode}
            className={`w-full flex items-center justify-between px-4 py-2 rounded
              ${ambulanceMode ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
              text-white focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium">{ambulanceMode ? 'Deactivate' : 'Activate'} Ambulance Mode</span>
              {ambulanceMode && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">ACTIVE</span>
              )}
            </div>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d={ambulanceMode ? "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}/>
            </svg>
          </button>
          {ambulanceMode && (
            <p className="mt-2 text-sm text-red-600 text-center">
              Emergency vehicle priority active - signals will turn green for approaching ambulance
            </p>
          )}
        </div>

        {/* Signals List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Traffic Signals</h3>
          {trafficSignals.map(signal => (
            <div key={signal.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSignal(signal)}
              className={selectedSignal && selectedSignal.id === signal.id ? 'bg-indigo-50 border-indigo-200' : ''}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">{signal.name}</h4>
                  <p className="text-sm text-gray-600">Last updated: {signal.lastUpdated}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full
                    ${signal.phase === 'RED' ? 'bg-red-100 text-red-800' :
                      signal.phase === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}`}>
                    {signal.phase}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Signal Details & Controls */}
        {selectedSignal && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Signal Controls</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600"><strong>Selected:</strong> {selectedSignal.name}</p>
                <p className="text-gray-600"><strong>Current Phase:</strong>
                  <span className={`text-${selectedSignal.phase === 'RED' ? 'red' :
                                    selectedSignal.phase === 'YELLOW' ? 'yellow' : 'green'}-600 font-medium`}>
                    {selectedSignal.phase}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Change Phase:</p>
                <div className="flex space-x-3">
                  ['RED', 'YELLOW', 'GREEN'].map(phase => (
                    <button
                      key={phase}
                      onClick={() => handlePhaseChange(selectedSignal.id, phase)}
                      className={`flex-1 px-3 py-2 rounded
                        ${selectedSignal.phase === phase ?
                          'bg-indigo-600 text-white hover:bg-indigo-700' :
                          'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                        focus:outline-none focus:ring-2 focus:ring-offset-2`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficSignalControl;