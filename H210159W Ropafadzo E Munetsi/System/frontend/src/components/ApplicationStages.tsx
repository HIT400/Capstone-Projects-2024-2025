'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Requirement {
  id: number;
  requirement_name: string;
  requirement_type: string;
  description: string;
  is_mandatory: boolean;
  status: string;
  completed_at: string | null;
  notes: string | null;
  reference_id: number | null;
}

interface Stage {
  id: number;
  name: string;
  description: string;
  order_number: number;
  progress_status: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

interface ApplicationDetails {
  id: number;
  user_id: number;
  current_stage_id: number;
  current_stage_name: string;
  current_stage_description: string;
  current_stage_order: number;
  status: string;
  standNumber: string;
  stages: Stage[];
  current_stage_requirements: Requirement[];
}

interface ApplicationStagesProps {
  applicationId: number;
}

const ApplicationStages: React.FC<ApplicationStagesProps> = ({ applicationId }) => {
  const { user } = useAuth();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`http://localhost:5001/api/application-stages/applications/${applicationId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch application details');
        }
        
        const data = await response.json();
        setApplication(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (applicationId) {
      fetchApplicationDetails();
    }
  }, [applicationId]);

  const updateRequirementStatus = async (requirementId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`http://localhost:5001/api/application-stages/applications/${applicationId}/requirements/${requirementId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update requirement status');
      }
      
      // Refresh application details
      const detailsResponse = await fetch(`http://localhost:5001/api/application-stages/applications/${applicationId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!detailsResponse.ok) {
        throw new Error('Failed to refresh application details');
      }
      
      const data = await detailsResponse.json();
      setApplication(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">No application data found.</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Application Progress</h2>
      
      {/* Current Stage Information */}
      <div className="mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800">Current Stage: {application.current_stage_name}</h3>
          <p className="text-gray-600 mt-1">{application.current_stage_description}</p>
          <div className="mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Stage {application.current_stage_order} of {application.stages.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {Math.round((application.current_stage_order / application.stages.length) * 100)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div 
              style={{ width: `${(application.current_stage_order / application.stages.length) * 100}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            ></div>
          </div>
        </div>
      </div>
      
      {/* Stages Timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Stages</h3>
        <div className="relative">
          {application.stages.map((stage, index) => (
            <div key={stage.id} className="mb-8 flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                  stage.progress_status === 'completed' ? 'bg-green-500' : 
                  stage.progress_status === 'in_progress' ? 'bg-blue-500' : 
                  'bg-gray-300'
                } text-white font-bold`}>
                  {index + 1}
                </div>
                {index < application.stages.length - 1 && (
                  <div className={`h-full w-0.5 ${
                    stage.progress_status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} style={{ height: '2rem' }}></div>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex-grow">
                <h4 className="font-semibold text-gray-800">{stage.name}</h4>
                <p className="text-sm text-gray-600">{stage.description}</p>
                <div className="mt-2 flex items-center">
                  <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded ${
                    stage.progress_status === 'completed' ? 'bg-green-100 text-green-800' : 
                    stage.progress_status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {stage.progress_status === 'completed' ? 'Completed' : 
                     stage.progress_status === 'in_progress' ? 'In Progress' : 
                     'Pending'}
                  </span>
                  {stage.completed_at && (
                    <span className="ml-2 text-xs text-gray-500">
                      Completed on {new Date(stage.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Current Stage Requirements */}
      {application.current_stage_requirements && application.current_stage_requirements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Stage Requirements</h3>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requirement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {application.current_stage_requirements.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{req.requirement_name}</div>
                      <div className="text-sm text-gray-500">{req.description}</div>
                      {req.is_mandatory && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded mt-1">
                          Required
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {req.requirement_type.charAt(0).toUpperCase() + req.requirement_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded ${
                        req.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        req.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      {req.completed_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(req.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {req.status !== 'completed' && (
                        <button
                          onClick={() => updateRequirementStatus(req.id, 'completed')}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Mark Complete
                        </button>
                      )}
                      {req.status === 'completed' && (
                        <button
                          onClick={() => updateRequirementStatus(req.id, 'pending')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationStages;
