import PropTypes from 'prop-types';

// Trip status component for displaying trip details
export default function TripStatus({ pickup, destination, distance, duration, fare }) {
  // Rendering trip details in a card
  return (
    <div className="p-4 bg-white shadow-md border-t mt-6">
      <h3 className="text-lg font-semibold text-[#2D6A4F]">Trip Details</h3>
      <p className="mt-2 text-gray-600">
        <span className="font-medium">From:</span> {pickup}
      </p>
      <p className="text-gray-600">
        <span className="font-medium">To:</span> {destination}
      </p>
      {distance && (
        <p className="text-gray-600">
          <span className="font-medium">Distance:</span> {distance}
        </p>
      )}
      {duration && (
        <p className="text-gray-600">
          <span className="font-medium">Duration:</span> {duration}
        </p>
      )}
      <p className="text-gray-600">
        <span className="font-medium">Fare:</span> {fare}
      </p>
    </div>
  );
}

// Prop types for type checking
TripStatus.propTypes = {
  pickup: PropTypes.string,
  destination: PropTypes.string,
  distance: PropTypes.string,
  duration: PropTypes.string,
  fare: PropTypes.string
};