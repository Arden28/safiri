export const mockDrivers = [
  { id: 1, name: 'Driver 1', lat: -1.267, lng: 36.811, vehicle: 'car' }, // Westlands
  { id: 2, name: 'Driver 2', lat: -1.280, lng: 36.820, vehicle: 'bike' }, // CBD
  { id: 3, name: 'Driver 3', lat: -1.295, lng: 36.785, vehicle: 'car' }, // Ngong Road
  { id: 4, name: 'Driver 4', lat: -1.261, lng: 36.802, vehicle: 'bike' }, // Sarit Centre
  { id: 5, name: 'Driver 5', lat: -1.283, lng: 36.830, vehicle: 'car' }, // Koinange Street
  { id: 6, name: 'Driver 6', lat: -1.275, lng: 36.815, vehicle: 'car' }, // University Way
  { id: 7, name: 'Driver 7', lat: -1.290, lng: 36.800, vehicle: 'bike' }, // Kimathi Street
  { id: 8, name: 'Driver 8', lat: -1.270, lng: 36.825, vehicle: 'car' } // Kenyatta Avenue
];

export const mockRiders = [
  { id: 1, name: 'John Doe', email: 'john@example.com' }
];

export const mockTripRequests = [
  {
    id: 1,
    rider: 'John Doe',
    pickup: 'Westlands, Nairobi',
    destination: 'CBD, Nairobi',
    pickupLat: -1.267,
    pickupLng: 36.811,
    destLat: -1.280,
    destLng: 36.820,
    distance: '3.2 km',
    fare: 'KSH 450',
    eta: '10 min',
    vehicleType: 'car'
  },
  {
    id: 2,
    rider: 'Jane Smith',
    pickup: 'Ngong Road, Nairobi',
    destination: 'Koinange Street, Nairobi',
    pickupLat: -1.295,
    pickupLng: 36.785,
    destLat: -1.283,
    destLng: 36.830,
    distance: '5.1 km',
    fare: 'KSH 600',
    eta: '15 min',
    vehicleType: 'bike'
  }
];