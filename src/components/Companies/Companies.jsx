import React, { useState, useEffect } from 'react';
import { Building2, Users, MapPin, Plus } from 'lucide-react';
import { companyAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getCompanies();
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (companyId) => {
    try {
      await companyAPI.followCompany(companyId);
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error('Error following company:', error);
    }
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies</h1>
          <p className="text-gray-600">Discover and follow companies you're interested in</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Create Company</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800">
              {company.coverImage && (
                <img
                  src={company.coverImage.url}
                  alt={`${company.name} cover`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div className="p-6 -mt-8">
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  {company.logo ? (
                    <img
                      src={company.logo.url}
                      alt={`${company.name} logo`}
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                
                <div className="flex-1 pt-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{company.name}</h3>
                  <p className="text-gray-600 text-sm">{company.industry}</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {company.headquarters && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{company.headquarters}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{company.size} employees</span>
                </div>
              </div>
              
              {company.description && (
                <p className="mt-4 text-gray-700 text-sm line-clamp-3">
                  {company.description}
                </p>
              )}
              
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {company.followerCount || 0} followers
                </span>
                
                <button
                  onClick={() => handleFollow(company._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
                >
                  Follow
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600">Be the first to create a company page!</p>
        </div>
      )}
    </div>
  );
};

export default Companies;