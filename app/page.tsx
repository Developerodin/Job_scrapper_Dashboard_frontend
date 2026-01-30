'use client';

import { useState } from 'react';
import JobFilters from '@/components/JobFilters';
import JobList from '@/components/JobList';
import SavedJobs from '@/components/SavedJobs';
import ConnectionStatus from '@/components/ConnectionStatus';
import { searchJobs, JobFilters as JobFiltersType, Job, SearchResponse } from '@/lib/api';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMeta, setSearchMeta] = useState<{
    total: number;
    offset: number;
    hasMore: boolean;
    nextOffset: number | null;
  }>({
    total: 0,
    offset: 0,
    hasMore: false,
    nextOffset: null
  });
  const [currentFilters, setCurrentFilters] = useState<JobFiltersType>({
    job_title: '',
    job_location: '',
    offset: 0,
    detailed: false
  });
  const [showSavedJobs, setShowSavedJobs] = useState(false);

  const handleSearch = async (filters: JobFiltersType) => {
    console.log('handleSearch called with filters:', filters);
    setIsLoading(true);
    setError(null);
    
    // Clear old jobs when starting a new search
    setJobs([]);
    
    // Reset offset to 0 for new search
    const searchFilters = {
      ...filters,
      offset: 0
    };
    setCurrentFilters(searchFilters);

    try {
      console.log('Calling searchJobs API...');
      const response: SearchResponse = await searchJobs(searchFilters);
      console.log('API Response:', response);
      console.log('Jobs received:', response.jobs);
      console.log('Number of jobs:', response.jobs?.length || 0);
      console.log('Total:', response.total);
      
      if (response.jobs && response.jobs.length > 0) {
        console.log('First job sample:', response.jobs[0]);
      }
      
      // Set new jobs (replacing any old ones)
      setJobs(response.jobs || []);
      setSearchMeta({
        total: response.total || 0,
        offset: response.offset || 0,
        hasMore: response.hasMore || false,
        nextOffset: response.nextOffset || null
      });
    } catch (err) {
      console.error('Error fetching jobs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(errorMessage);
      setJobs([]);
      setSearchMeta({
        total: 0,
        offset: 0,
        hasMore: false,
        nextOffset: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async (filters: JobFiltersType, newOffset: number) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Loading more jobs with offset: ${newOffset}`);
      const response: SearchResponse = await searchJobs({
        ...filters,
        offset: newOffset
      });
      
      console.log(`Loaded ${response.jobs?.length || 0} more jobs`);
      
      // Append new jobs to existing ones (for pagination)
      setJobs(prevJobs => {
        const updatedJobs = [...prevJobs, ...(response.jobs || [])];
        console.log(`Total jobs now: ${updatedJobs.length}`);
        return updatedJobs;
      });
      
      setSearchMeta(prevMeta => ({
        total: prevMeta.total + (response.jobs?.length || 0), // Accumulate total
        offset: response.offset,
        hasMore: response.hasMore,
        nextOffset: response.nextOffset
      }));
    } catch (err) {
      console.error('Error loading more jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more jobs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dharwin Job Scrapper
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Search LinkedIn job listings with advanced filters
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setShowSavedJobs(false)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                !showSavedJobs
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Jobs
              </div>
            </button>
            <button
              onClick={() => setShowSavedJobs(true)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                showSavedJobs
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Saved Jobs
              </div>
            </button>
          </nav>
        </div>

        {showSavedJobs ? (
          /* Saved Jobs View */
          <SavedJobs />
        ) : (
          /* Search Jobs View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <aside className="lg:col-span-1">
              <JobFilters onSearch={handleSearch} isLoading={isLoading} />
            </aside>

            {/* Main Content - Job List */}
            <div className="lg:col-span-3">
              <ConnectionStatus />
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-red-800">Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isLoading && jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Searching for jobs...</p>
              </div>
            ) : (
              <JobList
                jobs={jobs}
                total={searchMeta.total}
                offset={searchMeta.offset}
                hasMore={searchMeta.hasMore}
                nextOffset={searchMeta.nextOffset}
                onLoadMore={handleLoadMore}
                currentFilters={currentFilters}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by <span className="font-semibold text-primary-600">Apify</span> LinkedIn Jobs Scraper
          </p>
        </div>
      </footer>
    </div>
  );
}
