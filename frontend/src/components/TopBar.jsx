import SearchBox from './SearchBox';
import { Link, useLocation } from 'react-router-dom';

const TopBar = () => {
  // ✅ Get the current location (URL path)
  const location = useLocation();

  // ✅ Define on which pages the TopBar should be visible
  const showOnRoutes = ['/', '/shop'];

  // ✅ If the current path is NOT in our list, show nothing.
  if (!showOnRoutes.includes(location.pathname)) {
    return null;
  }

  // If it IS in the list, show the full TopBar.
  return (
    <header className="sticky top-0 bg-[#0f172a]/80 backdrop-blur-sm z-40">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">
          <Link to="/">FitForge</Link>
        </div>
        
        <div className="flex-1 flex justify-center px-4">
          <div className="w-full max-w-md">
            <SearchBox />
          </div>
        </div>

        <div className="w-24"></div>
      </div>
    </header>
  );
};

export default TopBar;
