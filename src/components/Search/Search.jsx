import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Users, Briefcase, Building2, Filter } from 'lucide-react';
import { userAPI, jobAPI, companyAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('people');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({
    people: [],
    jobs: [],
    companies: []
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    industry: '',
    jobType: '',
    experienceLevel: ''
  });

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const [peopleRes, jobsRes, companiesRes] = await Promise.all([
        userAPI.searchUsers(searchQuery),
        jobAPI.getJobs({ search: searchQuery }),
        companyAPI.getCompanies()
      ]);

      setResults({
        people: peopleRes.data.data.users || [],
        jobs: jobsRes.data || [],
        companies: companiesRes.data.filter(company => 
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch(query);
    }
  };

  const PersonCard = ({ person }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        {person.profilePicture ? (
          <img
            src={person.profilePicture}
            alt={`${person.firstName} ${person.lastName}`}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-medium text-lg">
              {person.firstName[0]}{person.lastName[0]}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {person.firstName} {person.lastName}
          </h3>
          <p className="text-gray-600 text-sm">{person.headline || 'Professional'}</p>
          <p className="text-gray-500 text-sm">{person.location}</p>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
          Connect
        </button>
      </div>
    </div>
  );

  const JobCard = ({ job }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="h-12 w-12 bg-blue-100 rounded flex items-center justify-center">
          <Briefcase className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
          <p className="text-gray-600">{job.companyName}</p>
          <p className="text-gray-500 text-sm">{job.location}</p>
          <p className="text-gray-700 mt-2 line-clamp-2">{job.description}</p>
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
          Apply
        </button>
      </div>
    </div>
  );

  const CompanyCard = ({ company }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
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
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{company.name}</h3>
          <p className="text-gray-600">{company.industry}</p>
          <p className="text-gray-500 text-sm">{company.size} employees</p>
          {company.description && (
            <p className="text-gray-700 mt-2 line-clamp-2">{company.description}</p>
          )}
        </div>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
          Follow
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'people', name: 'People', icon: Users, count: results.people.length },
    { id: 'jobs', name: 'Jobs', icon: Briefcase, count: results.jobs.length },
    { id: 'companies', name: 'Companies', icon: Building2, count: results.companies.length }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for people, jobs, companies..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {query && (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
                
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All locations</option>
                  <option value="San Francisco">San Francisco</option>
                  <option value="New York">New York</option>
                  <option value="Remote">Remote</option>
                </select>

                {activeTab === 'people' && (
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                )}

                {activeTab === 'jobs' && (
                  <>
                    <select
                      value={filters.jobType}
                      onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>

                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => setFilters({...filters, experienceLevel: e.target.value})}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All levels</option>
                      <option value="entry-level">Entry level</option>
                      <option value="mid-senior">Mid-Senior level</option>
                      <option value="director">Director</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                {activeTab === 'people' && (
                  <>
                    {results.people.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No people found</h3>
                        <p className="text-gray-600">Try adjusting your search terms</p>
                      </div>
                    ) : (
                      results.people.map((person) => (
                        <PersonCard key={person._id} person={person} />
                      ))
                    )}
                  </>
                )}

                {activeTab === 'jobs' && (
                  <>
                    {results.jobs.length === 0 ? (
                      <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-600">Try adjusting your search terms</p>
                      </div>
                    ) : (
                      results.jobs.map((job) => (
                        <JobCard key={job._id} job={job} />
                      ))
                    )}
                  </>
                )}

                {activeTab === 'companies' && (
                  <>
                    {results.companies.length === 0 ? (
                      <div className="text-center py-12">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                        <p className="text-gray-600">Try adjusting your search terms</p>
                      </div>
                    ) : (
                      results.companies.map((company) => (
                        <CompanyCard key={company._id} company={company} />
                      ))
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}

      {!query && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search LinkedIn Clone</h3>
          <p className="text-gray-600">Find people, jobs, and companies</p>
        </div>
      )}
    </div>
  );
};

export default Search;