import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { mockDrivers } from '../data/fakeData';
import Map from '../components/Map';
import LocationSearch from '../components/LocationSearch';
import TripStatus from '../components/TripStatus';
import RideSelectionPanel from '../components/RideSelectionPanel';

// Rider dashboard for managing trip requests and location selection
export default function RiderDashboard({ user }) {
  // State for trip details, inputs, route info, panel visibility, loading, and driver
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [trip, setTrip] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '', carFare: '', bikeFare: '' });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [isRideRequested, setIsRideRequested] = useState(false);
  const [nearestDriver, setNearestDriver] = useState(null);
  const routeCache = useRef({}); // Cache for route results

  // Calculate distance between two points (Haversine formula, in km)
  const haversineDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find nearest driver within 30km
  const findNearestDriver = useCallback(() => {
    if (!trip?.pickupLat || !trip?.pickupLng) return null;

    const pickup = { lat: trip.pickupLat, lng: trip.pickupLng };
    let closestDriver = null;
    let minDistance = Infinity;

    mockDrivers.forEach(driver => {
      if (driver.status !== 'available' || driver.vehicle !== trip.vehicleType) return;
      const distance = haversineDistance(pickup.lat, pickup.lng, driver.lat, driver.lng);
      if (distance <= 30 && distance < minDistance) {
        minDistance = distance;
        closestDriver = driver;
      }
    });

    console.log('Nearest driver:', closestDriver ? `${closestDriver.name} (${minDistance.toFixed(2)} km)` : 'None found');
    return closestDriver;
  }, [trip]);

  // Handling route calculation from map
  const handleRouteCalculated = useCallback(
    debounce((routeData) => {
      setIsRouteLoading(false);
      if (!routeData) {
        console.error('Route calculation failed, received null data');
        setRouteInfo({ distance: '', duration: '', carFare: '', bikeFare: '' });
        return;
      }
      const { distance, duration } = routeData;
      console.log('Route calculated in RiderDashboard:', { distance, duration });
      const distanceNum = parseFloat(distance) || 0;
      const carFare = `KSH ${(distanceNum * 150).toFixed(0)}`;
      const bikeFare = `KSH ${(distanceNum * 100).toFixed(0)}`;
      setRouteInfo({ distance, duration, carFare, bikeFare });
      setTrip(prev => {
        if (!prev) return prev;
        const fare = prev.vehicleType === 'car' ? carFare : bikeFare;
        return { ...prev, fare, distance, duration, paymentMethod: prev.paymentMethod };
      });
    }, 100),
    []
  );

  // Handling location selection from map clicks
  const handleLocationSelected = useCallback((location, type) => {
    console.log(`Location selected: ${type}`, location);
    if (type === 'pickup') {
      setPickup(location);
    } else {
      setDestination(location);
    }
    // Clear trip and panel when locations change
    setTrip(null);
    setRouteInfo({ distance: '', duration: '', carFare: '', bikeFare: '' });
    setIsPanelOpen(false);
    setIsRouteLoading(true);
    setIsRideRequested(false);
    setNearestDriver(null);
  }, []);

  // Handling input clearing
  const handleClearInput = useCallback((type) => {
    console.log(`Clearing input: ${type}`);
    if (type === 'pickup') {
      setPickup(null);
    } else if (type === 'destination') {
      setDestination(null);
    }
    setTrip(null);
    setRouteInfo({ distance: '', duration: '', carFare: '', bikeFare: '' });
    setIsPanelOpen(false);
    setIsRouteLoading(false);
    setIsRideRequested(false);
    setNearestDriver(null);
  }, []);

  // Handling see prices button
  const handleSeePrices = useCallback(() => {
    if (pickup && destination) {
      // Check cache for route
      const cacheKey = `${pickup.lat},${pickup.lng},${destination.lat},${destination.lng}`;
      if (routeCache.current[cacheKey]) {
        console.log('Using cached route:', routeCache.current[cacheKey]);
        setRouteInfo(routeCache.current[cacheKey]);
        setIsRouteLoading(false);
        setIsPanelOpen(true);
      } else {
        console.log('Opening RideSelectionPanel, awaiting route calculation');
        setIsPanelOpen(true);
      }
    }
  }, [pickup, destination]);

  // Handling route calculation with caching
  const handleRouteCalculatedWithCache = useCallback(
    (routeData) => {
      if (routeData && pickup && destination) {
        const cacheKey = `${pickup.lat},${pickup.lng},${destination.lat},${destination.lng}`;
        const distanceNum = parseFloat(routeData.distance) || 0;
        const routeInfo = {
          distance: routeData.distance,
          duration: routeData.duration,
          carFare: `KSH ${(distanceNum * 150).toFixed(0)}`,
          bikeFare: `KSH ${(distanceNum * 100).toFixed(0)}`
        };
        routeCache.current[cacheKey] = routeInfo;
        handleRouteCalculated(routeData);
      } else {
        handleRouteCalculated(routeData);
      }
    },
    [pickup, destination, handleRouteCalculated]
  );

  // Handling ride type and payment method selection from panel
  const handleRideSelect = useCallback((selection) => {
    if (!selection) {
      console.log('Clearing trip selection');
      setTrip(null);
      setRouteInfo({ distance: '', duration: '', carFare: '', bikeFare: '' });
      setIsRideRequested(false);
      setNearestDriver(null);
      return;
    }
    const { rideType, paymentMethod } = selection;
    console.log('Ride selected:', { rideType, paymentMethod });
    if (pickup && destination) {
      const fare = rideType === 'car' ? routeInfo.carFare : routeInfo.bikeFare;
      setTrip({
        pickup: pickup.name,
        destination: destination.name,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        vehicleType: rideType,
        fare: fare || 'Calculating...',
        distance: routeInfo.distance || '',
        duration: routeInfo.duration || '',
        paymentMethod
      });
      setIsRideRequested(true);
      // Find nearest driver after a short delay to simulate search
      setTimeout(() => {
        const driver = findNearestDriver();
        setNearestDriver(driver);
      }, 2000);
    }
  }, [pickup, destination, routeInfo, findNearestDriver]);

  // Rendering dashboard layout
  return (
    <main className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] mt-3 relative">
      {/* Map section */}
      <div className="flex-1">
        <Map
          drivers={mockDrivers}
          trip={trip}
          role="rider"
          onRouteCalculated={handleRouteCalculatedWithCache}
          onLocationSelected={handleLocationSelected}
          pickupInput={pickup?.name || ''}
          destinationInput={destination?.name || ''}
          onClearInput={handleClearInput}
          isRideRequested={isRideRequested}
          nearestDriver={nearestDriver}
        />
      </div>
      {/* Controls section */}
      <div className="w-full p-8 bg-white md:w-96 rounded-2xl">
        <h2 className="mb-6 text-3xl font-bold tracking-tight">Plan Your Ride</h2>
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
          className="w-full p-4 font-semibold text-white transition-all duration-300 bg-green-700 rounded-lg hover:bg-green-800 hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          See Prices
        </button>
        {/* Loading indicator */}
        {isRouteLoading && (
          <p className="mt-4 text-sm text-gray-500">Calculating route...</p>
        )}
        {/* Trip status */}
        {(pickup && destination) && (
          <TripStatus
            pickup={pickup.name}
            destination={destination.name}
            distance={routeInfo.distance}
            duration={routeInfo.duration}
            fare={trip ? trip.fare : routeInfo.carFare}
            vehicleType={trip ? trip.vehicleType : 'car'}
          />
        )}
        {/* Recent activity */}
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-semibold">Recent Activity</h3>
          {user ? (
            <p className="text-sm text-gray-500">No recent trips.</p>
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
          onClose={() => {
            setIsPanelOpen(false);
            setIsRideRequested(false);
            setNearestDriver(null);
            setTrip(null);
            setRouteInfo({ distance: '', duration: '', carFare: '', bikeFare: '' });
          }}
          distance={routeInfo.distance}
          duration={routeInfo.duration}
          trip={trip}
        />
      )}
    </main>
  );
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}