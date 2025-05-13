export default function TripCard({ trip, onAccept, onDecline }) {
    return (
      <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-900">Rider: {trip.rider}</p>
        <p className="text-sm text-gray-500">Pickup: {trip.pickup}</p>
        <p className="text-sm text-gray-500">Destination: {trip.destination}</p>
        <p className="text-sm text-gray-500">Distance: {trip.distance}</p>
        <p className="text-sm text-gray-500">Estimated Fare: {trip.fare}</p>
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => onAccept(trip)}
            className="flex-1 bg-green-700 text-white p-4 rounded-lg font-semibold hover:bg-green-800 hover:scale-105 transition-all duration-300"
          >
            Accept
          </button>
          <button
            onClick={() => onDecline(trip.id)}
            className="flex-1 bg-gray-200 text-gray-900 p-4 rounded-lg font-semibold hover:bg-gray-300"
          >
            Decline
          </button>
        </div>
      </div>
    );
  }