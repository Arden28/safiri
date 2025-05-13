import { Link } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-3xl font-bold text-green-700">Safiri</Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/rider" className="text-gray-700 hover:text-green-700 hover:underline font-semibold">Ride</Link>
          <Link to="/driver" className="text-gray-700 hover:text-green-700 hover:underline font-semibold">Drive</Link>
          <select className="bg-transparent text-gray-700 focus:outline-none border border-gray-300 rounded-md px-2 py-1">
            <option>EN</option>
            <option>FR</option>
            <option>ES</option>
          </select>
          {user ? (
            <button
              onClick={() => setUser(null)}
              className="text-green-700 border border-green-700 px-5 py-2 rounded-full hover:bg-green-50 font-semibold"
            >
              Log Out
            </button>
          ) : (
            <>
              <Link to="/login" className="text-green-700 border border-green-700 px-5 py-2 rounded-full hover:bg-green-50 font-semibold">
                Log In
              </Link>
              <Link to="/login" className="bg-green-700 text-white px-5 py-2 rounded-full hover:bg-green-800 font-semibold">
                Sign Up
              </Link>
            </>
          )}
        </div>
        <div className="md:hidden">
          <button className="text-gray-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}