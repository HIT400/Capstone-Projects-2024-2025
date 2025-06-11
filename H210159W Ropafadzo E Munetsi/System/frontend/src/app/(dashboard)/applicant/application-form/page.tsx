'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ApplicationProcessLayout from '@/components/ApplicationProcessLayout';
import { useAuth } from '@/context/AuthContext';
import { getNextStageUrl } from '@/utils/applicationFlow';
import toast from '@/utils/toast';
import DistrictSelect from '@/components/DistrictSelect';

// Extended User type to match what's returned from the backend
type ExtendedUser = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  contactNumber?: string;
  physicalAddress?: string;
  nationalIdNumber?: string;
};

const PlanApprovalForm = () => {
  // Get user and authentication state from context
  const { user: authUser, loading: authLoading } = useAuth();
  const user = authUser as ExtendedUser | null;
  const router = useRouter();

  // Log authentication state when component mounts
  useEffect(() => {
    console.log('Auth state:', { user, authLoading });
    console.log('Token in localStorage:', localStorage.getItem('token'));

    // Populate user information fields when user data is available
    if (user) {
      console.log('User data for form:', user);

      // Safely construct owner_name from firstName and lastName
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const owner_name = `${firstName} ${lastName}`.trim();

      setFormData(prevData => ({
        ...prevData,
        owner_name: owner_name || '',
        email: user.email || '',
        contact_number: user.contactNumber || '',
      }));

      console.log('Form data after user info update:', {
        owner_name,
        email: user.email,
        contact_number: user.contactNumber
      });

      // Check if user already has an active application
      const checkExistingApplication = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await axios.get('http://localhost:5001/api/applications', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          // Filter applications to find active ones for the current user
          const activeApplications = response.data.data.filter(
            (app: any) => app.user_id === user.id &&
                          !['completed', 'rejected'].includes(app.status)
          );

          if (activeApplications.length > 0) {
            // User has an active application
            toast.warning(
              <div>
                You already have an active application in the system.
                <div className="mt-2">
                  <button
                    onClick={() => router.push('/applicant/document-verification')}
                    className="text-white underline"
                  >
                    Continue with existing application
                  </button>
                </div>
              </div>,
              { duration: 6000 }
            );
          }
        } catch (error) {
          console.error('Error checking existing applications:', error);
        }
      };

      checkExistingApplication();
    }
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    stand_number: '',
    postal_address: '',
    district: '',
    construction_type: 'Residential', // Default to Residential
    project_description: '',
    start_date: '',
    completion_date: '',
    architect: '',
    owner_name: '',
    email: '',
    contact_number: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);

    // Create a new form data object with the updated value
    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    // Set the updated form data
    setFormData(updatedFormData);

    // Log the updated form data
    console.log('Setting formData:', updatedFormData);
  };

  // Specific handler for construction type to ensure it's being set correctly
  const handleConstructionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    console.log(`Construction type changed to: ${value}`);

    setFormData(prev => {
      const updated = {
        ...prev,
        construction_type: value
      };
      console.log('Updated form with construction type:', updated);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if all required fields are filled
      const requiredFields = [
        { name: 'stand_number', label: 'Stand Number' },
        { name: 'postal_address', label: 'Postal Address' },
        { name: 'district', label: 'District' },
        { name: 'construction_type', label: 'Construction Type' },
        { name: 'project_description', label: 'Project Description' },
        { name: 'start_date', label: 'Start Date' },
        { name: 'completion_date', label: 'Completion Date' },
        { name: 'architect', label: 'Architect' },
        { name: 'contact_number', label: 'Contact Number' },
        { name: 'owner_name', label: 'Owner Name' },
        { name: 'email', label: 'Email' },
      ];

      const missingFields = requiredFields
        .filter(field => !formData[field.name as keyof typeof formData])
        .map(field => field.label);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }

      // Check if user is authenticated
      if (!user) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');

      // Double check token exists
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      console.log('User authenticated:', user.email);

      // Log the form data being submitted
      console.log('Submitting form data:', formData);

      // Double-check that construction_type is set
      if (!formData.construction_type) {
        throw new Error('Construction Type is required. Please select a value.');
      }

      // Double-check that contact_number is set
      if (!formData.contact_number) {
        throw new Error('Contact Number is required. Please provide a value.');
      }

      // Create a copy of the form data to ensure all fields are properly set
      const dataToSubmit = {
        ...formData,
        // Ensure construction_type is explicitly set
        construction_type: formData.construction_type,
        // Ensure owner_name is properly set
        owner_name: formData.owner_name || 'Not provided',
        // Ensure email is properly set
        email: formData.email || 'Not provided',
        // Ensure contact_number is properly set
        contact_number: formData.contact_number || 'Not provided'
      };

      console.log('Final data to submit:', dataToSubmit);

      // Test the token with a simple request to verify authentication
      try {
        console.log('Testing authentication with token...');
        const testResponse = await axios.get('http://localhost:5001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Authentication test successful:', testResponse.data);
      } catch (testError: any) {
        console.error('Authentication test failed:', testError.response?.data || testError.message);
        // Continue with submission anyway to see the specific error
      }

      // Include the token in the request headers
      console.log('Sending application data with token:', token);
      const response = await axios.post(
        'http://localhost:5001/api/applications',
        dataToSubmit,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Form submitted successfully:', response.data);
      setSuccess(true);
      toast.success('Application submitted successfully!');

      // Wait a moment before redirecting to the next stage
      setTimeout(() => {
        const nextStageUrl = getNextStageUrl('application');
        if (nextStageUrl) {
          router.push(nextStageUrl);
        }
      }, 2000);

      // Reset form but keep user information and construction type
      setFormData({
        stand_number: '',
        postal_address: '',
        district: '',
        construction_type: 'Residential', // Always keep as Residential
        project_description: '',
        start_date: '',
        completion_date: '',
        architect: '',
        // Keep user information with proper handling of undefined values
        owner_name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
        email: user?.email || '',
        contact_number: user?.contactNumber || '',
      });
    } catch (err: any) {
      console.error('Error submitting form:', err);

      // Check for specific error types
      if (err.response?.status === 401) {
        console.error('Authentication error:', err.response.data);
        setError('Authentication failed. Please log out and log in again.');

        // Log additional debugging information
        console.log('Auth state at error time:', { user, token: localStorage.getItem('token') });
      } else if (err.response?.status === 409) {
        // Handle duplicate application error
        console.error('Duplicate application error:', err.response.data);

        const errorMessage = err.response.data?.message || 'You already have an active application in the system.';
        setError(errorMessage);

        // Show a toast with a link to view the existing application
        toast.error(
          <div>
            {errorMessage}
            <div className="mt-2">
              <button
                onClick={() => router.push('/applicant/document-verification')}
                className="text-white underline"
              >
                Continue with existing application
              </button>
            </div>
          </div>,
          { duration: 6000 }
        );
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while submitting the form. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApplicationProcessLayout>
    <div className="min-h-screen bg-blueGray-50">

        {/* Form Container */}
        <div className="w-full p-6">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-between">
                <div>
                  <h6 className="text-[#224057] text-xl font-bold">
                    Residential Plan Approval Form
                  </h6>
                  <p className="text-sm text-gray-600 mt-1">
                    This system is strictly for residential building plans only
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#224057] text-white active:bg-[#224057] font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                  onClick={handleSubmit}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-wrap">
                  {/* Stand Number */}
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Stand Number
                      </label>
                      <input
                        type="text"
                        name="stand_number"
                        value={formData.stand_number}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        required
                      />
                    </div>
                  </div>

                  {/* Postal Address */}
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Postal Address
                      </label>
                      <input
                        type="text"
                        name="postal_address"
                        value={formData.postal_address}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        required
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        District
                      </label>
                      <DistrictSelect
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>


                  {/* Construction Type */}
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Construction Type
                      </label>
                      <input
                        type="text"
                        name="construction_type"
                        value="Residential"
                        readOnly
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                    </div>
                  </div>

                  {/* Project Description */}
                  <div className="w-full px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Project Description
                      </label>
                      <textarea
                        name="project_description"
                        value={formData.project_description}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        required
                      />
                    </div>
                  </div>

                  {/* Completion Date */}
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Completion Date
                      </label>
                      <input
                        type="date"
                        name="completion_date"
                        value={formData.completion_date}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        required
                      />
                    </div>
                  </div>



                  {/* Architect */}
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Architect
                      </label>
                      <input
                        type="text"
                        name="architect"
                        value={formData.architect}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        required
                      />
                    </div>
                  </div>

                  {/* Owner Information (Read-only) */}
                  <div className="w-full px-4 mt-4">
                    <h6 className="text-[#224057] text-sm font-bold mb-4">Owner Information (Auto-filled from your account)</h6>
                  </div>

                  {/* Owner Name (Editable if not provided) */}
                  <div className="w-full lg:w-4/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        name="owner_name"
                        value={formData.owner_name}
                        onChange={handleChange}
                        className={`border-0 px-3 py-3 ${formData.owner_name ? 'bg-gray-100' : 'bg-white'} text-[#224057] rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                        placeholder="Enter your full name"
                        required
                      />
                      {!formData.owner_name && (
                        <p className="text-red-500 text-xs mt-1">Please provide your full name</p>
                      )}
                    </div>
                  </div>

                  {/* Email (Editable if not provided) */}
                  <div className="w-full lg:w-4/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`border-0 px-3 py-3 ${formData.email ? 'bg-gray-100' : 'bg-white'} text-[#224057] rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                        placeholder="Enter your email address"
                        required
                      />
                      {!formData.email && (
                        <p className="text-red-500 text-xs mt-1">Please provide your email address</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Number (Editable if not provided) */}
                  <div className="w-full lg:w-4/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                        Contact Number *
                      </label>
                      <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        className={`border-0 px-3 py-3 ${formData.contact_number ? 'bg-gray-100' : 'bg-white'} text-[#224057] rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                        placeholder="Enter your contact number"
                        required
                      />
                      {!formData.contact_number && (
                        <p className="text-red-500 text-xs mt-1">Please provide a contact number</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mt-6 text-center">
                    <p className="text-green-600 font-semibold">Form submitted successfully!</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-6 text-center">
                    <p className="text-red-600 font-semibold">{error}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      </ApplicationProcessLayout>
  );
};

export default PlanApprovalForm;