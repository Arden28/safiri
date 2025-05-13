import { useState,useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mockDrivers } from '../data/fakeData';
import Map from '../components/Map';
import LocationSearch from '../components/LocationSearch';
import TripStatus from '../components/TripStatus';
import RideSelectionPanel from '../components/RideSelectionPanel';

// Rider dashboard for managing trip requests and location selection
export default function RiderDashboard({ user }) {
  // State for trip details, inputs, route info, and panel visibility
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [trip, setTrip] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Handling route calculation from map
  const handleRouteCalculated = useCallback(({ distance, duration }) => {
    setRouteInfo({ distance, duration });
    // Update trip with fare estimate based on distance
    setTrip(prev => {
      if (!prev) return prev; // Skip if no trip
      const distanceNum = parseFloat(distance);
      const fare = prev.vehicleType === 'car' ? `KSH ${(distanceNum * 150).toFixed(0)}` : `KSH ${(distanceNum * 100).toFixed(0)}`;
      return { ...prev, fare, distance, duration };
    });
  }, []);

  // Handling location selection from map clicks
  const handleLocationSelected = useCallback((location, type) => {
    if (type === 'pickup') {
      setPickup(location);
    } else {
      setDestination(location);
    }
    // Clear trip and panel when locations change
    setTrip(null);
    setRouteInfo({ distance: '', duration: '' });
    setIsPanelOpen(false);
  }, []);

  // Handling input clearing
  const handleClearInput = useCallback((type) => {
    if (type === 'pickup') {
      setPickup(null);
    } else if (type === 'destination') {
      setDestination(null);
    }
    setTrip(null);
    setRouteInfo({ distance: '', duration: '' });
    setIsPanelOpen(false);
  }, []);

  // Handling see prices button
  const handleSeePrices = useCallback(() => {
    if (pickup && destination) {
      setIsPanelOpen(true);
    }
  }, [pickup, destination]);

  // Handling ride type selection from panel
  const handleRideSelect = useCallback((vehicleType) => {
    if (pickup && destination) {
      setTrip({
        pickup: pickup.name,
        destination: destination.name,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        vehicleType,
        fare: routeInfo.distance ? `KSH ${(parseFloat(routeInfo.distance) * (vehicleType === 'car' ? 150 : 100)).toFixed(0)}` : 'Calculating...',
        distance: routeInfo.distance || '',
        duration: routeInfo.duration || ''
      });
    }
    setIsPanelOpen(false);
  }, [pickup, destination, routeInfo]);

  // Rendering dashboard layout
  return (
    <main className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] mt-16 relative">
      {/* Map section */}
      <div className="flex-1">
        <Map
          drivers={mockDrivers}
          trip={trip}
          role="rider"
          onRouteCalculated={handleRouteCalculated}
          onLocationSelected={handleLocationSelected}
          pickupInput={pickup?.name || ''}
          destinationInput={destination?.name || ''}
          onClearInput={handleClearInput}
        />
      </div>
      {/* Controls section */}
      <div className="w-full md:w-96 bg-white p-8 rounded-2xl shadow-md md:border-l md:border-gray-200">
        <h2 className="text-3xl font-bold mb-6 tracking-tight">Plan Your Ride</h2>
        {/* Pickup input */}
        <div className="mb-4">
          <LocationSearch
            onSelect={setPickup}
            placeholder="Pickup Location"
            value={pickup?.name || ''}
            onChange={(value) => setPickup(value ? { name: value, lat: null, lng: null } : null)}
            onClear={() => handleClearInput('pickup')}
          />
        </div>
        {/* Destination input */}
        <div className="mb-6">
          <LocationSearch
            onSelect={setDestination}
            placeholder="Destination"
            value={destination?.name || ''}
            onChange={(value) => setDestination(value ? { name: value, lat: null, lng: null } : null)}
            onClear={() => handleClearInput('destination')}
          />
        </div>
        {/* See prices button */}
        <button
          onClick={handleSeePrices}
          disabled={!pickup || !destination}
          className="w-full bg-green-700 text-white p-4 rounded-lg font-semibold hover:bg-green-800 hover:scale-105 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          See Prices
        </button>
        {/* Trip status */}
        {trip && (
          <TripStatus
            pickup={trip.pickup}
            destination={trip.destination}
            distance={trip.distance}
            duration={trip.duration}
            fare={trip.fare}
          />
        )}
        {/* Recent activity */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          {user ? (
            <p className="text-gray-500 text-sm">No recent trips.</p>
          ) : (
            <Link to="/login" className="text-green-700 underline hover:text-green-800">
              Log in to see your recent activity
            </Link>
          )}
        </div>
      </div>
      {/* Ride selection panel */}
      {isPanelOpen && (
        <RideSelectionPanel
          onSelect={handleRideSelect}
          onClose={() => setIsPanelOpen(false)}
          distance={routeInfo.distance}
        />
      )}
    </main>
  );
}