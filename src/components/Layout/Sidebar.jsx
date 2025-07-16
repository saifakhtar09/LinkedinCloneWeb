import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Camera, Eye, Users, Bookmark, TrendingUp } from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="w-64 space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative">
          <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-800">
            {user?.coverPhoto && (
              <img
                src={user.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute -bottom-6 left-4">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="h-12 w-12 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center">
                <Camera className="h-6 w-6 text-gray-600" />
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-8 p-4">
          <Link to={`/profile/${user?.id}`} className="block hover:text-blue-600">
            <h3 className="font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{user?.headline || 'Add a headline'}</p>
          </Link>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Profile viewers</span>
              <span className="text-blue-600 font-medium">52</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Post impressions</span>
              <span className="text-blue-600 font-medium">1,337</span>
            </div>
          </div>
          
          <Link 
            to="/network" 
            className="block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Grow your network
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
        <div className="space-y-2">
          <Link
            to="/saved"
            className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            <span className="text-sm">Saved items</span>
          </Link>
          <Link
            to="/groups"
            className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span className="text-sm">Groups</span>
          </Link>
          <Link
            to="/events"
            className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm">Events</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Recent</h4>
        <div className="space-y-2">
          <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
            JavaScript Development
          </div>
          <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
            React Best Practices
          </div>
          <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
            Node.js Backend
          </div>
        </div>
      </div>

      {/* Trending */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-4 w-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Trending</h4>
        </div>
        <div className="space-y-2">
          <div className="text-sm">
            <div className="text-gray-900 font-medium">#ReactJS</div>
            <div className="text-gray-500 text-xs">12,543 posts</div>
          </div>
          <div className="text-sm">
            <div className="text-gray-900 font-medium">#WebDevelopment</div>
            <div className="text-gray-500 text-xs">8,921 posts</div>
          </div>
          <div className="text-sm">
            <div className="text-gray-900 font-medium">#RemoteWork</div>
            <div className="text-gray-500 text-xs">6,432 posts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;