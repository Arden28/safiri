import PropTypes from 'prop-types';

// Trip status component to display trip details
export default function TripStatus({ pickup, destination, distance, duration, fare, vehicleType }) {
  return (
    <div className="p-3 mt-4 rounded-lg sm:p-4 bg-gray-50">
      <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Trip Details</h3>
      <div className="mt-2 space-y-1 sm:space-y-2">
        <p className="text-xs text-gray-600 sm:text-sm">
          <span className="font-medium">From:</span> {pickup}
        </p>
        <p className="text-xs text-gray-600 sm:text-sm">
          <span className="font-medium">To:</span> {destination}
        </p>
        {distance && (
          <p className="text-xs text-gray-600 sm:text-sm">
            <span className="font-medium">Distance:</span> {distance}
          </p>
        )}
        {duration && (
          <p className="text-xs text-gray-600 sm:text-sm">
            <span className="font-medium">Duration:</span> {duration}
          </p>
        )}
        {fare && (
          <p className="text-xs text-gray-600 sm:text-sm">
            <span className="font-medium">Fare:</span> {fare} ({vehicleType})
          </p>
        )}
      </div>
    </div>
  );
}

// Prop types for type checking
TripStatus.propTypes = {
  pickup: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  distance: PropTypes.string,
  duration: PropTypes.string,
  fare: PropTypes.string,
  vehicleType: PropTypes.string
};