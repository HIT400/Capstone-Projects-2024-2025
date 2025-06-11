import { useState, useEffect } from 'react';
import UserCard from '@/components/UserCard';
import { get } from '@/utils/api';
import { toast } from 'react-hot-toast';

interface DashboardCounts {
  totalApplications: number;
  pendingApplications: number;
  approvedDocuments: number;
  completedInspections: number;
  pendingInspections: number;
}

const AdminDashboardCards = () => {
  const [counts, setCounts] = useState<DashboardCounts>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedDocuments: 0,
    completedInspections: 0,
    pendingInspections: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Initialize default values
        let applications = [];
        let documents = [];
        let inspections = [];
        let inspectionStages = [];

        try {
          // Fetch all applications
          const applicationsResponse = await get('applications');
          applications = Array.isArray(applicationsResponse?.data?.data)
            ? applicationsResponse.data.data
            : [];
        } catch (appError: any) {
          console.error('Error fetching applications:', appError);
          // Only show toast for errors that aren't already handled by the API utility
          if (!appError.friendlyMessage && appError.response?.status !== 500) {
            toast.error('Unable to load applications data');
          }
          // Continue with empty applications array
        }

        try {
          // Fetch documents - use the admin endpoint to get all documents
          const documentsResponse = await get('documents/all');
          console.log('Documents response:', documentsResponse);

          if (documentsResponse?.data?.data) {
            documents = Array.isArray(documentsResponse.data.data)
              ? documentsResponse.data.data
              : [];
            console.log(`Fetched ${documents.length} documents from the API`);
          } else {
            console.warn('No documents data in API response');
            documents = [];
          }
        } catch (docError: any) {
          console.error('Error fetching documents:', docError);
          // Only show toast for errors that aren't already handled by the API utility
          if (!docError.friendlyMessage && docError.response?.status !== 500) {
            toast.error('Unable to load documents data');
          }
          // Continue with empty documents array
        }

        try {
          // Fetch inspection schedules
          const inspectionsResponse = await get('inspection-schedules');
          inspections = Array.isArray(inspectionsResponse?.data?.data)
            ? inspectionsResponse.data.data
            : [];
        } catch (inspError: any) {
          console.error('Error fetching inspection schedules:', inspError);
          // Only show toast for errors that aren't already handled by the API utility
          if (!inspError.friendlyMessage && inspError.response?.status !== 500) {
            toast.error('Unable to load inspection schedules data');
          }
          // Continue with empty inspections array
        }

        try {
          // Fetch inspection stages
          const inspectionStagesResponse = await get('inspection-stages/user/applications');
          inspectionStages = Array.isArray(inspectionStagesResponse?.data?.data)
            ? inspectionStagesResponse.data.data
            : [];
        } catch (stageError: any) {
          console.error('Error fetching inspection stages:', stageError);
          // Only show toast for errors that aren't already handled by the API utility
          if (!stageError.friendlyMessage && stageError.response?.status !== 500) {
            toast.error('Unable to load inspection stages data');
          }
          // Continue with empty inspection stages array
        }

        // Calculate counts safely
        const totalApplications = applications.length;

        // Count pending applications (those not in final stage)
        const pendingApplications = applications.filter(app => {
          if (!app || typeof app !== 'object') return false;
          const status = typeof app.status === 'string' ? app.status.toLowerCase() : '';
          return status !== 'completed' && status !== 'approved';
        }).length;

        // Count approved documents
        const approvedDocuments = documents.filter(doc => {
          if (!doc || typeof doc !== 'object') return false;

          // Check document status
          const status = typeof doc.status === 'string' ? doc.status.toLowerCase() : '';

          // Check compliance status from compliance_result
          let complianceStatus = '';
          if (doc.compliance_result) {
            try {
              // Handle both string and object formats
              const complianceResult = typeof doc.compliance_result === 'string'
                ? JSON.parse(doc.compliance_result)
                : doc.compliance_result;

              if (complianceResult.compliant === true) {
                complianceStatus = 'compliant';
              }
            } catch (e) {
              console.error('Error parsing compliance result:', e);
            }
          }

          // Also check compliance_status field if it exists
          const directComplianceStatus = typeof doc.compliance_status === 'string'
            ? doc.compliance_status.toLowerCase()
            : '';

          console.log(`Document ${doc.id}: status=${status}, complianceStatus=${complianceStatus}, directComplianceStatus=${directComplianceStatus}`);

          return status === 'approved' || complianceStatus === 'compliant' || directComplianceStatus === 'compliant';
        }).length;

        console.log(`Found ${approvedDocuments} approved documents out of ${documents.length} total documents`);

        // Count completed inspections from inspection schedules
        const completedInspections = inspections.filter(inspection => {
          if (!inspection || typeof inspection !== 'object') return false;
          const status = typeof inspection.status === 'string' ? inspection.status.toLowerCase() : '';
          return status === 'completed';
        }).length;

        console.log(`Found ${completedInspections} completed inspections out of ${inspections.length} total inspections`);

        // Count pending inspections
        const pendingInspections = inspections.filter(inspection => {
          if (!inspection || typeof inspection !== 'object') return false;
          const status = typeof inspection.status === 'string' ? inspection.status.toLowerCase() : '';
          return status === 'scheduled' || status === 'pending';
        }).length;

        setCounts({
          totalApplications,
          pendingApplications,
          approvedDocuments,
          completedInspections,
          pendingInspections
        });
      } catch (error: any) {
        console.error('Error in dashboard data processing:', error);

        // Show a toast notification with a friendly error message
        if (error.friendlyMessage) {
          toast.error(error.friendlyMessage);
        } else {
          toast.error('Unable to load dashboard data. Please try again later.');
        }

        // Set default values in case of error
        setCounts({
          totalApplications: 0,
          pendingApplications: 0,
          approvedDocuments: 0,
          completedInspections: 0,
          pendingInspections: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      <UserCard
        type="Total Applications"
        count={counts.totalApplications}
        loading={loading}
        cardType="total-applications"
      />
      <UserCard
        type="Pending Applications"
        count={counts.pendingApplications}
        loading={loading}
        cardType="pending-applications"
      />
      <UserCard
        type="Approved Documents"
        count={counts.approvedDocuments}
        loading={loading}
        cardType="approved-documents"
      />
      <UserCard
        type="Completed Inspections"
        count={counts.completedInspections}
        loading={loading}
        cardType="completed-inspections"
      />
      <UserCard
        type="Pending Inspections"
        count={counts.pendingInspections}
        loading={loading}
        cardType="pending-inspections"
      />
    </div>
  );
};

export default AdminDashboardCards;
