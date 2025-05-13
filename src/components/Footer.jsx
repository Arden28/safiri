export default function Footer() {
    return (
      <footer className="bg-white py-8 text-center border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-500 text-sm">
          <a href="#" className="underline hover:text-green-700">About</a>
          <a href="#" className="underline hover:text-green-700">Contact</a>
          <a href="#" className="underline hover:text-green-700">Terms</a>
        </div>
        <p className="mt-4 text-gray-500 text-sm">© 2025 Safari. All rights reserved.</p>
      </footer>
    );
  }