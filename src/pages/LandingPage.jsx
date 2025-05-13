import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center text-center px-4 pt-24 hero-bg">
      <div className="pseudo-image w-48 h-48 md:w-64 md:h-64 rounded-2xl mb-8"></div>
      <h2 className="text-5xl md:text-7xl font-bold mb-6 max-w-5xl tracking-tight leading-tight">
        Travel or Earn with Safari’s Elegance
      </h2>
      <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl">
        Ride in style or drive with purpose, crafted for a seamless experience.
      </p>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        <Link
          to="/rider"
          className="bg-green-700 text-white px-10 py-5 rounded-full text-lg font-semibold hover:bg-green-800 hover:scale-105 transition-all duration-300 shadow-md"
        >
          Ride with Safari
        </Link>
        <Link
          to="/driver"
          className="bg-gray-900 text-white px-10 py-5 rounded-full text-lg font-semibold hover:bg-gray-800 hover:scale-105 transition-all duration-300 shadow-md"
        >
          Drive with Safari
        </Link>
      </div>
    </main>
  );
}