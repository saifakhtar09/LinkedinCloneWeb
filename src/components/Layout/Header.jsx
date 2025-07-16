import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Home, 
  Users, 
  Briefcase, 
  MessageCircle, 
  Bell, 
  User,
  LogOut,
  Settings,
  Linkedin
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Search */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Linkedin className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-blue-600">LinkedInClone</span>
            </Link>
            
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </Link>

            <Link
              to="/network"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Users className="h-6 w-6" />
              <span className="text-xs">Network</span>
            </Link>

            <Link
              to="/jobs"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Briefcase className="h-6 w-6" />
              <span className="text-xs">Jobs</span>
            </Link>

            <Link
              to="/messages"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs">Messages</span>
            </Link>

            <Link
              to="/notifications"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors relative"
            >
              <Bell className="h-6 w-6" />
              <span className="text-xs">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6" />
                )}
                <span className="text-xs">Me</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to={`/profile/${user?.id}`}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    View Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;