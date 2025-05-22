import { useEffect, useRef, useCallback, useState } from 'react';

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
  const markers = useRef({});
  const infoWindows = useRef([]);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);
  const geocoder = useRef(null);
  const lastTrip = useRef(null);
  const animationFrame = useRef(null);
  const driverRoutes = useRef({});

  // State to track driver progress, direction, and route loading
  const [driverStates, setDriverStates] = useState(
    drivers.map(driver => ({
      id: driver.id,
      progress: 0,
      direction: 1,
      routeLoaded: false
    }))
  );

  // Debounce function to limit API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Linear interpolation for smooth movement
  const lerp = (start, end, t) => start + (end - start) * t;

  // Calculate bearing between two points (in degrees)
  const calculateBearing = (start, end) => {
    const lat1 = (start.lat * Math.PI) / 180;
    const lng1 = (start.lng * Math.PI) / 180;
    const lat2 = (end.lat * Math.PI) / 180;
    const lng2 = (end.lng * Math.PI) / 180;
    const dLng = lng2 - lng1;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    bearing = (bearing + 360) % 360;
    console.log(`Driver ${start.id || ''} bearing from ${start.lat},${start.lng} to ${end.lat},${end.lng}: ${bearing}`);
    return bearing;
  };

  // Initialize map and services
  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      return;
    }

    if (!mapInstance.current) {
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: -1.286389, lng: 36.817223 }, // Nairobi
        zoom: 13,
        styles: [
          { featureType: 'all', stylers: [{ saturation: -20 }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ hue: '#2D6A4F' }] },
          { featureType: 'poi', stylers: [{ visibility: 'simplified' }] }
        ]
      });
      directionsService.current = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#2D6A4F',
          strokeOpacity: 0.8,
          strokeWeight: 5
        }
      });
      geocoder.current = new google.maps.Geocoder();
    }
  }, []);

  // Fetch driver routes
  useEffect(() => {
    if (!mapInstance.current || !directionsService.current || role !== 'rider' || !drivers || !drivers.length) return;

    const fetchRoute = (driver) => {
      return new Promise((resolve) => {
        if (!driver.routeStart || !driver.routeEnd) {
          console.warn(`No routeStart or routeEnd for driver ${driver.id}`);
          resolve([]);
          return;
        }
        if (driverRoutes.current[driver.id]) {
          resolve(driverRoutes.current[driver.id]);
          return;
        }

        const request = {
          origin: { lat: driver.routeStart.lat, lng: driver.routeStart.lng },
          destination: { lat: driver.routeEnd.lat, lng: driver.routeEnd.lng },
          travelMode: driver.vehicle === 'bike' ? 'BICYCLING' : 'DRIVING'
        };

        console.log(`Fetching route for driver ${driver.id} (${driver.vehicle}) from ${request.origin.lat},${request.origin.lng} to ${request.destination.lat},${request.destination.lng}`);

        directionsService.current.route(request, (result, status) => {
          if (status === 'OK') {
            const path = result.routes[0].overview_path.map(point => ({
              lat: point.lat(),
              lng: point.lng(),
              id: driver.id
            }));
            console.log(`Route fetched for driver ${driver.id} (${driver.vehicle}): ${path.length} points`);
            driverRoutes.current[driver.id] = path;
            resolve(path);
          } else {
            console.warn(`Directions API failed for driver ${driver.id} (${driver.vehicle}, BICYCLING): ${status}`);
            // Fallback to DRIVING for bikes
            if (driver.vehicle === 'bike') {
              console.log(`Retrying driver ${driver.id} with DRIVING mode`);
              directionsService.current.route(
                { ...request, travelMode: 'DRIVING' },
                (fallbackResult, fallbackStatus) => {
                  if (fallbackStatus === 'OK') {
                    const path = fallbackResult.routes[0].overview_path.map(point => ({
                      lat: point.lat(),
                      lng: point.lng(),
                      id: driver.id
                    }));
                    console.log(`Fallback route fetched for driver ${driver.id} (DRIVING): ${path.length} points`);
                    driverRoutes.current[driver.id] = path;
                    resolve(path);
                  } else {
                    console.error(`Fallback DRIVING failed for driver ${driver.id}: ${fallbackStatus}`);
                    resolve([]);
                  }
                }
              );
            } else {
              resolve([]);
            }
          }
        });
      });
    };

    // Fetch routes for all drivers concurrently
    Promise.all(drivers.map(driver => fetchRoute(driver))).then(results => {
      setDriverStates(prev =>
        prev.map((state, index) => ({
          ...state,
          routeLoaded: results[index] && results[index].length > 0
        }))
      );
      console.log('All routes fetched:', Object.keys(driverRoutes.current).length, 'drivers');
      console.log('Bike drivers status:', drivers
        .filter(d => d.vehicle === 'bike')
        .map(d => ({
          id: d.id,
          routeLoaded: driverStates.find(s => s.id === d.id)?.routeLoaded || false,
          pathLength: driverRoutes.current[d.id]?.length || 0
        }))
      );
    });

    return () => {
      driverRoutes.current = {};
      setDriverStates(prev =>
        prev.map(state => ({ ...state, routeLoaded: false }))
      );
    };
  }, [drivers, role]);

  // Initialize driver markers
  useEffect(() => {
    if (!mapInstance.current || role !== 'rider' || !drivers || !drivers.length) return;

    drivers.forEach(driver => {
      if (!markers.current[driver.id]) {
        markers.current[driver.id] = new google.maps.Marker({
          position: { lat: driver.lat, lng: driver.lng },
          map: mapInstance.current,
          icon: {
            url: driver.vehicle === 'car'
              ? 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747922965/ChatGPT_Image_May_22_2025_03_01_31_PM_urbdmy.png'
              : 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747924602/bike_iqaeck.png',
            scaledSize: new google.maps.Size(56, 56),
            anchor: new google.maps.Point(28, 28),
            rotation: 0
          },
          animation: google.maps.Animation.DROP
        });
        console.log(`Marker initialized for driver ${driver.id} (${driver.vehicle}) at ${driver.lat},${driver.lng}`);
      }
    });

    Object.keys(markers.current).forEach(driverId => {
      if (!drivers.find(d => d.id === parseInt(driverId))) {
        markers.current[driverId].setMap(null);
        delete markers.current[driverId];
      }
    });

    return () => {
      Object.values(markers.current).forEach(marker => marker.setMap(null));
      markers.current = {};
    };
  }, [drivers, role]);

  // Animate drivers along their routes
  useEffect(() => {
    if (!mapInstance.current || role !== 'rider' || !drivers || !drivers.length) return;

    const animate = () => {
      setDriverStates(prevStates => {
        console.log('Animation tick, driver states:', prevStates.map(s => ({
          id: s.id,
          progress: s.progress,
          routeLoaded: s.routeLoaded,
          vehicle: drivers.find(d => d.id === s.id)?.vehicle
        })));
        return prevStates.map(state => {
          const driver = drivers.find(d => d.id === state.id);
          if (!driver) {
            console.warn(`Driver ${state.id} not found in drivers`);
            return state;
          }
          const path = driverRoutes.current[driver.id];
          if (!path || path.length < 2 || !state.routeLoaded) {
            console.log(`Driver ${driver.id} (${driver.vehicle}) not animated: routeLoaded=${state.routeLoaded}, pathLength=${path?.length || 0}`);
            return state;
          }

          let { progress, direction } = state;
          const totalSegments = path.length - 1;
          progress += direction * 0.002;

          if (progress >= totalSegments) {
            progress = totalSegments;
            direction = -1;
          } else if (progress <= 0) {
            progress = 0;
            direction = 1;
          }

          const segment = Math.min(Math.floor(progress), totalSegments - 1);
          const segmentProgress = progress - segment;
          const start = path[segment];
          const end = path[segment + 1] || start;
          const currentLat = lerp(start.lat, end.lat, segmentProgress);
          const currentLng = lerp(start.lng, end.lng, segmentProgress);
          const bearing = calculateBearing(start, end);
          // Adjust rotation based on vehicle type: cars face north (0°), bikes face south (180°)
          const rotation = driver.vehicle === 'car' ? bearing : bearing + 180;

          if (markers.current[driver.id]) {
            markers.current[driver.id].setPosition({ lat: currentLat, lng: currentLng });
            const icon = {
              url: driver.vehicle === 'car'
                ? 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747922965/ChatGPT_Image_May_22_2025_03_01_31_PM_urbdmy.png'
                : 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747923675/ChatGPT_Image_22_mai_2025_15_20_43_qxbwfw.png',
              scaledSize: new google.maps.Size(56, 56),
              anchor: new google.maps.Point(28, 28),
              rotation: rotation
            };
            markers.current[driver.id].setIcon(icon);
            console.log(`Driver ${driver.id} (${driver.vehicle}) moved to ${currentLat},${currentLng}, bearing: ${bearing}, rotation: ${rotation}`);
          }

          return { ...state, progress, direction, routeLoaded: true };
        });
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [drivers, role]);

  // Handle map updates for trip and bounds
  const updateMap = useCallback(() => {
    if (!mapInstance.current || !directionsRenderer.current) return;

    infoWindows.current.forEach(infoWindow => infoWindow.close());
    infoWindows.current = [];

    Object.keys(markers.current).forEach(key => {
      if (!drivers.find(d => d.id === parseInt(key))) {
        markers.current[key].setMap(null);
        delete markers.current[key];
      }
    });

    if (trip && trip.pickupLat && trip.pickupLng && trip.destLat && trip.destLng) {
      const tripKey = `${trip.pickupLat},${trip.pickupLng},${trip.destLat},${trip.destLng},${trip.vehicleType}`;
      if (lastTrip.current === tripKey) return;
      lastTrip.current = tripKey;

      directionsRenderer.current.setDirections({ routes: [] });

      const request = {
        origin: { lat: trip.pickupLat, lng: trip.pickupLng },
        destination: { lat: trip.destLat, lng: trip.destLng },
        travelMode: trip.vehicleType === 'bike' ? 'BICYCLING' : 'DRIVING'
      };

      const calculateRoute = debounce((req) => {
        directionsService.current.route(req, (result, status) => {
          if (status === 'OK') {
            directionsRenderer.current.setMap(mapInstance.current);
            directionsRenderer.current.setDirections(result);
            const route = result.routes[0].legs[0];
            onRouteCalculated({
              distance: route.distance.text,
              duration: route.duration.text
            });

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
            const pickupInfo = new google.maps.InfoWindow({
              content: `<div style="background: #2D6A4F; color: white; padding: 8px 12px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; max-width: 200px;">
                        ${pickupContent}
                        </div>`
            });
            setTimeout(() => {
              pickupInfo.open(mapInstance.current, pickupMarker);
            }, 100);
            markers.current['pickup'] = pickupMarker;
            infoWindows.current.push(pickupInfo);

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
            const dropoffInfo = new google.maps.InfoWindow({
              content: `<div style="background: #2D6A4F; color: white; padding: 8px 12px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; max-width: 200px;">
                        ${dropoffContent}
                        </div>`
            });
            setTimeout(() => {
              dropoffInfo.open(mapInstance.current, dropoffMarker);
            }, 100);
            markers.current['dropoff'] = dropoffMarker;
            infoWindows.current.push(dropoffInfo);

            const bounds = new google.maps.LatLngBounds();
            route.steps.forEach(step => {
              step.path.forEach(point => bounds.extend(point));
            });
            mapInstance.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
          } else {
            console.error('Directions API failed for trip:', status);
          }
        });
      }, 100);

      calculateRoute(request);
    } else {
      directionsRenderer.current.setDirections({ routes: [] });
      if (drivers && drivers.length) {
        const bounds = new google.maps.LatLngBounds();
        drivers.forEach(driver => {
          const state = driverStates.find(s => s.id === driver.id);
          const path = driverRoutes.current[driver.id];
          if (state && path && path.length >= 2 && state.routeLoaded) {
            const segment = Math.min(Math.floor(state.progress), path.length - 1);
            const segmentProgress = state.progress - segment;
            const start = path[segment];
            const end = path[segment + 1] || start;
            const currentLat = lerp(start.lat, end.lat, segmentProgress);
            const currentLng = lerp(start.lng, end.lng, segmentProgress);
            bounds.extend({ lat: currentLat, lng: currentLng });
          } else {
            bounds.extend({ lat: driver.lat, lng: driver.lng });
          }
        });
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

    updateMap();

    return () => {
      google.maps.event.removeListener(clickListener);
      infoWindows.current.forEach(infoWindow => infoWindow.close());
      infoWindows.current = [];
    };
  }, [updateMap, onLocationSelected, onClearInput, pickupInput, destinationInput]);

  return <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />;
}