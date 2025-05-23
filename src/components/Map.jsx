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
  onClearInput,
  isRideRequested,
  nearestDriver
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
  const waveCircles = useRef([]);

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
        ],
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        disableDefaultUI: isRideRequested,
        draggable: !isRideRequested,
        zoomControl: !isRideRequested,
        clickableIcons: !isRideRequested
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
    } else if (mapInstance.current) {
      // Update map options when isRideRequested changes
      mapInstance.current.setOptions({
        disableDefaultUI: isRideRequested,
        draggable: !isRideRequested,
        zoomControl: !isRideRequested,
        clickableIcons: !isRideRequested
      });
    }
  }, [isRideRequested]);

  // Fetch driver routes
  useEffect(() => {
    if (!mapInstance.current || !directionsService.current || role !== 'rider' || !drivers || !drivers.length || isRideRequested) return;

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
          travelMode: 'DRIVING'
        };

        directionsService.current.route(request, (result, status) => {
          if (status === 'OK') {
            const path = result.routes[0].overview_path.map(point => ({
              lat: point.lat(),
              lng: point.lng(),
              id: driver.id
            }));
            driverRoutes.current[driver.id] = path;
            resolve(path);
          } else {
            console.warn(`Directions API failed for driver ${driver.id} (DRIVING): ${status}`);
            if (driver.vehicle === 'bike') {
              directionsService.current.route(
                { ...request, travelMode: 'BICYCLING' },
                (fallbackResult, fallbackStatus) => {
                  if (fallbackStatus === 'OK') {
                    const path = fallbackResult.routes[0].overview_path.map(point => ({
                      lat: point.lat(),
                      lng: point.lng(),
                      id: driver.id
                    }));
                    driverRoutes.current[driver.id] = path;
                    resolve(path);
                  } else {
                    console.error(`Fallback BICYCLING failed for driver ${driver.id}: ${fallbackStatus}`);
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

    Promise.all(drivers.map(driver => fetchRoute(driver))).then(results => {
      setDriverStates(prev =>
        prev.map((state, index) => ({
          ...state,
          routeLoaded: results[index] && results[index].length > 0
        }))
      );
    });

    return () => {
      driverRoutes.current = {};
      setDriverStates(prev =>
        prev.map(state => ({ ...state, routeLoaded: false }))
      );
    };
  }, [drivers, role, isRideRequested]);

  // Initialize driver markers
  useEffect(() => {
    if (!mapInstance.current || role !== 'rider' || !drivers || !drivers.length || isRideRequested) return;

    drivers.forEach(driver => {
      if (!markers.current[driver.id]) {
        markers.current[driver.id] = new google.maps.Marker({
          position: { lat: driver.lat, lng: driver.lng },
          map: mapInstance.current,
          icon: {
            url: driver.vehicle === 'car'
              ? 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747922965/ChatGPT_Image_May_22_2025_03_01_31_PM_urbdmy.png'
              : 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747923675/ChatGPT_Image_22_mai_2025_15_20_43_qxbwfw.png',
            scaledSize: new google.maps.Size(56, 56),
            anchor: new google.maps.Point(28, 28),
            rotation: 0
          },
          animation: google.maps.Animation.DROP
        });
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
  }, [drivers, role, isRideRequested]);

  // Animate drivers along their routes
  useEffect(() => {
    if (!mapInstance.current || role !== 'rider' || !drivers || !drivers.length || isRideRequested) return;

    const animate = () => {
      setDriverStates(prevStates => {
        return prevStates.map(state => {
          const driver = drivers.find(d => d.id === state.id);
          if (!driver) return state;
          const path = driverRoutes.current[driver.id];
          if (!path || path.length < 2 || !state.routeLoaded) return state;

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
  }, [drivers, role, isRideRequested]);

  // Wave animation for driver search
  useEffect(() => {
    if (!mapInstance.current || !isRideRequested || !trip?.pickupLat || !trip?.pickupLng) return;

    // Clear existing wave circles
    waveCircles.current.forEach(circle => circle.setMap(null));
    waveCircles.current = [];

    // Create three concentric circles for wave effect
    const center = { lat: trip.pickupLat, lng: trip.pickupLng };
    let radius = 100; // Starting radius in meters
    const maxRadius = 5000; // Max radius (5km)
    const step = 50; // Radius increment per frame
    const animationSpeed = 50; // ms per frame

    const animateWave = () => {
      waveCircles.current.forEach(circle => {
        const currentRadius = circle.getRadius() + step;
        if (currentRadius > maxRadius) {
          circle.setMap(null);
          waveCircles.current = waveCircles.current.filter(c => c !== circle);
        } else {
          circle.setRadius(currentRadius);
          circle.setOptions({ strokeOpacity: 0.5 * (1 - currentRadius / maxRadius) });
        }
      });

      // Add new circle every 500ms
      if (radius <= maxRadius && waveCircles.current.length < 3) {
        const circle = new google.maps.Circle({
          center,
          radius,
          strokeColor: '#2D6A4F',
          strokeOpacity: 0.5,
          strokeWeight: 2,
          fillColor: '#2D6A4F',
          fillOpacity: 0.1,
          map: mapInstance.current
        });
        waveCircles.current.push(circle);
        radius += 500;
      }

      if (waveCircles.current.length > 0 || radius <= maxRadius) {
        setTimeout(animateWave, animationSpeed);
      }
    };

    animateWave();

    // Center map on pickup point
    mapInstance.current.setCenter(center);
    mapInstance.current.setZoom(14);

    return () => {
      waveCircles.current.forEach(circle => circle.setMap(null));
      waveCircles.current = [];
    };
  }, [isRideRequested, trip]);

  // Show nearest driver marker
  useEffect(() => {
    if (!mapInstance.current || !nearestDriver || !isRideRequested) return;

    // Clear existing driver markers
    Object.values(markers.current).forEach(marker => marker.setMap(null));
    markers.current = {};

    // Add nearest driver marker
    const driver = nearestDriver;
    markers.current[driver.id] = new google.maps.Marker({
      position: { lat: driver.lat, lng: driver.lng },
      map: mapInstance.current,
      icon: {
        url: driver.vehicle === 'car'
          ? 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747922965/ChatGPT_Image_May_22_2025_03_01_31_PM_urbdmy.png'
          : 'https://res.cloudinary.com/ds5pvn0xy/image/upload/v1747923675/ChatGPT_Image_22_mai_2025_15_20_43_qxbwfw.png',
        scaledSize: new google.maps.Size(56, 56),
        anchor: new google.maps.Point(28, 28)
      },
      animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="background: #2D6A4F; color: white; padding: 8px 12px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 14px;">
                Driver: ${driver.name} (${driver.vehicle})
                </div>`
    });
    infoWindow.open(mapInstance.current, markers.current[driver.id]);
    infoWindows.current.push(infoWindow);

    return () => {
      if (markers.current[driver.id]) {
        markers.current[driver.id].setMap(null);
        delete markers.current[driver.id];
      }
      infoWindows.current.forEach(iw => iw.close());
      infoWindows.current = [];
    };
  }, [nearestDriver, isRideRequested]);

  // Handle map updates for trip, pickup, destination, and bounds
  const updateMap = useCallback(() => {
    if (!mapInstance.current || !directionsRenderer.current || isRideRequested) return;

    // Clear existing info windows and non-driver markers
    infoWindows.current.forEach(infoWindow => infoWindow.close());
    infoWindows.current = [];
    ['pickup', 'dropoff'].forEach(key => {
      if (markers.current[key]) {
        markers.current[key].setMap(null);
        delete markers.current[key];
      }
    });

    const bounds = new google.maps.LatLngBounds();

    // Handle pickup marker if pickupInput is set and has coordinates
    if (pickupInput && trip?.pickupLat && trip?.pickupLng) {
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
      bounds.extend({ lat: trip.pickupLat, lng: trip.pickupLng });
    }

    // Handle dropoff marker if destinationInput is set and has coordinates
    if (destinationInput && trip?.destLat && trip?.destLng) {
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
      bounds.extend({ lat: trip.destLat, lng: trip.destLng });
    }

    // Handle route rendering only if both pickup and destination are set
    if (trip && trip.pickupLat && trip.pickupLng && trip.destLat && trip.destLng) {
      const tripKey = `${trip.pickupLat},${trip.pickupLng},${trip.destLat},${trip.destLng},${trip.vehicleType}`;
      if (lastTrip.current !== tripKey) {
        lastTrip.current = tripKey;
        directionsRenderer.current.setDirections({ routes: [] });

        const request = {
          origin: { lat: trip.pickupLat, lng: trip.pickupLng },
          destination: { lat: trip.destLat, lng: trip.destLng },
          travelMode: 'DRIVING'
        };

        const calculateRoute = debounce((req) => {
          console.log('Requesting route:', req);
          directionsService.current.route(req, (result, status) => {
            if (status === 'OK') {
              console.log('Route calculated successfully:', result);
              directionsRenderer.current.setMap(mapInstance.current);
              directionsRenderer.current.setDirections(result);
              const route = result.routes[0].legs[0];
              onRouteCalculated({
                distance: route.distance.text,
                duration: route.duration.text
              });

              route.steps.forEach(step => {
                step.path.forEach(point => bounds.extend(point));
              });
              mapInstance.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
            } else {
              console.error(`Directions API failed for trip (DRIVING): ${status}`);
              if (trip.vehicleType === 'bike') {
                directionsService.current.route(
                  { ...request, travelMode: 'BICYCLING' },
                  (fallbackResult, fallbackStatus) => {
                    if (fallbackStatus === 'OK') {
                      console.log('Fallback BICYCLING route calculated:', fallbackResult);
                      directionsRenderer.current.setMap(mapInstance.current);
                      directionsRenderer.current.setDirections(fallbackResult);
                      const route = fallbackResult.routes[0].legs[0];
                      onRouteCalculated({
                        distance: route.distance.text,
                        duration: route.duration.text
                      });
                      route.steps.forEach(step => {
                        step.path.forEach(point => bounds.extend(point));
                      });
                      mapInstance.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
                    } else {
                      console.error(`Fallback BICYCLING failed for trip: ${fallbackStatus}`);
                      onRouteCalculated(null);
                    }
                  }
                );
              } else {
                onRouteCalculated(null);
              }
            }
          });
        }, 100);

        calculateRoute(request);
      }
    } else {
      directionsRenderer.current.setDirections({ routes: [] });
      if (drivers && drivers.length) {
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

    // If no trip or drivers, reset to default bounds
    if (!bounds.isEmpty()) {
      mapInstance.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }
  }, [drivers, trip, role, onRouteCalculated, pickupInput, destinationInput, isRideRequested]);

  // Handle map click for location selection
  useEffect(() => {
    if (!mapInstance.current || isRideRequested) return;

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
        } else {
          console.error(`Geocoding failed: ${status}`);
        }
      });
    });

    updateMap();

    return () => {
      google.maps.event.removeListener(clickListener);
      infoWindows.current.forEach(infoWindow => infoWindow.close());
      infoWindows.current = [];
    };
  }, [updateMap, onLocationSelected, onClearInput, pickupInput, destinationInput, isRideRequested]);

  return <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />;
}