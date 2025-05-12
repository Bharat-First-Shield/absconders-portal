import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { searchCriminals } from '../services/criminalService';

interface SearchFilters {
  query: string;
  state?: string;
  district?: string;
  gender?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  hasWarrant?: boolean;
}

export function Search() {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    state: '',
    district: '',
    gender: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    hasWarrant: false
  });

  const handleSearch = async () => {
    try {
      const searchParams = {
        name: filters.query,
        firNumber: filters.query,
        'idProof.number': filters.query,
        state: filters.state || user?.state,
        district: filters.district || user?.district,
        gender: filters.gender,
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        hasWarrant: filters.hasWarrant
      };
      
      const results = await searchCriminals(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search records');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Search Records</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, FIR number, or ID"
            className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          />
          
          <select
            className="w-full px-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Select Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
          </select>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasWarrant"
              className="mr-2"
              checked={filters.hasWarrant}
              onChange={(e) => setFilters({ ...filters, hasWarrant: e.target.checked })}
            />
            <label htmlFor="hasWarrant">Has Warrant</label>
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
      </div>
      
      <div className="mt-8">
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result: any) => (
              <div
                key={result.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <h3 className="font-semibold">{result.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">FIR: {result.firNumber}</p>
                <p className="text-gray-600 dark:text-gray-400">Status: {result.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400">
            No results found. Try adjusting your search criteria.
          </p>
        )}
      </div>
    </div>
  );
}