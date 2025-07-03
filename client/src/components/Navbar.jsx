import { Flame, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="w-full py-4 bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 bg-[#222] rounded-lg">
            <Flame className="w-5 h-5 text-[#d32f2f]" />
          </div>
          <span className="font-bold text-xl text-gray-100">KeyFury</span>
        </Link>
        <Link
          to="/Login"
          className="flex items-center gap-2 text-sm bg-[#d32f2f] text-white px-4 py-2 rounded-md hover:bg-[#b71c1c] transition"
        >
          <LogIn className="w-4 h-4" />
          Log In
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
