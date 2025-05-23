import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Location search component with Google Places Autocomplete and clear button
export default function LocationSearch({ onSelect, placeholder, value, onChange, onClear }) {
  // Refs for input element and autocomplete instance
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps API not loaded. Please check API key and network.');
      return;
    }

    const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ke' },
      fields: ['place_id', 'geometry', 'name']
    });

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      if (place.geometry) {
        const location = {
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        console.log('Location selected in LocationSearch:', location);
        onSelect(location);
      } else {
        console.warn('No geometry data for selected place:', place);
      }
    });

    autocompleteRef.current = autocompleteInstance;

    // Cleanup on unmount
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [onSelect]);

  // Handle clear button
  const handleClear = () => {
    onChange('');
    onClear();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 sm:p-3 text-sm sm:text-base bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] placeholder-gray-400 transition-all duration-200"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-2 top-1/2 hover:text-gray-600"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Prop types for type checking
LocationSearch.propTypes = {
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
};