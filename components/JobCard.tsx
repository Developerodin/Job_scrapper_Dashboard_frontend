'use client';

import { Job } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const title = job.title || job.job_title || 'Untitled Position';
  const company = job.company_name || job.company || 'Unknown Company';
  const location = job.location || job.job_location || 'Location not specified';
  const description = job.description || '';
  const url = job.url || job.platform_url || (job.job_id ? `https://www.linkedin.com/jobs/view/${job.job_id}` : '#');
  
  // Handle LinkedIn's "time_posted" format (e.g., "6 days ago", "1 week ago")
  // Also check for time_posted field from LinkedIn scraper
  const timePosted = job.time_posted || job.posted_date || '';
  let postedDate: Date | null = null;
  if (timePosted) {
    // Try to parse as date first
    const parsedDate = new Date(timePosted);
    if (!isNaN(parsedDate.getTime())) {
      postedDate = parsedDate;
    }
    // If parsing fails, it's likely "X days ago" format - we'll display it as-is
  }
  
  const isRemote = job.is_remote || job.remote || job.work_from_home === 'remote';
  const jobType = job.job_type || job.type || '';
  const jobLevel = job.job_level || job.level || job.experience_level || '';
  
  // Format salary
  const formatSalary = () => {
    const min = job.salary_min || job.salary_minimum || job.salary;
    const max = job.salary_max || job.salary_maximum;
    const currency = job.salary_currency || 'USD';
    
    if (min) {
      if (max && max !== min) {
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
      }
      return `${currency} ${min.toLocaleString()}`;
    }
    return null;
  };

  const salary = formatSalary();
  const descriptionPreview = description.length > 200 
    ? description.substring(0, 200) + '...' 
    : description;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors"
            >
              {title}
            </a>
          </h3>
          <p className="text-lg text-gray-700 font-medium mb-1">{company}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
            {isRemote && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Remote
              </span>
            )}
            {jobType && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                {jobType.replace('-', ' ')}
              </span>
            )}
            {jobLevel && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                {jobLevel}
              </span>
            )}
          </div>
        </div>
        {salary && (
          <div className="text-right">
            <p className="text-lg font-bold text-primary-600">{salary}</p>
          </div>
        )}
      </div>

      {descriptionPreview && (
        <p className="text-gray-600 mb-4 line-clamp-3">{descriptionPreview}</p>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        {timePosted && (
          <span className="text-sm text-gray-500">
            {postedDate 
              ? `Posted ${formatDistanceToNow(postedDate, { addSuffix: true })}`
              : `Posted ${timePosted}`}
          </span>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          View Details
        </a>
      </div>
    </div>
  );
}
