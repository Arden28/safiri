import { useState } from 'react';
import PropTypes from 'prop-types';

// Ride selection panel for choosing trip type (Safiri Cab or Safiri Boda)
export default function RideSelectionPanel({ onSelect, onClose, distance }) {
  // State for selected ride type
  const [selectedRide, setSelectedRide] = useState('car');

  // Ride options with details
  const rideOptions = [
    {
      type: 'car',
      name: 'Safiri Cab',
      description: 'Comfortable car for up to 4 passengers',
      icon: "/images/safari-cab.png",
      fare: distance ? `KSH ${(parseFloat(distance) * 150).toFixed(0)}` : 'Calculating...',
      eta: distance ? `${Math.round(parseFloat(distance) * 3)} min` : 'Calculating...'
    },
    {
      type: 'bike',
      name: 'Safiri Boda',
      description: 'Quick motorcycle for 1 passenger',
      icon: "/images/safari-boda.png",
      fare: distance ? `KSH ${(parseFloat(distance) * 100).toFixed(0)}` : 'Calculating...',
      eta: distance ? `${Math.round(parseFloat(distance) * 2)} min` : 'Calculating...'
    }
  ];

  // Handling ride selection
  const handleSelect = (type) => {
    setSelectedRide(type);
  };

  // Handling request button
  const handleRequest = () => {
    onSelect(selectedRide);
    onClose();
  };

  // Finding selected ride name for button
  const selectedRideName = rideOptions.find(option => option.type === selectedRide)?.name || 'Safiri Cab';

  // Rendering scrollable panel
  return (
    <div className="fixed bottom-0 left-0 z-50 overflow-y-auto bg-white shadow-xl top-16 w-80 md:w-96 sm:w-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-[#2D6A4F]">Choose Your Ride</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        {/* Ride options list */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {rideOptions.map((option) => (
            <div
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                selectedRide === option.type
                  ? 'border-[#2D6A4F] bg-gray-50'
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              {/* Vehicle icon */}
              {/* <div className="mr-4"></div> */}
              <img className='mr-4' src={option.icon} alt="" />
              {/* Ride details */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{option.name}</h3>
                <p className="text-sm text-gray-500">{option.description}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-sm font-medium text-[#2D6A4F]">{option.fare}</span>
                  <span className="text-sm text-gray-500">{option.eta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Request button */}
        <div className="sticky bottom-0 p-4 bg-white border-t">
          <button
            onClick={handleRequest}
            className="w-full bg-[#2D6A4F] text-white p-4 rounded-lg font-semibold hover:bg-[#1f513f] transition-all duration-300"
          >
            Request {selectedRideName}
          </button>
        </div>
      </div>
    </div>
  );
}

// Prop types for type checking
RideSelectionPanel.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  distance: PropTypes.string
};