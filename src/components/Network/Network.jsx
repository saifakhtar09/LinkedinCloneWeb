import React, { useState, useEffect } from 'react';
import { UserPlus, Users, MessageCircle, Check, X } from 'lucide-react';
import { userAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const Network = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      const [suggestionsRes, connectionsRes, pendingRes] = await Promise.all([
        userAPI.searchUsers(''), // Get all users as suggestions
        userAPI.getConnections(),
        userAPI.getConnections('pending')
      ]);
      
      setSuggestions(suggestionsRes.data.data.users.slice(0, 10));
      setConnections(connectionsRes.data.data.connections);
      setPendingRequests(pendingRes.data.data.connections);
    } catch (error) {
      console.error('Error fetching network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await userAPI.sendConnectionRequest(userId);
      toast.success('Connection request sent!');
      setSuggestions(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleAcceptConnection = async (connectionId) => {
    try {
      await userAPI.acceptConnection(connectionId);
      toast.success('Connection accepted!');
      fetchNetworkData();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Failed to accept connection');
    }
  };

  const handleRejectConnection = async (connectionId) => {
    try {
      await userAPI.rejectConnection(connectionId);
      toast.success('Connection request declined');
      fetchNetworkData();
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast.error('Failed to reject connection');
    }
  };

  const UserCard = ({ user, showConnectButton = false, showActionButtons = false, connectionId }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-medium text-lg">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-gray-600 text-sm">{user.headline || 'Professional'}</p>
          <p className="text-gray-500 text-sm">{user.location}</p>
        </div>
        
        <div className="flex flex-col space-y-2">
          {showConnectButton && (
            <button
              onClick={() => handleConnect(user._id)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Connect</span>
            </button>
          )}
          
          {showActionButtons && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleAcceptConnection(connectionId)}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => handleRejectConnection(connectionId)}
                className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Decline</span>
              </button>
            </div>
          )}
          
          {!showConnectButton && !showActionButtons && (
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span>Message</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Network</h1>
        <p className="text-gray-600">Grow your professional network</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              People you may know
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'connections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                People you may know
              </h2>
              {suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No suggestions available
                  </h3>
                  <p className="text-gray-600">
                    Check back later for new connection suggestions
                  </p>
                </div>
              ) : (
                suggestions.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    showConnectButton={true}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your connections
              </h2>
              {connections.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No connections yet
                  </h3>
                  <p className="text-gray-600">
                    Start connecting with professionals in your industry
                  </p>
                </div>
              ) : (
                connections.map((connection) => (
                  <UserCard
                    key={connection._id}
                    user={connection.user}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pending connection requests
              </h2>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No pending requests
                  </h3>
                  <p className="text-gray-600">
                    You'll see connection requests here when you receive them
                  </p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <UserCard
                    key={request._id}
                    user={request.user}
                    showActionButtons={true}
                    connectionId={request._id}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Network;