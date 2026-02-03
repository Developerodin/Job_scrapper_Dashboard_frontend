'use client';

import { useState, useEffect, useMemo } from 'react';
import { Job, JobFilters } from '@/lib/api';
import JobCard from './JobCard';

interface JobListProps {
  jobs: Job[];
  total: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
  onLoadMore: (filters: JobFilters, newOffset: number) => void;
  currentFilters: JobFilters;
  isLoading?: boolean;
}

export default function JobList({
  jobs,
  total,
  offset,
  hasMore,
  nextOffset,
  onLoadMore,
  currentFilters,
  isLoading
}: JobListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'salary' | 'relevance'>('relevance');

  const handleSort = (value: 'date' | 'salary' | 'relevance') => {
    setSortBy(value);
  };

  // Sort jobs based on sortBy state
  const sortedJobs = useMemo(() => {
    let sorted = [...jobs];

    switch (sortBy) {
      case 'date':
        sorted.sort((a, b) => {
          const dateA = a.posted_date ? new Date(a.posted_date).getTime() : 0;
          const dateB = b.posted_date ? new Date(b.posted_date).getTime() : 0;
          return dateB - dateA; // Newest first
        });
        break;
      case 'salary':
        sorted.sort((a, b) => {
          const salaryA = a.salary_max ?? a.salary_min ?? a.salary ?? 0;
          const salaryB = b.salary_max ?? b.salary_min ?? b.salary ?? 0;
          return salaryB - salaryA; // Highest first
        });
        break;
      case 'relevance':
      default:
        // Keep original order
        break;
    }

    return sorted;
  }, [jobs, sortBy]);

  if (jobs.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search filters to find more results.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with stats and sort */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {jobs.length > 0 ? `${jobs.length} Job${jobs.length !== 1 ? 's' : ''} Displayed` : 'Search Results'}
          </h2>
          {jobs.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              {hasMore && <span className="text-primary-600"> • More available</span>}
            </p>
          )}
        </div>
        {jobs.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as 'date' | 'salary' | 'relevance')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date Posted</option>
              <option value="salary">Salary</option>
            </select>
          </div>
        )}
      </div>

      {/* Job Cards */}
      <div className="space-y-4 mb-6">
        {sortedJobs.map((job, index) => (
          <JobCard key={job.job_id || job.url || `job-${index}`} job={job} />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading more jobs...</p>
        </div>
      )}

      {/* Pagination */}
      {hasMore && !isLoading && (
        <div className="text-center pt-6 border-t border-gray-200">
          <button
            onClick={() => nextOffset && onLoadMore(currentFilters, nextOffset)}
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Load More Jobs
          </button>
        </div>
      )}

      {!hasMore && jobs.length > 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          No more jobs to load
        </div>
      )}
    </div>
  );
}
