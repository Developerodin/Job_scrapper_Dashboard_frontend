'use client';

import { useState, useEffect } from 'react';
import { Job, getSavedJobs, getDatabaseStats, DatabaseStats } from '@/lib/api';
import JobCard from './JobCard';
import axios from 'axios';

interface SavedJobsProps {
  onClose?: () => void;
}

export default function SavedJobs({ onClose }: SavedJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [filters, setFilters] = useState({
    is_active: 'all',
    company: '',
    location: '',
    limit: 50
  });
  const [isMaintenanceRunning, setIsMaintenanceRunning] = useState(false);
  const [maintenanceResult, setMaintenanceResult] = useState<string | null>(null);

  const fetchSavedJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getSavedJobs({
        limit: filters.limit,
        is_active: filters.is_active !== 'all' ? filters.is_active : undefined,
        company: filters.company || undefined,
        location: filters.location || undefined,
      });
      
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch saved jobs');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getDatabaseStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
    fetchStats();
  }, [filters]);

  const runMaintenance = async () => {
    setIsMaintenanceRunning(true);
    setMaintenanceResult(null);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_URL}/api/jobs/maintenance`, {
        batchSize: 10,
        delayBetweenJobs: 1000,
        maxJobs: 50, // Limit for manual runs
        daysOld: 7,
        dryRun: false
      });
      
      const results = response.data.results;
      const message = `Verified: ${results.verification.verified} jobs | Expired: ${results.verification.expired} | Deleted: ${results.deletion.deleted || 0}`;
      setMaintenanceResult(message);
      
      // Refresh stats and jobs after maintenance
      await fetchStats();
      await fetchSavedJobs();
    } catch (error) {
      console.error('Error running maintenance:', error);
      setMaintenanceResult('Error: ' + (error instanceof Error ? error.message : 'Failed to run maintenance'));
    } finally {
      setIsMaintenanceRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Saved Jobs</h2>
            <p className="text-sm text-gray-600">View all jobs stored in MongoDB database</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runMaintenance}
            disabled={isMaintenanceRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isMaintenanceRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Running...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Verify & Cleanup
              </>
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Maintenance Result */}
      {maintenanceResult && (
        <div className={`mb-6 rounded-lg p-4 border-2 ${
          maintenanceResult.includes('Error') 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            {maintenanceResult.includes('Error') ? (
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <p className={`text-sm font-medium ${
              maintenanceResult.includes('Error') ? 'text-red-800' : 'text-green-800'
            }`}>
              {maintenanceResult}
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm font-medium text-blue-600">Total Jobs</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{stats.total_jobs}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm font-medium text-green-600">Active Jobs</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{stats.active_jobs}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-sm font-medium text-red-600">Expired Jobs</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{stats.expired_jobs}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm font-medium text-purple-600">Companies</div>
            <div className="text-2xl font-bold text-purple-900 mt-1">{stats.unique_companies}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.is_active}
              onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Jobs</option>
              <option value="true">Active Only</option>
              <option value="false">Expired Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              type="text"
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              placeholder="Filter by company"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Filter by location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="25">25 jobs</option>
              <option value="50">50 jobs</option>
              <option value="100">100 jobs</option>
              <option value="200">200 jobs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading saved jobs...</p>
        </div>
      )}

      {/* Jobs List */}
      {!isLoading && jobs.length === 0 && !error && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No saved jobs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start searching for jobs to save them to the database.
          </p>
        </div>
      )}

      {/* Jobs Grid */}
      {!isLoading && jobs.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{jobs.length}</span> saved jobs
            </p>
            <button
              onClick={fetchSavedJobs}
              className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div key={job.job_id || index} className="relative">
                <JobCard job={job} />
                {job.is_expired && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                    Expired
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
