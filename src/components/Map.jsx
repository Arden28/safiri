import { useEffect, useRef, useCallback } from 'react';

// Map component for displaying drivers, trip routes, and interactive location selection
export default function Map({
  drivers,
  trip,
  role,
  onRouteCalculated,
  onLocationSelected,
  pickupInput,
  destinationInput,
  onClearInput
}) {
  // Refs for map instance, markers, directions, geocoder, and info windows
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const infoWindows = useRef([]); // Track info windows for cleanup
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);
  const geocoder = useRef(null);
  const lastTrip = useRef(null); // Track last processed trip to prevent duplicate renders

  // Debounce function to limit API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Initialize map and services
  useEffect(() => {
    if (!window.google) return;

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: -1.286389, lng: 36.817223 }, // Nairobi
        zoom: 13,
        styles: [
          { featureType: 'all', stylers: [{ saturation: -20 }] }, // Muted colors
          { featureType: 'road', elementType: 'geometry', stylers: [{ hue: '#2D6A4F' }] }, // Green roads
          { featureType: 'poi', stylers: [{ visibility: 'simplified' }] } // Simplified POIs
        ]
      });
      directionsService.current = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2D6A4F', // Green to match theme
          strokeOpacity: 0.8,
          strokeWeight: 5 // Thick, smooth line
        }
      });
      geocoder.current = new google.maps.Geocoder();
    }
  }, []);

  // Handle map updates
  const updateMap = useCallback(() => {
    if (!mapInstance.current || !directionsRenderer.current) return;

    // Clear existing markers and info windows
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    infoWindows.current.forEach(infoWindow => infoWindow.close());
    infoWindows.current = [];

    // Add driver markers for rider role
    if (role === 'rider' && drivers && drivers.length) {
      drivers.forEach(driver => {
        const marker = new google.maps.Marker({
          position: { lat: driver.lat, lng: driver.lng },
          map: mapInstance.current,
          icon: {
            path: driver.vehicle === 'car' ? google.maps.SymbolPath.CIRCLE : google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: '#2D6A4F',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: driver.vehicle === 'car' ? 8 : 6
          },
          animation: google.maps.Animation.DROP
        });
        markers.current.push(marker);
      });
    }

    // Calculate and display route for trip
    if (trip && trip.pickupLat && trip.pickupLng && trip.destLat && trip.destLng) {
      // Check if trip has changed to avoid duplicate calls
      const tripKey = `${trip.pickupLat},${trip.pickupLng},${trip.destLat},${trip.destLng},${trip.vehicleType}`;
      if (lastTrip.current === tripKey) return;
      lastTrip.current = tripKey;

      // Clear previous route only when starting a new calculation
      directionsRenderer.current.setDirections({ routes: [] });

      const request = {
        origin: { lat: trip.pickupLat, lng: trip.pickupLng },
        destination: { lat: trip.destLat, lng: trip.destLng },
        travelMode: trip.vehicleType === 'bike' ? 'BICYCLING' : 'DRIVING'
      };

      // Debounced route calculation
      const calculateRoute = debounce((req) => {
        directionsService.current.route(req, (result, status) => {
          if (status === 'OK') {
            // Ensure renderer is bound to map
            directionsRenderer.current.setMap(mapInstance.current);
            directionsRenderer.current.setDirections(result);
            const route = result.routes[0].legs[0];
            onRouteCalculated({
              distance: route.distance.text,
              duration: route.duration.text
            });

            // Add pickup marker
            const pickupMarker = new google.maps.Marker({
              position: { lat: trip.pickupLat, lng: trip.pickupLng },
              map: mapInstance.current,
              icon: {
                path: 'M -10,0 A 10,10 0 1,1 10,0 A 10,10 0 1,1 -10,0 Z M -7,0 A 7,7 0 1,0 7,0 A 7,7 0 1,0 -7,0 Z',
                fillColor: '#2D6A4F',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 1
              }
            });
            const pickupContent = trip.pickup ? `From ${trip.pickup}` : 'Pickup';
            console.log('Pickup Info Content:', pickupContent); // Debug content
            const pickupInfo = new google.maps.InfoWindow({
              content: `<div style="background: #2D6A4F; color: white; padding: 8px 12px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; max-width: 200px;">
                        ${pickupContent}
                        </div>`
            });
            // Delay opening to ensure rendering
            setTimeout(() => {
              pickupInfo.open(mapInstance.current, pickupMarker);
            }, 100);
            markers.current.push(pickupMarker);
            infoWindows.current.push(pickupInfo);

            // Add dropoff marker
            const dropoffMarker = new google.maps.Marker({
              position: { lat: trip.destLat, lng: trip.destLng },
              map: mapInstance.current,
              icon: {
                path: 'M -10,-10 L 10,-10 L 10,10 L -10,10 Z M -7,-7 L 7,-7 L 7,7 L -7,7 Z',
                fillColor: '#2D6A4F',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 1
              }
            });
            const dropoffContent = trip.destination ? `To ${trip.destination}` : 'Dropoff';
            console.log('Dropoff Info Content:', dropoffContent); // Debug content
            const dropoffInfo = new google.maps.InfoWindow({
              content: `<div style="background: #2D6A4F; color: white; padding: 8px 12px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; max-width: 200px;">
                        ${dropoffContent}
                        </div>`
            });
            // Delay opening to ensure rendering
            setTimeout(() => {
              dropoffInfo.open(mapInstance.current, dropoffMarker);
            }, 100);
            markers.current.push(dropoffMarker);
            infoWindows.current.push(dropoffInfo);

            // Fit map to route
            const bounds = new google.maps.LatLngBounds();
            route.steps.forEach(step => {
              step.path.forEach(point => bounds.extend(point));
            });
            mapInstance.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
          } else {
            console.error('Directions API failed:', status);
          }
        });
      }, 100);

      calculateRoute(request);
    } else {
      // Clear route only when no trip
      directionsRenderer.current.setDirections({ routes: [] });
      if (drivers && drivers.length) {
        // Center map on drivers if no trip
        const bounds = new google.maps.LatLngBounds();
        drivers.forEach(driver => bounds.extend({ lat: driver.lat, lng: driver.lng }));
        mapInstance.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
      }
    }
  }, [drivers, trip, role, onRouteCalculated, pickupInput, destinationInput]);

  // Handle map click for location selection
  useEffect(() => {
    if (!mapInstance.current) return;

    const clickListener = mapInstance.current.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      geocoder.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          if (!pickupInput || (pickupInput && destinationInput)) {
            onLocationSelected({ name: address, lat, lng }, 'pickup');
            if (pickupInput && destinationInput) onClearInput('destination');
          } else {
            onLocationSelected({ name: address, lat, lng }, 'destination');
          }
        }
      });
    });

    // Update map when dependencies change
    updateMap();

    // Cleanup
    return () => {
      google.maps.event.removeListener(clickListener);
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
      infoWindows.current.forEach(infoWindow => infoWindow.close());
      infoWindows.current = [];
    };
  }, [updateMap, onLocationSelected, onClearInput, pickupInput, destinationInput]);

  // Rendering map container
  return <div ref={mapRef} className="h-full w-full rounded-lg shadow-lg" />;
}