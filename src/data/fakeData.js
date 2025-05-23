export const mockDrivers = [
  {
    id: 1,
    name: 'John Kamau',
    lat: -1.286389, // Nairobi CBD
    lng: 36.817223,
    vehicle: 'car',
    routeStart: { lat: -1.286389, lng: 36.817223 },
    routeEnd: { lat: -1.266389, lng: 36.837223 },
    status: 'available'
  },
  {
    id: 2,
    name: 'Aisha Mwangi',
    lat: -1.296389, // Westlands
    lng: 36.807223,
    vehicle: 'bike',
    routeStart: { lat: -1.296389, lng: 36.807223 },
    routeEnd: { lat: -1.276389, lng: 36.827223 },
    status: 'available'
  },
  {
    id: 3,
    name: 'Peter Njoroge',
    lat: -1.250000, // Karen
    lng: 36.750000,
    vehicle: 'car',
    routeStart: { lat: -1.250000, lng: 36.750000 },
    routeEnd: { lat: -1.270000, lng: 36.770000 },
    status: 'available'
  },
  {
    id: 4,
    name: 'Mary Wanjiku',
    lat: -1.320000, // Ngong
    lng: 36.780000,
    vehicle: 'bike',
    routeStart: { lat: -1.320000, lng: 36.780000 },
    routeEnd: { lat: -1.300000, lng: 36.800000 },
    status: 'available'
  },
  {
    id: 5,
    name: 'James Otieno',
    lat: -1.270000, // Langata
    lng: 36.790000,
    vehicle: 'car',
    routeStart: { lat: -1.270000, lng: 36.790000 },
    routeEnd: { lat: -1.290000, lng: 36.810000 },
    status: 'available'
  }
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