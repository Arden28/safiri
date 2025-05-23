import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Ride selection panel for choosing trip type (Safiri Cab or Safiri Boda)
export default function RideSelectionPanel({ onSelect, onClose, distance, duration, trip, nearestDriver, noDriverFound, driverConfirmed }) {
  // State for selected ride type, request status, payment method, modals, and loading
  const [selectedRide, setSelectedRide] = useState('car');
  const [isRequested, setIsRequested] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  // Log props for debugging
  useEffect(() => {
    console.log('RideSelectionPanel props:', { distance, duration, trip, nearestDriver, noDriverFound, driverConfirmed });
    if (distance && duration) {
      setIsPriceLoading(false);
    } else {
      // Fallback after 5 seconds if no route data
      const timeout = setTimeout(() => {
        console.warn('Using fallback values due to missing distance/duration');
        setUseFallback(true);
        setIsPriceLoading(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [distance, duration]);

  // Ride options with details
  const rideOptions = [
    {
      type: 'car',
      name: 'Safiri Cab',
      description: 'Comfortable car for up to 4 passengers',
      icon: 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747923673/ChatGPT_Image_May_22_2025_02_44_42_PM_giunij.png',
      fare: distance ? `KSH ${(parseFloat(distance) * 150).toFixed(0)}` : (useFallback ? 'KSH 300' : 'Calculating...'),
      eta: duration ? `${Math.round(parseFloat(duration) / 60)} min` : (useFallback ? '15 min' : 'Calculating...')
    },
    {
      type: 'bike',
      name: 'Safiri Boda',
      description: 'Quick motorcycle for 1 passenger',
      icon: 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747923676/ChatGPT_Image_May_22_2025_02_58_28_PM_kc29tp.png',
      fare: distance ? `KSH ${(parseFloat(distance) * 100).toFixed(0)}` : (useFallback ? 'KSH 200' : 'Calculating...'),
      eta: duration ? `${Math.round(parseFloat(duration) / 90)} min` : (useFallback ? '10 min' : 'Calculating...')
    }
  ];

  // Payment method options
  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: 'M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM1 10h22' },
    { id: 'mpesa', name: 'M-Pesa', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-9h2v4h-2zm0-2h2v2h-2z' },
    { id: 'card', name: 'Card', icon: 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM2 8h20' },
    { id: 'paypal', name: 'PayPal', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-9h2v4h-2zm0-2h2v2h-2z' }
  ];

  // Handling ride selection
  const handleSelect = (type) => {
    console.log('Selected ride type:', type);
    setSelectedRide(type);
    if (isRequested) {
      setIsRequested(false);
      onSelect(null);
    }
  };

  // Handling request button
  const handleRequest = () => {
    console.log('Requesting ride:', { rideType: selectedRide, paymentMethod: selectedPaymentMethod });
    setIsRequested(true);
    onSelect({ rideType: selectedRide, paymentMethod: selectedPaymentMethod });
  };

  // Handling cancel button
  const handleCancel = () => {
    console.log('Canceling request');
    setIsRequested(false);
    setSelectedRide('car');
    setSelectedPaymentMethod('Cash');
    setIsPriceLoading(true);
    setUseFallback(false);
    onSelect(null);
  };

  // Handling payment method selection
  const handlePaymentSelect = (method) => {
    console.log('Selected payment method:', method);
    setSelectedPaymentMethod(method);
    setIsPaymentModalOpen(false);
  };

  // Handling add payment method (placeholder for future implementation)
  const handleAddPayment = () => {
    console.log('Add Payment Method clicked');
    alert('Add Payment Method functionality to be implemented.');
  };

  // Handling message send (placeholder)
  const handleSendMessage = () => {
    console.log('Sending message:', messageText);
    alert('Message functionality to be implemented.');
    setMessageText('');
    setIsMessageModalOpen(false);
  };

  // Finding selected ride name for button
  const selectedRideName = rideOptions.find(option => option.type === selectedRide)?.name || 'Safiri Cab';

  // Rendering scrollable panel with Uber-like design
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-white shadow-2xl rounded-t-3xl max-h-[80vh] overflow-y-auto sm:w-96 sm:rounded-2xl sm:max-h-[90vh] sm:mx-auto">
      <div className="flex flex-col h-full">
        {/* Drag handle for mobile */}
        <div className="flex justify-center py-2 sm:hidden">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg sm:text-xl font-bold text-[#2D6A4F]">
            {isRequested ? (noDriverFound ? 'No Drivers Available' : driverConfirmed ? 'Ride Confirmed' : 'Searching for Driver') : 'Choose Your Ride'}
          </h2>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Ride options or confirmation */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto sm:p-6">
          {isRequested ? (
            noDriverFound ? (
              <div className="py-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">No Drivers Available</h3>
                <p className="mt-2 text-sm text-gray-500">Sorry, there are no drivers within 30km of your location.</p>
                <button
                  onClick={handleRequest}
                  className="mt-4 w-full bg-[#2D6A4F] text-white p-3 rounded-lg font-semibold hover:bg-[#1f513f] transition-all duration-300"
                >
                  Try Again
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full p-3 mt-2 font-semibold text-white transition-all duration-300 bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            ) : driverConfirmed && nearestDriver ? (
              <div className="space-y-4">
                <div className="flex items-center p-4 shadow-sm bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 mr-4 bg-gray-200 rounded-full"></div> {/* Placeholder for driver photo */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{nearestDriver.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{nearestDriver.vehicle} • {selectedRideName}</p>
                  </div>
                  <button
                    onClick={() => setIsMessageModalOpen(true)}
                    className="text-[#2D6A4F] font-semibold hover:text-[#1f513f]"
                  >
                    Message
                  </button>
                </div>
                <p className="text-sm text-gray-500">Payment Method: {selectedPaymentMethod}</p>
                <button
                  onClick={handleCancel}
                  className="w-full p-3 font-semibold text-white transition-all duration-300 bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Cancel Ride
                </button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <svg className="w-16 h-16 mx-auto text-[#2D6A4F] mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 0116 0" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800">Searching for {selectedRideName}</h3>
                <p className="mt-2 text-sm text-gray-500">We're looking for a driver. Please wait...</p>
                <button
                  onClick={handleCancel}
                  className="w-full p-3 mt-4 font-semibold text-white transition-all duration-300 bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            )
          ) : (
            <>
              {isPriceLoading && !useFallback && (
                <p className="text-sm text-center text-gray-500">Calculating fares...</p>
              )}
              {rideOptions.map((option) => (
                <div
                  key={option.type}
                  onClick={() => handleSelect(option.type)}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                    selectedRide === option.type
                      ? 'border-[#2D6A4F] bg-[#2D6A4F]/5 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Vehicle icon */}
                  <img className="w-12 h-12 mr-4 rounded-lg sm:w-16 sm:h-16" src={option.icon} alt={option.name} />
                  {/* Ride details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-800 sm:text-lg">{option.name}</h3>
                      <span className="text-xs sm:text-sm font-medium text-[#2D6A4F]">{option.eta}</span>
                    </div>
                    <p className="text-xs text-gray-500 sm:text-sm">{option.description}</p>
                    <span className="text-sm sm:text-base font-bold text-[#2D6A4F] mt-1 block">{option.fare}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        {/* Payment and Request buttons */}
        {!isRequested && (
          <div className="sticky bottom-0 flex flex-col gap-2 p-4 bg-white border-t sm:p-6 sm:flex-row sm:gap-4">
            {/* Payment method section */}
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center justify-center w-full p-2 font-semibold text-gray-800 transition-all duration-300 bg-gray-100 rounded-lg sm:w-1/3 sm:p-3 hover:bg-gray-200"
            >
              <svg className="w-4 h-4 mr-2 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paymentMethods.find(m => m.name === selectedPaymentMethod)?.icon} />
              </svg>
              <span className="text-sm sm:text-base">{selectedPaymentMethod}</span>
            </button>
            {/* Request button */}
            <button
              onClick={handleRequest}
              disabled={isPriceLoading && !useFallback}
              className="w-full sm:w-2/3 bg-[#2D6A4F] text-white p-2 sm:p-3 rounded-lg font-semibold hover:bg-[#1f513f] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Request {selectedRideName}
            </button>
          </div>
        )}
      </div>
      {/* Payment selection modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-[#2D6A4F]">Select Payment Method</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-500 transition-colors hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal body */}
            <div className="p-4 space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentSelect(method.name)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                    selectedPaymentMethod === method.name
                      ? 'bg-[#2D6A4F]/10 border-[#2D6A4F]'
                      : 'hover:bg-gray-50 border-gray-200'
                  } border`}
                >
                  <svg className="w-6 h-6 mr-3 text-[#2D6A4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={method.icon} />
                  </svg>
                  <span className="font-medium text-gray-800">{method.name}</span>
                  {selectedPaymentMethod === method.name && (
                    <svg className="w-5 h-5 ml-auto text-[#2D6A4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            {/* Add payment method */}
            <div className="p-4 border-t">
              <button
                onClick={handleAddPayment}
                className="w-full bg-[#2D6A4F] text-white p-3 rounded-lg font-semibold hover:bg-[#1f513f] transition-all duration-300"
              >
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Message modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-[#2D6A4F]">Message {nearestDriver?.name}</h3>
              <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-500 transition-colors hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal body */}
            <div className="p-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full h-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
            </div>
            {/* Send button */}
            <div className="p-4 border-t">
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="w-full bg-[#2D6A4F] text-white p-3 rounded-lg font-semibold hover:bg-[#1f513f] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Prop types for type checking
RideSelectionPanel.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  distance: PropTypes.string,
  duration: PropTypes.string,
  trip: PropTypes.object,
  nearestDriver: PropTypes.object,
  noDriverFound: PropTypes.bool,
  driverConfirmed: PropTypes.bool
};