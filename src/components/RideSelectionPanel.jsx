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
      icon: (
        <svg className="w-8 h-8 text-[#2D6A4F]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 18.5v-1c0-.8-.7-1.5-1.5-1.5H13v6h-2v-6H7.5C6.7 16 6 16.7 6 17.5v1H3v2h18v-2h-3zM12 3C7.6 3 4 6.6 4 11h2c0-3.3 2.7-6 6-6s6 2.7 6 6h2c0-4.4-3.6-8-8-8z" />
        </svg>
      ),
      fare: distance ? `KSH ${(parseFloat(distance) * 150).toFixed(0)}` : 'Calculating...',
      eta: distance ? `${Math.round(parseFloat(distance) * 3)} min` : 'Calculating...'
    },
    {
      type: 'bike',
      name: 'Safiri Boda',
      description: 'Quick motorcycle for 1 passenger',
      icon: (
        <svg className="w-8 h-8 text-[#2D6A4F]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 10h-1.6l-2-4H11v2h3.4l1.2 2.4L12 12H9v2h3l3.6-1.8 1.2 2.4H15v2h3.6l1.2-2.4L21 12l-2-2zM5 14c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
        </svg>
      ),
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
    <div className="fixed top-16 left-0 bottom-0 w-80 bg-white shadow-xl z-50 overflow-y-auto md:w-96 sm:w-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
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
              <div className="mr-4">{option.icon}</div>
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
        <div className="p-4 border-t sticky bottom-0 bg-white">
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