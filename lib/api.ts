import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://demo-addon-apis.theodin.in/job';

export interface JobFilters {
  job_title?: string;
  job_location?: string; // Location used for LinkedIn API search
  offset?: number;
  detailed?: boolean;
  date_posted?: string; // e.g., "24h", "7 days", "1 months", "3 months"
  salary_min?: number;
  salary_max?: number;
  experience?: string;
  job_type?: string[];
  company?: string;
  remote?: string;
}

export interface Job {
  title?: string;
  job_title?: string;
  company_name?: string;
  company?: string;
  location?: string;
  job_location?: string;
  description?: string;
  url?: string;
  platform_url?: string;
  posted_date?: string;
  time_posted?: string; // LinkedIn format: "6 days ago", "1 week ago", etc.
  num_applicants?: string; // LinkedIn format: "94 applicants"
  salary_min?: number;
  salary_max?: number;
  salary?: number;
  salary_currency?: string;
  is_remote?: boolean;
  remote?: boolean;
  work_from_home?: string;
  job_type?: string;
  type?: string;
  job_level?: string;
  level?: string;
  experience_level?: string;
  job_id?: string; // LinkedIn job ID
  source?: string; // e.g., "linkedin"
  is_expired?: boolean; // Saved jobs: marked expired by backend
}

export interface SearchResponse {
  jobs: Job[];
  total: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
  savedToDatabase?: number; // Number of jobs saved to MongoDB
}

export async function searchJobs(filters: JobFilters): Promise<SearchResponse> {
  try {
    console.log('API URL:', API_URL);
    console.log('Sending request to:', `${API_URL}/api/jobs/search`);
    
    // Clean up the filters - remove undefined and empty values
    const cleanedFilters: any = {};
    
    if (filters.job_title && filters.job_title.trim()) {
      cleanedFilters.job_title = filters.job_title.trim();
    }
    if (filters.job_location && filters.job_location.trim()) {
      cleanedFilters.job_location = filters.job_location.trim();
    }
    if (filters.offset !== undefined && filters.offset !== null) {
      cleanedFilters.offset = filters.offset;
    }
    if (filters.detailed !== undefined) {
      cleanedFilters.detailed = filters.detailed;
    }
    if (filters.salary_min !== undefined && filters.salary_min !== null) {
      cleanedFilters.salary_min = filters.salary_min;
    }
    if (filters.salary_max !== undefined && filters.salary_max !== null) {
      cleanedFilters.salary_max = filters.salary_max;
    }
    if (filters.experience && filters.experience.trim()) {
      cleanedFilters.experience = filters.experience.trim();
    }
    if (filters.job_type && Array.isArray(filters.job_type) && filters.job_type.length > 0) {
      cleanedFilters.job_type = filters.job_type;
    }
    if (filters.company && filters.company.trim()) {
      cleanedFilters.company = filters.company.trim();
    }
    if (filters.remote && filters.remote.trim()) {
      cleanedFilters.remote = filters.remote.trim();
    }
    
    console.log('Cleaned request payload:', cleanedFilters);
    
    const response = await axios.post<SearchResponse>(
      `${API_URL}/api/jobs/search`,
      cleanedFilters,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 300000, // 5 minutes timeout for Apify calls
      }
    );
    
    console.log('API Response status:', response.status);
    console.log('API Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('API Error details:', error);
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      let errorMessage = 'Failed to fetch jobs';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = `Validation Error: ${errorData.errors.map((e: any) => e.msg || e.message).join(', ')}`;
        }
      }
      
      // Preserve newlines in error messages (for multi-line error messages)
      if (errorMessage.includes('\n')) {
        errorMessage = errorMessage.replace(/\n/g, ' ');
      }
      
      console.error('Error response:', errorData);
      console.error('Error status:', error.response?.status);
      
      throw new Error(errorMessage);
    }
    throw error;
  }
}

export interface DatabaseJobsResponse {
  jobs: Job[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface DatabaseStats {
  total_jobs: number;
  active_jobs: number;
  expired_jobs: number;
  unique_companies: number;
  latest_job: {
    job_id: string;
    job_title: string;
    company_name: string;
    created_at: string;
  } | null;
  database: string;
}

/**
 * Fetch saved jobs from MongoDB database
 */
export async function getSavedJobs(params?: {
  limit?: number;
  skip?: number;
  is_active?: string;
  company?: string;
  location?: string;
}): Promise<DatabaseJobsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.is_active) queryParams.append('is_active', params.is_active);
    if (params?.company) queryParams.append('company', params.company);
    if (params?.location) queryParams.append('location', params.location);

    const response = await axios.get<DatabaseJobsResponse>(
      `${API_URL}/api/jobs/database?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch saved jobs: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  try {
    const response = await axios.get<DatabaseStats>(
      `${API_URL}/api/jobs/stats`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching database stats:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch database stats: ${error.message}`);
    }
    throw error;
  }
}
