import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage({ setUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rider');

  const handleAuth = () => {
    setUser({ email, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-bg">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md mt-24 border border-gray-200">
        <h2 className="text-4xl font-bold mb-8 text-center tracking-tight">
          {isSignup ? 'Sign Up' : 'Log In'}
        </h2>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 mb-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 mb-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
          />
          {isSignup && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-4 mb-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="rider">Rider</option>
              <option value="driver">Driver</option>
            </select>
          )}
          <button
            onClick={handleAuth}
            className="w-full bg-green-700 text-white p-4 rounded-lg font-semibold hover:bg-green-800 hover:scale-105 transition-all duration-300"
          >
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </div>
        <hr className="my-6 border-gray-200" />
        <button className="w-full bg-white border border-gray-300 p-4 mb-4 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.35-1.01 2.49-2.13 3.24v2.69h3.45c2.02-1.86 3.18-4.6 3.18-7.89z" />
            <path fill="#34A853" d="M12 23.5c2.88 0 5.3-.95 7.07-2.57l-3.45-2.69c-.96.64-2.19 1.02-3.62 1.02-2.78 0-5.14-1.88-5.98-4.41H2.54v2.77C4.3 21.07 7.83 23.5 12 23.5z" />
            <path fill="#FBBC05" d="M6.02 14.09c-.21-.64-.33-1.32-.33-2.09s.12-1.45.33-2.09V7.14H2.54C1.92 8.36 1.5 9.68 1.5 11.01s.42 2.65 1.04 3.87l3.48-2.79z" />
            <path fill="#EA4335" d="M12 4.5c1.57 0 2.97.54 4.08 1.59l3.07-3.07C17.3 1.43 14.88.5 12 .5 7.83.5 4.3 2.93 2.54 6.37l3.48 2.77c.84-2.53 3.2-4.64 5.98-4.64z" />
          </svg>
          Sign in with Google
        </button>
        <button className="w-full bg-white border border-gray-300 p-4 mb-4 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#0077B5" d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.12 20.45H3.56V9.06h3.56v11.39zM5.34 7.58c-1.14 0-2.06-.92-2.06-2.06s.92-2.06 2.06-2.06 2.06.92 2.06 2.06-.92 2.06-2.06 2.06zm15.11 12.87h-3.56v-5.97c0-1.42-.51-2.39-1.78-2.39-1.02 0-1.63.69-1.9 1.35-.1.25-.12.6-.12 1v6.01H9.53s.05-10.92 0-12.06h3.56v1.71c.47-.73 1.31-1.77 3.18-1.77 2.32 0 4.06 1.51 4.06 4.76v7.36z" />
          </svg>
          Sign in with LinkedIn
        </button>
        <p className="mt-6 text-center text-gray-500">
          <span>{isSignup ? 'Already have an account?' : 'Need an account?'}</span>
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-green-700 underline ml-1 hover:text-green-800"
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </p>
        <Link to="/" className="block text-center text-green-700 underline mt-4 hover:text-green-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
}