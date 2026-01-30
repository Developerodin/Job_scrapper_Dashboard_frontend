'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { JobFilters } from '@/lib/api';

interface JobFiltersProps {
  onSearch: (filters: JobFilters) => void;
  isLoading?: boolean;
}

export default function JobFiltersComponent({ onSearch, isLoading }: JobFiltersProps) {
  const { register, handleSubmit, reset, watch, setValue } = useForm<JobFilters>({
    defaultValues: {
      job_title: '',
      job_location: '',
      detailed: false,
      offset: 0,
      salary_min: undefined,
      salary_max: undefined,
      experience: '',
      job_type: [],
      company: '',
      remote: ''
    }
  });

  const onSubmit = (data: JobFilters) => {
    console.log('Form submitted with data:', data);
    
    // Ensure job_type is properly formatted
    const jobTypeValue = data.job_type;
    let jobTypeArray: string[] = [];
    
    if (typeof jobTypeValue === 'string') {
      try {
        jobTypeArray = JSON.parse(jobTypeValue);
      } catch {
        jobTypeArray = [];
      }
    } else if (Array.isArray(jobTypeValue)) {
      jobTypeArray = jobTypeValue;
    }
    
    const searchFilters = {
      ...data,
      job_type: jobTypeArray.length > 0 ? jobTypeArray : undefined,
      offset: 0 // Reset offset on new search
    };
    
    console.log('Calling onSearch with filters:', searchFilters);
    onSearch(searchFilters);
  };

  const handleReset = () => {
    reset({
      job_title: '',
      job_location: '',
      detailed: false,
      offset: 0,
      salary_min: undefined,
      salary_max: undefined,
      experience: '',
      job_type: [],
      company: '',
      remote: ''
    });
    onSearch({
      job_title: '',
      job_location: '',
      detailed: false,
      offset: 0
    });
  };

  const jobTypes = watch('job_type') || [];


  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900">Search Filters</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="job_title" className="block text-sm font-semibold text-gray-700 mb-2">
            Job Title
          </label>
          <input
            {...register('job_title')}
            type="text"
            id="job_title"
            placeholder="e.g., Node Js Developer"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
          />
        </div>

        {/* Job Location */}
        <div>
          <label htmlFor="job_location" className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <input
            {...register('job_location')}
            type="text"
            id="job_location"
            placeholder="e.g., India, New York, Toronto"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
          />
        </div>

        {/* Detailed Toggle */}
        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            {...register('detailed')}
            type="checkbox"
            id="detailed"
            className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="detailed" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
            Fetch detailed job information
          </label>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Additional Filters</h3>
          </div>

          {/* Date Posted Filter */}
          <div className="mb-4">
            <label htmlFor="date_posted" className="block text-sm font-semibold text-gray-700 mb-2">
              Date Posted (for current jobs only)
            </label>
            <select
              {...register('date_posted')}
              id="date_posted"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300 cursor-pointer"
            >
              <option value="24h">Past 24 hours</option>
              <option value="7 days">Past week</option>
              <option value="1 months" selected>Past month</option>
              <option value="3 months">Past 3 months</option>
              <option value="6 months">Past 6 months</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Only shows jobs posted within this timeframe</p>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="salary_min" className="block text-sm font-semibold text-gray-700 mb-2">
                Min Salary
              </label>
              <input
                {...register('salary_min', { valueAsNumber: true })}
                type="number"
                id="salary_min"
                placeholder="Min"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="salary_max" className="block text-sm font-semibold text-gray-700 mb-2">
                Max Salary
              </label>
              <input
                {...register('salary_max', { valueAsNumber: true })}
                type="number"
                id="salary_max"
                placeholder="Max"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
              />
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-4">
            <label htmlFor="experience" className="block text-sm font-semibold text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              {...register('experience')}
              id="experience"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300 cursor-pointer"
            >
              <option value="">Any</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="executive">Executive</option>
            </select>
          </div>

          {/* Job Type */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Type
            </label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {['full-time', 'part-time', 'contract'].map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`job_type_${type}`}
                    checked={jobTypes.includes(type)}
                    onChange={() => {
                      const newTypes = jobTypes.includes(type)
                        ? jobTypes.filter(t => t !== type)
                        : [...jobTypes, type];
                      setValue('job_type', newTypes);
                    }}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor={`job_type_${type}`} className="ml-3 text-sm font-medium text-gray-700 capitalize cursor-pointer">
                    {type.replace('-', ' ')}
                  </label>
                </div>
              ))}
              <input
                type="hidden"
                {...register('job_type')}
                value={JSON.stringify(jobTypes)}
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="mb-4">
            <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name
            </label>
            <input
              {...register('company')}
              type="text"
              id="company"
              placeholder="Filter by company"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:border-gray-300"
            />
          </div>

          {/* Remote Work */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Work Arrangement
            </label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {[
                { value: '', label: 'Any' },
                { value: 'remote', label: 'Remote' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'on-site', label: 'On-site' }
              ].map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    {...register('remote')}
                    type="radio"
                    id={`remote_${option.value}`}
                    value={option.value}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 cursor-pointer"
                  />
                  <label htmlFor={`remote_${option.value}`} className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Jobs
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
