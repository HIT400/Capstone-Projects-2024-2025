import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Calendar, 
  MoreHorizontal, 
  Search, 
  Download, 
  Filter, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { getPatientHistory } from '@/services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PatientHistoryTableProps {
  onSelectScan?: (scan: any) => void;
}

const PatientHistoryTable: React.FC<PatientHistoryTableProps> = ({ onSelectScan }) => {
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'cancer' | 'non-cancer'>('all');
  const itemsPerPage = 10;
  
  const navigate = useNavigate();
  
  React.useEffect(() => {
    fetchPatientHistory();
  }, []);
  
  const fetchPatientHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getPatientHistory();
      setPatientHistory(history);
    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter and search the patient history
  const filteredHistory = patientHistory
    .filter(scan => {
      // Apply cancer/non-cancer filter
      if (filter === 'cancer') {
        return scan.result === 'Cancer' || scan.result === 'Malignant';
      } else if (filter === 'non-cancer') {
        return scan.result === 'Non-Cancer' || scan.result === 'Benign';
      }
      return true;
    })
    .filter(scan => {
      // Apply search filter
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      
      // Search in patient name, ID, result
      return (
        (scan.patient?.name || '').toLowerCase().includes(searchLower) ||
        (scan.id || '').toLowerCase().includes(searchLower) ||
        (scan.result || '').toLowerCase().includes(searchLower)
      );
    });
  
  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Patient Scan History', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Define table columns
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Patient', dataKey: 'patient' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Result', dataKey: 'result' },
      { header: 'Confidence', dataKey: 'confidence' }
    ];
    
    // Prepare data
    const data = filteredHistory.map((scan, index) => ({
      id: `#${index + 1}`,
      patient: scan.patient?.name || 'Unknown',
      date: formatDate(scan.date),
      result: scan.result || 'Unknown',
      confidence: `${Math.round((scan.confidence || 0) * 100)}%`
    }));
    
    // @ts-ignore - jspdf-autotable types are not properly recognized
    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: data.map(item => columns.map(col => item[col.dataKey as keyof typeof item])),
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      rowStyles: data.map(item => 
        item.result.includes('Cancer') ? { fillColor: [255, 240, 240] } : {}
      )
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        'ScanClassify Pro - AI-Powered Breast Cancer Detection',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    doc.save('Patient_Scan_History.pdf');
  };
  
  // Handle view report
  const handleViewReport = (scan: any) => {
    if (onSelectScan) {
      onSelectScan(scan);
    } else {
      // Navigate to analysis page with the scan ID
      navigate('/analysis', { state: { selectedScanId: scan.id, activeTab: 'reports' } });
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <h2 className="text-xl font-bold">Patient Scan History</h2>
              {isLoading && <RefreshCw className="ml-2 h-4 w-4 animate-spin" />}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search patients..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Results
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('cancer')}>
                    Cancer Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('non-cancer')}>
                    Non-Cancer Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="outline"
                className="gap-1"
                onClick={exportToPDF}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          {filter !== 'all' && (
            <div className="flex items-center">
              <Badge variant={filter === 'cancer' ? 'destructive' : 'outline'} className="mr-2">
                {filter === 'cancer' ? 'Cancer Results' : 'Non-Cancer Results'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setFilter('all')}
              >
                Clear
              </Button>
            </div>
          )}
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading patient history...
                    </TableCell>
                  </TableRow>
                ) : paginatedHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No scan history found
                      {searchTerm && " matching your search"}
                      {filter !== 'all' && ` with ${filter} results`}.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedHistory.map((scan, index) => (
                    <TableRow key={scan.id || index}>
                      <TableCell className="font-medium">#{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>{scan.patient?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {scan.patient?.age || '?'} / {scan.patient?.gender || 'Unknown'}
                      </TableCell>
                      <TableCell>{formatDate(scan.date)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={scan.result === 'Cancer' || scan.result === 'Malignant' ? 'destructive' : 'success'}
                        >
                          {scan.result || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{Math.round((scan.confidence || 0) * 100)}%</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewReport(scan)}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/appointments', { state: { scanId: scan.id } })}>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {Math.min(filteredHistory.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredHistory.length, currentPage * itemsPerPage)} of {filteredHistory.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientHistoryTable;
