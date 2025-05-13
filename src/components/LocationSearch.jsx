import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Location search component with Google Places Autocomplete and clear button
export default function LocationSearch({ onSelect, placeholder, value, onChange, onClear }) {
  // Ref for input element
  const inputRef = useRef(null);
  const autocomplete = useRef(null);

  // Initializing Google Places Autocomplete
  useEffect(() => {
    if (!window.google) return;
    const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ke' },
      fields: ['place_id', 'geometry', 'name']
    });

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      if (place.geometry) {
        onSelect({
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    });

    // Cleanup on unmount
    return () => {
      if (autocomplete.current) {
        google.maps.event.clearInstanceListeners(autocomplete.current);
      }
    };
  }, [onSelect, onChange]);

  // Rendering input with clear button
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 mb-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            onClear();
            inputRef.current.value = '';
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          ✕
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