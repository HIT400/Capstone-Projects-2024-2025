import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Define report types
export type ReportType = 'applications' | 'inspections' | 'financial';

// Helper function to format date
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to add report header
const addReportHeader = (doc: jsPDF, title: string, period: string): void => {
  // Add logo or header image if available
  // doc.addImage('logo.png', 'PNG', 10, 10, 40, 40);
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(34, 64, 87); // #224057
  doc.text(title, 14, 22);
  
  // Add period and date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Period: ${period}`, 14, 30);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 35);
  
  // Add divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 38, 196, 38);
};

// Helper function to add report footer
const addReportFooter = (doc: jsPDF): void => {
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `ZimBuilds Building Plan Approval System - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
};

// Generate applications report
export const generateApplicationsReport = (
  applications: any[],
  period: string
): jsPDF => {
  const doc = new jsPDF();
  
  // Add header
  addReportHeader(doc, 'Applications Report', period);
  
  // Add summary section
  doc.setFontSize(14);
  doc.setTextColor(34, 64, 87);
  doc.text('Summary', 14, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const totalApplications = applications.length;
  const approvedApplications = applications.filter(app => 
    app.status?.toLowerCase() === 'approved' || 
    app.status?.toLowerCase() === 'completed'
  ).length;
  
  const rejectedApplications = applications.filter(app => 
    app.status?.toLowerCase() === 'rejected'
  ).length;
  
  const pendingApplications = applications.filter(app => 
    app.status?.toLowerCase() === 'pending' || 
    app.status?.toLowerCase() === 'draft'
  ).length;
  
  doc.text(`Total Applications: ${totalApplications}`, 14, 58);
  doc.text(`Approved Applications: ${approvedApplications}`, 14, 65);
  doc.text(`Rejected Applications: ${rejectedApplications}`, 14, 72);
  doc.text(`Pending Applications: ${pendingApplications}`, 14, 79);
  
  // Add applications table
  doc.setFontSize(14);
  doc.setTextColor(34, 64, 87);
  doc.text('Application Details', 14, 95);
  
  // Prepare table data
  const tableData = applications.map(app => [
    app.id || 'N/A',
    app.stand_number || 'N/A',
    app.owner_name || 'N/A',
    app.status || 'N/A',
    app.created_at ? formatDate(new Date(app.created_at)) : 'N/A'
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 100,
    head: [['ID', 'Stand Number', 'Owner', 'Status', 'Submission Date']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 64, 87],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  // Add footer
  addReportFooter(doc);
  
  return doc;
};

// Generate inspections report
export const generateInspectionsReport = (
  inspections: any[],
  period: string
): jsPDF => {
  const doc = new jsPDF();
  
  // Add header
  addReportHeader(doc, 'Inspections Report', period);
  
  // Add summary section
  doc.setFontSize(14);
  doc.setTextColor(34, 64, 87);
  doc.text('Summary', 14, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const totalInspections = inspections.length;
  const completedInspections = inspections.filter(insp => 
    insp.status?.toLowerCase() === 'completed'
  ).length;
  
  const pendingInspections = inspections.filter(insp => 
    insp.status?.toLowerCase() === 'pending' || 
    insp.status?.toLowerCase() === 'scheduled'
  ).length;
  
  doc.text(`Total Inspections: ${totalInspections}`, 14, 58);
  doc.text(`Completed Inspections: ${completedInspections}`, 14, 65);
  doc.text(`Pending/Scheduled Inspections: ${pendingInspections}`, 14, 72);
  
  // Add inspections table
  doc.setFontSize(14);
  doc.setTextColor(34, 64, 87);
  doc.text('Inspection Details', 14, 88);
  
  // Prepare table data
  const tableData = inspections.map(insp => [
    insp.id || 'N/A',
    insp.stand_number || 'N/A',
    insp.inspection_type || 'N/A',
    insp.inspector_name || 'N/A',
    insp.scheduled_date ? formatDate(new Date(insp.scheduled_date)) : 'N/A',
    insp.status || 'N/A'
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 93,
    head: [['ID', 'Stand Number', 'Type', 'Inspector', 'Date', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 64, 87],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  // Add footer
  addReportFooter(doc);
  
  return doc;
};

// Generate financial report
export const generateFinancialReport = (
  payments: any[],
  period: string
): jsPDF => {
  const doc = new jsPDF();
  
  // Add header
  addReportHeader(doc, 'Financial Report', period);
  
  // Add summary section
  doc.setFontSize(14);
  doc.setTextColor(34, 64, 87);
  doc.text('Summary', 14, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const totalPayments = payments.length;
  
  // Calculate total revenue
  const totalRevenue = payments.reduce((sum, payment) => {
    let amount = 0;
    
    if (typeof payment.amount === 'number') {
      amount = payment.amount;
    } else if (typeof payment.amount === 'string') {
      // Remove any non-numeric characters except decimal point
      const cleanedAmount = payment.amount.replace(/[^0-9.]/g, '');
      amount = parseFloat(cleanedAmount || '0');
    }
    
    // Check payment status - only count completed payments
    const status = typeof payment.payment_status === 'string' 
      ? payment.payment_status.toLowerCase() 
      : '';
      
    const isCompleted = status === 'completed' || status === 'approved' || status === 'paid';
    
    return sum + (isCompleted && !isNaN(amount) ? amount : 0);
  }, 0);
  
  // Count payment methods
  const paymentMethods: Record<string, number> = {};
  payments.forEach(payment => {
    const method = payment.payment_method || 'Unknown';
    paymentMethods[method] = (paymentMethods[method] || 0) + 1;
  });
  
  doc.text(`Total Payments: ${totalPayments}`, 14, 58);
  doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 65);
  
  // Add payment methods breakdown
  doc.text('Payment Methods:', 14, 72);
  let yPos = 79;
  Object.entries(paymentMethods).forEach(([method, count]) => {
    doc.text(`${method}: ${count} payments`, 20, yPos);
    yPos += 7;
  });
  
  // Add payments table
  doc.setFontSize(14);
  doc.setTextColor(34, 64, 87);
  doc.text('Payment Details', 14, yPos + 10);
  
  // Prepare table data
  const tableData = payments.map(payment => [
    payment.id || 'N/A',
    payment.application_id || 'N/A',
    payment.payment_method || 'N/A',
    payment.amount ? `$${parseFloat(payment.amount).toFixed(2)}` : 'N/A',
    payment.payment_status || 'N/A',
    payment.created_at ? formatDate(new Date(payment.created_at)) : 'N/A'
  ]);
  
  // Add table
  autoTable(doc, {
    startY: yPos + 15,
    head: [['ID', 'Application ID', 'Method', 'Amount', 'Status', 'Date']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 64, 87],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  // Add footer
  addReportFooter(doc);
  
  return doc;
};

// Main function to generate report based on type
export const generateReport = (
  type: ReportType,
  data: any[],
  period: string
): jsPDF => {
  switch (type) {
    case 'applications':
      return generateApplicationsReport(data, period);
    case 'inspections':
      return generateInspectionsReport(data, period);
    case 'financial':
      return generateFinancialReport(data, period);
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
};
