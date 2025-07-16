import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, MapPin, Users, Calendar, Globe, Plus } from 'lucide-react';
import { companyAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const response = await companyAPI.getCompany(id);
      setCompany(response.data);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
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

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Company not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-800">
          {company.coverImage && (
            <img
              src={company.coverImage.url}
              alt={`${company.name} cover`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Company Info */}
        <div className="px-8 pb-8">
          <div className="flex items-start space-x-6 -mt-16">
            <div className="h-32 w-32 bg-white rounded-lg shadow-lg flex items-center justify-center">
              {company.logo ? (
                <img
                  src={company.logo.url}
                  alt={`${company.name} logo`}
                  className="h-24 w-24 object-contain"
                />
              ) : (
                <Building2 className="h-16 w-16 text-gray-600" />
              )}
            </div>
            
            <div className="flex-1 pt-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              <p className="text-lg text-gray-700 mb-4">{company.industry}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                {company.headquarters && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>{company.headquarters}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>{company.size} employees</span>
                </div>
                
                {company.founded && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Founded {company.founded}</span>
                  </div>
                )}
                
                {company.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  Follow
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                  Visit Website
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      {company.description && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{company.description}</p>
        </div>
      )}

      {/* Specialties */}
      {company.specialties && company.specialties.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {company.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Section */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Jobs at {company.name}</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Post Job</span>
          </button>
        </div>
        
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No open positions</h3>
          <p className="text-gray-600">Check back later for new job opportunities</p>
        </div>
      </div>

      {/* Employees Section */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Employees</h2>
        
        {company.employees && company.employees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.employees.map((employee, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                {employee.user.profilePicture ? (
                  <img
                    src={employee.user.profilePicture}
                    alt={`${employee.user.firstName} ${employee.user.lastName}`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {employee.user.firstName[0]}{employee.user.lastName[0]}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {employee.user.firstName} {employee.user.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees listed</h3>
            <p className="text-gray-600">Employee information will appear here when available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;