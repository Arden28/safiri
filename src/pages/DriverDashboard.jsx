import { useState } from 'react';
import { mockTripRequests } from '../data/fakeData';
import Map from '../components/Map';
import TripCard from '../components/TripCard';

export default function DriverDashboard({ user }) {
  const [tripRequests, setTripRequests] = useState(mockTripRequests);
  const [activeTrip, setActiveTrip] = useState(null);

  const handleAccept = (trip) => {
    setActiveTrip(trip);
    setTripRequests(tripRequests.filter(t => t.id !== trip.id));
  };

  const handleDecline = (tripId) => {
    setTripRequests(tripRequests.filter(t => t.id !== tripId));
  };

  return (
    <main className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] mt-16">
      <div className="flex-1">
        <Map trip={activeTrip} role="driver" />
      </div>
      <div className="w-full md:w-96 bg-white p-8 rounded-2xl shadow-md md:border-l md:border-gray-200">
        <h2 className="text-3xl font-bold mb-6 tracking-tight">Trip Requests</h2>
        {tripRequests.map(trip => (
          <TripCard
            key={trip.id}
            trip={trip}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        ))}
        {activeTrip && (
          <div className="mt-6 bg-green-50 p-6 rounded-lg border border-green-200">
            <p className="text-green-700 font-semibold">Active Ride</p>
            <p className="text-gray-600">Rider: {activeTrip.rider}</p>
            <p className="text-gray-600">Pickup: {activeTrip.pickup}</p>
            <p className="text-gray-600">Destination: {activeTrip.destination}</p>
            <p className="text-gray-600">ETA: {activeTrip.eta}</p>
            <p className="text-gray-600">Distance: {activeTrip.distance}</p>
            <p className="text-gray-600">Fare: {activeTrip.fare}</p>
          </div>
        )}
      </div>
    </main>
  );
}