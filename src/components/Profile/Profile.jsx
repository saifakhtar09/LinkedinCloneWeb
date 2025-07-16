import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Edit, MapPin, Calendar, Building2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const { user } = useAuth();
  console.log('Inside Profile, user is:', user);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/profile/${id}`);
      setProfile(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put('http://localhost:5000/api/users/profile', editData);
      setProfile(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('coverPhoto', file);

    try {
      const response = await axios.post('http://localhost:5000/api/users/upload-cover-photo', formData);
      setProfile(response.data);
    } catch (error) {
      console.error('Error uploading cover photo:', error);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await axios.post('http://localhost:5000/api/users/upload-profile-picture', formData);
      setProfile(response.data);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300"></div>
          <div className="px-6 pb-6">
            <div className="flex items-start space-x-4 -mt-16">
              <div className="h-32 w-32 bg-gray-300 rounded-full"></div>
              <div className="flex-1 pt-16 space-y-4">
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-800">
            {profile.coverPhoto && (
              <img
                src={`http://localhost:5000${profile.coverPhoto}`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {isOwnProfile && (
            <label className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
              <Camera className="h-5 w-5 text-gray-600" />
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex items-start space-x-4 -mt-16">
            <div className="relative">
              {profile.profilePicture ? (
                <img
                  src={`http://localhost:5000${profile.profilePicture}`}
                  alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center">
               <span className="text-2xl text-gray-600 font-bold">
  {(profile?.firstName?.[0] ?? 'U')}{(profile?.lastName?.[0] ?? '')}
</span>

                </div>
              )}
              
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <div className="flex-1 pt-16">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={editData.headline || ''}
                      onChange={(e) => setEditData({...editData, headline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Professional headline"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Summary
                    </label>
                    <textarea
                      value={editData.summary || ''}
                      onChange={(e) => setEditData({...editData, summary: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editData.location || ''}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City, State"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={editData.industry || ''}
                        onChange={(e) => setEditData({...editData, industry: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your industry"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                  
                  <p className="text-lg text-gray-700 mb-4">{profile.headline || 'Professional'}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                    {profile.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    
                    {profile.industry && (
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        <span>{profile.industry}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {profile.summary && (
                    <p className="text-gray-700 mb-6">{profile.summary}</p>
                  )}
                  
                  <div className="flex space-x-3">
                    {!isOwnProfile && (
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Connect
                      </button>
                    )}
                    
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                      Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Experience</h2>
          {isOwnProfile && (
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <Plus className="h-4 w-4" />
              <span>Add experience</span>
            </button>
          )}
        </div>
        
       {Array.isArray(profile.experience) && profile.experience.length > 0 ? (
  <div className="space-y-4">
    {profile.experience.map((exp, index) => (

              <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString()} - 
                    {exp.current ? ' Present' : new Date(exp.endDate).toLocaleDateString()}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No experience added yet.</p>
        )}
      </div>

      {/* Skills Section */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Skills</h2>
          {isOwnProfile && (
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <Plus className="h-4 w-4" />
              <span>Add skill</span>
            </button>
          )}
        </div>
      {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
  <div className="flex flex-wrap gap-2">
    {profile.skills.map((skill, index) => (

              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No skills added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;